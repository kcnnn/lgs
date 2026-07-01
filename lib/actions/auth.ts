"use server";

import { signIn } from "@/lib/auth";

export async function sendMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "/new");
  await signIn("nodemailer", { email, redirectTo: callbackUrl });
}
