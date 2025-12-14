import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { authClient } from "~/lib/auth-client";
import { toast } from "sonner";
import type { Route } from "./+types/login";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login - Starter App" },
    { name: "description", content: "Sign in to your account" },
  ];
}

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[Login] Form submitted", { email: formData.email });
    setIsLoading(true);

    try {
      console.log("[Login] Attempting sign in...");
      const response = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
      });

      console.log("[Login] Sign in response:", response);

      if (response.error) {
        console.error("[Login] Sign in failed:", response.error);
        toast.error("Login Failed", {
          description: response.error.message || "Invalid email or password",
        });
        return;
      }

      console.log("[Login] Sign in successful, redirecting to dashboard");
      toast.success("Login Successful", {
        description: "Welcome back!",
      });

      navigate("/dashboard");
    } catch (err: any) {
      console.error("[Login] Unexpected error:", err);
      toast.error("Login Failed", {
        description: err.message || "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
      console.log("[Login] Loading state set to false");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col pt-5 space-y-5">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </div>
            <div className="text-sm text-center text-muted-foreground">
              <Link to="/" className="text-primary hover:underline font-medium">
                Back to home
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
