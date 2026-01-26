import { Injectable, signal } from '@angular/core';

interface RateLimitData {
  attempts: number;
  lockoutUntil: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly SESSION_KEY = 'rsvp_auth';
  private readonly RATE_LIMIT_KEY = 'rsvp_rate_limit';
  
  // Rate limiting configuration
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes
  
  // SHA-256 hash of credentials (not stored in plain text)
  // Default: admin:rsvp2024 - Generate new hash using: node generate-hash.js
  private readonly VALID_HASH = 'd99433132e62eeec9970636c18486d335e20e7703053292cef377027f1bcecde';
  
  isAuthenticated = signal<boolean>(this.checkSession());
  isLockedOut = signal<boolean>(false);
  lockoutRemaining = signal<number>(0);

  private lockoutInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Check session on service initialization
    this.isAuthenticated.set(this.checkSession());
    this.checkLockout();
  }

  private checkSession(): boolean {
    if (typeof sessionStorage === 'undefined') return false;
    return sessionStorage.getItem(this.SESSION_KEY) === 'true';
  }

  private getRateLimitData(): RateLimitData {
    if (typeof localStorage === 'undefined') {
      return { attempts: 0, lockoutUntil: null };
    }
    const data = localStorage.getItem(this.RATE_LIMIT_KEY);
    if (!data) {
      return { attempts: 0, lockoutUntil: null };
    }
    try {
      return JSON.parse(data);
    } catch {
      return { attempts: 0, lockoutUntil: null };
    }
  }

  private setRateLimitData(data: RateLimitData): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(this.RATE_LIMIT_KEY, JSON.stringify(data));
  }

  private clearRateLimitData(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(this.RATE_LIMIT_KEY);
  }

  private checkLockout(): void {
    const data = this.getRateLimitData();
    if (data.lockoutUntil && Date.now() < data.lockoutUntil) {
      this.isLockedOut.set(true);
      this.startLockoutTimer(data.lockoutUntil);
    } else if (data.lockoutUntil && Date.now() >= data.lockoutUntil) {
      // Lockout expired, reset
      this.clearRateLimitData();
      this.isLockedOut.set(false);
    }
  }

  private startLockoutTimer(lockoutUntil: number): void {
    if (this.lockoutInterval) {
      clearInterval(this.lockoutInterval);
    }

    const updateRemaining = () => {
      const remaining = Math.max(0, lockoutUntil - Date.now());
      this.lockoutRemaining.set(Math.ceil(remaining / 1000));
      
      if (remaining <= 0) {
        this.isLockedOut.set(false);
        this.clearRateLimitData();
        if (this.lockoutInterval) {
          clearInterval(this.lockoutInterval);
          this.lockoutInterval = null;
        }
      }
    };

    updateRemaining();
    this.lockoutInterval = setInterval(updateRemaining, 1000);
  }

  getRemainingAttempts(): number {
    const data = this.getRateLimitData();
    return Math.max(0, this.MAX_ATTEMPTS - data.attempts);
  }

  async login(username: string, password: string): Promise<{ success: boolean; error?: string }> {
    // Check if locked out
    const rateLimitData = this.getRateLimitData();
    if (rateLimitData.lockoutUntil && Date.now() < rateLimitData.lockoutUntil) {
      const remaining = Math.ceil((rateLimitData.lockoutUntil - Date.now()) / 1000);
      return { 
        success: false, 
        error: `Demasiadas tentativas. Tenta novamente em ${remaining} segundos.` 
      };
    }

    // If lockout expired, reset
    if (rateLimitData.lockoutUntil && Date.now() >= rateLimitData.lockoutUntil) {
      this.clearRateLimitData();
    }

    const credentials = `${username}:${password}`;
    const hash = await this.hashCredentials(credentials);
    
    // Check against valid hash
    if (hash === this.VALID_HASH) {
      this.clearRateLimitData();
      this.isLockedOut.set(false);
      sessionStorage.setItem(this.SESSION_KEY, 'true');
      this.isAuthenticated.set(true);
      return { success: true };
    }
    
    // Failed attempt - increment counter
    const currentData = this.getRateLimitData();
    const newAttempts = currentData.attempts + 1;
    
    if (newAttempts >= this.MAX_ATTEMPTS) {
      // Lock out the user
      const lockoutUntil = Date.now() + this.LOCKOUT_DURATION_MS;
      this.setRateLimitData({ attempts: newAttempts, lockoutUntil });
      this.isLockedOut.set(true);
      this.startLockoutTimer(lockoutUntil);
      return { 
        success: false, 
        error: `Demasiadas tentativas. Conta bloqueada por 5 minutos.` 
      };
    }

    this.setRateLimitData({ attempts: newAttempts, lockoutUntil: null });
    const remaining = this.MAX_ATTEMPTS - newAttempts;
    return { 
      success: false, 
      error: `Credenciais inválidas. ${remaining} tentativa${remaining !== 1 ? 's' : ''} restante${remaining !== 1 ? 's' : ''}.` 
    };
  }

  logout(): void {
    sessionStorage.removeItem(this.SESSION_KEY);
    this.isAuthenticated.set(false);
  }

  private async hashCredentials(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  // Helper method to generate hash for new credentials (use in browser console)
  async generateHash(username: string, password: string): Promise<string> {
    const credentials = `${username}:${password}`;
    const hash = await this.hashCredentials(credentials);
    console.log(`Hash for "${username}:${password}": ${hash}`);
    return hash;
  }
}
