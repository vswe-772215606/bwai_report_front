import { create } from "zustand";
import type { User } from "../types/auth";

interface AuthState {
  token: string | null;
  user: User | null;
  setToken: (token: string) => void;
  setUser: (user: User | null) => void;
  setSession: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem("access_token"),
  user: null,

  setToken: (token) => {
    localStorage.setItem("access_token", token);
    set({ token });
  },

  setUser: (user) => {
    set({ user });
  },

  setSession: (token, user) => {
    localStorage.setItem("access_token", token);
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem("access_token");
    set({ token: null, user: null });
  },

  isAuthenticated: () => !!get().token,
}));
