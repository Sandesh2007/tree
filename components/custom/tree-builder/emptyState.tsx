"use client";

import { useEffect, useRef } from "react";
import { Users, Plus } from "lucide-react";
import { gsap } from "gsap";
import Button from "@/components/ui/button";

interface EmptyStateProps {
  onAddPerson: () => void;
}

export default function EmptyState({ onAddPerson }: EmptyStateProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
      );
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
    >
      <div className="text-center pointer-events-auto">
        <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
          <Users size={40} className="text-slate-400" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          Start Building Your Tree
        </h2>
        <p className="text-slate-500 mb-6 max-w-sm">
          Add your first person to begin creating your organization chart or
          family tree.
        </p>
        <Button onClick={onAddPerson} size="lg">
          <Plus size={20} />
          Add First Person
        </Button>
      </div>
    </div>
  );
}
