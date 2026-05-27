import type { TCongregation, TTag } from '~/db/schema'

export type TypeCongregation = Omit<TCongregation, 'congregationTags'> & {
  tags: TTag[]
}
