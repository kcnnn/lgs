import NextAuth from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

function adminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  providers: [
    Nodemailer({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/login/check-email",
  },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      session.user.isAdmin = user.isAdmin;
      session.user.credits = user.credits;
      session.user.companyName = user.companyName;
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (user.email && adminEmails().includes(user.email.toLowerCase())) {
        await prisma.user.update({ where: { id: user.id }, data: { isAdmin: true } });
      }
    },
  },
});
