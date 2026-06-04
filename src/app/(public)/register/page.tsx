import { RegisterForm } from '@/components/auth/register-form';
import Head from 'next/head';

export default function RegisterPage() {
  return (
    <>
      <Head>
        <title>Register</title>
        <meta name="description" content="Create your account" />
      </Head>
      
      <div className="min-h-screen flex">
        {/* Left side - Mountain landscape background */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center bg-no-repeat auth-page-overlay">
          {/* Content overlay */}
          <div className="relative z-10 flex flex-col justify-center items-start p-16 text-panel-foreground h-full">
            <div className="space-y-4 max-w-md">
              <h1 className="text-5xl font-bold leading-tight text-panel-foreground">
                Welcome E-Learning
                <br />
                <span className="text-4xl font-light text-panel-foreground">Start Your Journey</span>
              </h1>
            </div>
          </div>
        </div>
        
        {/* Right side - Register form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-panel relative">
          <div className="relative z-10 w-full max-w-md p-8">
            <RegisterForm />
          </div>
        </div>
      </div>
    </>
  );
}