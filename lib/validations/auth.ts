import * as z from "zod"

export const userAuthSchema = z.object({
  email: z.string().email(),
})

export const credentialsAuthSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_-]+$/, {
    message: "Username can only contain letters, numbers, underscores, and hyphens"
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long"
  }),
})

export const registerSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_-]+$/, {
    message: "Username can only contain letters, numbers, underscores, and hyphens"
  }),
  email: z.string().email(),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long"
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const loginSchema = z.object({
  username: z.string().min(1, {
    message: "Username is required"
  }),
  password: z.string().min(1, {
    message: "Password is required"
  }),
})
