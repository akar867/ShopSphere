"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSession, authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { api, Admin } from "@/lib/api";
import { ShieldCheck } from "lucide-react";

export const Header = () => {
  const { data: session, isPending, refetch } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        if (token) {
          const admin = await api.getAdminMe();
          setCurrentAdmin(admin);
        }
      } catch (err) {
        // Not an admin
        setCurrentAdmin(null);
      }
    };
    checkAdmin();
  }, []);

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();
    if (!error?.code) {
      localStorage.removeItem("bearer_token");
      refetch();
      router.push("/");
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_data");
    setCurrentAdmin(null);
    router.push("/admin/login");
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          {!mounted || isPending ? null : session?.user ? (
            <div className="flex items-center gap-2">
              <Link href="/profile">
                <Button size="sm" variant="secondary">Profile</Button>
              </Link>
              <Link href="/quiz">
                <Button size="sm" variant="secondary">Quiz</Button>
              </Link>
              <Button size="sm" variant="ghost" onClick={handleSignOut}>Sign out</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href={`/login?redirect=${encodeURIComponent(pathname || "/")}`}>
                <Button size="sm" variant="default">Login</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" variant="outline">Register</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;