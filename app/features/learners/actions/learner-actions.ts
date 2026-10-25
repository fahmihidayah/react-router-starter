import { redirect } from 'react-router'
import * as mediaService from '~/features/media/services'
import { userContext } from '~/features/users/contexts'
import type { ActionArgs } from '~/lib/types'
import { logger } from '~/utils/logger'
import {
  addLearnerAccessSchema,
  createLearnerSchema,
  learnerGroupSchema,
  updateLearnerSchema,
} from '../schemas/form/learner-schema'
import * as learnerService from '../services'

const deleteLogger = logger.scope('LearnerDelete')

type LearnerActionFailure = {
  success: false
  errors: Record<string, string[] | undefined>
}

export type LearnerAccessActionFailure = LearnerActionFailure & {
  scope: 'access'
}

export type LearnerGroupActionFailure = LearnerActionFailure & {
  scope: 'learner-group'
  operation: 'create' | 'rename'
  groupId?: string
}

function learnerInput(formData: FormData) {
  return {
    name: formData.get('name'),
    dateOfBirth: formData.get('dateOfBirth'),
  }
}

function avatarFile(formData: FormData): File | undefined {
  const value = formData.get('avatar')
  return value instanceof File && value.size > 0 ? value : undefined
}

async function uploadAvatar(file: File, learnerName: string) {
  const id = await mediaService.create({ alt: `${learnerName} profile image` }, file)
  try {
    const media = await mediaService.findById(id)
    if (!media) throw new Error('Unable to retrieve the uploaded image')
    return media
  } catch (error) {
    await mediaService.deleteById(id).catch(() => undefined)
    throw error
  }
}

function avatarFailure(error: unknown): LearnerActionFailure {
  return {
    success: false,
    errors: {
      avatar: [error instanceof Error ? error.message : 'Unable to upload the profile image'],
    },
  }
}

function currentUserId(args: ActionArgs): string {
  const authSession = args.context.get(userContext)
  if (!authSession.user) throw new Response('Unauthorized', { status: 401 })
  return authSession.user.id
}

export async function createLearnerAction(
  args: ActionArgs,
): Promise<Response | LearnerActionFailure> {
  const formData = await args.request.formData()
  const parsed = createLearnerSchema.safeParse(learnerInput(formData))

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors }
  }

  const userId = currentUserId(args)
  let uploadedMedia: Awaited<ReturnType<typeof uploadAvatar>> | undefined
  const file = avatarFile(formData)
  if (file) {
    try {
      uploadedMedia = await uploadAvatar(file, parsed.data.name)
    } catch (error) {
      return avatarFailure(error)
    }
  }

  try {
    await learnerService.createForUser({ ...parsed.data, avatar: uploadedMedia?.url || '' }, userId)
  } catch (error) {
    if (uploadedMedia) await mediaService.deleteById(uploadedMedia.id).catch(() => undefined)
    throw error
  }
  return redirect('/track-app/learners')
}

export async function updateLearnerAction(
  args: ActionArgs,
  id: string,
): Promise<Response | LearnerActionFailure> {
  const formData = await args.request.formData()
  const parsed = updateLearnerSchema.safeParse(learnerInput(formData))

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors }
  }

  const userId = currentUserId(args)
  const currentLearner = await learnerService.findByIdOwned(id, userId)
  if (!currentLearner) throw new Response('Learner not found', { status: 404 })

  let uploadedMedia: Awaited<ReturnType<typeof uploadAvatar>> | undefined
  const file = avatarFile(formData)
  if (file) {
    try {
      uploadedMedia = await uploadAvatar(file, parsed.data.name)
    } catch (error) {
      return avatarFailure(error)
    }
  }

  let learner: Awaited<ReturnType<typeof learnerService.updateForUser>>
  try {
    learner = await learnerService.updateForUser(id, userId, {
      ...parsed.data,
      avatar: uploadedMedia?.url || currentLearner.avatar || '',
    })
  } catch (error) {
    if (uploadedMedia) await mediaService.deleteById(uploadedMedia.id).catch(() => undefined)
    throw error
  }
  if (!learner) {
    if (uploadedMedia) await mediaService.deleteById(uploadedMedia.id).catch(() => undefined)
    throw new Response('Learner not found', { status: 404 })
  }

  return redirect(`/track-app/learners/${id}?tab=settings`)
}

