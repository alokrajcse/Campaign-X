import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import * as Papa from 'papaparse';

import { Lead } from '../../../../core/models/lead';
import { BulkUploadResult } from '../../../../core/models/bulk-upload';
import { CampaignService } from '../../services/campaign.service';
import { SegmentMappingService } from '../../services/segment-mapping.service';
import { NavigationComponent } from '../../../../shared/components/navigation/navigation';

@Component({
  selector: 'app-bulk-upload',
  standalone: true,
  imports: [CommonModule, NavigationComponent],
  templateUrl: './bulk-upload.html',
  styleUrls: ['./bulk-upload.css']
})
export class BulkUploadComponent {
  selectedFile: File | null = null;
  previewData: Lead[] = [];
  validationErrors: string[] = [];
  uploadResult: BulkUploadResult | null = null;
  isProcessing = false;
  availableCampaigns: string[] = [];
  
  currentPage = 1;
  itemsPerPage = 10;
  paginatedData: Lead[] = [];

  constructor(
    private campaignService: CampaignService,
    private segmentService: SegmentMappingService,
    private router: Router
  ) {
    this.loadCampaigns();
  }

  loadCampaigns() {
    this.campaignService.getCampaigns().subscribe({
      next: (campaigns) => {
        this.availableCampaigns = campaigns.map(c => c.name);
      },
      error: () => {
        alert('Data fetch failed')
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.validationErrors = ['File size must be less than 5MB'];
      return;
    }

    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (fileExtension !== '.csv') {
      this.validationErrors = ['Only CSV files are allowed'];
      return;
    }

    this.selectedFile = file;
    this.validationErrors = [];
    this.parseFile();
  }

  

parseFile() {
  if (!this.selectedFile) return;

  Papa.parse(this.selectedFile, {
    header: true,         
    skipEmptyLines: true,  
    complete: (result) => {
      this.previewData = result.data.map((row: any) => ({
        leadId: String(row['Lead ID'] || row['leadId'] || ''),
        name: String(row['Name'] || row['name'] || ''),
        email: String(row['Email'] || row['email'] || ''),
        phone: String(row['Phone'] || row['phone'] || ''),
        campaignId: String(row['Campaign'] || row['campaignId'] || ''),
        segment: '' 
      }));

      this.validateData();
      this.assignSegments();
    },
    error: (error) => {
      console.error('Error parsing CSV:', error);
    }
  });
}



  validateData() {
    this.validationErrors = [];
    const emailSet = new Set<string>();
    
    this.previewData.forEach((lead, index) => {
      if (!lead.leadId) this.validationErrors.push(`Row ${index + 1}: Lead ID is required`);
      if (!lead.name) this.validationErrors.push(`Row ${index + 1}: Name is required`);
      if (!lead.email || !this.isValidEmail(lead.email)) {
        this.validationErrors.push(`Row ${index + 1}: Valid email is required`);
      } else {
        if (emailSet.has(lead.email.toLowerCase())) {
          this.validationErrors.push(`Row ${index + 1}: Duplicate email "${lead.email}" found in upload`);
        } else {
          emailSet.add(lead.email.toLowerCase());
        }
      }
      if (!lead.phone) this.validationErrors.push(`Row ${index + 1}: Phone is required`);
      if (!lead.campaignId) {
        this.validationErrors.push(`Row ${index + 1}: Campaign is required`);
      } else {
        if (this.availableCampaigns.length > 0 && 
            !this.availableCampaigns.some(c => c.toLowerCase() === lead.campaignId.toLowerCase())) {
          this.validationErrors.push(`Row ${index + 1}: Campaign "${lead.campaignId}" not found. Available: ${this.availableCampaigns.join(', ')}`);
        }
      }
    });
  }

  assignSegments() {
    this.previewData = this.segmentService.processBulkLeads(this.previewData);
    this.updatePagination();
  }

  updatePagination() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedData = this.previewData.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.previewData.length / this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  uploadLeads() {
    if (this.validationErrors.length > 0) return;

    this.isProcessing = true;
    const totalRows = this.previewData.length;
    
    this.campaignService.bulkUploadLeads(this.previewData).subscribe({
      next: (result) => {
        const successCount = result.leads?.length || 0;
        const failedCount = totalRows - successCount;
        
        this.uploadResult = {
          ...result,
          successCount,
          failedCount,
          totalRows
        };
        this.isProcessing = false;
      },
      error: () => {
        this.uploadResult = {
          message: 'Upload failed',
          leads: [],
          successCount: 0,
          failedCount: totalRows,
          totalRows
        };
        this.isProcessing = false;
      }
    });
  }

  downloadSample() {
 const csvContent = `Lead ID,Name,Email,Phone,Campaign
L001,Rahul Sharma,rahul.sharma@gmail.com,+919876543210,Diwali Sale 2025
L002,Ananya Singh,ananya.singh@edu.in,+919812345678,Corporate Offer
L003,Arjun Kumar,arjun.kumar@company.in,+919900112233,New Product Launch
L004,Priya Mehta,priya.mehta@yahoo.in,+919845612345,Holiday Special
L005,Manish Patel,manish.patel@company.com,+919911223344,Training Program
L006,Sneha Reddy,sneha.reddy@university.edu.in,+919876543211,Newsletter
L007,Vikram Joshi,vikram.joshi@outlook.in,+919899887766,General Campaign`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-leads.csv';
    a.click();
  }

  goBack() {
    this.router.navigate(['/campaigns']);
  }
}