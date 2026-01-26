import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonText,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { lockClosedOutline, personOutline, logInOutline, heartOutline } from 'ionicons/icons';

import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonText,
    IonSpinner,
  ],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  username = '';
  password = '';
  isLoading = signal(false);
  errorMessage = signal('');

  private returnUrl = '/events';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    addIcons({ lockClosedOutline, personOutline, logInOutline, heartOutline });
    
    // Get return URL from query params
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/events';
    });

    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  async onLogin(): Promise<void> {
    if (!this.username || !this.password) {
      this.errorMessage.set('Por favor, preencha todos os campos.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const result = await this.authService.login(this.username, this.password);
      
      if (result.success) {
        this.router.navigate([this.returnUrl]);
      } else {
        this.errorMessage.set(result.error || 'Credenciais inválidas. Tente novamente.');
      }
    } catch (error) {
      this.errorMessage.set('Erro ao fazer login. Tente novamente.');
    } finally {
      this.isLoading.set(false);
    }
  }

  get isLockedOut(): boolean {
    return this.authService.isLockedOut();
  }

  get lockoutRemaining(): number {
    return this.authService.lockoutRemaining();
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onLogin();
    }
  }
}
