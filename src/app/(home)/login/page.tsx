import { HomeHeroLogin } from '@/components/layouts/home-hero-login'

export default async function HomePageLogin({
  searchParams
}: {
searchParams: Promise<{ email: string }>
}) {
  const { email } = await searchParams

  return <HomeHeroLogin email={email} />
}
