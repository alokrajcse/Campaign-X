export interface Campaign {
  id?: number;
  name: string;
  startDate: string;
  endDate: string;
  totalLeads?: number;
  openRate?: number;
  clickRate?: number;
  conversionRate?: number;
  revenue?: number;
  status?: 'Active' | 'Completed' | 'Draft';
  agency?: string;
  buyer?: string;
  brand?: string;
}