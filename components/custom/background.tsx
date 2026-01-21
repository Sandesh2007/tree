"use client";

import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface Connection {
  from: number;
  to: number;
}

interface BackgroundProps {
  nodeCount?: number;
  maxConnections?: number;
  nodeSpeed?: number;
  connectionDistance?: number;
  nodeColor?: string;
  connectionColor?: string;
  backgroundColor?: string;
  className?: string;
}

export function Background({
  nodeCount = 40,
  maxConnections = 3,
  nodeSpeed = 0.4,
  connectionDistance = 150,
  nodeColor = "rgba(59, 130, 246, 0.6)",
  connectionColor = "rgba(59, 130, 246, 0.2)",
  backgroundColor = "rgba(0, 0, 0, 0.05)",
  className = "",
}: BackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    setCanvasSize();

    const nodes: Node[] = [];
    const connections: Connection[] = [];

    // Create nodes
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * nodeSpeed,
        vy: (Math.random() - 0.5) * nodeSpeed,
        radius: Math.random() * 3 + 1.5,
      });
    }

    // Create connections
    for (let i = 0; i < nodes.length; i++) {
      const numConnections = Math.floor(Math.random() * maxConnections);
      for (let j = 0; j < numConnections; j++) {
        const target = Math.floor(Math.random() * nodes.length);
        if (target !== i) {
          connections.push({ from: i, to: target });
        }
      }
    }

    let animationFrameId: number;

    const animate = () => {
      // Clear canvas with fade effect
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      ctx.strokeStyle = connectionColor;
      ctx.lineWidth = 1;
      connections.forEach(({ from, to }) => {
        const distance = Math.sqrt(
          Math.pow(nodes[to].x - nodes[from].x, 2) +
            Math.pow(nodes[to].y - nodes[from].y, 2),
        );

        // Only draw connections within distance threshold
        if (distance < connectionDistance) {
          ctx.beginPath();
          ctx.moveTo(nodes[from].x, nodes[from].y);
          ctx.lineTo(nodes[to].x, nodes[to].y);
          ctx.stroke();
        }
      });

      // Update and draw nodes
      nodes.forEach((node) => {
        // Update position
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      setCanvasSize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [
    nodeCount,
    maxConnections,
    nodeSpeed,
    connectionDistance,
    nodeColor,
    connectionColor,
    backgroundColor,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
    />
  );
}
