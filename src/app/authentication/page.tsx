import { headers } from "next/headers";
import { redirect } from "next/navigation";

import LoginForm from "@/app/authentication/components/login-form";
import SignUpForm from "@/app/authentication/components/sign-up-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/auth";

const AuthenticationPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Tabs defaultValue="login">
          <TabsList className="w-full">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Criar conta</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          <TabsContent value="register">
            <SignUpForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthenticationPage;
