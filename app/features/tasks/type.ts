// Types
export type Task = {
  id: string
  title: string | null
  description: string | null
  createdAt: Date | null
  updatedAt: Date | null
}

export type TaskForm = {
  title: string
  description: string
}
