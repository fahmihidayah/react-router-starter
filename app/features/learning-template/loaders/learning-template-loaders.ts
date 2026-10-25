import * as learnerService from '~/features/learners/services'
import { userContext } from '~/features/users/contexts'
import type { Arguments } from '~/lib/types'
import * as service from '../services'

function userIdFrom(args: Arguments): string {
  const authSession = args.context.get(userContext)
  if (!authSession.user) throw new Response('Unauthorized', { status: 401 })
  return authSession.user.id
}

export function learningTemplateCatalogLoader(args: Arguments) {
  return service.findCatalogForUser(userIdFrom(args))
}

export async function learningTemplateDetailLoader(args: Arguments, templateId: string) {
  const userId = userIdFrom(args)
  const [template, learners] = await Promise.all([
    service.findByIdAccessible(templateId, userId),
    learnerService.findAllContributableForUser(userId),
  ])
  if (!template) throw new Response('Template not found', { status: 404 })
  return { template, learners, isOwner: template.ownerUserId === userId }
}
