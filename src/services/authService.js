import { createToken } from '../api/ambry'

const signIn = async (email, password) => {
  const { token } = await createToken(email, password)
  return {
    token: token,
    email: email
  }
}

export const authService = { signIn }
