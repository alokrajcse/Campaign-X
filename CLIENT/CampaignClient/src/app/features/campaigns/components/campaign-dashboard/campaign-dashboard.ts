import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Campaign } from '../../../../core/models/campaign';
import { CampaignService } from '../../services/campaign.service';
import { AuthService } from '../../../../core/services/auth';
import { CreateCampaignComponent } from '../create-campaign/create-campaign';
import { EditCampaignComponent } from '../edit-campaign/edit-campaign';
import { CampaignAnalyticsComponent } from '../campaign-analytics/campaign-analytics';
import { LoadingComponent } from '../../../../shared/components/loading/loading';
import { NavigationComponent } from '../../../../shared/components/navigation/navigation';

@Component({
  selector: 'app-campaign-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NavigationComponent, CreateCampaignComponent, EditCampaignComponent, CampaignAnalyticsComponent, LoadingComponent],
  templateUrl: './campaign-dashboard.html',
  styleUrls: ['./campaign-dashboard.css']
})
export class CampaignDashboardComponent implements OnInit {
  campaigns: Campaign[] = [];
  filteredCampaigns: Campaign[] = [];
  showCreateModal = false;
  showEditModal = false;
  showAnalyticsModal = false;
  editingCampaign: Campaign | null = null;
  analyticsCampaign: Campaign | null = null;
  loading = false;
  error = '';
  Math = Math;
  
  filters = {
    name: '',
    startDate: '',
    endDate: '',
    agencies: [] as string[],
    buyers: [] as string[],
    brands: [] as string[]
  };

  agencies: string[] = [];
  buyers: string[] = [];
  brands: string[] = [];
  
  dropdownStates = {
    agencies: false,
    buyers: false,
    brands: false
  };
  
  currentPage = 1;
  itemsPerPage = 5;
  totalItems = 0;
  paginatedCampaigns: Campaign[] = [];
  
