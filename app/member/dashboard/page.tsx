import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../lib/auth";
import MemberDashboardClient from "../../../components/MemberDashboardClient";

export default async function MemberDashboardPage() {
  const user = await getCurrentUser();
  if (!user || (user.role === "member" && !user.approved)) {
    redirect("/login?from=/member/dashboard");
  }

  return <MemberDashboardClient />;
}
