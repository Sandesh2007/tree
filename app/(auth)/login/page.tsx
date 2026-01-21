"use client";

import { LoginForm } from "@/components/login-form";
import { TreePalmIcon } from "lucide-react";
import { useEffect, useRef } from "react";

export default function LoginPage() {
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
    const nodeCount = 7;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Create root node
    treeNodes.push({
      x: centerX,
      y: centerY - 150,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: 25,
      connections: [1, 2],
      level: 0,
    });

    // Create middle level nodes
    treeNodes.push({
      x: centerX - 150,
      y: centerY,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: 20,
      connections: [3, 4],
      level: 1,
    });

    treeNodes.push({
      x: centerX + 150,
      y: centerY,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: 20,
      connections: [5, 6],
      level: 1,
    });

    // Create leaf nodes
    for (let i = 3; i < nodeCount; i++) {
      const parentIndex = i < 5 ? 1 : 2;
      const offset = (i % 2) * 2 - 1;
      treeNodes.push({
        x: treeNodes[parentIndex].x + offset * 80,
        y: centerY + 150,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: 15,
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
      ctx.strokeStyle = "rgba(59, 130, 246, 0.3)";
      ctx.lineWidth = 2;
      treeNodes.forEach((node) => {
        node.connections.forEach((targetIndex) => {
          if (targetIndex < treeNodes.length) {
            const target = treeNodes[targetIndex];
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

        // Draw node with gradient
        const gradient = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          node.radius,
        );
        gradient.addColorStop(0, "rgba(59, 130, 246, 0.9)");
        gradient.addColorStop(1, "rgba(6, 182, 212, 0.6)");

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Add glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = "rgba(59, 130, 246, 0.5)";
        ctx.fill();
        ctx.shadowBlur = 0;
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
          <div className="flex items-center gap-3">
            <TreePalmIcon className="h-10 w-10 text-blue-500" />
            <span className="text-3xl font-bold text-white">Tree Org</span>
          </div>
        </div>

        {/* Login Form Container */}
        <div className="mx-auto w-md max-w-5xl">
          <LoginForm />
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-slate-400">
          © 2024 Tree Org. All rights reserved.
        </p>
      </div>
    </div>
  );
}
