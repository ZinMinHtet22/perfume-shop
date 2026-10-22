import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/auth";
import { LoginForm } from "./login-form";

export const instant = false;

export default async function LoginPage() {
  await connection();
  const session = await auth();
  if (session?.user) {
    redirect("/account");
  }

  return <LoginForm />;
}
