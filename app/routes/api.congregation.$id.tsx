import { getCongregationByIdLoader } from '~/features/congregations/loaders/get-congregation-by-id-loader'

export async function loader({ params }: { params: { id: string } }) {
  const congregation = await getCongregationByIdLoader(params.id, true)

  if (!congregation) {
    throw new Response('Congregation not found', { status: 404 })
  }

  return congregation
}
