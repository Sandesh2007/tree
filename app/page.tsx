"use client";

import Button from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  TreePalmIcon,
  ArrowRight,
  Network,
  Zap,
  Shield,
  Users,
  GitBranch,
  Database,
  BarChart3,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const nodes: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }[] = [];
    const connections: { from: number; to: number }[] = [];

    // Create nodes
    for (let i = 0; i < 50; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 3 + 2,
      });
    }

    // Create connections
    for (let i = 0; i < nodes.length; i++) {
      const numConnections = Math.floor(Math.random() * 3);
      for (let j = 0; j < numConnections; j++) {
        const target = Math.floor(Math.random() * nodes.length);
        if (target !== i) {
          connections.push({ from: i, to: target });
        }
      }
    }

    let animationFrameId: number;

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw connections
      ctx.strokeStyle = "rgba(59, 130, 246, 0.2)";
      ctx.lineWidth = 1;
      connections.forEach(({ from, to }) => {
        ctx.beginPath();
        ctx.moveTo(nodes[from].x, nodes[from].y);
        ctx.lineTo(nodes[to].x, nodes[to].y);
        ctx.stroke();
      });

      // Update and draw nodes
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(59, 130, 246, 0.6)";
        ctx.fill();
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
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Animated Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-40"
        aria-hidden="true"
      />

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/10 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <TreePalmIcon className="h-8 w-8 text-blue-500" />
              <span className="text-xl font-bold text-white">Tree Org</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                >
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-4 pt-20 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-300">
                Visualize Your Data Relationships
              </span>
            </div>
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Build & Manage
              <br />
              <span className="bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Data Relations
              </span>{" "}
              Visually
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-300 sm:text-xl">
              Create, visualize, and manage complex data relationships with an
              intuitive tree-based interface. Perfect for organizational
              structures, data modeling, and network analysis.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-blue-600 text-lg hover:bg-blue-700"
                >
                  Start Building Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-lg text-white hover:bg-white/10"
                >
                  View Demo
                  <Network className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="mt-16 rounded-2xl border border-white/10 bg-linear-to-br from-slate-900/50 to-blue-900/30 p-8 backdrop-blur-sm">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-900/50">
              <svg
                viewBox="0 0 800 400"
                className="h-full w-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Tree Diagram */}
                <defs>
                  <linearGradient
                    id="nodeGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
                  </linearGradient>
                </defs>

                {/* Connections */}
                <line
                  x1="400"
                  y1="80"
                  x2="200"
                  y2="180"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  opacity="0.5"
                />
                <line
                  x1="400"
                  y1="80"
                  x2="400"
                  y2="180"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  opacity="0.5"
                />
                <line
                  x1="400"
                  y1="80"
                  x2="600"
                  y2="180"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  opacity="0.5"
                />
                <line
                  x1="200"
                  y1="180"
                  x2="100"
                  y2="280"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  opacity="0.5"
                />
                <line
                  x1="200"
                  y1="180"
                  x2="250"
                  y2="280"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  opacity="0.5"
                />
                <line
                  x1="400"
                  y1="180"
                  x2="400"
                  y2="280"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  opacity="0.5"
                />
                <line
                  x1="600"
                  y1="180"
                  x2="550"
                  y2="280"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  opacity="0.5"
                />
                <line
                  x1="600"
                  y1="180"
                  x2="700"
                  y2="280"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  opacity="0.5"
                />

                {/* Nodes */}
                <circle cx="400" cy="80" r="30" fill="url(#nodeGradient)" />
                <text
                  x="400"
                  y="85"
                  textAnchor="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                >
                  Root
                </text>

                <circle cx="200" cy="180" r="25" fill="url(#nodeGradient)" />
                <text
                  x="200"
                  y="185"
                  textAnchor="middle"
                  fill="white"
                  fontSize="11"
                >
                  Team A
                </text>

                <circle cx="400" cy="180" r="25" fill="url(#nodeGradient)" />
                <text
                  x="400"
                  y="185"
                  textAnchor="middle"
                  fill="white"
                  fontSize="11"
                >
                  Team B
                </text>

                <circle cx="600" cy="180" r="25" fill="url(#nodeGradient)" />
                <text
                  x="600"
                  y="185"
                  textAnchor="middle"
                  fill="white"
                  fontSize="11"
                >
                  Team C
                </text>

                <circle cx="100" cy="280" r="20" fill="url(#nodeGradient)" />
                <text
                  x="100"
                  y="285"
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                >
                  A1
                </text>

                <circle cx="250" cy="280" r="20" fill="url(#nodeGradient)" />
                <text
                  x="250"
                  y="285"
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                >
                  A2
                </text>

                <circle cx="400" cy="280" r="20" fill="url(#nodeGradient)" />
                <text
                  x="400"
                  y="285"
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                >
                  B1
                </text>

                <circle cx="550" cy="280" r="20" fill="url(#nodeGradient)" />
                <text
                  x="550"
                  y="285"
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                >
                  C1
                </text>

                <circle cx="700" cy="280" r="20" fill="url(#nodeGradient)" />
                <text
                  x="700"
                  y="285"
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                >
                  C2
                </text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-white">
              Powerful Features for Data Management
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-300">
              Everything you need to create, visualize, and manage complex data
              relationships
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-white/10 bg-slate-900/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex rounded-lg bg-blue-500/10 p-3">
                  <Network className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">
                  Visual Tree Builder
                </h3>
                <p className="text-slate-400">
                  Drag and drop interface to create complex hierarchical
                  structures with ease. Intuitive and powerful.
                </p>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-slate-900/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex rounded-lg bg-cyan-500/10 p-3">
                  <Zap className="h-6 w-6 text-cyan-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">
                  Real-time Collaboration
                </h3>
                <p className="text-slate-400">
                  Work together with your team in real-time. See changes as they
                  happen, instantly.
                </p>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-slate-900/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex rounded-lg bg-purple-500/10 p-3">
                  <Shield className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">
                  Secure & Reliable
                </h3>
                <p className="text-slate-400">
                  Enterprise-grade security with encrypted data storage and
                  regular backups.
                </p>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-slate-900/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex rounded-lg bg-green-500/10 p-3">
                  <Users className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">
                  Team Management
                </h3>
                <p className="text-slate-400">
                  Organize teams, assign roles, and manage permissions with
                  granular access control.
                </p>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-slate-900/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex rounded-lg bg-orange-500/10 p-3">
                  <GitBranch className="h-6 w-6 text-orange-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">
                  Version Control
                </h3>
                <p className="text-slate-400">
                  Track changes, revert to previous versions, and maintain a
                  complete history of your data.
                </p>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-slate-900/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex rounded-lg bg-pink-500/10 p-3">
                  <BarChart3 className="h-6 w-6 text-pink-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">
                  Analytics & Insights
                </h3>
                <p className="text-slate-400">
                  Get valuable insights from your data with built-in analytics
                  and visualization tools.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Card className="border-blue-500/30 bg-linear-to-br from-blue-900/30 to-cyan-900/30 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Database className="mx-auto mb-6 h-16 w-16 text-blue-400" />
              <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
                Ready to get started?
              </h2>
              <p className="mb-8 text-lg text-slate-300">
                Join thousands of teams already using Tree Org to manage their
                data relationships.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="bg-blue-600 text-lg hover:bg-blue-700"
                  >
                    Create Free Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 text-lg text-white hover:bg-white/10"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <TreePalmIcon className="h-6 w-6 text-blue-500" />
              <span className="font-semibold text-white">Tree Org</span>
            </div>
            <p className="text-sm text-slate-400">
              © 2024 Tree Org. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-slate-400">
              <a href="#" className="hover:text-white">
                Privacy
              </a>
              <a href="#" className="hover:text-white">
                Terms
              </a>
              <a href="#" className="hover:text-white">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
