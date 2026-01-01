import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import DetailClient from "./word-detail-client";

// Server component page wrapper. Interactive fetching happens in client child
export default function VocabDetailPage({ params }: { params: { id: string } }) {
  // Basic guard; actual existence is handled client-side
  if (!params?.id) return notFound();

  return (
    <main className="min-h-screen w-full px-4 py-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Word Details</h1>
      <Card>
        <CardContent className="pt-6">
          <Suspense fallback={<div>Loading…</div>}>
            <DetailClient id={params.id} />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}