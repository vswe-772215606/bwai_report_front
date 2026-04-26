import { apiClient } from "./client";
import type {
  DocumentCatalogFilters,
  DocumentTypeDefinition,
} from "../types/documentCatalog";

interface DocumentTypeResponse {
  id?: number | string | null;
  key?: string | null;
  slug?: string | null;
  code?: string | null;
  document_type?: string | null;
  type?: string | null;
  title?: string | null;
  name?: string | null;
  label?: string | null;
  description?: string | null;
  document_domain?: string | null;
  domain?: string | null;
  supports_batch_generation?: boolean | null;
}

interface DocumentCatalogEnvelope {
  items?: DocumentTypeResponse[];
  results?: DocumentTypeResponse[];
  types?: DocumentTypeResponse[];
}

function normalizeDocumentType(item: DocumentTypeResponse): DocumentTypeDefinition {
  const documentType =
    item.document_type ??
    item.type ??
    item.code ??
    item.slug ??
    item.key ??
    "unknown-document";

  return {
    id: String(item.id ?? item.key ?? item.slug ?? documentType),
    document_type: documentType,
    title: item.title ?? item.name ?? item.label ?? documentType,
    description: item.description ?? null,
    document_domain: item.document_domain ?? item.domain ?? "unknown",
    supports_batch_generation: Boolean(item.supports_batch_generation),
  };
}

export async function getDocumentTypes(
  filters: DocumentCatalogFilters = {}
): Promise<DocumentTypeDefinition[]> {
  const params: Record<string, string> = {};

  if (filters.domain) {
    params.domain = filters.domain;
  }

  if (typeof filters.supports_batch_generation === "boolean") {
    params.supports_batch_generation = String(filters.supports_batch_generation);
  }

  const res = await apiClient.get<DocumentTypeResponse[] | DocumentCatalogEnvelope>(
    "/document-catalog/types",
    { params }
  );

  const rawItems = Array.isArray(res.data)
    ? res.data
    : res.data.items ?? res.data.results ?? res.data.types ?? [];

  return rawItems.map(normalizeDocumentType);
}
