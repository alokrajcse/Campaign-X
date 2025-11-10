import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Campaign } from '../../../../core/models/campaign';
import { CampaignService } from '../../services/campaign.service';

@Component({
  selector: 'app-edit-campaign',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-campaign.html',
  styleUrls: ['./edit-campaign.css']
})
export class EditCampaignComponent implements OnInit {
  @Input() campaign!: Campaign;
  @Output() cancel = new EventEmitter<void>();
  @Output() success = new EventEmitter<Campaign>();
  
  campaignForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private campaignService: CampaignService
  ) {
    this.campaignForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      agency: [''],
      buyer: [''],
      brand: [''],
      status: ['Draft']
    }, { validators: this.dateValidator });
  }

  ngOnInit() {
    if (this.campaign) {
      this.campaignForm.patchValue({
        name: this.campaign.name,
        startDate: this.campaign.startDate,
        endDate: this.campaign.endDate,
        agency: this.campaign.agency || '',
        buyer: this.campaign.buyer || '',
        brand: this.campaign.brand || '',
        status: this.campaign.status || 'Draft'
      });
    }
  }

  onSubmit() {
    if (this.campaignForm.valid) {
      this.loading = true;
      const updatedCampaign: Campaign = {
        ...this.campaign,
        ...this.campaignForm.value,
        id: this.campaign.id
      };
      
      this.campaignService.updateCampaign(this.campaign.id!, updatedCampaign).subscribe({
        next: (campaign) => {
          this.success.emit(campaign);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  dateValidator(form: any) {
    const startDate = form.get('startDate')?.value;
    const endDate = form.get('endDate')?.value;
    
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return { dateInvalid: true };
    }
    return null;
  }

  getFormError(): string {
    if (this.campaignForm.errors?.['dateInvalid']) {
      return 'End date must be after start date';
    }
    return '';
  }
}