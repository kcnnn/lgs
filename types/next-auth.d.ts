import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    isAdmin: boolean;
    credits: number;
    companyName: string | null;
  }

  interface Session {
    user: {
      id: string;
      isAdmin: boolean;
      credits: number;
      companyName: string | null;
    } & DefaultSession["user"];
  }
}
