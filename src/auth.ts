import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/db";

const allowedEmails = (process.env.ALLOWED_USERS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      if (allowedEmails.length > 0) {
        return allowedEmails.includes(user.email.toLowerCase());
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        try {
          const dbUser = await prisma.user.upsert({
            where: { email: user.email },
            update: { name: user.name, image: user.image },
            create: {
              email: user.email,
              name: user.name,
              image: user.image,
              updatedAt: new Date(),
            },
          });
          token.userId = dbUser.id;
        } catch (e) {
          console.error("Failed to upsert user:", e);
          token.userId = user.email;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
});
