import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { AdminShell } from "./admin-shell";

// The real gate for every /admin page. The Edge middleware can only read the
// role baked into the JWT, which goes stale the moment someone is promoted or
// demoted from /admin/team, so it just checks that you're signed in. Here we're
// on the Node runtime and can ask the database who this user is right now.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/admin");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== Role.ADMIN) {
    redirect("/login?callbackUrl=/admin&reason=unauthorized");
  }

  return <AdminShell>{children}</AdminShell>;
}
