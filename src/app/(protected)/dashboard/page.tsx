import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";

import SignOutButton from "@/app/(protected)/dashboard/_components/sign-out-button";
import { auth } from "@/lib/auth";

const DashboardPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  if (!session?.user.clinic) {
    redirect("/clinic-form");
  }

  return (
    <>
      <h1>Dashboard</h1>
      <h1>{session?.user?.name}</h1>
      <p>{session?.user?.email}</p>
      <Image
        src={session?.user?.image as string}
        alt="User Avatar"
        width={100}
        height={100}
      />
      <SignOutButton />
    </>
  );
};

export default DashboardPage;
