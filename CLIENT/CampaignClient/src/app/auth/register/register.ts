import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { Organization } from '../../core/models/auth';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {

  username = '';
  email = '';
  password = '';
  organizationId = 0;
  organizations: Organization[] = [];
  errors: any = {};

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.loadOrganizations();
  }

  loadOrganizations() {
    this.auth.getOrganizations().subscribe({
      next: (orgs) => this.organizations = orgs,
      error: (e) => console.error('Error loading organizations:', e)
    });
  }

  validateForm(): boolean {
    this.errors = {};
    
    if (!this.username.trim()) {
      this.errors.username = 'Username is required';
    }
    
    if (!this.email.trim()) {
      this.errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      this.errors.email = 'Invalid email format';
    }
    
    if (!this.password) {
      this.errors.password = 'Password is required';
    } else if (this.password.length < 6) {
      this.errors.password = 'Password must be at least 6 characters';
    }
    
    if (!this.organizationId || this.organizationId === 0) {
      this.errors.organization = 'Please select an organization';
    }
    
    return Object.keys(this.errors).length === 0;
  }

  register() {
    if (!this.validateForm()) {
      return;
    }
    
    this.auth.signup({username: this.username, email: this.email, password: this.password, organizationId: this.organizationId})
    .subscribe({
      next: () => {
        alert('Registration successful');
        this.router.navigate(['/login']);
      },
      error: (e: any) => alert("Error: " + e.message)
    });
  }
}
