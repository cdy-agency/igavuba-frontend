import { LoginForm } from "@/components/auth/login-form";
import Head from "next/head";

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Login</title>
        <meta name="description" content="login page" />
      </Head>

      <div className="min-h-screen flex">
        {/* Left side - Mountain landscape background */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center bg-no-repeat auth-page-overlay">
          {/* Content overlay */}
          <div className="relative z-10 flex flex-col justify-center items-start p-16 text-panel-foreground h-full">
            <div className="space-y-4 max-w-md">
              <h1 className="text-5xl font-bold leading-tight text-panel-foreground">
                One more step
                <br />
                <span className="text-4xl font-light">Creating Memories</span>
              </h1>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-panel relative">
          <div className="relative z-10 w-full max-w-md p-8">
            <LoginForm />
          </div>
        </div>
      </div>
    </>
  );
}
