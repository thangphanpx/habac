import { Outlet, createFileRoute } from '@tanstack/react-router'
import { Footer, Header, useRevealOnScroll } from '../components/site'
import { getSiteFn } from '../lib/public.functions'

export const Route = createFileRoute('/_site')({
  loader: () => getSiteFn(),
  head: () => ({
    links: [
      { rel: 'preload', href: '/assets/fonts/hanken-grotesk-variable.ttf', as: 'font', type: 'font/ttf', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: '/assets/styles.css' },
    ],
  }),
  component: SiteLayout,
})

function SiteLayout() {
  const site = Route.useLoaderData()
  useRevealOnScroll()
  return (
    <>
      <Header />
      <main id="main"><Outlet /></main>
      <Footer site={site} />
    </>
  )
}
