export interface Lead {
  id?: number;
  leadId: string;
  name: string;
  email: string;
  phone: string;
  campaignId: string;
  segment?: string;
  status?: string;
  createdDate?: string;
  updatedDate?: string;
  openRate?: number;
  clickRate?: number;
  conversions?: number;
}