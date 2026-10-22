import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/auth";
import { RegisterForm } from "./register-form";

export const instant = false;

export default async function RegisterPage() {
  await connection();
  const session = await auth();
  if (session?.user) {
    redirect("/account");
  }

  return <RegisterForm />;
}
