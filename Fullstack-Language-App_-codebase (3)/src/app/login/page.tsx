"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/vocabulary";
  const { data: session, isPending } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  // If already authenticated, go straight to redirect target
  useEffect(() => {
    if (!isPending && session?.user) {
      router.replace(redirect);
    }
  }, [isPending, session, redirect, router]);

  // Prefill email and show success messages based on query params
  useEffect(() => {
    const qEmail = params.get("email");
    if (qEmail) setEmail(qEmail);

    if (params.get("registered") === "true") {
      toast.success("Account created! You can now sign in.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    setLoading(true);
    const { error } = await authClient.signIn.email({
      email,
      password,
      rememberMe,
      callbackURL: redirect,
    });
    setLoading(false);
    if (error?.code) {
      toast.error("Invalid email or password.");
      return;
    }
    // better-auth client stores bearer_token via plugin; navigate to redirect
    router.push(redirect);
  };

  return (
    <main className="min-h-screen w-full px-4 py-10 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <h1 className="text-2xl font-semibold mb-6">Log in</h1>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="off"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" checked={rememberMe} onCheckedChange={(v) => setRememberMe(!!v)} />
              <Label htmlFor="remember">Remember me</Label>
            </div>
            <Button type="submit" className="w-full" disabled={loading || isPending}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground mt-4">
            New here? <Link href="/register" className="underline">Create an account</Link>
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Admin? <Link href="/admin" className="underline">Go to the Admin Panel</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}