import { apiClient } from "./client";
import type { Template, TemplateField } from "../types/template";

export interface CreateTemplateRequest {
  name: string;
  report_type: string;
  description?: string;
}

export async function getTemplates(): Promise<Template[]> {
  const res = await apiClient.get<Template[]>("/templates");
  return res.data;
}

export async function getTemplate(templateId: string): Promise<Template> {
  const res = await apiClient.get<Template>(`/templates/${templateId}`);
  return res.data;
}

export async function getTemplateFields(templateId: string): Promise<TemplateField[]> {
  const res = await apiClient.get<TemplateField[]>(`/templates/${templateId}/fields`);
  return res.data;
}

export async function createTemplate(data: CreateTemplateRequest): Promise<Template> {
  const res = await apiClient.post<Template>("/templates", data);
  return res.data;
}

export async function uploadDocxTemplate(
  templateId: string,
  file: File
): Promise<Template> {
  const form = new FormData();
  form.append("file", file);
  form.append("template_id", templateId);
  const res = await apiClient.post<Template>("/templates/upload-docx", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}
