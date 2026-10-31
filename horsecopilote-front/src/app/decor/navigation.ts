import { Role } from '../auth/authModel';

export interface Feature {
  label: string;
  description: string;
  // null : fonctionnalité pas encore développée (affichée grisée sur le tableau de bord).
  route: string | null;
}

export interface RoleNavigation {
  section: string;
  features: Feature[];
}

// Fonctionnalités proposées à chaque rôle : source unique de la sidebar et du tableau de bord.
// Le front ne fait qu'afficher : chaque route est aussi protégée par un guard, et le back refuse.
export const NAVIGATION_BY_ROLE: Record<Role, RoleNavigation> = {
  MEMBRE: {
    section: 'MENU',
    features: [
      {
        label: 'Mes cours',
        description:
          'Consultez vos leçons de la semaine, leur lieu et le cheval qui vous est attribué.',
        route: '/membre/cours',
      },
      {
        label: 'Créneaux de la semaine',
        description: 'Parcourez les créneaux du centre et inscrivez-vous pour l’année.',
        route: null,
      },
    ],
  },
  COACH: {
    section: 'MENU',
    features: [
      {
        label: 'Agenda de la semaine',
        description: 'Vos leçons de la semaine, leurs participants et les chevaux attribués.',
        route: '/coach/cours',
      },
      {
        label: 'Attribution des chevaux',
        description:
          'Attribuez à chaque cavalier un cheval compatible avec son niveau et son poids.',
        route: null,
      },
    ],
  },
  ADMIN: {
    section: 'GESTION',
    features: [
      {
        label: 'Membres',
        description:
          'Créez les comptes des cavaliers et suivez leur niveau de galop, taille et poids.',
        route: '/admin/membres',
      },
      {
        label: 'Chevaux',
        description:
          'Gérez la cavalerie : statut, lieu actuel et limites de travail de chaque cheval.',
        route: '/admin/chevaux',
      },
      {
        label: 'Créneaux hebdomadaires',
        description:
          'Planifiez les créneaux d’une heure de la semaine : coach, niveau et capacité.',
        route: '/admin/creneaux',
      },
      {
        label: 'Coachs',
        description: 'Créez les comptes des moniteurs du centre.',
        route: null,
      },
      {
        label: 'Toutes les leçons',
        description: 'Consultez, modifiez ou annulez les leçons de tous les coachs.',
        route: null,
      },
    ],
  },
};
