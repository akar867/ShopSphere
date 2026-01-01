"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isLoggingInRef = useRef(false);

  // Check if already logged in
  useEffect(() => {
    const checkExistingAuth = async () => {
      if (isLoggingInRef.current) return; // avoid race with active login
      const token = localStorage.getItem("admin_token");
      if (token) {
        try {
          await api.getAdminMe();
          // Already logged in, redirect to admin
          console.log("[Login Page] Already authenticated, redirecting...");
          router.replace("/admin");
        } catch (err: any) {
          const status = err?.status as number | undefined;
          // Only clear on explicit auth failures; don't clear on transient/network errors
          if (status === 401 || status === 403) {
            console.log("[Login Page] Existing token invalid, clearing...");
            localStorage.removeItem("admin_token");
            localStorage.removeItem("admin_data");
          } else {
            console.log("[Login Page] Auth check failed (non-auth error), keeping token.");
          }
        }
      }
    };
    
    checkExistingAuth();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    isLoggingInRef.current = true;

    try {
      console.log("Attempting admin login...");
      const response = await api.adminLogin(email, password);
      console.log("Login successful, token received:", response.token.substring(0, 20) + "...");
      
      // Store admin token
      localStorage.setItem("admin_token", response.token);
      localStorage.setItem("admin_data", JSON.stringify(response.admin));
      console.log("Tokens stored in localStorage");
      
      // Verify token was stored
      const storedToken = localStorage.getItem("admin_token");
      console.log("Verified token in localStorage:", storedToken?.substring(0, 20) + "...");
      
      // Optional short delay
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify session before navigating to avoid redirect loop
      console.log("Verifying session via /api/admin/me before navigation...");
      await api.getAdminMe();
      console.log("Verification successful. Navigating to /admin");
      router.replace("/admin");
      
    } catch (err: any) {
      console.error("Login error:", err);
      // Clean up any possibly invalid token to avoid loops
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_data");
      setError(err?.message || "Login failed. Please check your credentials.");
      setLoading(false);
      isLoggingInRef.current = false;
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>
            Sign in to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="off"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}