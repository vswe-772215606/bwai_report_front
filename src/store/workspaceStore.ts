import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WorkspaceReference {
  id: string;
  label: string;
}

interface WorkspaceState {
  currentUpload: WorkspaceReference | null;
  currentBlueprint: WorkspaceReference | null;
  currentIndexRun: WorkspaceReference | null;
  currentExtractionRun: WorkspaceReference | null;
  setCurrentUpload: (ref: WorkspaceReference | null) => void;
  setCurrentBlueprint: (ref: WorkspaceReference | null) => void;
  setCurrentIndexRun: (ref: WorkspaceReference | null) => void;
  setCurrentExtractionRun: (ref: WorkspaceReference | null) => void;
  clearWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      currentUpload: null,
      currentBlueprint: null,
      currentIndexRun: null,
      currentExtractionRun: null,

      setCurrentUpload: (ref) =>
        set({
          currentUpload: ref,
          currentIndexRun: null,
          currentExtractionRun: null,
        }),

      setCurrentBlueprint: (ref) =>
        set({
          currentBlueprint: ref,
          currentExtractionRun: null,
        }),

      setCurrentIndexRun: (ref) =>
        set({
          currentIndexRun: ref,
        }),

      setCurrentExtractionRun: (ref) =>
        set({
          currentExtractionRun: ref,
        }),

      clearWorkspace: () =>
        set({
          currentUpload: null,
          currentBlueprint: null,
          currentIndexRun: null,
          currentExtractionRun: null,
        }),
    }),
    {
      name: "workspace-selection",
    }
  )
);
