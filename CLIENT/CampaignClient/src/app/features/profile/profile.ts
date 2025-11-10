import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth';
import { UserProfile, UpdateProfileRequest, Organization } from '../../core/models/auth';
import { NavigationComponent } from '../../shared/components/navigation/navigation';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, NavigationComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  profile: UserProfile | null = null;
  isEditing = false;
  editForm: UpdateProfileRequest = {
    username: '',
    email: '',
    organizationId: 0
  };
  organizations: Organization[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadProfile();
    this.loadOrganizations();
  }

  loadOrganizations() {
    this.authService.getOrganizations().subscribe({
      next: (orgs) => this.organizations = orgs,
      error: (e) => console.error('Error loading organizations:', e)
    });
  }

  loadProfile() {
    this.authService.getProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.editForm = {
          username: profile.username,
          email: profile.email,
          organizationId: profile.organizationId
        };
      },
      error: (e) => console.error('Error loading profile:', e)
    });
  }

  startEdit() {
    this.isEditing = true;
  }

  cancelEdit() {
    this.isEditing = false;
    if (this.profile) {
      this.editForm = {
        username: this.profile.username,
        email: this.profile.email,
        organizationId: this.profile.organizationId
      };
    }
  }

  saveProfile() {
    this.authService.updateProfile(this.editForm).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.isEditing = false;
        alert('Profile updated successfully!');
      },
      error: (e) => {
        console.error('Error updating profile:', e);
        alert('Error updating profile');
      }
    });
  }
}