import { create } from "zustand";
import type { User } from "../types/auth";

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem("access_token"),
  user: null,

  setAuth: (token, user) => {
    localStorage.setItem("access_token", token);
    set({ token, user });
  },

  setUser: (user) => {
    set({ user });
  },

  logout: () => {
    localStorage.removeItem("access_token");
    set({ token: null, user: null });
  },

  isAuthenticated: () => {
    return !!get().token;
  },
}));
