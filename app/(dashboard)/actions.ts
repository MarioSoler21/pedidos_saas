"use server";

import { redirect } from "next/navigation";
import { clearDevTenant } from "@/lib/dev-session";

export async function salirDelTenant() {
  await clearDevTenant();
  redirect("/login");
}
