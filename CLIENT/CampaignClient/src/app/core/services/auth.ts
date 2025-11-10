import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginRequest, LoginResponse, RegisterRequest, Organization, UserProfile, UpdateProfileRequest } from '../models/auth';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl='https://localhost:44392/api/Auth';
  private orgApiUrl='https://localhost:44392/api/Organizations';

  constructor(private http: HttpClient){
  }

  getOrganizations(): Observable<Organization[]> {
    return this.http.get<Organization[]>(this.orgApiUrl);
  }

  signup(request: RegisterRequest): Observable<boolean>{
    return this.http.post<boolean>(`${this.apiUrl}/signup`, request);
  }

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`);
  }

  updateProfile(request: UpdateProfileRequest): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/profile`, request);
  }

  login(request: LoginRequest):Observable<LoginResponse> {

    return this.http.post<LoginResponse>(`${this.apiUrl}/signin`, request).pipe(
      tap(response=>{
        localStorage.setItem('token', response.token); // store JWT
      })
    )


  }
  

  isLoggedIn(): boolean {
  const token = localStorage.getItem('token');
  const expiry = localStorage.getItem('tokenExpiry'); 

  if(!token) return false;

  if(expiry && Date.now() > Number(expiry)){
    this.logout();
    return false;
  }

  return true;
}


  getUser() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}


  
}
