import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Lead } from '../../../../core/models/lead';
import { CampaignService } from '../../services/campaign.service';
import { SegmentMappingService } from '../../services/segment-mapping.service';
import { NavigationComponent } from '../../../../shared/components/navigation/navigation';

@Component({
  selector: 'app-add-lead',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavigationComponent],
  templateUrl: './add-lead.html',
  styleUrls: ['./add-lead.css']
})
export class AddLeadComponent implements OnInit {
  leadForm: FormGroup;
  campaigns: string[] = [];
  message = '';
  messageType = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private campaignService: CampaignService,
    private segmentService: SegmentMappingService,
    private router: Router
  ) {
    this.leadForm = this.fb.group({
      leadId: ['', [Validators.required, Validators.pattern(/^[A-Z]\d{3,}$/)]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      campaignId: ['', Validators.required],
      segment: [''],
      openRate: [0, [Validators.min(0), Validators.max(1)]],
      clickRate: [0, [Validators.min(0), Validators.max(10)]],
      conversions: [0, [Validators.min(0), Validators.max(1)]]
    });
  }

  ngOnInit() {
    this.loadCampaigns();
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

  onSubmit() {
    if (this.leadForm.valid) {
      this.loading = true;
      const formData = this.leadForm.value;
      
      const lead: Lead = {
        leadId: formData.leadId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        campaignId: formData.campaignId,
        segment: formData.segment || this.segmentService.assignSegment(formData),
        status: 'Active',
        openRate: formData.openRate,
        clickRate: formData.clickRate,
        conversions: formData.conversions
      };

      console.log('Sending lead data:', lead);

      this.campaignService.getLeads().subscribe({
        next: (existingLeads) => {
          const duplicateEmail = existingLeads.find(l => l.email.toLowerCase() === lead.email.toLowerCase());
          if (duplicateEmail) {
            this.message = `Lead with email "${lead.email}" already exists (Lead ID: ${duplicateEmail.leadId})`;
            this.messageType = 'error';
            this.loading = false;
            return;
          }
          
          this.addNewLead(lead);
        },
        error: () => {
          this.addNewLead(lead);
        }
      });
    } else {
      // this.markFormGroupTouched();
    }
  }

  // markFormGroupTouched() {
  //   Object.keys(this.leadForm.controls).forEach(key => {
  //     this.leadForm.get(key)?.markAsTouched();
  //   });
  // }

  getFieldError(fieldName: string): string {
    const field = this.leadForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['pattern']) {
        if (fieldName === 'leadId') return 'Lead ID must start with letter followed by 3+ digits (e.g., L001)';
        if (fieldName === 'phone') return 'Please enter a valid phone number with country code';
      }
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
    }
    return '';
  }

  goBack() {
    this.router.navigate(['/campaigns']);
  }

  viewDashboard() {
    this.router.navigate(['/campaigns']);
  }

  addNewLead(lead: Lead) {
    this.campaignService.addLead(lead).subscribe({
      next: () => {
        this.message = `Lead added successfully! Assigned to segment: ${lead.segment}`;
        this.messageType = 'success';
        this.leadForm.reset();
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/campaigns']);
        }, 2000);
      },
      error: (err) => {
        console.error('API Error:', err);
       
        this.messageType = 'error';
        this.loading = false;
      }
    });
  }
}