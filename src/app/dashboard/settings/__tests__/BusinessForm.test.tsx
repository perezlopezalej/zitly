import { describe, it, expect, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { createRoot } from 'react-dom/client'
import { act } from 'react'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

vi.mock('@/app/actions/business', () => ({
  updateBusinessAction: vi.fn(async () => ({ success: 'ok' })),
}))

import BusinessForm from '../BusinessForm'

function data(category: string | null) {
  return { name: 'Mi negocio', category, address: null, phone: null, contact_email: null }
}

function selectedOptions(category: string | null): string[] {
  const html = renderToStaticMarkup(<BusinessForm initialData={data(category)} />)
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return Array.from(doc.querySelectorAll('select[name="category"] option'))
    .filter((o) => o.hasAttribute('selected'))
    .map((o) => o.getAttribute('value') ?? '')
}

describe('BusinessForm category select', () => {
  it('muestra seleccionada la categoría guardada', () => {
    expect(selectedOptions('estetica')).toEqual(['estetica'])
  })

  it('usa general cuando no hay categoría', () => {
    expect(selectedOptions(null)).toEqual(['general'])
  })

  it('mantiene la categoría elegida tras guardar (reset del form de React 19)', async () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    const root = createRoot(el)
    await act(async () => { root.render(<BusinessForm initialData={data('general')} />) })

    const select = el.querySelector('select[name="category"]') as HTMLSelectElement
    await act(async () => {
      select.value = 'estetica'
      select.dispatchEvent(new Event('change', { bubbles: true }))
    })
    await act(async () => {
      el.querySelector('form')!.requestSubmit()
    })
    await act(async () => { root.render(<BusinessForm initialData={data('estetica')} />) })

    expect(select.value).toBe('estetica')
    await act(async () => { root.unmount() })
    el.remove()
  })
})
