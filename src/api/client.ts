import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export type ApiValidationIssue = {
  type: string;
  loc: Array<string | number>;
  msg: string;
  input?: unknown;
};

export type ApiErrorDetail =
  | string
  | {
      message?: string;
      error?: string;
      validation_snapshot?: unknown;
      [key: string]: unknown;
    }
  | ApiValidationIssue[];

export type ApiErrorResponse = {
  detail?: ApiErrorDetail;
  message?: string;
  error?: string;
  [key: string]: unknown;
};

export type NormalizedApiError = {
  message: string;
  detail: ApiErrorDetail | null;
  validationIssues: ApiValidationIssue[];
  status?: number;
};

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/login?expired=1";
    }
    return Promise.reject(error);
  }
);

export function normalizeApiError(error: unknown): NormalizedApiError {
  if (axios.isAxiosError(error)) {
    const data = (error.response?.data ?? {}) as ApiErrorResponse | string;
    const status = error.response?.status;

    if (typeof data === "string") {
      return {
        message: data,
        detail: data,
        validationIssues: [],
        status,
      };
    }

    const detail = data.detail ?? null;

    if (typeof detail === "string") {
      return {
        message: detail,
        detail,
        validationIssues: [],
        status,
      };
    }

    if (Array.isArray(detail)) {
      return {
        message: detail.map((issue) => issue.msg).join("; "),
        detail,
        validationIssues: detail,
        status,
      };
    }

    if (detail && typeof detail === "object") {
      const base = detail.message ?? data.message ?? data.error ?? error.message;
      const specific = detail.error;
      const message =
        base && specific
          ? `${base}: ${specific}`
          : base ?? specific ?? "Request failed";

      return { message, detail, validationIssues: [], status };
    }

    return {
      message: data.message ?? data.error ?? error.message ?? "Request failed",
      detail,
      validationIssues: [],
      status,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      detail: null,
      validationIssues: [],
    };
  }

  return {
    message: "An unexpected error occurred",
    detail: null,
    validationIssues: [],
  };
}

export function extractErrorMessage(error: unknown): string {
  return normalizeApiError(error).message;
}
