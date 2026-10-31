import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/authService';
import { AppHeader } from '../app-header/app-header';
import { Sidebar } from '../sidebar/sidebar';

// Cadre des écrans connectés : sidebar à gauche, header et écran courant à droite.
@Component({
  selector: 'hc-shell',
  imports: [RouterOutlet, Sidebar, AppHeader],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Renseigné par authGuard (getMe) avant l'activation de la route.
  protected readonly user = this.authService.currentUser;
  protected readonly loggingOut = signal(false);

  async logout(): Promise<void> {
    this.loggingOut.set(true);
    try {
      await this.authService.logout();
    } catch {
      // La session est de toute façon oubliée côté front : on renvoie vers la connexion.
    } finally {
      this.loggingOut.set(false);
      await this.router.navigate(['/login']);
    }
  }
}
