"use client";

import { SignupForm } from "@/components/signup-form";
import { TreePalmIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import Link from "next/link";

export default function SignupPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Tree structure nodes
    interface TreeNode {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      connections: number[];
      level: number;
    }

    const treeNodes: TreeNode[] = [];
    const nodeCount = 9;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Create root node
    treeNodes.push({
      x: centerX,
      y: centerY - 200,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: 30,
      connections: [1, 2, 3],
      level: 0,
    });

    // Create middle level nodes
    treeNodes.push({
      x: centerX - 200,
      y: centerY - 50,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: 22,
      connections: [4, 5],
      level: 1,
    });

    treeNodes.push({
      x: centerX,
      y: centerY - 50,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: 22,
      connections: [6],
      level: 1,
    });

    treeNodes.push({
      x: centerX + 200,
      y: centerY - 50,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: 22,
      connections: [7, 8],
      level: 1,
    });

    // Create leaf nodes
    const leafPositions = [
      { x: centerX - 250, y: centerY + 100 },
      { x: centerX - 150, y: centerY + 100 },
      { x: centerX, y: centerY + 100 },
      { x: centerX + 150, y: centerY + 100 },
      { x: centerX + 250, y: centerY + 100 },
    ];

    for (let i = 4; i < nodeCount; i++) {
      const pos = leafPositions[i - 4];
      treeNodes.push({
        x: pos.x,
        y: pos.y,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: 16,
        connections: [],
        level: 2,
      });
    }

    let animationFrameId: number;

    const animate = () => {
      // Clear with fade effect
      ctx.fillStyle = "rgba(15, 23, 42, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      ctx.strokeStyle = "rgba(6, 182, 212, 0.35)";
      ctx.lineWidth = 2.5;
      treeNodes.forEach((node) => {
        node.connections.forEach((targetIndex) => {
          if (targetIndex < treeNodes.length) {
            const target = treeNodes[targetIndex];

            // Create gradient for connection line
            const gradient = ctx.createLinearGradient(
              node.x,
              node.y,
              target.x,
              target.y,
            );
            gradient.addColorStop(0, "rgba(59, 130, 246, 0.4)");
            gradient.addColorStop(1, "rgba(6, 182, 212, 0.4)");

            ctx.strokeStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(target.x, target.y);
            ctx.stroke();
          }
        });
      });

      // Update and draw nodes
      treeNodes.forEach((node) => {
        // Update position with gentle movement
        node.x += node.vx;
        node.y += node.vy;

        // Keep nodes within bounds with soft boundaries
        if (node.x < 100 || node.x > canvas.width - 100) node.vx *= -1;
        if (node.y < 100 || node.y > canvas.height - 100) node.vy *= -1;

        // Draw node with radial gradient
        const gradient = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          node.radius,
        );

        // Color based on level
        if (node.level === 0) {
          gradient.addColorStop(0, "rgba(59, 130, 246, 1)");
          gradient.addColorStop(1, "rgba(6, 182, 212, 0.7)");
        } else if (node.level === 1) {
          gradient.addColorStop(0, "rgba(6, 182, 212, 0.9)");
          gradient.addColorStop(1, "rgba(59, 130, 246, 0.6)");
        } else {
          gradient.addColorStop(0, "rgba(6, 182, 212, 0.8)");
          gradient.addColorStop(1, "rgba(59, 130, 246, 0.5)");
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Add glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor =
          node.level === 0
            ? "rgba(59, 130, 246, 0.6)"
            : "rgba(6, 182, 212, 0.5)";
        ctx.fill();
        ctx.shadowBlur = 0;

        // Add subtle stroke
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Animated Tree Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full opacity-40"
        aria-hidden="true"
      />

      {/* Overlay gradient for better form visibility */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-slate-950/20 to-transparent" />

      {/* Content */}
      <div className="relative z-10 w-full px-4 py-8">
        {/* Logo and Brand */}
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-3">
            <TreePalmIcon className="h-10 w-10 text-blue-500" />
            <span className="text-3xl font-bold text-white">Tree Org</span>
          </Link>
        </div>

        {/* Signup Form Container */}
        <div className="mx-auto w-full max-w-md">
          <SignupForm />
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-400">
          By signing up, you agree to our{" "}
          <a href="#" className="underline hover:text-slate-300">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline hover:text-slate-300">
            Privacy Policy
          </a>
        </p>

        <p className="mt-4 text-center text-sm text-slate-400">
          © 2024 Tree Org. All rights reserved.
        </p>
      </div>
    </div>
  );
}
