import { apiClient } from "./client";
import type { ValidationResult, ValidationRunRequest } from "../types/validation";

export async function runValidation(data: ValidationRunRequest): Promise<ValidationResult> {
  const res = await apiClient.post<ValidationResult>("/validation/run", data);
  return res.data;
}

export async function getValidationByUpload(uploadId: string): Promise<ValidationResult> {
  const res = await apiClient.get<ValidationResult>(`/validation/upload/${uploadId}`);
  return res.data;
}
