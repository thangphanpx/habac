import { describe, expect, it } from 'bun:test'
import { legacyTarget } from './legacy'

describe('given a static-site html url', () => {
  it.each([
    ['/dich-vu.html', '/dich-vu'],
    ['dich-vu/tu-van-ho-so-moi-truong.html', '/dich-vu/tu-van-ho-so-moi-truong'],
    ['/thiet-bi/may-khuay.html', '/thiet-bi/may-khuay'],
    ['/index.html', '/'],
  ])('%s_redirects_to_the_clean_url_%s', (path, expected) => {
    expect(legacyTarget(path)).toBe(expected)
  })
})

describe('given a url from the old nganhaec.com website', () => {
  it.each([
    ['/nganhaec.com/sanpham/48920/may-khuay.html', '/thiet-bi/may-khuay'],
    ['/dichvu/3727/thiet-ke-he-thong-xu-ly-nuoc-thai-cong-nghiep.html', '/dich-vu/xu-ly-nuoc-thai-cong-nghiep'],
    ['/nganhaec.com/nganh/14564/tu-van-ho-so-moi-truong.html', '/dich-vu/tu-van-ho-so-moi-truong'],
    ['/gioithieu-2.html', '/gioi-thieu'],
    ['/nganhaec.com/nhomnganh/604/thiet-bi-xu-ly-nuoc-thiet-bi-moi-truong.html', '/thiet-bi'],
  ])('%s_redirects_to_%s', (path, expected) => {
    expect(legacyTarget(path)).toBe(expected)
  })
})

describe('given an unrelated path', () => {
  it.each(['/abc', '/random/page.html'])('%s_is_not_redirected', path => {
    expect(legacyTarget(path)).toBeNull()
  })
})
