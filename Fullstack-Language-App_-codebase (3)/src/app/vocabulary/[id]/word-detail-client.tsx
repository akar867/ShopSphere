"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { ArrowLeft, Play, Pause, Maximize2, Volume2, Loader2, ArrowRight } from "lucide-react";
import { markAudioComplete, markVideoComplete } from "@/lib/progress";
import { isYouTubeUrl, getYouTubeEmbedUrl } from "@/lib/youtube";

type Vocab = {
  id: number;
  hanzi: string;
  pinyin: string;
  translation: string;
  audioUrl?: string;
  videoUrl?: string;
  difficulty?: "easy" | "medium" | "hard";
};

export default function DetailClient({ id }: { id: string }) {
  const router = useRouter();
  const [data, setData] = useState<Vocab | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [canFullscreen, setCanFullscreen] = useState(false);
  const [nextId, setNextId] = useState<number | null>(null);
  const [prevId, setPrevId] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getVocabById(id);
      setData(res as Vocab);
      // Compute next id by fetching list and finding next by ascending id
      try {
        const list = (await api.getVocab()) as Vocab[];
        const currentId = Number(id);
        const sorted = [...list].sort((a, b) => a.id - b.id);
        const idx = sorted.findIndex((x) => x.id === currentId);
        if (idx >= 0) {
          const n = sorted[idx + 1];
          setNextId(n ? n.id : null);
          const p = sorted[idx - 1];
          setPrevId(p ? p.id : null);
        } else {
          setNextId(null);
          setPrevId(null);
        }
      } catch {
        setNextId(null);
        setPrevId(null);
      }
    } catch (e: any) {
      if (e?.status === 401) {
        router.push("/login");
        return;
      }
      setError(e?.message || "Failed to load word");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    // Detect if fullscreen is allowed (not in iframe and browser allows it)
    try {
      const inIframe = typeof window !== "undefined" && window.self !== window.top;
      const allowed = typeof document !== "undefined" && !!document.fullscreenEnabled && !inIframe;
      setCanFullscreen(allowed);
    } catch {
      setCanFullscreen(false);
    }
  }, []);

  const placeholder = useMemo(
    () => ({ hanzi: "…", pinyin: "…", translation: "…" }),
    []
  );

  const toggleAudio = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      await a.play();
      setAudioPlaying(true);
    } else {
      a.pause();
      setAudioPlaying(false);
    }
  };

  const enterFullscreen = () => {
    const v = videoRef.current;
    if (!v) return;
    if (!canFullscreen) return; // Guard when policy disallows
    const el: any = v as any;
    const req =
      el.requestFullscreen ||
      el.webkitRequestFullscreen ||
      el.mozRequestFullScreen ||
      el.msRequestFullscreen;
    if (req) {
      try {
        const p = req.call(el);
        if (p && typeof p.then === "function") {
          // Swallow rejections caused by permissions policy
          p.catch(() => {});
        }
      } catch {
        // no-op when disallowed
      }
    }
  };

  // Check if video is YouTube
  const isYouTube = data?.videoUrl ? isYouTubeUrl(data.videoUrl) : false;
  const embedUrl = data?.videoUrl && isYouTube ? getYouTubeEmbedUrl(data.videoUrl) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push("/vocabulary")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          {prevId !== null && (
            <Button
              variant="secondary"
              onClick={() => router.push(`/vocabulary/${prevId}`)}
              aria-label="Previous vocabulary"
           >
              <ArrowLeft className="h-4 w-4 mr-2" /> Previous
            </Button>
          )}
        </div>
        {nextId !== null && (
          <Button
            variant="default"
            onClick={() => router.push(`/vocabulary/${nextId}`)}
            aria-label="Next vocabulary"
          >
            Next <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>

      {error && (
        <div className="text-red-600" role="alert">
          {error}
        </div>
      )}

      <Card>
        <CardContent className="pt-6 space-y-4">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-5 w-64" />
              <Skeleton className="h-48 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-10" />
              </div>
            </div>
          ) : (
            data && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold">{data.hanzi}</h2>
                  <p className="text-sm text-muted-foreground">
                    {data.pinyin} • {data.translation}
                  </p>
                </div>

                {data.videoUrl ? (
                  <div className="space-y-2">
                    {isYouTube && embedUrl ? (
                      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                        <iframe
                          src={embedUrl}
                          className="absolute top-0 left-0 w-full h-full rounded-md border"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={`${data.hanzi} video`}
                          onLoad={() => {
                            // Mark as complete when iframe loads
                            setTimeout(() => markVideoComplete(data.id), 1000);
                          }}
                        />
                      </div>
                    ) : (
                      <>
                        <video
                          ref={videoRef}
                          controls
                          preload="metadata"
                          src={data.videoUrl}
                          className="w-full rounded-md border"
                          playsInline
                          onEnded={() => markVideoComplete(data.id)}
                        />
                        <div className="flex gap-2">
                          <Button onClick={enterFullscreen} variant="secondary" size="sm" disabled={!canFullscreen} title={!canFullscreen ? "Fullscreen not available in this view" : undefined}>
                            <Maximize2 className="h-4 w-4 mr-2" /> Fullscreen
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No video available.</div>
                )}

                <div className="flex items-center gap-3">
                  <Button onClick={toggleAudio} size="sm">
                    {audioPlaying ? (
                      <>
                        <Pause className="h-4 w-4" />
                        <span className="ml-2">Pause audio</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        <span className="ml-2">Play audio</span>
                      </>
                    )}
                  </Button>
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                  <audio ref={audioRef} src={data.audioUrl} onEnded={() => { setAudioPlaying(false); markAudioComplete(data.id); }} />
                </div>
              </div>
            )
          )}

          {loading && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}