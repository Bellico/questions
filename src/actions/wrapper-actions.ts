import { getSessionUserIdOrThrow } from '@/queries/commons-queries'
import { ZodType } from 'zod'

export type ActionResultType<T> = {
  success: boolean
  message?: string
  data?: T
  errors?: unknown
  errorFormat?: unknown
  issues?: unknown
}

const ZparseOrError = <T extends ZodType, TResult>(
  schema: T,
  value: unknown,
): void | ActionResultType<TResult> => {
  const validatedFields = schema.safeParse(value)

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: validatedFields.error.flatten().fieldErrors,
      errorFormat: validatedFields.error.format(),
      issues: validatedFields.error.issues,
    }
  }
}

export function withValidate<TResult, TData, TSchema extends ZodType>(schema : TSchema,  action : (data: TData) => Promise<ActionResultType<TResult>>) {
  return async(data: TData) => {
    const errors = ZparseOrError<TSchema, TResult>(schema, data)
    if (errors) return errors

    return action(data)
  }
}

export function withValidateAndSession<TResult, TData, TSchema extends ZodType>(schema : TSchema,  action : (data: TData, userId: string) => Promise<ActionResultType<TResult>>) {
  return async(data: TData) => {
    const errors = ZparseOrError<TSchema, TResult>(schema, data)
    if (errors) return errors

    const userId = await getSessionUserIdOrThrow()

    return action(data, userId)
  }
}
