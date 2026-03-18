export type DocType = "podcast" | "newsletter";

export interface RawIndexItem {
  title?: string;
  filename?: string;
  tags?: string[];
  word_count?: number;
  date?: string;
  description?: string;
  guest?: string;
  subtitle?: string;
}

export interface IndexFile {
  schema_version?: string;
  generated_at?: string;
  podcasts?: RawIndexItem[];
  newsletters?: RawIndexItem[];
}

export interface DocItem {
  type: DocType;
  title: string;
  filename: string;
  tags: string[];
  wordCount: number;
  date: string;
  summary: string;
  guest: string;
  subtitle: string;
}

export interface NormalizedData {
  schemaVersion: string;
  generatedAt: string;
  podcasts: DocItem[];
  newsletters: DocItem[];
  all: DocItem[];
  tagLabels: Record<string, string>;
}

export interface TagCount {
  name: string;
  count: number;
}

export interface SearchIndexEntry {
  filename: string;
  text: string;
}

export interface SearchIndexFile {
  version: number;
  generated_at: string;
  docs: SearchIndexEntry[];
}

export interface TranslationDocFields {
  title?: string;
  summary?: string;
  subtitle?: string;
  guest?: string;
}

export interface TranslationMetaFile {
  version?: number;
  locale?: string;
  generated_at?: string;
  tag_map?: Record<string, string>;
  items?: Record<string, TranslationDocFields>;
}
