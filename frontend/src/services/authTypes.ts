export interface AuthUser {
  id: string
  firstName: string
  lastName: string
  email: string
}

export type LinkPurpose = 'activation' | 'reset'

export type ApiErrorCode =
  | 'validation'
  | 'invalid_credentials'
  | 'account_pending'
  | 'locked'
  | 'weak_password'
  | 'invalid_link'
  | 'invalid_image'
  | 'image_too_large'
  | 'not_found'
  | 'own_job'
  | 'profile_incomplete'
