"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form fields
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to send OTP");
        return;
      }

      toast.success("OTP sent to your email! Please check your inbox.");
      setOtpSent(true);
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);

    try {
      // Verify OTP first
      const verifyRes = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        throw new Error(verifyData.error || "OTP verification failed");
      }

      // OTP verified successfully - now create the account
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (error?.code) {
        throw new Error(error.message || "Failed to create account");
      }

      // Mark user as verified since they completed MFA
      if (data?.user?.id) {
        await fetch("/api/users/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: data.user.id }),
        });
      }

      toast.success("Account created and verified successfully!");
      router.push("/login?verified=true");
    } catch (err: any) {
      toast.error(err.message || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to resend OTP");
        return;
      }

      toast.success("OTP resent to your email!");
    } catch (error) {
      console.error("Error resending OTP:", error);
      toast.error("Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full px-4 py-10 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <h1 className="text-2xl font-semibold mb-6">Create account</h1>
          
          {!otpSent ? (
            // Step 1: Registration form
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Jane Doe" 
                  required 
                />
              </div>
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
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input 
                  id="confirm" 
                  type="password" 
                  autoComplete="off" 
                  value={confirm} 
                  onChange={(e) => setConfirm(e.target.value)} 
                  required 
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending OTP..." : "Continue"}
              </Button>
            </form>
          ) : (
            // Step 2: OTP verification
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="bg-muted p-4 rounded-md mb-4">
                <p className="text-sm text-muted-foreground">
                  We've sent a 6-digit verification code to:
                </p>
                <p className="font-medium mt-1">{email}</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input 
                  id="otp" 
                  type="text" 
                  maxLength={6}
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} 
                  placeholder="Enter 6-digit code" 
                  className="text-center text-2xl tracking-widest"
                  required 
                />
                <p className="text-xs text-muted-foreground">
                  The code will expire in 10 minutes
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={verifying}>
                {verifying ? "Verifying..." : "Verify & Create Account"}
              </Button>

              <div className="flex items-center justify-between text-sm">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setOtpSent(false)}
                  disabled={verifying}
                >
                  ← Back
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResendOtp}
                  disabled={loading || verifying}
                >
                  Resend code
                </Button>
              </div>
            </form>
          )}

          <p className="text-sm text-muted-foreground mt-4">
            Already have an account? <Link href="/login" className="underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}