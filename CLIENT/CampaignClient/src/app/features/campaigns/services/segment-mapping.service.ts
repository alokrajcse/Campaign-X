import { Injectable } from '@angular/core';
import { Lead } from '../../../core/models/lead';

@Injectable({
  providedIn: 'root'
})
export class SegmentMappingService {

  assignSegment(lead: Lead): string {
    const campaignId = lead.campaignId || '';
    const email = lead.email || '';
    const phone = String(lead.phone || '');

    const campaign = campaignId.toLowerCase();
    
    if (campaign.includes('summer') || campaign.includes('winter') || 
        campaign.includes('fall') || campaign.includes('spring') || 
        campaign.includes('seasonal') || campaign.includes('holiday')) return 'Seasonal';
    
    if (campaign.includes('corporate') || campaign.includes('business') || 
        campaign.includes('enterprise') || campaign.includes('b2b') || 
        campaign.includes('company')) return 'Corporate';
    
    if (campaign.includes('launch') || campaign.includes('new') || 
        campaign.includes('beta') || campaign.includes('preview') || 
        campaign.includes('early') || campaign.includes('first')) return 'Early Adopters';

    if (email.toLowerCase().endsWith('@company.com')) return 'Corporate Leads';
    if (email.toLowerCase().endsWith('@edu.org')) return 'Student/Academic';
    if (email.toLowerCase().endsWith('@gmail.com') || 
        email.toLowerCase().endsWith('@yahoo.com')) return 'General Public';

    if (phone.startsWith('+1')) return 'US Leads';
    if (phone.startsWith('+91')) return 'India Leads';

    return 'General';
  }

  processBulkLeads(leads: Lead[]): Lead[] {
    return leads.map(lead => ({
      ...lead,
      segment: this.assignSegment(lead)
    }));
  }
}