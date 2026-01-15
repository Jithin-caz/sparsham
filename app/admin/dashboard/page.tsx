import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../lib/auth";
import AdminDashboardClient from "../../../components/AdminDashboardClient";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "super") {
    redirect("/login?from=/admin/dashboard");
  }

  return <AdminDashboardClient />;
}
