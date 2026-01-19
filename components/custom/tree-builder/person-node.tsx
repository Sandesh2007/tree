"use client";

import { useEffect, useRef } from "react";
import { Handle, Position } from "@xyflow/react";
import { Mail, Phone, Building2 } from "lucide-react";
import { gsap } from "gsap";
import { PersonData } from "@/types/types";
import { levelConfig } from "@/types/constants";
import { cn } from "@/lib/utils";

interface PersonNodeProps {
  data: PersonData;
  id: string;
  selected: boolean;
}

export default function PersonNode({ data, id, selected }: PersonNodeProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const config = levelConfig[data.level];
  if (!config) {
    console.warn("Invalid node level:", data.level, data);
  }

  useEffect(() => {
    if (nodeRef.current) {
      // Initial animation when node is created
      gsap.fromTo(
        nodeRef.current,
        {
          opacity: 0,
          scale: 0.5,
          y: -20,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.5,
          ease: "back.out(1.7)",
        },
      );
    }
  }, []);

  useEffect(() => {
    if (nodeRef.current) {
      if (selected) {
        gsap.to(nodeRef.current, {
          scale: 1.02,
          duration: 0.2,
          ease: "power2.out",
        });
      } else {
        gsap.to(nodeRef.current, {
          scale: 1,
          duration: 0.2,
          ease: "power2.out",
        });
      }
    }
  }, [selected]);

  const handleMouseEnter = () => {
    if (nodeRef.current && !selected) {
      gsap.to(nodeRef.current, {
        y: -4,
        duration: 0.2,
        ease: "power2.out",
      });
    }
  };

  const handleMouseLeave = () => {
    if (nodeRef.current && !selected) {
      gsap.to(nodeRef.current, {
        y: 0,
        duration: 0.2,
        ease: "power2.out",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      ref={nodeRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "bg-white dark:bg-neutral-800 rounded-2xl border-2 shadow-lg min-w-55 overflow-hidden transition-shadow duration-200",
        selected
          ? "border-neutral-900 dark:border-neutral-100 shadow-xl ring-4 ring-neutral-900/10 dark:ring-neutral-100/10"
          : "border-neutral-200 dark:border-neutral-700 hover:shadow-xl hover:border-neutral-300 dark:hover:border-neutral-600",
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3! h-3! bg-neutral-400! dark:bg-neutral-500! border-2! border-white! dark:border-neutral-800! -top-1.5!"
      />

      {/* Level Badge */}
      <div className={cn("px-4 py-2 dark:opacity-90", config.bgColor)}>
        <span
          className={cn(
            "text-xs font-medium dark:brightness-125",
            config.color,
          )}
        >
          {config.label}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center text-sm font-semibold shrink-0 dark:opacity-90",
              config.bgColor,
              config.color,
              "dark:brightness-125",
            )}
          >
            {data.image ? (
              <img
                src={data.image}
                alt={data.name}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              getInitials(data.name)
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-50 truncate">
              {data.name}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
              {data.role}
            </p>
          </div>
        </div>

        {/* Details */}
        {(data.department || data.email || data.phone) && (
          <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-700 space-y-2">
            {data.department && (
              <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                <Building2
                  size={14}
                  className="text-neutral-400 dark:text-neutral-500"
                />
                <span className="truncate">{data.department}</span>
              </div>
            )}
            {data.email && (
              <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                <Mail
                  size={14}
                  className="text-neutral-400 dark:text-neutral-500"
                />
                <span className="truncate">{data.email}</span>
              </div>
            )}
            {data.phone && (
              <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                <Phone
                  size={14}
                  className="text-neutral-400 dark:text-neutral-500"
                />
                <span>{data.phone}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3! h-3! bg-neutral-400! dark:bg-neutral-500! border-2! border-white! dark:border-neutral-800! -bottom-1.5!"
      />
    </div>
  );
}
