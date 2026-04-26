export type DocumentDomain = "finance" | "hr" | string;

export interface DocumentTypeDefinition {
  id: string;
  document_type: string;
  title: string;
  description: string | null;
  document_domain: DocumentDomain;
  supports_batch_generation: boolean;
}

export interface DocumentCatalogFilters {
  domain?: DocumentDomain | "";
  supports_batch_generation?: boolean;
}
