import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Lead } from '../../../../core/models/lead';
import { SearchResult } from '../../../../core/models/search';
import { CampaignService } from '../../services/campaign.service';
import { NavigationComponent } from '../../../../shared/components/navigation/navigation';

@Component({
  selector: 'app-multi-lead-search',
  standalone: true,
  imports: [CommonModule, FormsModule, NavigationComponent],
  templateUrl: './multi-lead-search.html',
  styleUrls: ['./multi-lead-search.css']
})
export class MultiLeadSearchComponent {
  searchInput = '';
  searchResult: SearchResult | null = null;
  isSearching = false;

  constructor(
    private campaignService: CampaignService,
    private router: Router
  ) {}

  searchLeads() {
    if (!this.searchInput.trim()) return;

    const identifiers = this.searchInput
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    this.isSearching = true;
    
    this.campaignService.searchLeads(identifiers, this.searchInput).subscribe({
      next: (result: any) => {
        const mappedResult = {
          found: result.foundLeads || [],
          notFound: result.notFoundIdentifiers || []
        };
        
        this.searchResult = mappedResult;
        this.isSearching = false;
      },
      error: (err) => {
        console.error('Search error:', err);
        this.searchByName({ found: [], notFound: identifiers }, identifiers);
      }
    });
  }

  searchByName(initialResult: SearchResult, identifiers: string[]) {
    this.campaignService.getLeads().subscribe({
      next: (allLeads) => {
        const found = [...(initialResult.found || [])];
        const notFound: string[] = [];
        
        for (const identifier of identifiers) {
          if (initialResult.found?.some(lead => 
            lead.leadId === identifier || 
            lead.email === identifier
          )) continue;
          
          const matchingLeads = allLeads.filter(lead => 
            lead.name?.toLowerCase().includes(identifier.toLowerCase()) ||
            lead.email?.toLowerCase().includes(identifier.toLowerCase()) ||
            lead.leadId?.toLowerCase().includes(identifier.toLowerCase()) ||
            lead.campaignId?.toLowerCase().includes(identifier.toLowerCase())
          );
          
          if (matchingLeads.length > 0) {
            matchingLeads.forEach(lead => {
              if (!found.some(f => f.leadId === lead.leadId)) {
                found.push(lead);
              }
            });
          } else {
            notFound.push(identifier);
          }
        }
        
        this.searchResult = { found: found || [], notFound: notFound || [] };
        this.isSearching = false;
      },
      error: () => {
        this.searchResult = { found: initialResult.found || [], notFound: initialResult.notFound || [] };
        this.isSearching = false;
      }
    });
  }

  exportResults() {
    if (!this.searchResult?.found?.length) {
      return;
    }

    const csvContent = this.generateCSV(this.searchResult.found);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'search-results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private generateCSV(leads: Lead[]): string {
    const headers = ['Lead ID', 'Name', 'Email', 'Phone', 'Campaign', 'Segment', 'Status', 'Open Rate', 'Click Rate', 'Conversions', 'Created Date'];
    const rows = leads.map(lead => [
      lead.leadId || '',
      lead.name || '',
      lead.email || '',
      lead.phone || '',
      lead.campaignId || '',
      lead.segment || '',
      lead.status || '',
      lead.openRate || 0,
      lead.clickRate || 0,
      lead.conversions || 0,
      lead.createdDate ? new Date(lead.createdDate).toLocaleDateString() : ''
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
  }

  clearSearch() {
    this.searchInput = '';
    this.searchResult = null;
  }

  goBack() {
    this.router.navigate(['/campaigns']);
  }
}