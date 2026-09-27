// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { createRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RichEditor, type RichEditorHandle } from './editor'
import { RichEditorViewer } from './viewer'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('rich editor', () => {
  it('preserves plain text and supports controlled resets without echoing changes', async () => {
    const ref = createRef<RichEditorHandle>()
    const onChange = vi.fn()
    const { rerender } = render(<RichEditor ref={ref} value="Original text" onChange={onChange} />)
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Post content' }).textContent).toBe(
        'Original text',
      ),
    )
    rerender(<RichEditor ref={ref} value="" onChange={onChange} />)
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Post content' }).textContent).toBe(''),
    )
    expect(onChange).not.toHaveBeenCalled()
    expect(JSON.parse(ref.current?.getJSON() ?? '{}').root.children).toHaveLength(1)
  })

  it('round trips code, images and alignment through the read-only viewer', async () => {
    const ref = createRef<RichEditorHandle>()
    const { unmount } = render(<RichEditor ref={ref} initialContent="Hello" />)
    const state = JSON.parse(ref.current?.getJSON() ?? '{}')
    state.root.children[0].format = 'center'
    state.root.children.push({
      type: 'code',
      version: 1,
      language: 'javascript',
      direction: null,
      format: '',
      indent: 0,
      children: [
        {
          type: 'text',
          version: 1,
          text: 'const answer = 42',
          format: 0,
          detail: 0,
          mode: 'normal',
          style: '',
        },
      ],
    })
    state.root.children.push({
      type: 'paragraph',
      version: 1,
      direction: null,
      format: 'right',
      indent: 0,
      children: [
        { type: 'image', version: 1, src: '/uploads/example.png', altText: 'Example image' },
      ],
    })
    act(() => ref.current?.setJSON(JSON.stringify(state)))
    await waitFor(() => expect(screen.getByAltText('Example image')).toBeTruthy())
    const saved = ref.current?.getJSON() ?? '{}'
    unmount()
    const { container } = render(<RichEditorViewer content={saved} />)
    await waitFor(() => expect(screen.getByAltText('Example image')).toBeTruthy())
    expect(container.querySelector('[contenteditable="false"]')).toBeTruthy()
    expect(container.querySelector('p')?.style.textAlign).toBe('center')
    expect(container.textContent).toContain('const answer = 42')
    expect(screen.queryByRole('button', { name: 'Remove image' })).toBeNull()
  })

  it('inserts and removes an image using the toolbar', async () => {
    const ref = createRef<RichEditorHandle>()
    render(<RichEditor ref={ref} />)
    fireEvent.click(screen.getByRole('button', { name: 'Insert image' }))
    fireEvent.change(screen.getByLabelText('Image URL'), {
      target: { value: 'javascript:alert(1)' },
    })
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Insert image' }),
    )
    expect(screen.getByRole('alert').textContent).toContain('HTTP(S)')
    fireEvent.change(screen.getByLabelText('Image URL'), {
      target: { value: '/uploads/photo.png' },
    })
    fireEvent.change(screen.getByLabelText('Image description'), { target: { value: 'A photo' } })
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Insert image' }),
    )
    await waitFor(() => expect(screen.getByAltText('A photo')).toBeTruthy())
    fireEvent.click(screen.getByRole('button', { name: 'Remove image' }))
    await waitFor(() => expect(screen.queryByAltText('A photo')).toBeNull())
  })
})

describe('image uploads', () => {
  it('uploads once and inserts the returned media URL instead of a local preview URL', async () => {
    vi.stubGlobal(
      'URL',
      class extends URL {
        static createObjectURL() {
          return 'blob:preview'
        }
        static revokeObjectURL() {
          /* No browser object URL is allocated in this test. */
        }
      },
    )
    const upload = vi.fn().mockResolvedValue({
      ok: true,
      redirected: false,
      json: async () => ({ url: '/api/media/files/uploaded.webp' }),
    })
    vi.stubGlobal('fetch', upload)
    const ref = createRef<RichEditorHandle>()
    render(<RichEditor ref={ref} />)
    fireEvent.click(screen.getByRole('button', { name: 'Insert image' }))
    const file = new File(['photo'], 'photo.png', { type: 'image/png' })
    fireEvent.change(screen.getByLabelText('Upload image'), { target: { files: [file] } })
    fireEvent.change(screen.getByLabelText('Image description'), {
      target: { value: 'Uploaded photo' },
    })
    const button = screen.getByRole('button', { name: 'Upload and insert' })
    fireEvent.click(button)
    fireEvent.click(button)
    await waitFor(() =>
      expect(screen.getByAltText('Uploaded photo').getAttribute('src')).toBe(
        '/api/media/files/uploaded.webp',
      ),
    )
    expect(upload).toHaveBeenCalledOnce()
    const [url, options] = upload.mock.calls[0]
    expect(url).toBe('/admin/media/upload')
    expect(options.body.get('file')).toBe(file)
    expect(options.body.get('alt')).toBe('Uploaded photo')
    expect(ref.current?.getJSON()).toContain('/api/media/files/uploaded.webp')
    expect(ref.current?.getJSON()).not.toContain('blob:preview')
  })

  it('keeps the dialog open and permits retry after an upload failure', async () => {
    vi.stubGlobal(
      'URL',
      class extends URL {
        static createObjectURL() {
          return 'blob:preview'
        }
        static revokeObjectURL() {
          /* No browser object URL is allocated in this test. */
        }
      },
    )
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ errors: { form: ['Image exceeds size limit'] } }),
      }),
    )
    render(<RichEditor />)
    fireEvent.click(screen.getByRole('button', { name: 'Insert image' }))
    fireEvent.change(screen.getByLabelText('Upload image'), {
      target: { files: [new File(['photo'], 'photo.png', { type: 'image/png' })] },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Upload and insert' }))
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toBe('Image exceeds size limit'),
    )
    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Upload and insert' }).hasAttribute('disabled')).toBe(
      false,
    )
  })
})
