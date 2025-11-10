import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Campaign } from '../../../core/models/campaign';
import { Lead } from '../../../core/models/lead';
import { BulkUploadResult } from '../../../core/models/bulk-upload';
import { SearchResult } from '../../../core/models/search';
import { APP_CONSTANTS } from '../../../core/constants/app.constants';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private apiUrl = APP_CONSTANTS.API_BASE_URL;

  constructor(private http: HttpClient) {}

  getCampaigns(): Observable<Campaign[]> {
    return this.http.get<Campaign[]>(`${this.apiUrl}/Campaigns`);
  }

  createCampaign(campaign: Campaign): Observable<Campaign> {
    return this.http.post<Campaign>(`${this.apiUrl}/Campaigns`, campaign);
  }

  updateCampaign(id: number, campaign: Campaign): Observable<Campaign> {
    return this.http.put<Campaign>(`${this.apiUrl}/Campaigns/${id}`, campaign);
  }

  deleteCampaign(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Campaigns/${id}`);
  }

  getCampaign(id: number): Observable<Campaign> {
    return this.http.get<Campaign>(`${this.apiUrl}/Campaigns/${id}`);
  }

  addLead(lead: Lead): Observable<Lead> {
    console.log('API URL:', `${this.apiUrl}/Leads`);
    console.log('Lead payload:', lead);
    return this.http.post<Lead>(`${this.apiUrl}/Leads`, lead);
  }

  updateLead(leadId: string, lead: Lead): Observable<Lead> {
    return this.http.put<Lead>(`${this.apiUrl}/Leads/${leadId}`, lead);
  }

  getLead(leadId: string): Observable<Lead> {
    return this.http.get<Lead>(`${this.apiUrl}/Leads/${leadId}`);
  }

  getLeads(filters?: { campaignId?: string }): Observable<Lead[]> {
    let params = new HttpParams();
    if (filters?.campaignId) {
      params = params.set('campaignId', filters.campaignId);
    }
    return this.http.get<Lead[]>(`${this.apiUrl}/Leads`, { params });
  }

  bulkUploadLeads(leads: Lead[]): Observable<BulkUploadResult> {
    return this.http.post<BulkUploadResult>(`${this.apiUrl}/Leads/bulk`, leads);
  }

  searchLeads(identifiers: string[], rawInput: string = ''): Observable<SearchResult> {
    const payload = { identifiers, rawInput };
    return this.http.post<SearchResult>(`${this.apiUrl}/Leads/multi-search`, payload);
  }

  exportLeads(format = 'csv', campaignId?: string, segment?: string): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    if (campaignId) params = params.set('campaignId', campaignId);
    if (segment) params = params.set('segment', segment);
    
    return this.http.get(`${this.apiUrl}/Leads/export`, { 
      params, 
      responseType: 'blob' 
    });
  }

  getCampaignAnalytics(campaignId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/Campaigns/${campaignId}/analytics`);
  }

  getDropdownData(): Observable<{agencies: string[], buyers: string[], brands: string[]}> {
    return this.http.get<{agencies: string[], buyers: string[], brands: string[]}>(`${this.apiUrl}/Campaigns/dropdown-data`);
  }

  updateLeadCampaign(leadId: string, campaignName: string): Observable<Lead> {
    return this.http.patch<Lead>(`${this.apiUrl}/Leads/${leadId}/campaign`, { campaignName });
  }

  deleteLead(leadId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Leads/${leadId}`);
  }
}