import { Suspense } from "react";
import CanvasClient from "./canvas";

export default function CanvasPage() {
  return (
    <Suspense fallback={<CanvasLoading />}>
      <CanvasClient />
    </Suspense>
  );
}

function CanvasLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <span className="text-gray-500">Loading canvas…</span>
    </div>
  );
}
