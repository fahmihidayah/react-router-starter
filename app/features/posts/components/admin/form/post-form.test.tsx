// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PostForm } from './post-form'

const category = { id: 'category-1', title: 'News', createdAt: new Date(), updatedAt: new Date() }
afterEach(cleanup)

describe('admin post form', () => {
  it('submits editor content and exactly one category value from the edit form', async () => {
    const submitted = vi.fn()
    const post = {
      id: 'post-1',
      title: 'Existing post',
      slug: 'existing-post',
      content: 'Existing content',
      categoryId: category.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const router = createMemoryRouter(
      [
        {
          path: '/admin/posts/:id',
          element: <PostForm post={post} categories={[category]} />,
          action: async ({ request }) => {
            const data = await request.formData()
            submitted(Object.fromEntries(data), data.getAll('categoryId'))
            return null
          },
        },
      ],
      { initialEntries: ['/admin/posts/post-1'] },
    )
    render(<RouterProvider router={router} />)
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Post content' }).textContent).toBe(
        'Existing content',
      ),
    )
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Updated post' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save post' }))
    await waitFor(() => expect(submitted).toHaveBeenCalledOnce())
    const [data, categories] = submitted.mock.calls[0]
    expect(data.title).toBe('Updated post')
    expect(categories).toEqual([category.id])
    expect(JSON.parse(data.content).root.children[0].children[0].text).toBe('Existing content')
  })

  it('prevents creating posts until a category exists', () => {
    const router = createMemoryRouter([{ path: '/', element: <PostForm categories={[]} /> }])
    render(<RouterProvider router={router} />)
    expect(screen.getByRole('button', { name: 'Save post' }).hasAttribute('disabled')).toBe(true)
    expect(screen.getByRole('link', { name: 'Create a category' }).getAttribute('href')).toBe(
      '/admin/categories/new',
    )
  })
})
