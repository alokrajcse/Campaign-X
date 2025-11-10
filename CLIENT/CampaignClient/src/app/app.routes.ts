import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { loginGuard } from './core/guards/login-guard';
import { CampaignDashboardComponent } from './features/campaigns/components/campaign-dashboard/campaign-dashboard';
import { AddLeadComponent } from './features/campaigns/components/add-lead/add-lead';
import { BulkUploadComponent } from './features/campaigns/components/bulk-upload/bulk-upload';
import { MultiLeadSearchComponent } from './features/campaigns/components/multi-lead-search/multi-lead-search';
import { LeadsListComponent } from './features/campaigns/components/leads-list/leads-list';
import { OverviewComponent } from './features/campaigns/components/overview/overview';
import { Profile } from './features/profile/profile';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'signup', component: Register },
  { path: 'campaigns', component: CampaignDashboardComponent, canActivate: [loginGuard] },
  { path: 'campaigns/overview', component: OverviewComponent, canActivate: [loginGuard] },
  { path: 'campaigns/add-lead', component: AddLeadComponent, canActivate: [loginGuard] },
  { path: 'campaigns/bulk-upload', component: BulkUploadComponent, canActivate: [loginGuard] },
  { path: 'campaigns/search', component: MultiLeadSearchComponent, canActivate: [loginGuard] },
  { path: 'campaigns/leads', component: LeadsListComponent, canActivate: [loginGuard] },
  { path: 'profile', component: Profile, canActivate: [loginGuard] },
  { path: 'dashboard', redirectTo: 'campaigns', pathMatch: 'full' }
];
