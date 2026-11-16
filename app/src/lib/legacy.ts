const SERVICE = '/dich-vu/'
const LEGACY_ROOTS = ['dichvu', 'sanpham', 'nganh', 'nhomnganh', 'gioithieu', 'lienhe', 'thuvienanh']
const PAGES = ['dich-vu', 'thiet-bi', 'gioi-thieu', 'du-an', 'lien-he']

// Từng điều kiện thử theo thứ tự, giống quy tắc ánh xạ của bản tĩnh cũ.
const LEGACY_RULES: { matches: (path: string, name: string) => boolean; target: (name: string) => string }[] = [
  { matches: (_, name) => name.startsWith('gioithieu'), target: () => '/gioi-thieu' },
  { matches: (_, name) => name.startsWith('lienhe'), target: () => '/lien-he' },
  { matches: (_, name) => name.startsWith('thuvienanh'), target: () => '/du-an' },
  { matches: path => path.includes('sanpham/'), target: name => `/thiet-bi/${name}` },
  { matches: (_, name) => name.includes('thiet-bi-'), target: () => '/thiet-bi' },
  { matches: (_, name) => name.includes('tu-van-'), target: () => `${SERVICE}tu-van-ho-so-moi-truong` },
  { matches: (_, name) => name.includes('cong-nghiep'), target: () => `${SERVICE}xu-ly-nuoc-thai-cong-nghiep` },
  { matches: (_, name) => name.includes('sinh-hoat'), target: () => `${SERVICE}xu-ly-nuoc-thai-sinh-hoat` },
]

/** Trả về đường dẫn mới cho URL `.html` hoặc URL của website cũ; null nếu không phải URL cũ. */
export function legacyTarget(rawPath: string): string | null {
  const path = rawPath.replace(/^\/+/, '').replace(/^nganhaec\.com\//, '')
  if (!path.endsWith('.html')) return null
  const clean = path.slice(0, -'.html'.length)
  if (clean === 'index') return '/'
  const segments = clean.split('/')
  const [root] = segments
  const maxDepth = root === 'dich-vu' || root === 'thiet-bi' ? 2 : 1
  if (PAGES.includes(root) && segments.length <= maxDepth) return `/${clean}`
  if (!LEGACY_ROOTS.some(legacyRoot => root.startsWith(legacyRoot))) return null
  const name = segments.at(-1) ?? ''
  return LEGACY_RULES.find(rule => rule.matches(clean, name))?.target(name) ?? '/dich-vu'
}
