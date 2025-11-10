import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { NavigationComponent } from '../../../../shared/components/navigation/navigation';
import { CampaignService } from '../../services/campaign.service';
import { Campaign } from '../../../../core/models/campaign';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, NavigationComponent],
  templateUrl: './overview.html',
  styleUrls: ['./overview.css']
})
export class OverviewComponent implements OnInit, AfterViewInit, OnDestroy {
  private charts: Chart[] = [];


  campaigns: Campaign[] = [];
  campaignData = {
    totalCampaigns: 0,
    totalLeads: 0,
    openRate: 0,
    conversionRate: 0
  };

  constructor(private campaignService: CampaignService) {
    Chart.register(...registerables);
  }

  ngOnInit() {
    this.loadCampaignData();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.campaigns.length > 0) {
        this.createCharts();
      }
    }, 1000);
  }

  ngOnDestroy() {
    this.charts.forEach(chart => chart.destroy());
  }

  private createCharts() {
    this.createCampaignPerformanceChart();
    this.createLeadSegmentChart();
  }

  private createCampaignPerformanceChart() {
    const ctx = document.getElementById('campaignChart') as HTMLCanvasElement;
    if (!ctx) return;

    const labels = this.campaigns.map(campaign => campaign.name);
    const openRates = this.campaigns.map(campaign => campaign.openRate || 0);
    const conversionRates = this.campaigns.map(campaign => campaign.conversionRate || 0);
const config: ChartConfiguration = {
  type: 'bar',
  data: {
    labels: labels,
    datasets: [{
      label: 'Open Rate (%)',
      data: openRates,
      backgroundColor: '#4f46e5',
      borderRadius: 4,
      borderColor: '#ffffff'
    }, {
      label: 'Conversion Rate (%)',
      data: conversionRates,
      backgroundColor: '#06b6d4',
      borderRadius: 4
    }]
  },
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Campaign Performance',
        color: '#ffffff'  
      },
      legend: {
        labels: {
          color: '#ffffff'  
        }
      },
      tooltip: {
        titleColor: '#ffffff', 
        bodyColor: '#ffffff',  
        backgroundColor: '#333333', 
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#ffffff', 
        }
      },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: '#ffffff',  
        }
      }
    }
  }
};


    this.charts.push(new Chart(ctx, config));
  }
private createLeadSegmentChart() {
  const ctx = document.getElementById('segmentChart') as HTMLCanvasElement;
  if (!ctx) return;

  this.campaignService.getLeads().subscribe({
    next: (leads) => {
      const segmentCounts: { [key: string]: number } = {};
      
      leads.forEach(lead => {
        const segment = (lead as any).Segment || lead.segment || 'General';
        segmentCounts[segment] = (segmentCounts[segment] || 0) + 1;
      });

      const labels = Object.keys(segmentCounts);
      const data = Object.values(segmentCounts);
      const colors = ['#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4'];

      const config: ChartConfiguration = {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: colors.slice(0, labels.length),
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Lead Segments Distribution',
              color: '#ffffff'
            },
            legend: {
              labels: {
                color: '#ffffff'
              }
            },
            tooltip: {
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              footerColor: '#ffffff'
            }
          }
        }
      };

      this.charts.push(new Chart(ctx, config));
    },
    error: () => {
      const config: ChartConfiguration = {
        type: 'doughnut',
        data: {
          labels: ['General'],
          datasets: [{
            data: [100],
            backgroundColor: ['#ef4444'],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Lead Segments Distribution',
              color: '#ffffff'
            },
            legend: {
              labels: {
                color: '#ffffff'
              }
            },
            tooltip: {
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              footerColor: '#ffffff'
            }
          }
        }
      };
      this.charts.push(new Chart(ctx, config));
    }
  });
}


  

  private loadCampaignData() {
    this.campaignService.getCampaigns().subscribe({
      next: (campaigns) => {
        this.campaignService.getLeads().subscribe({
          next: (leads) => {
            campaigns.forEach(campaign => {
              const campaignLeads = leads.filter(lead => ((lead as any).CampaignId || lead.campaignId) === campaign.name);
              campaign.totalLeads = campaignLeads.length;
              
              if (campaignLeads.length > 0) {
                const totalOpenRate = campaignLeads.reduce((sum, lead) => sum + (((lead as any).OpenRate || lead.openRate) || 0), 0);
                const totalClickRate = campaignLeads.reduce((sum, lead) => sum + (((lead as any).ClickRate || lead.clickRate) || 0), 0);
                const totalConversions = campaignLeads.reduce((sum, lead) => sum + (((lead as any).Conversions || lead.conversions) || 0), 0);
                
                campaign.openRate = Math.round((totalOpenRate / campaignLeads.length) * 100);
                campaign.clickRate = Math.round(totalClickRate / campaignLeads.length);
                campaign.conversionRate = Math.round((totalConversions / campaignLeads.length) * 100);
              }
            });
            this.campaigns = campaigns;
            this.updateCampaignData();
          },
          error: () => {
            this.campaigns = campaigns;
            this.updateCampaignData();
          }
        });
      }
    });
  }

  private updateCampaignData() {
    this.campaignData.totalCampaigns = this.campaigns.length;
    this.campaignData.totalLeads = this.campaigns.reduce((total, campaign) => total + (campaign.totalLeads || 0), 0);
    this.campaignData.openRate = this.getAvgOpenRate();
    this.campaignData.conversionRate = this.getAvgConversionRate();
  }

  private getAvgOpenRate(): number {
    const validCampaigns = this.campaigns.filter(c => c.openRate !== undefined);
    if (validCampaigns.length === 0) return 0;
    const total = validCampaigns.reduce((sum, c) => sum + (c.openRate || 0), 0);
    return Math.round(total / validCampaigns.length * 10) / 10;
  }

  private getAvgConversionRate(): number {
    const validCampaigns = this.campaigns.filter(c => c.conversionRate !== undefined);
    if (validCampaigns.length === 0) return 0;
    const total = validCampaigns.reduce((sum, c) => sum + (c.conversionRate || 0), 0);
    return Math.round(total / validCampaigns.length * 10) / 10;
  }

  private updateCharts() {
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];
    setTimeout(() => {
      this.createCharts();
    }, 100);
  }



  refreshData() {
    this.loadCampaignData();
  }
}