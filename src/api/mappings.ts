import { apiClient } from "./client";
import type { Mapping, ConfirmMappingRequest } from "../types/mapping";
import type { AggregationType } from "../types/template";

export async function confirmMappings(data: ConfirmMappingRequest): Promise<Mapping[]> {
  const res = await apiClient.post<Mapping[]>("/mappings/confirm", data);
  return res.data;
}

export async function getMappings(): Promise<Mapping[]> {
  const res = await apiClient.get<Mapping[]>("/mappings");
  return res.data;
}

export async function getMappingsByTemplate(templateId: string): Promise<Mapping[]> {
  const res = await apiClient.get<Mapping[]>(`/mappings/template/${templateId}`);
  return res.data;
}

export interface UpdateMappingRequest {
  source_sheet?: string;
  source_column?: string;
  source_column_index?: number;
  aggregation_type?: AggregationType;
}

export async function updateMapping(
  mappingId: string,
  data: UpdateMappingRequest
): Promise<Mapping> {
  const res = await apiClient.put<Mapping>(`/mappings/${mappingId}`, data);
  return res.data;
}

export async function deleteMapping(mappingId: string): Promise<void> {
  await apiClient.delete(`/mappings/${mappingId}`);
}
