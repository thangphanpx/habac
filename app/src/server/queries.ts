import { sql } from './db'
import type { Product, Service, Project, Site } from '../lib/types'

export async function getSite(): Promise<Site> {
  const rows: { key: string; value: string }[] = await sql`select key, value from settings`
  const settings = Object.fromEntries(rows.map(row => [row.key, row.value]))
  return { company: '', address: '', phone: '', email: '', ...settings }
}

export const listServices = (): Promise<Service[]> => sql`select * from services where published order by position, id`
export const listProducts = (): Promise<Product[]> => sql`select * from products where published order by position, id`
export const listProjects = (): Promise<Project[]> => sql`select * from projects where published order by position, id`

export async function getService(slug: string): Promise<Service | null> {
  const [row] = await sql`select * from services where slug = ${slug} and published`
  return row ?? null
}
export async function getProduct(slug: string): Promise<Product | null> {
  const [row] = await sql`select * from products where slug = ${slug} and published`
  return row ?? null
}
