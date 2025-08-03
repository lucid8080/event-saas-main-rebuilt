import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { UserAuthForm } from "@/components/forms/user-auth-form";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="container relative flex-col grid lg:max-w-none lg:grid-cols-2 lg:px-0 items-center justify-center">
      <div className="relative flex-col hidden h-full p-10 bg-muted text-white dark:border-r lg:flex">
        <div className="absolute bg-zinc-900 inset-0" />
        <div className="relative flex text-lg z-20 items-center font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-6 mr-2"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          EventCraftAI
        </div>
        <div className="relative mt-auto z-20">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;This platform has completely transformed how we create event
              invitations. The AI-generated designs are stunning and save us
              hours of work.&rdquo;
            </p>
            <footer className="text-sm">Sofia Davis, Event Planner</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="flex flex-col w-full mx-auto space-y-6 sm:w-[350px] justify-center">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email to sign in to your account
            </p>
          </div>
          <UserAuthForm />
          
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <a
              href="/terms"
              className="hover:text-primary underline underline-offset-4"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              className="hover:text-primary underline underline-offset-4"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
