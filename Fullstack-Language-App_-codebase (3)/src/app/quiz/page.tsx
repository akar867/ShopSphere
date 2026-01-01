import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import QuizClient from "./quiz-client";

export default function QuizPage() {
  return (
    <main className="min-h-screen w-full px-4 py-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Quiz</h1>
      <Suspense>
        <Card>
          <CardContent className="pt-6">
            <QuizClient />
          </CardContent>
        </Card>
      </Suspense>
    </main>
  );
}