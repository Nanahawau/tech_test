import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthState, LoginRequest, TokenResponse } from '../models/auth.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly EMAIL_KEY = 'auth_email';
  private readonly EXPIRES_KEY = 'auth_expires';

  private authState$ = new BehaviorSubject<AuthState>({
    token: null,
    email: null,
    expiresAt: null
  });

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadAuthState();
  }

  /**
   * Load auth state from storage on init
   * Using localStorage for persistence across tabs/refreshes
   * Alternative: In-memory only (more secure but loses state on refresh)
   */
  private loadAuthState(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const email = localStorage.getItem(this.EMAIL_KEY);
    const expiresAt = localStorage.getItem(this.EXPIRES_KEY);

    if (token && email && expiresAt) {
      const expires = Number(expiresAt);
      if (Date.now() < expires) {
        this.authState$.next({ token, email, expiresAt: expires });
      } else {
        this.clearAuthState();
      }
    }
  }

  login(credentials: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(
      `${environment.apiBaseUrl}/api/auth/token`,
      credentials
    ).pipe(
      tap(response => {
        const expiresAt = Date.now() + (response.data.expires_in * 1000);
        localStorage.setItem(this.TOKEN_KEY, response.data.access_token);
        localStorage.setItem(this.EMAIL_KEY, response.data.email);
        localStorage.setItem(this.EXPIRES_KEY, expiresAt.toString());

        this.authState$.next({
          token: response.data.access_token,
          email: response.data.email,
          expiresAt
        });
      })
    );
  }

  logout(): void {
    this.clearAuthState();
    this.router.navigate(['/login']);
  }

  private clearAuthState(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.EMAIL_KEY);
    localStorage.removeItem(this.EXPIRES_KEY);
    this.authState$.next({ token: null, email: null, expiresAt: null });
  }

  getToken(): string | null {
    return this.authState$.value.token;
  }

  isAuthenticated(): boolean {
    const state = this.authState$.value;
    return !!(state.token && state.expiresAt && Date.now() < state.expiresAt);
  }

  getAuthState(): Observable<AuthState> {
    return this.authState$.asObservable();
  }

  getCurrentEmail(): string | null {
    return this.authState$.value.email;
  }
}