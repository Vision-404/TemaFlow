/**
 * Validation utilities for TeamFlow
 * All user input should be validated before use
 */

export const ERROR_MESSAGES = {
  REQUIRED: "This field is required",
  INVALID_EMAIL: "Please enter a valid email address",
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters`,
  MAX_LENGTH: (max: number) => `Must be less than ${max} characters`,
  INVALID_FORMAT: "Invalid format",
  PASSWORD_WEAK: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
  SLUG_INVALID: "Use only letters, numbers, and hyphens",
  NAME_INVALID: "Use only letters, numbers, spaces, and hyphens",
} as const

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

/**
 * Validate password strength
 */
export const isStrongPassword = (password: string): boolean => {
  if (password.length < 8) return false
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  return hasUppercase && hasLowercase && hasNumber
}

/**
 * Validate slug format (for channels, workspaces)
 */
export const isValidSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 50
}

/**
 * Validate name format
 */
export const isValidName = (name: string): boolean => {
  const nameRegex = /^[\w\s\-.']+$/
  return nameRegex.test(name) && name.length >= 1 && name.length <= 100
}

/**
 * Validate string length
 */
export const validateLength = (
  value: string,
  min: number,
  max: number
): { valid: boolean; message?: string } => {
  if (value.length < min) {
    return { valid: false, message: ERROR_MESSAGES.MIN_LENGTH(min) }
  }
  if (value.length > max) {
    return { valid: false, message: ERROR_MESSAGES.MAX_LENGTH(max) }
  }
  return { valid: true }
}

/**
 * Sanitize string input
 */
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[^\x20-\x7E -퟿豈-﷏ﷰ-￯]/g, "") // Remove non-printable chars
}

/**
 * Sanitize HTML input (basic)
 */
export const sanitizeHTML = (input: string): string => {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

/**
 * Validate file upload
 */
export const validateFile = (
  file: File,
  allowedTypes: string[],
  maxSizeMB: number
): { valid: boolean; message?: string } => {
  // Check file type
  const isAllowedType = allowedTypes.some(type => file.type.includes(type))
  if (!isAllowedType) {
    return { valid: false, message: `File type ${file.type} is not allowed` }
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return { valid: false, message: `File must be smaller than ${maxSizeMB}MB` }
  }

  return { valid: true }
}

/**
 * Validate URL format
 */
export const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url)
    return ["http:", "https:"].includes(parsed.protocol)
  } catch {
    return false
  }
}

/**
 * Validate channel name
 */
export const validateChannelName = (name: string): { valid: boolean; message?: string } => {
  if (!name || name.trim().length === 0) {
    return { valid: false, message: ERROR_MESSAGES.REQUIRED }
  }

  if (name.length > 50) {
    return { valid: false, message: ERROR_MESSAGES.MAX_LENGTH(50) }
  }

  // Check for invalid characters
  const invalidChars = /[^a-zA-Z0-9_\s-]/
  if (invalidChars.test(name)) {
    return { valid: false, message: "Use only letters, numbers, spaces, underscores, and hyphens" }
  }

  // Don't allow starting with @ or #
  if (/^[@#]/.test(name)) {
    return { valid: false, message: "Name cannot start with @ or #" }
  }

  return { valid: true }
}

/**
 * Validate workspace name
 */
export const validateWorkspaceName = (name: string): { valid: boolean; message?: string } => {
  if (!name || name.trim().length === 0) {
    return { valid: false, message: ERROR_MESSAGES.REQUIRED }
  }

  if (name.length > 100) {
    return { valid: false, message: ERROR_MESSAGES.MAX_LENGTH(100) }
  }

  return { valid: true }
}

/**
 * Validate organization name
 */
export const validateOrganizationName = (name: string): { valid: boolean; message?: string } => {
  return validateWorkspaceName(name)
}

/**
 * Validate member email
 */
export const validateMemberEmail = (email: string): { valid: boolean; message?: string } => {
  if (!email || email.trim().length === 0) {
    return { valid: false, message: ERROR_MESSAGES.REQUIRED }
  }

  if (!isValidEmail(email)) {
    return { valid: false, message: ERROR_MESSAGES.INVALID_EMAIL }
  }

  return { valid: true }
}

/**
 * Validate role value
 */
export const isValidRole = (role: string): role is "owner" | "admin" | "member" | "guest" => {
  return ["owner", "admin", "member", "guest"].includes(role)
}