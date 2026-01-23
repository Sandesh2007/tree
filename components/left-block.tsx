import { ChartLine, Hand, Network, TreePalm, User } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface NodePosition {
  x: number;
  y: number;
}

interface FloatingNodeProps {
  id: string;
  delay?: number;
  color: string;
  shadowColor: string;
  size: string;
  sizeNum: number;
  initialTop: string;
  initialLeft: string;
  icon: React.ReactNode;
  onPositionChange: (id: string, pos: NodePosition) => void;
}

// Floating nodes with position tracking and dragging
function FloatingNode({
  id,
  delay = 0,
  color,
  shadowColor,
  size,
  initialTop,
  initialLeft,
  icon,
  onPositionChange,
}: FloatingNodeProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({
    top: initialTop,
    left: initialLeft,
  });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Update position for connecting lines
  useEffect(() => {
    const updatePosition = () => {
      if (nodeRef.current) {
        const rect = nodeRef.current.getBoundingClientRect();
        const parent = nodeRef.current.closest(".nodes-container");
        if (parent) {
          const parentRect = parent.getBoundingClientRect();
          onPositionChange(id, {
            x: rect.left - parentRect.left + rect.width / 2,
            y: rect.top - parentRect.top + rect.height / 2,
          });
        }
      }
      requestAnimationFrame(updatePosition);
    };

    const animationId = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(animationId);
  }, [id, onPositionChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const rect = nodeRef.current?.getBoundingClientRect();
    if (rect) {
      setOffset({
        x: e.clientX - rect.left - rect.width / 2,
        y: e.clientY - rect.top - rect.height / 2,
      });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);

    const rect = nodeRef.current?.getBoundingClientRect();
    if (rect) {
      setOffset({
        x: touch.clientX - rect.left - rect.width / 2,
        y: touch.clientY - rect.top - rect.height / 2,
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !nodeRef.current) return;

      const parent = nodeRef.current.closest(".nodes-container");
      if (!parent) return;

      const parentRect = parent.getBoundingClientRect();
      const nodeRect = nodeRef.current.getBoundingClientRect();

      let newLeft = e.clientX - parentRect.left - offset.x - nodeRect.width / 2;
      let newTop = e.clientY - parentRect.top - offset.y - nodeRect.height / 2;

      newLeft = Math.max(
        0,
        Math.min(newLeft, parentRect.width - nodeRect.width),
      );
      newTop = Math.max(
        0,
        Math.min(newTop, parentRect.height - nodeRect.height),
      );

      setPosition({
        left: `${newLeft}px`,
        top: `${newTop}px`,
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !nodeRef.current) return;

      const touch = e.touches[0];
      const parent = nodeRef.current.closest(".nodes-container");
      if (!parent) return;

      const parentRect = parent.getBoundingClientRect();
      const nodeRect = nodeRef.current.getBoundingClientRect();

      let newLeft =
        touch.clientX - parentRect.left - offset.x - nodeRect.width / 2;
      let newTop =
        touch.clientY - parentRect.top - offset.y - nodeRect.height / 2;

      // Constrain to parent bounds
      newLeft = Math.max(
        0,
        Math.min(newLeft, parentRect.width - nodeRect.width),
      );
      newTop = Math.max(
        0,
        Math.min(newTop, parentRect.height - nodeRect.height),
      );

      setPosition({
        left: `${newLeft}px`,
        top: `${newTop}px`,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, offset]);

  return (
    <div
      ref={nodeRef}
      className={`absolute ${size} ${color} rounded-full ${shadowColor} flex items-center justify-center text-white select-none ${
        isDragging ? "cursor-grabbing z-50 scale-110" : "cursor-grab"
      } transition-transform duration-150`}
      style={{
        top: position.top,
        left: position.left,
        animation: isDragging
          ? "none"
          : `float${id} ${7 + delay}s ease-in-out infinite`,
        zIndex: isDragging ? 50 : 2,
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {icon}
      {/* Drag indicator ring */}
      <div
        className={`absolute inset-0 rounded-full border-2 border-white/30 transition-opacity duration-200 ${
          isDragging ? "opacity-100 scale-110" : "opacity-0"
        }`}
      />
    </div>
  );
}

function ConnectingLines({
  positions,
}: {
  positions: Record<string, NodePosition>;
}) {
  const { node1, node2, node3, node4 } = positions;

  if (!node1 || !node2 || !node3 || !node4) return null;

  // helper to render a line between two nodes
  const renderLine = (
    from: NodePosition,
    to: NodePosition,
    gradientId: string,
  ) => (
    <line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke={`url(#${gradientId})`}
      strokeWidth="2"
      strokeLinecap="round"
    />
  );

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    >
      <defs>
        <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop
            offset="0%"
            style={{ stopColor: "#ec4899", stopOpacity: 0.6 }}
          />
          <stop
            offset="100%"
            style={{ stopColor: "#22d3ee", stopOpacity: 0.6 }}
          />
        </linearGradient>
        <linearGradient id="lineGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop
            offset="0%"
            style={{ stopColor: "#22d3ee", stopOpacity: 0.6 }}
          />
          <stop
            offset="100%"
            style={{ stopColor: "#3b82f6", stopOpacity: 0.6 }}
          />
        </linearGradient>
        <linearGradient id="lineGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop
            offset="0%"
            style={{ stopColor: "#3b82f6", stopOpacity: 0.6 }}
          />
          <stop
            offset="100%"
            style={{ stopColor: "#ec4899", stopOpacity: 0.6 }}
          />
        </linearGradient>
        <linearGradient id="lineGradient4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop
            offset="0%"
            style={{ stopColor: "#22c55e", stopOpacity: 0.6 }}
          />
          <stop
            offset="100%"
            style={{ stopColor: "#3b82f6", stopOpacity: 0.6 }}
          />
        </linearGradient>
        <linearGradient id="lineGradient5" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop
            offset="0%"
            style={{ stopColor: "#22c55e", stopOpacity: 0.6 }}
          />
          <stop
            offset="100%"
            style={{ stopColor: "#22d3ee", stopOpacity: 0.6 }}
          />
        </linearGradient>
      </defs>

      {/* Connect all nodes */}
      {renderLine(node1, node2, "lineGradient1")}
      {renderLine(node1, node3, "lineGradient2")}
      {renderLine(node2, node3, "lineGradient3")}
      {renderLine(node3, node4, "lineGradient4")}
      {renderLine(node2, node4, "lineGradient5")}
    </svg>
  );
}

// Tooltip component for drag hint
function DragHint() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 text-white/80 text-sm flex items-center gap-2 animate-pulse">
      <Hand className="w-4 h-4" />
      <span>Drag the nodes to move them!</span>
    </div>
  );
}

export default function LeftBlock() {
  const [nodePositions, setNodePositions] = useState<
    Record<string, NodePosition>
  >({});

  const handlePositionChange = useCallback((id: string, pos: NodePosition) => {
    setNodePositions((prev) => ({
      ...prev,
      [id]: pos,
    }));
  }, []);

  return (
    <>
      <style jsx global>{`
        @keyframes floatnode1 {
          0%,
          100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(15px, -25px);
          }
          50% {
            transform: translate(-10px, -15px);
          }
          75% {
            transform: translate(20px, -30px);
          }
        }
        @keyframes floatnode2 {
          0%,
          100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(-20px, -15px);
          }
          50% {
            transform: translate(15px, -25px);
          }
          75% {
            transform: translate(-10px, -20px);
          }
        }
        @keyframes floatnode3 {
          0%,
          100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(10px, -20px);
          }
          50% {
            transform: translate(-15px, -30px);
          }
          75% {
            transform: translate(5px, -15px);
          }
        }
        @keyframes floatnode4 {
          0%,
          100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(-15px, -20px);
          }
          50% {
            transform: translate(20px, -15px);
          }
          75% {
            transform: translate(-5px, -25px);
          }
        }
        @keyframes pulse-glow {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
          }
          50% {
            box-shadow: 0 0 40px rgba(59, 130, 246, 0.8);
          }
        }
      `}</style>
      <div className="nodes-container bg-neutral-100 dark:bg-neutral-800 relative flex-1 hidden md:flex items-center justify-center overflow-hidden">
        <ConnectingLines positions={nodePositions} />
        <DragHint />
        <FloatingNode
          id="node1"
          delay={0}
          color="bg-gradient-to-br from-pink-400 to-pink-600"
          shadowColor="shadow-lg shadow-pink-500/50"
          size="w-20 h-20"
          sizeNum={80}
          initialTop="18%"
          initialLeft="35%"
          icon={<User className="w-8 h-8" />}
          onPositionChange={handlePositionChange}
        />
        <FloatingNode
          id="node2"
          delay={0.5}
          color="bg-gradient-to-br from-cyan-400 to-cyan-600"
          shadowColor="shadow-lg shadow-cyan-500/50"
          size="w-16 h-16"
          sizeNum={64}
          initialTop="58%"
          initialLeft="22%"
          icon={<ChartLine className="w-6 h-6" />}
          onPositionChange={handlePositionChange}
        />
        <FloatingNode
          id="node3"
          delay={1}
          color="bg-gradient-to-br from-blue-500 to-blue-700"
          shadowColor="shadow-lg shadow-blue-500/50"
          size="w-24 h-24"
          sizeNum={96}
          initialTop="52%"
          initialLeft="58%"
          icon={<Network className="w-10 h-10" />}
          onPositionChange={handlePositionChange}
        />
        <FloatingNode
          id="node4"
          delay={0.5}
          color="bg-gradient-to-br from-green-500 to-green-700"
          shadowColor="shadow-lg shadow-green-500/50"
          size="w-20 h-20"
          sizeNum={80}
          initialTop="72%"
          initialLeft="68%"
          icon={<Hand className="w-8 h-8" />}
          onPositionChange={handlePositionChange}
        />

        <div className="relative z-10 text-center pointer-events-none">
          <div className="w-24 h-24 mx-auto mb-6 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
            <TreePalm className="w-14 h-14 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
            Tree Org
          </h1>
          <p className="text-gray-400 text-lg">Visualize your organization</p>
        </div>

        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-md" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-md" />
      </div>
    </>
  );
}
