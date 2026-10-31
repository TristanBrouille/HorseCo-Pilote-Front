import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormField, MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { UserLog } from '../auth/authModel';
import { AuthService } from '../auth/authService';
import { Router } from '@angular/router';

@Component({
  imports: [ReactiveFormsModule, MatFormField, MatInput, MatButton, MatCard],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loginForm: FormGroup;
  errorMessage = '';

  readonly features = [
    'Inscription annuelle aux créneaux hebdomadaires',
    "Attribution des chevaux en un coup d'œil",
    'Règles de bien-être du cheval appliquées automatiquement',
  ];

  constructor() {
    this.loginForm = this.fb.group({
      email: ['lea.martin@email.fr', [Validators.required, Validators.email]],
      password: ['••••••••••', [Validators.required]],
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.valid) {
      this.errorMessage = '';

      const credentials: UserLog = this.loginForm.value;

      try {
        const me = await this.authService.login(credentials);

        console.log('Utilisateur connecté :', me);
        this.router.navigate(['/']);
      } catch (error) {
        console.error('Erreur de connexion', error);
        this.errorMessage = 'Identifiants incorrects ou problème de serveur.';
      }
    }
  }
}
