import { commonNames, swNames } from '@/lib/collection-names'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type ArrayType<T> = T extends (infer Item)[] ? Item : T

export const sleep = (s: number) => new Promise((r) => setTimeout(r, s * 1000))

export const mapToArray = <T>(map: Map<string, T>): T[] =>
  Array.from(map, ([, value]) => value)

export const arrayToMap = <T>(datas: T[]) =>
  new Map<string, T>(datas.map((e) => [crypto.randomUUID(), e]))

export const findIndexOfKeyMap = (map: Map<string, unknown>, key: string) =>  {
  let index = 0
  for (const [mapKey] of map) {
    if (mapKey === key) {
      return index
    }
    index++
  }
  return -1
}

export const randomSwName = () => swNames[Math.floor(Math.random() * swNames.length)]

export const randomCommonName = () => commonNames[Math.floor(Math.random() * commonNames.length)]

export function generateRandomGroup(questionCount: number = 6, responsesCount: number = 4) {
  const questions: unknown[] = []
  for (let q = 0; q < questionCount; q++) {

    const responses: unknown[] = []
    for (let r = 0; r < responsesCount; r++) {
      const isGood = (q + r) % 2 == 0
      responses.push({
        id: null,
        text: (isGood ? 'Good Response ' : 'Bad Response ') + randomSwName(),
        isCorrect: isGood
      })
    }

    questions.push({
      id: null,
      order: q + 1,
      title: null,
      subject: 'Question ' + randomCommonName(),
      responses
    })
  }

  return arrayToMap(questions)
}

export function computeScore(results: number[]) {
  const success = results.filter(r => r === 100).length

  return {
    score: Math.round((success * 100) / results.length),
    success,
    failed: results.filter(r => r < 100).length,
  }
}

export function computeAchievement(goodCount: number, totalGood: number, choicesCount: number) {
  if (totalGood == 0) return 0

  else if (goodCount == totalGood && choicesCount == totalGood) return 100

  else if (goodCount < totalGood && choicesCount <= totalGood) return (goodCount * 100) / totalGood

  else {
    const diff = goodCount - (choicesCount - totalGood)
    const trueGoodCount = Math.max(diff, 0)
    return (trueGoodCount * 100) / totalGood
  }
}

export function diffDateToDhms(start : Date, end: Date, t : (key: string) => string) {
  return secondsToDhms(end.getTime() / 1000 - start.getTime() / 1000, t)
}

export function secondsToDhms(seconds : number, t : (key: string, o: unknown) => string) {
  const d = Math.floor(seconds / (3600*24))
  const h = Math.floor(seconds % (3600*24) / 3600)
  const m = Math.floor(seconds % 3600 / 60)
  const s = Math.floor(seconds % 60)

  let label = ''

  if (d > 0) label += ' ' + d + ' ' + (d == 1 ? t('Day', { ns: 'global' }) : t('Days', { ns: 'global' }))

  if (h > 0) label += ' ' + h + ' ' + (h == 1 ? t('Hour', { ns: 'global' }) : t('Hours', { ns: 'global' }))

  if (m > 0) label += ' ' + m + ' ' + (m == 1 ? 'minute' : 'minutes')

  label +=  ' ' + s + ' ' + (s == 1 ? t('Second', { ns: 'global' }) : t('Seconds', { ns: 'global' }))

  return label
}

export async function downloadBlob(res: Response) {
  const disposition = res.headers.get('Content-Disposition')
  const fileName = disposition!.split('filename=')[1].split(';')[0] ?? 'file'
  // const blob = new Blob([blob], { type: contentType! })
  const blob = await res.blob()

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', fileName)
  link.click()
}

export function capitalize(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1)
}


export function numberToChar(number: number) {
  return String.fromCharCode(65 + number)
}
