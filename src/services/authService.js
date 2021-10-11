import { createToken } from '../api/ambry'

const signIn = async (host, email, password) => {
  const { token } = await createToken(host, email, password)
  return { host, email, token }
}

export const authService = { signIn }
