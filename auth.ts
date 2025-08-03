import authConfig from "@/auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { UserRole, User } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";

import { prisma } from "@/lib/db";
import { getUserById } from "@/lib/user";

// More info: https://authjs.dev/getting-started/typescript#module-augmentation
declare module "next-auth" {
  interface Session {
    user: {
      role: UserRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    lastFetch?: number;
  }
}

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    // error: "/auth/error",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      try {
        // Handle OAuth callback URLs more efficiently
        if (url.startsWith("/")) return `${baseUrl}${url}`
        // Allow same origin URLs
        else if (new URL(url).origin === baseUrl) return url
        // Default redirect to dashboard
        return `${baseUrl}/dashboard`
      } catch (error) {
        console.error("Redirect error:", error);
        return `${baseUrl}/dashboard`;
      }
    },
    async session({ token, session }) {
      if (session.user) {
        if (token.sub) {
          session.user.id = token.sub;
        }

        if (token.email) {
          session.user.email = token.email;
        }

        if (token.role) {
          session.user.role = token.role;
        }

        session.user.name = token.name;
        session.user.image = token.picture;
      }

      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        // This runs when the user first signs in
        const dbUser = user as User;
        token.role = dbUser.role;
        token.name = dbUser.name;
        token.email = dbUser.email;
        token.picture = dbUser.image;
        return token;
      }

      // Only fetch user data if we don't have it or if it's been more than 5 minutes
      if (token.sub && (!token.lastFetch || Date.now() - (token.lastFetch || 0) > 300000)) {
        try {
          const dbUser = await getUserById(token.sub);
          if (dbUser) {
            token.name = dbUser.name;
            token.email = dbUser.email;
            token.picture = dbUser.image;
            token.role = dbUser.role;
            token.lastFetch = Date.now();
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }

      return token;
    },
  },
  ...authConfig,
  // debug: process.env.NODE_ENV !== "production"
});
