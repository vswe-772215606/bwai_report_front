import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WorkspaceReference {
  id: string;
  label: string;
}

interface WorkspaceState {
  currentUpload: WorkspaceReference | null;
  currentBlueprint: WorkspaceReference | null;
  currentDocumentAiJob: WorkspaceReference | null;
  currentBatchRun: WorkspaceReference | null;
  setCurrentUpload: (ref: WorkspaceReference | null) => void;
  setCurrentBlueprint: (ref: WorkspaceReference | null) => void;
  setCurrentDocumentAiJob: (ref: WorkspaceReference | null) => void;
  setCurrentBatchRun: (ref: WorkspaceReference | null) => void;
  clearWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      currentUpload: null,
      currentBlueprint: null,
      currentDocumentAiJob: null,
      currentBatchRun: null,

      setCurrentUpload: (ref) =>
        set({
          currentUpload: ref,
        }),

      setCurrentBlueprint: (ref) =>
        set({
          currentBlueprint: ref,
        }),

      setCurrentDocumentAiJob: (ref) =>
        set({
          currentDocumentAiJob: ref,
        }),

      setCurrentBatchRun: (ref) =>
        set({
          currentBatchRun: ref,
        }),

      clearWorkspace: () =>
        set({
          currentUpload: null,
          currentBlueprint: null,
          currentDocumentAiJob: null,
          currentBatchRun: null,
        }),
    }),
    {
      name: "workspace-selection",
    }
  )
);
