import { db } from '../../prisma/client'

export const findUser = async (identifier: number | string) => {
  const where =
    typeof identifier === 'number'
      ? { id: identifier }
      : { username: identifier }

  const user = await db.user.findUnique({ where })
  return user
}

export const checkUserExists = async (identifier: number | string) => {
  const user = await findUser(identifier)
  return !!user
}

export const formatUserResponse = (user: any) => {
  const { password, ...rest } = user
  return rest
}

export const checkUserRole = async (userId: number, role: string) => {
  const userRole = await db.user.role(userId)
  return userRole === role
}
