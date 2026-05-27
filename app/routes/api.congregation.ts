import { congregationRepository } from "~/features/congregations/repositories"

export async function loader() {

  const list = await congregationRepository.findAll()

  return Response.json({
    message: "Success",
    data: list
  })
}
