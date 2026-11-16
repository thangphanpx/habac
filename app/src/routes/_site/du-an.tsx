import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Intro, Photo, pageHead } from '../../components/site'
import { getProjectsFn } from '../../lib/public.functions'
import { PROJECT_CATEGORIES } from '../../lib/permissions'
import type { Project } from '../../lib/types'

export const Route = createFileRoute('/_site/du-an')({
  loader: () => getProjectsFn(),
  head: () => pageHead('Thư viện công trình', 'Hình ảnh công trình, hệ thống và thiết bị thực tế từ thư viện Ngân Hà.'),
  component: Projects,
})

type Filter = 'all' | Project['category']

function Projects() {
  const projects = Route.useLoaderData()
  const [filter, setFilter] = useState<Filter>('all')
  const [current, setCurrent] = useState<number | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)

  const visible = filter === 'all' ? projects : projects.filter(project => project.category === filter)
  const shown = current === null ? null : visible[current]
  const filterLabel = filter === 'all' ? 'Tất cả' : PROJECT_CATEGORIES[filter]

  useEffect(() => {
    document.body.classList.toggle('modal-open', current !== null)
    return () => document.body.classList.remove('modal-open')
  }, [current])

  const open = (event: MouseEvent<HTMLElement>, index: number) => {
    event.preventDefault()
    openerRef.current = event.currentTarget
    setCurrent(index)
    dialogRef.current?.showModal()
  }
  const step = (delta: number) => setCurrent(index => (((index ?? 0) + delta) % visible.length + visible.length) % visible.length)
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') step(-1)
    if (event.key === 'ArrowRight') step(1)
  }
  const onClose = () => {
    setCurrent(null)
    openerRef.current?.focus()
  }

  return (
    <>
      <Intro title="Thư viện công trình" text="Hình ảnh hệ thống, thiết bị và hoạt động thi công từ thư viện dự án Ngân Hà." />
      <section className="section">
        <div className="wrap">
          <div className="filters" role="group" aria-label="Lọc hình ảnh">
            <button className="filter" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>Tất cả</button>
            {Object.entries(PROJECT_CATEGORIES).map(([key, label]) => (
              <button key={key} className="filter" aria-pressed={filter === key} onClick={() => setFilter(key as Filter /* khóa lấy từ PROJECT_CATEGORIES */)}>{label}</button>
            ))}
          </div>
          <p className="filter-status" role="status">{visible.length} hình ảnh · {filterLabel}</p>
          <div className="gallery-grid">
            {visible.map((project, index) => (
              <figure key={project.id} className="gallery-item" data-reveal>
                <a className="gallery-open" href={project.image} aria-label={`Phóng to: ${project.title}`} onClick={event => open(event, index)}>
                  <Photo src={project.image} alt={project.title} />
                </a>
                <figcaption>{project.title}<span>{project.description}</span></figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
      <dialog ref={dialogRef} className="lightbox" aria-label="Ảnh công trình phóng to" onClose={onClose} onKeyDown={onKeyDown}
        onClick={event => { if (event.target === dialogRef.current) dialogRef.current?.close() }}>
        <div className="lightbox-inner">
          <img className="lightbox-image" src={shown?.image} alt={shown?.title ?? ''} width={1200} height={900} />
          <p className="lightbox-caption" aria-live="polite">{shown ? `${(current ?? 0) + 1} / ${visible.length} — ${shown.title}` : ''}</p>
          <div className="lightbox-actions">
            <button onClick={() => step(-1)}>Ảnh trước</button>
            <button className="close-dialog" autoFocus onClick={() => dialogRef.current?.close()}>Đóng ảnh</button>
            <button onClick={() => step(1)}>Ảnh tiếp</button>
          </div>
        </div>
      </dialog>
    </>
  )
}
