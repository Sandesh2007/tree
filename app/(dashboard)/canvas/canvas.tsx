"use client";

import TreeBuilder from "@/components/custom/treeBuilder";
import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { DiagramData } from "@/types/types";

export default function Canvas() {
  const [isLoading, setIsLoading] = useState(true);
  const [canvasId, setCanvasId] = useState<string | null>(null);
  const [canvasName, setCanvasName] = useState<string>("");
  const [canvasData, setCanvasData] = useState<DiagramData | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isNewCanvas, setIsNewCanvas] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadRef = useRef(true);

  // Fetch existing canvas or create new one
  const fetchOrCreateCanvas = useCallback(
    async (id: string) => {
      try {
        // Try to fetch the canvas
        const response = await axios.get(`/api/canvas?id=${id}`);

        if (response.data.success) {
          if (response.data.canvas) {
            // Canvas exists in database - load it
            const canvas = response.data.canvas;
            setCanvasData(canvas.data || { nodes: [], links: [] });
            setIsPublic(canvas.isPublic || false);
            setCanvasName(canvas.name || `Untitled Canvas`);
            setLastSaved(canvas.updatedAt ? new Date(canvas.updatedAt) : null);
            setHasUnsavedChanges(false);
            setIsNewCanvas(false);
          } else {
            // Canvas doesn't exist - create new one
            const emptyData: DiagramData = { nodes: [], links: [] };
            const defaultName = `Untitled Canvas`;

            // Create canvas in database
            const createResponse = await axios.post("/api/canvas/save", {
              canvasId: id,
              name: defaultName,
              data: emptyData,
              isPublic: false,
            });

            if (createResponse.data.success) {
              setCanvasData(emptyData);
              setCanvasName(defaultName);
              setIsPublic(false);
              setLastSaved(new Date());
              setHasUnsavedChanges(false);
              setIsNewCanvas(true);
              toast.success("New canvas created");
            } else {
              throw new Error("Failed to create canvas");
            }
          }
        } else {
          throw new Error(response.data.message || "Failed to load canvas");
        }
      } catch (error: unknown) {
        console.error("Canvas fetch/create error:", error);

        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            toast.error("Please login again");
            router.push("/login");
            return;
          }
        }

        toast.error("Failed to load canvas");
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
        setTimeout(() => {
          initialLoadRef.current = false;
        }, 500);
      }
    },
    [router],
  );

  // Save canvas
  const saveCanvas = useCallback(
    async (data: DiagramData, force = false) => {
      if (!canvasId) return;
      if (!hasUnsavedChanges && !force && !isNewCanvas) return;

      try {
        setIsSaving(true);
        const response = await axios.post("/api/canvas/save", {
          canvasId,
          name: canvasName,
          data,
          isPublic,
        });

        if (response.data.success) {
          setLastSaved(new Date());
          setHasUnsavedChanges(false);
          setIsNewCanvas(false);
          if (force) {
            toast.success("Canvas saved successfully");
          }
        } else {
          throw new Error(response.data.message || "Failed to save");
        }
      } catch (error: unknown) {
        console.error("Failed to save canvas:", error);
        toast.error("Failed to save changes");
      } finally {
        setIsSaving(false);
      }
    },
    [canvasId, canvasName, isPublic, hasUnsavedChanges, isNewCanvas],
  );

  // Manual save
  const handleManualSave = useCallback(() => {
    if (canvasData && canvasId) {
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
      } else {
        throw new Error(response.data.message || "Failed to update visibility");
      }
    } catch (error) {
      console.error("Visibility toggle error:", error);
      toast.error("Failed to update visibility");
    }
  };

  // Rename canvas
  const handleRenameCanvas = async (newName: string) => {
    if (!canvasId || !newName.trim()) return;

    try {
      // Update name via save endpoint (includes name in the update)
      const response = await axios.post("/api/canvas/save", {
        canvasId,
        name: newName.trim(),
        data: canvasData,
        isPublic,
      });

      if (response.data.success) {
        setCanvasName(newName.trim());
        toast.success("Canvas renamed successfully");
      } else {
        throw new Error(response.data.message || "Failed to rename");
      }
    } catch (error) {
      console.error("Rename error:", error);
      toast.error("Failed to rename canvas");
    }
  };

  // Delete canvas
  const handleDeleteCanvas = async () => {
    if (!canvasId) return;

    if (
      !confirm(
        "Are you sure you want to delete this canvas? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const response = await axios.delete(`/api/canvases?canvasId=${canvasId}`);

      if (response.data.success) {
        toast.success("Canvas deleted successfully");
        router.push("/dashboard");
      } else {
        throw new Error(response.data.message || "Failed to delete");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete canvas");
    }
  };

  // Initialize canvas on mount
  useEffect(() => {
    const id = searchParams.get("id");

    if (id) {
      setCanvasId(id);
      fetchOrCreateCanvas(id);
    } else {
      toast.error("No canvas ID provided");
      router.push("/dashboard");
    }
  }, [searchParams, router, fetchOrCreateCanvas]);

  // Track unsaved changes
  useEffect(() => {
    if (!canvasData || !canvasId || initialLoadRef.current) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setHasUnsavedChanges(true);

    // Optional: Auto-save after 30 seconds of inactivity
    // saveTimeoutRef.current = setTimeout(() => {
    //   saveCanvas(canvasData);
    // }, 30000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [canvasData, canvasId]);

  // Handle data changes from TreeBuilder
  const handleDataChange = useCallback((data: DiagramData) => {
    setCanvasData(data);
  }, []);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
          <p className="text-neutral-600 dark:text-neutral-400">
            Loading canvas...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {canvasData && canvasId && (
        <TreeBuilder
          initialData={canvasData}
          onDataChange={handleDataChange}
          canvas={{
            id: canvasId,
            name: canvasName,
            isPublic,
            isSaving,
            hasUnsavedChanges,
            lastSaved,
            onSave: handleManualSave,
            onRename: handleRenameCanvas,
            onToggleVisibility: toggleVisibility,
            onDelete: handleDeleteCanvas,
            onBack: () => {
              if (hasUnsavedChanges) {
                if (confirm("You have unsaved changes. Save before leaving?")) {
                  saveCanvas(canvasData, true).then(() => {
                    router.push("/dashboard");
                  });
                  return;
                }
              }
              router.push("/dashboard");
            },
          }}
        />
      )}
    </>
  );
}
