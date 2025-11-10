import { Lead } from './lead';

export interface SearchResult {
  found: Lead[];
  notFound: string[];
}