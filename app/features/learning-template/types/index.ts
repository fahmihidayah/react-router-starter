import type { TLearningTemplate, TLearningTemplateGoal } from '~/db/schema'

export type LearningTemplateWithGoals = TLearningTemplate & {
  goals: TLearningTemplateGoal[]
  ownerName: string
}

export type LearningTemplateCatalogItem = TLearningTemplate & {
  goalCount: number
  ownerName: string
}

export type LearningTemplateCatalog = {
  owned: LearningTemplateCatalogItem[]
  publicFromOthers: LearningTemplateCatalogItem[]
}
