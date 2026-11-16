import { createServerFn } from '@tanstack/react-start'
import { notFound } from '@tanstack/react-router'
import { getProduct, getService, getSite, listProducts, listProjects, listServices } from '../server/queries'

export const getSiteFn = createServerFn({ method: 'GET' }).handler(() => getSite())

export const getHomeFn = createServerFn({ method: 'GET' }).handler(async () => {
  const [services, products, projects] = await Promise.all([listServices(), listProducts(), listProjects()])
  return { services, products, projects: projects.slice(0, 3) }
})

export const getServicesFn = createServerFn({ method: 'GET' }).handler(() => listServices())
export const getProductsFn = createServerFn({ method: 'GET' }).handler(() => listProducts())
export const getProjectsFn = createServerFn({ method: 'GET' }).handler(() => listProjects())

export const getServiceFn = createServerFn({ method: 'GET' })
  .validator((slug: string) => slug)
  .handler(async ({ data }) => {
    const row = await getService(data)
    if (!row) throw notFound()
    return row
  })

export const getProductFn = createServerFn({ method: 'GET' })
  .validator((slug: string) => slug)
  .handler(async ({ data }) => {
    const row = await getProduct(data)
    if (!row) throw notFound()
    return row
  })
