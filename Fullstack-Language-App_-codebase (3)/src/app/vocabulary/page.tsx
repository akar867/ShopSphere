"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import VocabCard, { Vocab } from "@/components/VocabCard";
import { api } from "@/lib/api";
import { Search } from "lucide-react";

export default function VocabularyPage() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<Vocab[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchData = async (q?: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getVocab(q);
      setData(res as Vocab[]);
    } catch (e: any) {
      if (e?.status === 401) {
        router.push("/login");
        return;
      }
      setError(e.message || "Failed to load vocabulary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSearch = () => fetchData(query.trim() || undefined);

  const placeholder: Vocab[] = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => ({
        id: i + 1,
        hanzi: "…",
        pinyin: "…",
        translation: "…",
      })) as Vocab[],
    []
  );

  return (
    <main className="min-h-screen w-full px-4 py-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Vocabulary</h1>
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Input
              placeholder="Search by word, pinyin, or translation…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
            />
            <Button onClick={onSearch} aria-label="Search">
              <Search className="h-4 w-4 mr-1" /> Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="text-red-600 mb-4" role="alert">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(loading ? placeholder : data).map((item) => (
          <div key={item.id}>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : (
              <VocabCard item={item} />
            )}
          </div>
        ))}
      </div>
    </main>
  );
}