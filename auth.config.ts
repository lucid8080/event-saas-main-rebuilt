import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";

import { env } from "@/env.mjs";
import { sendVerificationRequest } from "@/lib/email";
import { comparePassword } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";

export default {
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    Resend({
      apiKey: env.RESEND_API_KEY,
      from: env.EMAIL_FROM,
      // sendVerificationRequest,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: Record<"username" | "password", string> | undefined) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { username: credentials.username },
                { email: credentials.username }, // Allow login with email too
              ],
            },
          });

          if (!user || !user.password) {
            return null;
          }

          const isPasswordValid = await comparePassword(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
            role: user.role,
            image: user.image,
          };
        } catch (error) {
          console.error("Credentials authorization error:", error);
          return null;
        }
      },
    }),
  ],
  // Add trusted hosts for production deployment
  trustHost: true,
} satisfies NextAuthConfig;
