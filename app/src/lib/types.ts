import type { Role } from './permissions'

export type Service = { id: number; slug: string; title: string; subtitle: string; image: string; intro: string; description: string; scope: string[]; position: number; published: boolean }
export type Product = { id: number; slug: string; title: string; use_text: string; body: string; criteria: string[]; image: string; position: number; published: boolean }
export type Project = { id: number; title: string; description: string; image: string; category: 'water' | 'equipment' | 'construction'; position: number; published: boolean }
export type Inquiry = { id: number; name: string; phone: string; email: string; topic: string; message: string; status: 'new' | 'in_progress' | 'done'; note: string; created_at: string }
export type Site = { company: string; address: string; phone: string; email: string }
export type SessionUser = { id: number; email: string; name: string; role: Role }
export type AdminUser = SessionUser & { active: boolean; created_at: string }
