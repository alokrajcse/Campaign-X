import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Campaign } from '../../../../core/models/campaign';
import { CampaignService } from '../../services/campaign.service';

@Component({
  selector: 'app-create-campaign',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-campaign.html',
  styleUrls: ['./create-campaign.css']
})
export class CreateCampaignComponent {

  @Output() cancel = new EventEmitter<void>();
  @Output() success = new EventEmitter<Campaign>();

  constructor(private campaignService: CampaignService) {}

  onSubmit(formValue: any) {

    
    if (formValue.startDate && formValue.endDate && formValue.startDate >= formValue.endDate) {
      alert("End date must be after start date");
      return;
    }

    const campaign: Campaign = {
      ...formValue,
      status: 'Draft' as const,
      totalLeads: 0,
      openRate: 0,
      clickRate: 0,
      conversionRate: 0,
      revenue: 0
    };

    this.campaignService.createCampaign(campaign).subscribe((created) => {
      this.success.emit(created);
    });
  }

  onCancel() {
    this.cancel.emit();
  }
}
