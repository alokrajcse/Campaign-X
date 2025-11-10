import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Lead } from '../../../../core/models/lead';
import { CampaignService } from '../../services/campaign.service';
import { NavigationComponent } from '../../../../shared/components/navigation/navigation';

@Component({
  selector: 'app-leads-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NavigationComponent],
  templateUrl: './leads-list.html',
  styleUrls: ['./leads-list.css']
})
export class LeadsListComponent implements OnInit {
  leads: Lead[] = [];
  filteredLeads: Lead[] = [];
  paginatedLeads: Lead[] = [];
  campaigns: string[] = [];
  loading = false;
  Math = Math;

  filters = {
    campaign: '',
    segment: '',
    email: ''
  };

  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  
  showEditModal = false;
  editingLead: Lead | null = null;
  editForm: FormGroup;

  constructor(private campaignService: CampaignService, private fb: FormBuilder) {
    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      campaignId: ['', Validators.required],
      segment: [''],
      status: [''],
      openRate: [0, [Validators.min(0), Validators.max(1)]],
      clickRate: [0, [Validators.min(0), Validators.max(10)]],
      conversions: [0, [Validators.min(0), Validators.max(1)]]
    });
  }

  ngOnInit() {
    this.loadLeads();
    this.loadCampaigns();
  }

  loadLeads() {
    this.loading = true;
    this.campaignService.getLeads().subscribe({
      next: (leads) => {
        this.leads = leads;
        this.filteredLeads = leads;
        this.updatePagination();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load leads:', err);
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.filteredLeads = this.leads.filter(lead => {
      return (!this.filters.campaign || lead.campaignId?.toLowerCase().includes(this.filters.campaign.toLowerCase())) &&
             (!this.filters.segment || lead.segment?.toLowerCase().includes(this.filters.segment.toLowerCase())) &&
             (!this.filters.email || lead.email?.toLowerCase().includes(this.filters.email.toLowerCase()));
    });
    this.currentPage = 1;
    this.updatePagination();
  }

  resetFilters() {
    this.filters = { campaign: '', segment: '', email: '' };
    this.filteredLeads = this.leads;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalItems = this.filteredLeads.length;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedLeads = this.filteredLeads.slice(startIndex, endIndex);
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

  formatDate(date: string | undefined): string {
    return date ? new Date(date).toLocaleDateString() : '';
  }



  editLead(lead: Lead) {
    this.editingLead = lead;
    this.editForm.patchValue({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      campaignId: lead.campaignId,
      segment: lead.segment,
      status: lead.status,
      openRate: lead.openRate || 0,
      clickRate: lead.clickRate || 0,
      conversions: lead.conversions || 0
    });
    this.showEditModal = true;
  }

  saveEdit() {
    if (this.editForm.valid && this.editingLead) {
      const formData = this.editForm.value;
      const updatedLead = { ...this.editingLead, ...formData };
      
      this.campaignService.updateLead(this.editingLead.leadId, updatedLead).subscribe({
        next: () => {
          Object.assign(this.editingLead!, formData);
          this.closeEditModal();
          console.log('Lead updated:', this.editingLead!.leadId);
        },
        error: (err) => {
          console.error('Failed to update lead:', err);
        }
      });
    }
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingLead = null;
    this.editForm.reset();
  }

  loadCampaigns() {
    this.campaignService.getCampaigns().subscribe({
      next: (campaigns) => {
        this.campaigns = campaigns.map(c => c.name);
      },
      error: (err) => {
        console.error('Failed to load campaigns:', err);
      }
    });
  }

  deleteLead(lead: Lead) {
    if (confirm(`Are you sure you want to delete lead "${lead.name}"?`)) {
      this.campaignService.deleteLead(lead.leadId).subscribe({
        next: () => {
          this.leads = this.leads.filter(l => l.leadId !== lead.leadId);
          this.applyFilters();
          console.log('Lead deleted:', lead.leadId);
        },
        error: (err) => {
          console.error('Failed to delete lead:', err);
        }
      });
    }
  }

  exportLeads() {
    const csvContent = this.generateLeadsCsv(this.filteredLeads);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  generateLeadsCsv(leads: Lead[]): string {
    const headers = [
      'Lead ID',
      'Name',
      'Email',
      'Phone',
      'Campaign ID',
      'Segment',
      'Status',
      'Open Rate',
      'Click Rate',
      'Conversions',
      'Created Date',
      'Updated Date'
    ];

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
      lead.createdDate || '',
      lead.updatedDate || ''
    ]);

    const csvRows = [headers, ...rows];
    return csvRows.map(row => 
      row.map(field => 
        typeof field === 'string' && field.includes(',') 
          ? `"${field}"` 
          : field
      ).join(',')
    ).join('\n');
  }
}