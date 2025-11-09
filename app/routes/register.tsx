import { useEffect, useState } from "react";
import { Link, useNavigate, Form as ReactRouterForm, useActionData, type ActionFunctionArgs, redirect, data, useSubmit } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { toast } from "sonner";
import type { Route } from "./+types/register";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { auth } from "~/lib/auth";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

type RegisterSchema = z.infer<typeof registerSchema>;

type ActionResponse = {
  success: boolean;
  error?: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
};

export async function action({ request }: ActionFunctionArgs) {
  console.log("[Register Action] Starting registration process");

  try {
    const form = await request.formData();
    const name = form.get("name")?.toString();
    const email = form.get("email")?.toString();
    const password = form.get("password")?.toString();

    console.log("[Register Action] Form data received:", { name, email, passwordLength: password?.length });

    // Validate required fields
    if (!name || !email || !password) {
      console.error("[Register Action] Missing required fields:", { name: !!name, email: !!email, password: !!password });
      return data<ActionResponse>(
        {
          success: false,
          error: "All fields are required"
        },
        { status: 400 }
      );
    }

    // Attempt to register the user
    console.log("[Register Action] Calling auth.api.signUpEmail...");
    const result = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password
      },
      asResponse: true
    });

    console.log("[Register Action] API Response Status:", result.status);
    console.log("[Register Action] API Response Headers:", Object.fromEntries(result.headers.entries()));

    // Check if registration was successful
    if (!result.ok) {
      const errorData = await result.json();
      console.error("[Register Action] Registration failed:", {
        status: result.status,
        statusText: result.statusText,
        errorData
      });

      let errorMessage = "Registration failed. Please try again.";

      // Handle specific error cases
      if (result.status === 400) {
        errorMessage = errorData.message || "Invalid registration data";
      } else if (result.status === 409) {
        errorMessage = "An account with this email already exists";
      } else if (result.status === 500) {
        errorMessage = "Server error. Please try again later";
      }

      return data<ActionResponse>(
        {
          success: false,
          error: errorMessage
        },
        { status: result.status }
      );
    }

    // Parse successful response
    const responseData = await result.json();
    console.log("[Register Action] Registration successful:", {
      userId: responseData.user?.id,
      userEmail: responseData.user?.email,
      hasToken: !!responseData.token
    });

    // Attempt automatic login by setting the session
    console.log("[Register Action] Attempting automatic login...");

    try {
      // Sign in the user immediately after registration
      const signInResult = await auth.api.signInEmail({
        body: {
          email,
          password
        },
        asResponse: true
      });

      console.log("[Register Action] Auto-login response status:", signInResult.status);

      if (signInResult.ok) {
        await signInResult.json();
        console.log("[Register Action] Auto-login successful, redirecting to dashboard");

        // Return success with redirect
        return redirect("/dashboard");
      } else {
        console.warn("[Register Action] Auto-login failed, returning success without redirect");
        return data<ActionResponse>({
          success: true,
          error: "Account created but auto-login failed. Please sign in manually."
        });
      }
    } catch (loginError) {
      console.error("[Register Action] Auto-login error:", loginError);
      return data<ActionResponse>({
        success: true,
        error: "Account created but auto-login failed. Please sign in manually."
      });
    }

  } catch (error) {
    console.error("[Register Action] Unexpected error during registration:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    });

    return data<ActionResponse>(
      {
        success: false,
        error: "An unexpected error occurred. Please try again."
      },
      { status: 500 }
    );
  }
}

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Register - Starter App" },
    { name: "description", content: "Create a new account" },
  ];
}

export default function Register() {
  const navigate = useNavigate();
  const actionData = useActionData<ActionResponse>();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const submit = useSubmit();

  // Handle action data responses
  useEffect(() => {
    console.log("[Register Component] Action data received:", actionData);

    if (actionData) {
      setIsLoading(false);

      if (actionData.success) {
        console.log("[Register Component] Registration successful");

        if (actionData.error) {
          // Partial success (registered but not logged in)
          toast.warning(actionData.error);
          console.log("[Register Component] Redirecting to login page");
          setTimeout(() => navigate("/login"), 2000);
        } else {
          // Full success (should have already redirected in action)
          toast.success("Account created successfully! Redirecting...");
          console.log("[Register Component] Should already be redirecting to dashboard");
        }
      } else if (actionData.error) {
        console.error("[Register Component] Registration failed:", actionData.error);
        toast.error(actionData.error);

        // Set form errors if applicable
        if (actionData.error.includes("email")) {
          form.setError("email", { message: actionData.error });
        }
      }
    }
  }, [actionData, navigate, form]);

  const onSubmit = async (data: RegisterSchema) => {
    console.log("[Register Component] Form submitted:", {
      name: data.name,
      email: data.email,
      passwordLength: data.password.length
    });

    setIsLoading(true);
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("password", data.password);

    // Sends to your `action()` on this route
    submit(formData, {
      method: "post",
    });
    // The form will automatically submit to the action
    console.log("[Register Component] Submitting form data to action...");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Enter your information to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <ReactRouterForm
              method="post"
              className="space-y-4"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="John Doe"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john.doe@example.com"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </ReactRouterForm>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-muted-foreground w-full">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
          <div className="text-sm text-center text-muted-foreground w-full">
            <Link to="/" className="text-primary hover:underline font-medium">
              Back to home
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