  sortField = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private campaignService: CampaignService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCampaigns();
    this.loadDropdownData();
  }

  loadCampaigns() {
    this.loading = true;
    this.error = '';
    this.campaignService.getCampaigns().subscribe({
      next: (campaigns) => {
        this.campaignService.getLeads().subscribe({
          next: (leads) => {
            campaigns.forEach(campaign => {
              const campaignLeads = leads.filter(lead => lead.campaignId === campaign.name);
              campaign.totalLeads = campaignLeads.length;
              
              if (campaignLeads.length > 0) {
                const totalOpenRate = campaignLeads.reduce((sum, lead) => sum + (lead.openRate || 0), 0);
                const totalClickRate = campaignLeads.reduce((sum, lead) => sum + (lead.clickRate || 0), 0);
                const totalConversions = campaignLeads.reduce((sum, lead) => sum + (lead.conversions || 0), 0);
                
                campaign.openRate = Math.round((totalOpenRate / campaignLeads.length) * 100);
                campaign.clickRate = Math.round(totalClickRate / campaignLeads.length);
                campaign.conversionRate = Math.round((totalConversions / campaignLeads.length) * 100);
              }
            });
            this.campaigns = campaigns;
            this.filteredCampaigns = campaigns;
            this.updatePagination();
            this.loading = false;
          },
          error: () => {
            this.campaigns = campaigns;
            this.filteredCampaigns = campaigns;
            this.updatePagination();
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('API Error:', err);
        if (err.status === 0) {
          this.error = 'Cannot connect to server. Please check if the backend is running on https://localhost:44392';
        } else if (err.status === 500) {
          this.error = 'Server error. Please check the backend logs.';
        } else {
          this.error = `Failed to load campaigns: ${err.error?.message || err.message}`;
        }
        this.loading = false;
      }
    });
  }

  loadDropdownData() {
    this.campaignService.getDropdownData().subscribe(data => {
      this.agencies = data.agencies;
      this.buyers = data.buyers;
      this.brands = data.brands;
    });
  }

  applyFilters() {
    this.filteredCampaigns = this.campaigns.filter(campaign => {
      return (!this.filters.name || campaign.name.toLowerCase().includes(this.filters.name.toLowerCase())) &&
             (!this.filters.startDate || campaign.startDate >= this.filters.startDate) &&
             (!this.filters.endDate || campaign.endDate <= this.filters.endDate) &&
             (!this.filters.agencies.length || this.filters.agencies.includes(campaign.agency || '')) &&
             (!this.filters.buyers.length || this.filters.buyers.includes(campaign.buyer || '')) &&
             (!this.filters.brands.length || this.filters.brands.includes(campaign.brand || ''));
    });
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalItems = this.filteredCampaigns.length;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedCampaigns = this.filteredCampaigns.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }



  sort(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    
    this.filteredCampaigns.sort((a: any, b: any) => {
      const aVal = a[field];
      const bVal = b[field];
      
      if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    this.currentPage = 1;
    this.updatePagination();
  }
  
 
  getSortIcon(field: string): string {
    if (this.sortField !== field) return '(click to sort)';
    return this.sortDirection === 'asc' ? '(asc)' : '(desc)';
  }

  getTotalLeads(): number {
    return this.campaigns.reduce((total, campaign) => total + (campaign.totalLeads || 0), 0);
  }

  getAvgOpenRate(): number {
    const validCampaigns = this.campaigns.filter(c => c.openRate !== undefined);
    if (validCampaigns.length === 0) return 0;
    const total = validCampaigns.reduce((sum, c) => sum + (c.openRate || 0), 0);
    return Math.round(total / validCampaigns.length);
  }

  getAvgConversionRate(): number {
    const validCampaigns = this.campaigns.filter(c => c.conversionRate !== undefined);
    if (validCampaigns.length === 0) return 0;
    const total = validCampaigns.reduce((sum, c) => sum + (c.conversionRate || 0), 0);
    return Math.round(total / validCampaigns.length);
  }

  updateCampaignStatus(campaign: Campaign, event: any) {
    const newStatus = event.target.value as 'Active' | 'Completed' | 'Draft';
    campaign.status = newStatus;
    console.log(`Campaign ${campaign.name} status updated to ${newStatus}`);
  }

  viewCampaignDetails(campaign: Campaign) {
    this.analyticsCampaign = campaign;
    this.showAnalyticsModal = true;
  }

  editCampaign(campaign: Campaign) {
    this.editingCampaign = { ...campaign };
    this.showEditModal = true;
  }

  deleteCampaign(campaign: Campaign) {
    if (confirm(`Are you sure you want to delete "${campaign.name}"?`)) {
      this.campaignService.deleteCampaign(campaign.id!).subscribe({
        next: () => {
          this.campaigns = this.campaigns.filter(c => c.id !== campaign.id);
          this.applyFilters();
          this.error = '';
        },
        error: (err) => {
          if (err.status === 200) {
            this.campaigns = this.campaigns.filter(c => c.id !== campaign.id);
            this.applyFilters();
            this.error = '';
          } else {
            console.error('Delete error:', err);
            this.error = 'Failed to delete campaign';
          }
        }
      });
    }
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingCampaign = null;
  }

  closeAnalyticsModal() {
    this.showAnalyticsModal = false;
    this.analyticsCampaign = null;
  }

 onCampaignUpdated(campaign: Campaign) {

  this.campaigns = this.campaigns.map(c =>
    c.id === campaign.id ? campaign : c
  );

  this.applyFilters();

  this.showEditModal = false;
  this.editingCampaign = null;
}


  resetFilters() {
    this.filters = { name: '', startDate: '', endDate: '', agencies: [], buyers: [], brands: [] };
    this.filteredCampaigns = this.campaigns;
    this.currentPage = 1;
    this.updatePagination();
  }

  toggleSelection(array: string[], value: string) {
    const index = array.indexOf(value);
    if (index > -1) {
      array.splice(index, 1);
    } else {
      array.push(value);
    }
    this.applyFilters();
  }

  isSelected(array: string[], value: string): boolean {
    return array.includes(value);
  }

  toggleDropdown(dropdown: 'agencies' | 'buyers' | 'brands') {
    this.dropdownStates[dropdown] = !this.dropdownStates[dropdown];
  }

  closeDropdown(dropdown: 'agencies' | 'buyers' | 'brands') {
    this.dropdownStates[dropdown] = false;
  }

  navigateToAddLead() {
    this.router.navigate(['/campaigns/add-lead']);
  }

  navigateToBulkUpload() {
    this.router.navigate(['/campaigns/bulk-upload']);
  }

  navigateToSearch() {
    this.router.navigate(['/campaigns/search']);
  }

  exportData() {
    this.exportCampaigns();
  }

  exportCampaigns() {
    const csvContent = this.generateCampaignsCsv(this.filteredCampaigns);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'campaigns-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

 generateCampaignsCsv(campaigns: Campaign[]): string {

  let csv = "Campaign Name,Start Date,End Date,Status,Agency,Buyer,Brand,Total Leads,Open Rate (%),Click Rate (%),Conversion Rate (%),Revenue ($)\n";

  campaigns.forEach(c => {
    csv +=
      (c.name || "") + "," +
      (c.startDate || "") + "," +
      (c.endDate || "") + "," +
      (c.status || "") + "," +
      (c.agency || "") + "," +
      (c.buyer || "") + "," +
      (c.brand || "") + "," +
      (c.totalLeads || 0) + "," +
      (c.openRate || 0) + "," +
      (c.clickRate || 0) + "," +
      (c.conversionRate || 0) + "," +
      (c.revenue || 0) + "\n";
  });

  return csv;
}

  openCreateModal() {
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  onCampaignCreated(campaign: Campaign) {
    this.campaigns.unshift(campaign);
    this.filteredCampaigns = [...this.campaigns];
    this.showCreateModal = false;
    this.loadCampaigns(); 
    this.loadDropdownData(); 
  }

  refreshData() {
    this.loadCampaigns();
  }




}