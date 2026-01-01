"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen w-full relative flex flex-col items-center justify-center bg-[url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/Gemini_Generated_Image_rzo2vrzo2vrzo2vr-1-1760414325080.png')] bg-cover bg-center">
      {/* Top-right Admin button */}
      <div className="absolute top-4 right-4 z-20">
        <Button asChild size="sm" variant="outline" className="bg-transparent text-white border-white/70 hover:bg-white/10">
          <Link href="/admin">Admin</Link>
        </Button>
      </div>
      <div className="backdrop-blur-sm bg-black/40 w-full h-full absolute inset-0" />
      <section className="relative z-10 mx-auto max-w-4xl px-6 text-center text-white flex flex-col gap-6">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Mini Mandarin – Learn 25 Essential Words</h1>
        <p className="text-lg md:text-xl text-white/90">
          Watch short videos by native speakers, listen to audio, and search vocabulary with
          Pinyin and English translations.
        </p>
        <div className="mt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" variant="outline" className="bg-transparent text-white border-white/70 hover:bg-white/10">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild size="lg" className="bg-white text-black hover:bg-white/90">
            <Link href="/register">Create account</Link>
          </Button>
        </div>
        <p className="text-xs text-white/70 mt-4">
          Built by INFT6900 Group 4 • Ahsanul Haque, Arnab Kar, Trang Pham, Hefei Sun, Di Hao
        </p>
      </section>
    </main>
  );
}