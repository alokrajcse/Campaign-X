import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Campaign } from '../../../../core/models/campaign';
import { CampaignService } from '../../services/campaign.service';

@Component({
  selector: 'app-campaign-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './campaign-analytics.html',
  styleUrls: ['./campaign-analytics.css']
})
export class CampaignAnalyticsComponent implements OnInit {
  @Input() campaign!: Campaign;
  @Output() close = new EventEmitter<void>();

  segmentData: any[] = [];
  analyticsData: any = {};
  loading = false;

  constructor(private campaignService: CampaignService) {}

  ngOnInit() {
    this.loadAnalyticsData();
  }

  loadAnalyticsData() {
    if (!this.campaign.id) return;
    
    this.loading = true;
    this.campaignService.getCampaignAnalytics(this.campaign.id).subscribe({
      next: (data) => {
        this.analyticsData = data;
        this.campaign = { ...this.campaign, ...data.campaign };
        this.segmentData = data.segments || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }



  calculateSegmentData(leads: any[]) {
    const segments: any = {};
    leads.forEach(lead => {
      const segment = lead.segment || 'General';
      segments[segment] = (segments[segment] || 0) + 1;
    });

    const total = leads.length;
    this.segmentData = Object.keys(segments).map(name => ({
      name,
      count: segments[name],
      percentage: Math.round((segments[name] / total) * 100)
    }));
  }

  calculateMetrics(leads: any[]) {
    this.campaign.totalLeads = leads.length;
    this.campaign.openRate = Math.floor(Math.random() * 40) + 20;
    this.campaign.clickRate = Math.floor(Math.random() * 15) + 5;
    this.campaign.conversionRate = Math.floor(Math.random() * 10) + 2;
    this.campaign.revenue = leads.length * (Math.floor(Math.random() * 100) + 50);
  }

  onClose() {
    this.close.emit();
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  formatRevenue(revenue: number): string {
    return revenue.toLocaleString();
  }



  getCampaignDuration(): number {
    const start = new Date(this.campaign.startDate);
    const end = new Date(this.campaign.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  exportAnalytics() {
    this.campaignService.exportLeads('csv', this.campaign.name).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = this.campaign.name + '-analytics.csv';
      a.click();
    });
  }
}