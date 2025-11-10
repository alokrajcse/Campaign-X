export interface BulkUploadResult {
  message: string;
  leads: any[];
  successCount?: number;
  failedCount?: number;
  totalRows?: number;
}