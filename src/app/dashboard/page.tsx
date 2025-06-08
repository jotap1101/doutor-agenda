import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import SignOutButton from "./components/sign-out-button";

const DashboardPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/authentication");
  }

  return (
    <>
      <h1>Dashboard</h1>
      <h1>{session?.user?.name}</h1>
      <p>{session?.user?.email}</p>
      <SignOutButton />
    </>
  );
};

export default DashboardPage;
