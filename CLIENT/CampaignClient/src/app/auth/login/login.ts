import { Component, NgModule } from '@angular/core';
import { AuthService } from '../../core/services/auth';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, NgModel } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  email = '';
  password = '';
  constructor(private auth: AuthService, private router: Router){

  }


  login(){
      this.auth.login({email: this.email, password:this.password}).subscribe({
        next: (response: any) => {
          localStorage.setItem('token', response.token);
          this.router.navigate(['/campaigns']);
        },
        error: () => alert('Invalid credentials')
      });

    
  }
  




  }



