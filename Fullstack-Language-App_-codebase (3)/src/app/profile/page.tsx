import { Card, CardContent } from "@/components/ui/card";
import ProfileClient from "./profile-client";

export const metadata = {
  title: "Profile",
};

export default function ProfilePage() {
  return (
    <main className="min-h-screen w-full px-4 py-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      <Card>
        <CardContent className="pt-6">
          <ProfileClient />
        </CardContent>
      </Card>
    </main>
  );
}