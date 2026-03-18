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
