import { apiClient } from "./client";
import type {
  Blueprint,
  BlueprintField,
  CreateBlueprintFieldRequest,
  CreateBlueprintRequest,
} from "../types/blueprint";
import type { JsonValue } from "../types/common";

interface BlueprintResponse {
  id: number;
  title?: string | null;
  name?: string | null;
  report_type?: string | null;
  status?: string | null;
  source_type?: string | null;
  parse_error?: string | null;
  created_at: string;
  updated_at?: string | null;
  user_id?: number | null;
}

interface BlueprintFieldResponse {
  id: number;
  blueprint_id: number;
  section_key?: string | null;
  field_key: string;
  label: string;
  data_type?: string | null;
  required?: boolean | null;
  formula?: string | null;
  display_order?: number | null;
  hints_json?: JsonValue | null;
}

function normalizeBlueprint(blueprint: BlueprintResponse): Blueprint {
  return {
    id: String(blueprint.id),
    title: blueprint.title ?? blueprint.name ?? `Blueprint ${blueprint.id}`,
    report_type: blueprint.report_type ?? null,
    status: blueprint.status ?? null,
    source_type: blueprint.source_type ?? null,
    parse_error: blueprint.parse_error ?? null,
    created_at: blueprint.created_at,
    updated_at: blueprint.updated_at ?? null,
    user_id: blueprint.user_id == null ? null : String(blueprint.user_id),
  };
}

function normalizeBlueprintField(field: BlueprintFieldResponse): BlueprintField {
  return {
    id: String(field.id),
    blueprint_id: String(field.blueprint_id),
    section_key: field.section_key ?? null,
    field_key: field.field_key,
    label: field.label,
    data_type: field.data_type ?? "string",
    required: Boolean(field.required),
    formula: field.formula ?? null,
    display_order: field.display_order ?? null,
    hints_json: field.hints_json ?? null,
  };
}

export async function getBlueprints(): Promise<Blueprint[]> {
  const res = await apiClient.get<BlueprintResponse[]>("/blueprints");
  return res.data.map(normalizeBlueprint);
}

export async function getBlueprint(blueprintId: string): Promise<Blueprint> {
  const res = await apiClient.get<BlueprintResponse>(`/blueprints/${blueprintId}`);
  return normalizeBlueprint(res.data);
}

export async function createBlueprint(data: CreateBlueprintRequest): Promise<Blueprint> {
  const res = await apiClient.post<BlueprintResponse>("/blueprints", data);
  return normalizeBlueprint(res.data);
}

export async function uploadBlueprintDocx(file: File): Promise<Blueprint> {
  const form = new FormData();
  form.append("file", file);
  const res = await apiClient.post<BlueprintResponse>("/blueprints/upload-docx", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return normalizeBlueprint(res.data);
}

export async function uploadBlueprintPdf(file: File): Promise<Blueprint> {
  const form = new FormData();
  form.append("file", file);
  const res = await apiClient.post<BlueprintResponse>("/blueprints/upload-pdf", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return normalizeBlueprint(res.data);
}

export async function getBlueprintFields(blueprintId: string): Promise<BlueprintField[]> {
  const res = await apiClient.get<BlueprintFieldResponse[]>(
    `/blueprints/${blueprintId}/fields`
  );
  return res.data.map(normalizeBlueprintField);
}

export async function createBlueprintField(
  blueprintId: string,
  data: CreateBlueprintFieldRequest
): Promise<BlueprintField> {
  const res = await apiClient.post<BlueprintFieldResponse>(
    `/blueprints/${blueprintId}/fields`,
    data
  );
  return normalizeBlueprintField(res.data);
}
