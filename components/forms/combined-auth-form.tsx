"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { cn } from "@/lib/utils";
import { userAuthSchema, loginSchema, registerSchema } from "@/lib/validations/auth";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Icons } from "@/components/shared/icons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CombinedAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "login" | "register";
}

type MagicLinkFormData = z.infer<typeof userAuthSchema>;
type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export function CombinedAuthForm({ 
  className, 
  type = "login", 
  ...props 
}: CombinedAuthFormProps) {
  const [authMethod, setAuthMethod] = React.useState<"magic-link" | "credentials">("magic-link");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState<boolean>(false);
  const searchParams = useSearchParams();

  // Magic link form
  const magicLinkForm = useForm<MagicLinkFormData>({
    resolver: zodResolver(userAuthSchema),
  });

  // Credentials form
  const credentialsForm = useForm<LoginFormData | RegisterFormData>({
    resolver: zodResolver(type === "login" ? loginSchema : registerSchema),
  });

  // Handle OAuth errors from URL parameters
  React.useEffect(() => {
    const error = searchParams?.get("error");
    if (error === "OAuthAccountNotLinked") {
      toast.error("Account already exists", {
        description: "An account with this email already exists. Please sign in with the original method you used to create the account.",
      });
    } else if (error === "CredentialsSignin") {
      toast.error("Invalid credentials", {
        description: "The username or password you entered is incorrect. Please try again.",
      });
    } else if (error) {
      toast.error("Authentication error", {
        description: "There was an error during authentication. Please try again.",
      });
    }
  }, [searchParams]);

  async function onMagicLinkSubmit(data: MagicLinkFormData) {
    setIsLoading(true);

    const signInResult = await signIn("resend", {
      email: data.email.toLowerCase(),
      redirect: false,
      callbackUrl: searchParams?.get("from") || "/dashboard",
    });

    setIsLoading(false);

    if (!signInResult?.ok) {
      return toast.error("Something went wrong.", {
        description: "Your sign in request failed. Please try again."
      });
    }

    return toast.success("Check your email", {
      description: "We sent you a login link. Be sure to check your spam too.",
    });
  }

  async function onCredentialsSubmit(data: LoginFormData | RegisterFormData) {
    setIsLoading(true);

    if (type === "login") {
      const loginData = data as LoginFormData;
      const signInResult = await signIn("credentials", {
        username: loginData.username,
        password: loginData.password,
        redirect: false,
        callbackUrl: searchParams?.get("from") || "/dashboard",
      });

      setIsLoading(false);

      if (!signInResult?.ok) {
        return toast.error("Invalid credentials", {
          description: "The username or password you entered is incorrect. Please try again."
        });
      }

      return toast.success("Login successful", {
        description: "Welcome back! Redirecting to dashboard...",
      });
    } else {
      // Registration logic
      const registerData = data as RegisterFormData;
      
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: registerData.username,
            email: registerData.email,
            password: registerData.password,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Registration failed");
        }

        toast.success("Registration successful", {
          description: "Your account has been created. You can now sign in.",
        });

        // Optionally redirect to login or auto-sign in
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);

      } catch (error) {
        toast.error("Registration failed", {
          description: error instanceof Error ? error.message : "Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    }
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      {/* Display authentication errors if present */}
      {searchParams?.get("error") === "OAuthAccountNotLinked" && (
        <Alert variant="destructive">
          <AlertDescription>
            An account with this email already exists. Please sign in with the original method you used to create the account, or contact support for assistance.
          </AlertDescription>
        </Alert>
      )}
      
      {searchParams?.get("error") === "CredentialsSignin" && (
        <Alert variant="destructive">
          <AlertDescription>
            The username or password you entered is incorrect. Please try again.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={authMethod} onValueChange={(value) => setAuthMethod(value as "magic-link" | "credentials")} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
          <TabsTrigger value="credentials">
            {type === "login" ? "Username/Password" : "Create Account"}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="magic-link" className="space-y-4">
          <form onSubmit={magicLinkForm.handleSubmit(onMagicLinkSubmit)}>
            <div className="grid gap-2">
              <div className="grid gap-1">
                <Label className="sr-only" htmlFor="email">
                  Email
                </Label>
                <Input
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading || isGoogleLoading}
                  {...magicLinkForm.register("email")}
                />
                {magicLinkForm.formState.errors?.email && (
                  <p className="px-1 text-xs text-red-600">
                    {magicLinkForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <button className={cn(buttonVariants())} disabled={isLoading}>
                {isLoading && (
                  <Icons.spinner className="size-4 mr-2 animate-spin" />
                )}
                {type === "register" ? "Sign Up with Email" : "Sign In with Email"}
              </button>
            </div>
          </form>
        </TabsContent>
        
        <TabsContent value="credentials" className="space-y-4">
          <form onSubmit={credentialsForm.handleSubmit(onCredentialsSubmit)}>
            <div className="grid gap-4">
              {type === "register" && (
                <div className="grid gap-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading || isGoogleLoading}
                    {...credentialsForm.register("email" as keyof RegisterFormData)}
                  />
                  {(credentialsForm.formState.errors as any)?.email && (
                    <p className="px-1 text-xs text-red-600">
                      {(credentialsForm.formState.errors as any).email.message}
                    </p>
                  )}
                </div>
              )}
              
              <div className="grid gap-1">
                <Label htmlFor="username">
                  {type === "login" ? "Username or Email" : "Username"}
                </Label>
                <Input
                  id="username"
                  placeholder={type === "login" ? "username or email" : "username"}
                  type="text"
                  autoCapitalize="none"
                  autoComplete={type === "login" ? "username" : "username"}
                  autoCorrect="off"
                  disabled={isLoading || isGoogleLoading}
                  {...credentialsForm.register("username")}
                />
                {credentialsForm.formState.errors?.username && (
                  <p className="px-1 text-xs text-red-600">
                    {credentialsForm.formState.errors.username.message}
                  </p>
                )}
              </div>
              
              <div className="grid gap-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  placeholder="Enter your password"
                  type="password"
                  autoComplete={type === "login" ? "current-password" : "new-password"}
                  disabled={isLoading || isGoogleLoading}
                  {...credentialsForm.register("password")}
                />
                {credentialsForm.formState.errors?.password && (
                  <p className="px-1 text-xs text-red-600">
                    {credentialsForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              {type === "register" && (
                <div className="grid gap-1">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    placeholder="Confirm your password"
                    type="password"
                    autoComplete="new-password"
                    disabled={isLoading || isGoogleLoading}
                    {...credentialsForm.register("confirmPassword" as keyof RegisterFormData)}
                  />
                  {(credentialsForm.formState.errors as any)?.confirmPassword && (
                    <p className="px-1 text-xs text-red-600">
                      {(credentialsForm.formState.errors as any).confirmPassword.message}
                    </p>
                  )}
                </div>
              )}
              
              <button className={cn(buttonVariants())} disabled={isLoading}>
                {isLoading && (
                  <Icons.spinner className="size-4 mr-2 animate-spin" />
                )}
                {type === "register" ? "Create Account" : "Sign In"}
              </button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
      
      <div className="relative">
        <div className="absolute flex inset-0 items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex text-xs justify-center uppercase">
          <span className="px-2 bg-background text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      
      <button
        type="button"
        className={cn(buttonVariants({ variant: "outline" }))}
        onClick={() => {
          setIsGoogleLoading(true);
          signIn("google", {
            callbackUrl: searchParams?.get("from") || "/dashboard",
          });
        }}
        disabled={isLoading || isGoogleLoading}
      >
        {isGoogleLoading ? (
          <Icons.spinner className="size-4 mr-2 animate-spin" />
        ) : (
          <Icons.google className="size-4 mr-2" />
        )}{" "}
        Google
      </button>
    </div>
  );
} 