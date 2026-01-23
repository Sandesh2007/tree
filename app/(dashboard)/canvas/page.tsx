"use client";
import TreeBuilder from "@/components/custom/treeBuilder";
import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, Lock, Globe, Save } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { DiagramData } from "@/types/types";

export default function Canvas() {
  const [isLoading, setIsLoading] = useState(true);
  const [canvasId, setCanvasId] = useState<string | null>(null);
  const [canvasData, setCanvasData] = useState<DiagramData | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadRef = useRef(true);

  // Fetch or initialize canvas
  const fetchCanvasData = async (id: string) => {
    try {
      const response = await axios.get(`/api/canvas?id=${id}`);

      if (response.data.success) {
        if (response.data.canvas) {
          // Existing canvas
          setCanvasData(response.data.canvas.data);
          setIsPublic(response.data.canvas.isPublic);
          setLastSaved(new Date(response.data.canvas.updatedAt));
        } else {
          // New canvas
          setCanvasData({ nodes: [], links: [] });
        }
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast.error("Please login again");
          router.push("/login");
        } else if (error.response?.status === 404) {
          // Canvas doesn't exist, create new one
          setCanvasData({ nodes: [], links: [] });
        } else {
          toast.error("Failed to fetch canvas data");
        }
      } else {
        toast.error("Failed to fetch canvas data");
      }
    } finally {
      setIsLoading(false);
      // Mark initial load as complete after a short delay
      setTimeout(() => {
        initialLoadRef.current = false;
      }, 500);
    }
  };

  // Save canvas data
  const saveCanvas = useCallback(
    async (data: DiagramData, force = false) => {
      if (!canvasId || (!hasUnsavedChanges && !force)) return;

      try {
        setIsSaving(true);
        const response = await axios.post("/api/canvas/save", {
          canvasId,
          data,
          isPublic,
        });

        if (response.data.success) {
          setLastSaved(new Date());
          setHasUnsavedChanges(false);
          if (force) {
            toast.success("Canvas saved successfully");
          }
        }
      } catch (error: unknown) {
        console.error("Failed to save canvas:", error);
        toast.error("Failed to save changes");
      } finally {
        setIsSaving(false);
      }
    },
    [canvasId, isPublic, hasUnsavedChanges],
  );

  // Manual save function
  const handleManualSave = useCallback(() => {
    if (canvasData && canvasId) {
      // Clear any pending auto-save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveCanvas(canvasData, true);
    }
  }, [canvasData, canvasId, saveCanvas]);

  // Toggle visibility
  const toggleVisibility = async () => {
    if (!canvasId) return;

    try {
      const newVisibility = !isPublic;
      const response = await axios.post("/api/canvas/visibility", {
        canvasId,
        isPublic: newVisibility,
      });

      if (response.data.success) {
        setIsPublic(newVisibility);
        toast.success(`Canvas is now ${newVisibility ? "public" : "private"}`);
      }
    } catch {
      toast.error("Failed to update visibility");
    }
  };

  // Initialize canvas
  useEffect(() => {
    const id = searchParams.get("id");

    if (id) {
      setCanvasId(id);
      fetchCanvasData(id);
    } else {
      toast.error("No canvas ID provided");
      router.push("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router]);

  // Debounced auto-save when data changes (only after initial load)
  useEffect(() => {
    if (!canvasData || !canvasId || initialLoadRef.current) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Mark that we have unsaved changes
    setHasUnsavedChanges(true);

    // Set new timeout to save after 1 second of inactivity
    // saveTimeoutRef.current = setTimeout(() => {
    //   saveCanvas(canvasData);
    // }, 1000);

    // Cleanup timeout on unmount or when dependencies change
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [canvasData, canvasId, saveCanvas]);

  // Handle data changes from TreeBuilder
  const handleDataChange = useCallback((data: DiagramData) => {
    setCanvasData(data);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header with controls */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Canvas
          </h1>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {canvasId}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Last saved indicator */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            {isSaving ? (
              <>
                <Save className="h-4 w-4 animate-pulse" />
                <span>Saving...</span>
              </>
            ) : // : hasUnsavedChanges ? (
            // <>
            //   <Save className="h-4 w-4 text-yellow-500" />
            //   <span>Unsaved changes</span>
            // </>
            // )
            lastSaved ? (
              <>
                <Save className="h-4 w-4 text-green-500" />
                <span>
                  Saved{" "}
                  {new Date().getTime() - lastSaved.getTime() < 60000
                    ? "just now"
                    : lastSaved.toLocaleTimeString()}
                </span>
              </>
            ) : null}
          </div>

          {/* Manual save button */}
          <button
            onClick={handleManualSave}
            disabled={isSaving || (!hasUnsavedChanges && lastSaved !== null)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isSaving || (!hasUnsavedChanges && lastSaved !== null)
                ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300"
            }`}
          >
            <Save className="h-4 w-4" />
            <span>Save</span>
          </button>

          {/* Visibility toggle */}
          <button
            onClick={toggleVisibility}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isPublic
                ? "bg-green-100 text-green-700  hover:bg-green-200 dark:bg-green-900 dark:text-green-300"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            {isPublic ? (
              <>
                <Globe className="h-4 w-4" />
                <span>Public</span>
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                <span>Private</span>
              </>
            )}
          </button>

          {/* Back to dashboard */}
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Tree Builder */}
      <div className="flex-1">
        {canvasData && (
          <TreeBuilder
            initialData={canvasData}
            onDataChange={handleDataChange}
          />
        )}
      </div>
    </div>
  );
}
