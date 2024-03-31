import http from '@/lib/http'
import { LoginResType, RegisterBodyType, RegisterResType } from '@/schemaValidations/auth.schema'

const authApiRequest = {
  login: (body: { email: string; password: string }) =>
    http.post<LoginResType>('/auth/login', body),
  register: (body: { email: string; name: string; password: string }) =>
    http.post<RegisterResType>('/auth/register', body),
  auth: (body: { sessionToken: string }) =>
    http.post('/api/auth', body, {
      baseUrl: ''
    })
}

export default authApiRequest
