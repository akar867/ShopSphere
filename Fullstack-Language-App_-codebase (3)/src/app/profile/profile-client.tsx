"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { getProgress } from "@/lib/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

type Vocab = {
  id: number;
  audioUrl?: string;
  videoUrl?: string;
};

export default function ProfileClient() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Vocab[]>([]);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?redirect=/profile");
    }
  }, [isPending, session, router]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.getVocab();
        setItems(res as Vocab[]);
      } catch (e: any) {
        if (e?.status === 401) {
          router.push("/login?redirect=/profile");
          return;
        }
        setError(e?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const { totals, completed, percent } = useMemo(() => {
    const prog = getProgress();
    const audioAvailableIds = new Set(items.filter(i => !!i.audioUrl).map(i => String(i.id)));
    const videoAvailableIds = new Set(items.filter(i => !!i.videoUrl).map(i => String(i.id)));

    const completedAudio = Object.keys(prog.audio).filter(id => audioAvailableIds.has(id));
    const completedVideo = Object.keys(prog.video).filter(id => videoAvailableIds.has(id));

    const totalAudio = audioAvailableIds.size;
    const totalVideo = videoAvailableIds.size;

    const numerator = completedAudio.length + completedVideo.length;
    const denominator = totalAudio + totalVideo;

    const pct = denominator === 0 ? 0 : Math.min(100, Math.round((numerator / denominator) * 100));

    return {
      totals: { audio: totalAudio, video: totalVideo },
      completed: { audio: completedAudio.length, video: completedVideo.length },
      percent: pct,
    };
  }, [items]);

  return (
    <div className="space-y-6">
      <section className="space-y-1">
        <p className="text-sm text-muted-foreground">Signed in as</p>
        <p className="font-medium">{session?.user?.email || (isPending ? "" : "Unknown user")}</p>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Activity</h2>
          {!loading && (
            <span className="text-sm text-muted-foreground">{percent}% completed</span>
          )}
        </div>

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ) : (
          <div className="space-y-2">
            {/* Progress bar */}
            <div className="h-3 w-full rounded-full bg-muted">
              <div
                className="h-3 rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Audio: {completed.audio}/{totals.audio} • Video: {completed.video}/{totals.video}
            </div>
          </div>
        )}
      </section>

      {error && (
        <div className="text-red-600" role="alert">{error}</div>
      )}

      <section>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Need more practice?</div>
                <div className="text-sm text-muted-foreground">Head back to the vocabulary list to continue.</div>
              </div>
              <Button onClick={() => router.push("/vocabulary")}>Go to Vocabulary</Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}