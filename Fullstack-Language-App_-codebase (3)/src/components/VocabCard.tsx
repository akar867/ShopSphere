"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";

export type Vocab = {
  id: number;
  hanzi: string; // Chinese characters
  pinyin: string;
  translation: string;
  audioUrl?: string;
  videoUrl?: string;
  imageUrl?: string;
  difficulty?: "easy" | "medium" | "hard";
};

export default function VocabCard({ item }: { item: Vocab }) {
  // Use a concrete string path to avoid dynamic href error in App Router
  const href = `/vocabulary/${item.id}` as const;
  const router = useRouter();

  return (
    <Link href={href} className="block" aria-label={`Open ${item.hanzi} details`}>
      <Card
        className="overflow-hidden cursor-pointer"
        onClick={() => router.push(href)}
        role="button"
        tabIndex={0}
      >
        <CardHeader className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-2xl hover:underline">{item.hanzi}</CardTitle>
            <p className="text-sm text-muted-foreground">{item.pinyin} • {item.translation}</p>
          </div>
          {item.difficulty && (
            <Badge variant="secondary" className="capitalize">{item.difficulty}</Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.hanzi}
              className="w-full h-48 object-cover rounded-md border"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-48 rounded-md border bg-muted/50 flex items-center justify-center text-muted-foreground text-sm">
              No image available
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}