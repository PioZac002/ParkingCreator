import type { NextAuthConfig } from "next-auth";

// Edge-compatible auth config (no Prisma, no Node.js-only modules).
// Used in middleware/proxy for JWT validation.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const u = user as unknown as Record<string, unknown>;
        token.role = u.role as string;
        token.estateId = u.estateId as string | null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        const s = session.user as unknown as Record<string, unknown>;
        s.role = token.role;
        s.estateId = token.estateId;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
