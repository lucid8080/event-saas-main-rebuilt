// import { createEnv } from "@t3-oss/env-nextjs";
// import { z } from "zod";

// Temporary workaround while zod module is missing
export const env = {
  // Server environment variables
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  AUTH_SECRET: process.env.AUTH_SECRET || "",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GITHUB_OAUTH_TOKEN: process.env.GITHUB_OAUTH_TOKEN || "",
  DATABASE_URL: process.env.DATABASE_URL || "",
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  EMAIL_FROM: process.env.EMAIL_FROM || "",
  STRIPE_API_KEY: process.env.STRIPE_API_KEY || "",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID || "",
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY || "",
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || "",
  R2_ENDPOINT: process.env.R2_ENDPOINT || "",
  
  // Client environment variables
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "",
  NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PLAN_ID: process.env.NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PLAN_ID || "",
  NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PLAN_ID: process.env.NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PLAN_ID || "",
  NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID || "",
  NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID || "",
  NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID || "",
  NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID || "",
  NEXT_PUBLIC_IDEOGRAM_API_KEY: process.env.NEXT_PUBLIC_IDEOGRAM_API_KEY || "",
  NEXT_PUBLIC_HUGGING_FACE_API_TOKEN: process.env.NEXT_PUBLIC_HUGGING_FACE_API_TOKEN || "",
  FAL_KEY: process.env.FAL_KEY || "",
};

// TODO: Re-enable proper environment validation once zod is properly installed
// export const env = createEnv({
//   server: {
//     // This is optional because it's only used in development.
//     // See https://next-auth.js.org/deployment.
//     NEXTAUTH_URL: z.string().url().optional().default("http://localhost:3000"),
//     AUTH_SECRET: z.string().min(1),
//     GOOGLE_CLIENT_ID: z.string().min(1),
//     GOOGLE_CLIENT_SECRET: z.string().min(1),
//     GITHUB_OAUTH_TOKEN: z.string().min(1),
//     DATABASE_URL: z.string().min(1),
//     RESEND_API_KEY: z.string().min(1),
//     EMAIL_FROM: z.string().min(1),
//     STRIPE_API_KEY: z.string().min(1),
//     STRIPE_WEBHOOK_SECRET: z.string().min(1),
//     // Cloudflare R2 Configuration
//     R2_ACCESS_KEY_ID: z.string().min(1),
//     R2_SECRET_ACCESS_KEY: z.string().min(1),
//     R2_BUCKET_NAME: z.string().min(1),
//     R2_ENDPOINT: z.string().url(),
//   },
//   client: {
//     NEXT_PUBLIC_APP_URL: z.string().min(1),
//     NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PLAN_ID: z.string().min(1),
//     NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PLAN_ID: z.string().min(1),
//     NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID: z.string().min(1),
//     NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID: z.string().min(1),
//     NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID: z.string().min(1),
//     NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID: z.string().min(1),
//     NEXT_PUBLIC_IDEOGRAM_API_KEY: z.string().min(1),
//   },
//   runtimeEnv: {
//     NEXTAUTH_URL: process.env.NEXTAUTH_URL,
//     AUTH_SECRET: process.env.AUTH_SECRET,
//     GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
//     GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
//     GITHUB_OAUTH_TOKEN: process.env.GITHUB_OAUTH_TOKEN,
//     DATABASE_URL: process.env.DATABASE_URL,
//     RESEND_API_KEY: process.env.RESEND_API_KEY,
//     EMAIL_FROM: process.env.EMAIL_FROM,
//     NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
//     // Stripe
//     STRIPE_API_KEY: process.env.STRIPE_API_KEY,
//     STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
//     NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PLAN_ID:
//       process.env.NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PLAN_ID,
//     NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PLAN_ID:
//       process.env.NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PLAN_ID,
//     NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID:
//       process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID,
//     NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID:
//       process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID,
//     NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID:
//       process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID,
//     NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID:
//       process.env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID,
//     // Ideogram AI
//     NEXT_PUBLIC_IDEOGRAM_API_KEY: process.env.NEXT_PUBLIC_IDEOGRAM_API_KEY,
//     // Cloudflare R2
//     R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
//     R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
//     R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
//     R2_ENDPOINT: process.env.R2_ENDPOINT,
//   },
// });