export async function deleteLearnerAction(args: ActionArgs, id: string): Promise<Response> {
  const userId = currentUserId(args)
  deleteLogger.info('Action started', { learnerId: id, userId })

  const learner = await learnerService.findByIdOwned(id, userId)
  if (!learner) {
    deleteLogger.warn('Owned learner was not found', { learnerId: id, userId })
    throw new Response('Learner not found', { status: 404 })
  }

  const formData = await args.request.formData()
  const confirmation = formData.get('confirmation')
  if (typeof confirmation !== 'string' || confirmation.trim() !== learner.name) {
    deleteLogger.warn('Confirmation did not match learner name', { learnerId: id, userId })
    throw new Response('Learner name does not match', { status: 400 })
  }

  const deleted = await learnerService.deleteForUser(id, userId)
  if (!deleted) {
    deleteLogger.warn('Delete query did not remove a learner', { learnerId: id, userId })
    throw new Response('Learner not found', { status: 404 })
  }

  deleteLogger.info('Learner deleted; redirecting to learner list', { learnerId: id, userId })
  return redirect('/track-app/learners')
}

export async function addLearnerAccessAction(
  args: ActionArgs,
  id: string,
): Promise<Response | LearnerAccessActionFailure> {
  const formData = await args.request.formData()
  const parsed = addLearnerAccessSchema.safeParse({
    email: formData.get('email'),
    role: formData.get('role'),
  })

  if (!parsed.success) {
    return {
      success: false,
      scope: 'access',
      errors: parsed.error.flatten().fieldErrors,
    }
  }

  const result = await learnerService.addAccessForUser(id, currentUserId(args), parsed.data)
  if (result === 'learner-not-found') throw new Response('Learner not found', { status: 404 })
  if (result === 'user-not-found') {
    return {
      success: false,
      scope: 'access',
      errors: { email: ['No registered user was found with this email address'] },
    }
  }
  if (result === 'already-exists') {
    return {
      success: false,
      scope: 'access',
      errors: { email: ['This user already has access to the learner'] },
    }
  }

  return redirect(`/track-app/learners/${id}?tab=access`)
}

export async function createLearnerGroupAction(
  args: ActionArgs,
): Promise<Response | LearnerGroupActionFailure> {
  const formData = await args.request.formData()
  const parsed = learnerGroupSchema.safeParse({ name: formData.get('name') })
  if (!parsed.success) {
    return {
      success: false,
      scope: 'learner-group',
      operation: 'create',
      errors: parsed.error.flatten().fieldErrors,
    }
  }
  const result = await learnerService.createGroupForUser(parsed.data.name, currentUserId(args))
  if (result === 'duplicate') {
    return {
      success: false,
      scope: 'learner-group',
      operation: 'create',
      errors: { name: ['A learner group with this name already exists'] },
    }
  }
  return redirect('/track-app/learners')
}

export async function renameLearnerGroupAction(
  args: ActionArgs,
  groupId: string,
): Promise<Response | LearnerGroupActionFailure> {
  const formData = await args.request.formData()
  const parsed = learnerGroupSchema.safeParse({ name: formData.get('name') })
  if (!parsed.success) {
    return {
      success: false,
      scope: 'learner-group',
      operation: 'rename',
      groupId,
      errors: parsed.error.flatten().fieldErrors,
    }
  }
  const result = await learnerService.renameGroupForUser(
    groupId,
    parsed.data.name,
    currentUserId(args),
  )
  if (!result) throw new Response('Learner group not found', { status: 404 })
  if (result === 'duplicate') {
    return {
      success: false,
      scope: 'learner-group',
      operation: 'rename',
      groupId,
      errors: { name: ['A learner group with this name already exists'] },
    }
  }
  return redirect('/track-app/learners')
}

export async function deleteLearnerGroupAction(
  args: ActionArgs,
  groupId: string,
): Promise<Response> {
  const deleted = await learnerService.deleteGroupForUser(groupId, currentUserId(args))
  if (!deleted) throw new Response('Learner group not found', { status: 404 })
  return redirect('/track-app/learners')
}

export async function moveLearnerToGroupAction(
  args: ActionArgs,
  learnerId: string,
): Promise<Response> {
  const formData = await args.request.formData()
  const rawGroupId = formData.get('groupId')
  if (typeof rawGroupId !== 'string') throw new Response('Group ID is required', { status: 400 })
  const moved = await learnerService.moveToGroupForUser(
    learnerId,
    rawGroupId || null,
    currentUserId(args),
  )
  if (!moved) throw new Response('Learner or group not found', { status: 404 })
  return redirect('/track-app/learners')
}
