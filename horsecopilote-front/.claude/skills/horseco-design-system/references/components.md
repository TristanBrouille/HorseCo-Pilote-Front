# Composants partagés — spécification

Emplacement : `src/app/shared/ui/<nom>/`. Composants **standalone**, entrées en `input()` / `input.required()`, sorties en `output()`, `ChangeDetectionStrategy.OnPush`. Sélecteur préfixé `hc-`. Styles uniquement à base de tokens (`var(--hc-…)`).

---

## Bouton — `hc-button`

| Entrée | Type | Défaut |
|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` |
| `type` | `'button' \| 'submit'` | `'button'` |
| `disabled` | `boolean` | `false` |
| `fullWidth` | `boolean` | `false` |

Contenu projeté (`<ng-content>`) = libellé.

- Padding `10px 18px`, rayon `--hc-radius-sm`, police `body-strong`, contenu centré.
- `primary` : fond `--hc-brand-primary`, texte `--hc-text-inverse` ; survol `--hc-brand-primary-hover`.
- `secondary` : fond `--hc-bg-surface`, bordure 1 px `--hc-border-strong`, texte `--hc-text-primary` ; survol fond `--hc-bg-subtle`.
- `ghost` : sans fond, texte `--hc-brand-primary` ; survol fond `--hc-brand-primary-soft`.
- `danger` : fond `--hc-status-danger`, texte `--hc-text-inverse`.
- Désactivé : opacité 0.5, `cursor: not-allowed`.

## Badge — `hc-badge`

| Entrée | Type | Défaut |
|---|---|---|
| `tone` | `'neutral' \| 'success' \| 'warning' \| 'danger' \| 'info' \| 'brand'` | `'neutral'` |

- Padding `3px 10px`, rayon `--hc-radius-pill`, police `caption`.
- Couleurs (fond / texte) : neutral `bg-subtle` / `text-muted` · success `status-success-soft` / `status-success` · warning `status-warning-soft` / `status-warning` · danger `status-danger-soft` / `status-danger` · info `status-info-soft` / `status-info` · brand `brand-primary-soft` / `brand-primary`.

## Champ — `hc-field`

Enveloppe un `<input>` ou `<select>` projeté, compatible Reactive Forms.

| Entrée | Type |
|---|---|
| `label` | `string` (requis) |
| `error` | `string \| null` |
| `hint` | `string \| null` |

- Largeur par défaut 320 px (ou 100 % du parent). Colonne : libellé (`label`) → zone → message, espacement 6 px.
- Zone : padding `10px 12px`, rayon `--hc-radius-sm`, fond `--hc-bg-surface`, bordure 1 px `--hc-border-strong` ; focus : bordure `--hc-brand-primary` + anneau de focus.
- Liste déroulante : chevron « ▾ » en `--hc-text-muted` à droite.
- Erreur : bordure `--hc-status-danger`, message en `caption` `--hc-status-danger`.

## Puce de choix — `hc-chip-group`

Choix unique parmi une liste courte (type de leçon, lieu). Entrées : `options: {value, label}[]`, modèle `value` (`model()`).

- Puce : padding `7px 12px`, rayon pill. Inactive : fond `--hc-bg-surface`, bordure `--hc-border-strong`, texte `body`. Active : fond et bordure `--hc-brand-primary`, texte `--hc-text-inverse` en `body-strong`.
- Rôle ARIA `radiogroup` / `radio`.

## Élément de menu — `hc-nav-item`

Entrées : `label`, `route`. Actif automatiquement via `routerLinkActive`.

- Largeur 100 %, hauteur 40 px, padding `10px 12px`, gap 10 px, rayon `--hc-radius-sm`.
- Puce ronde de 8 px à gauche : `--hc-text-sidebar-muted` (défaut) / `--hc-highlight-late` (actif).
- Défaut : texte `body` `--hc-text-sidebar-muted`, sans fond. Actif : fond `--hc-brand-primary-hover`, texte `body-strong` `--hc-text-inverse`.

## Menu latéral — `hc-sidebar`

Entrées : `role: 'MEMBER' | 'COACH' | 'ADMIN'`, `user: { firstName, lastName, subtitle }`. Sortie : `logout`.

- Largeur `--hc-sidebar-width` (240 px), hauteur 100 vh, fond `--hc-bg-sidebar`, padding `24px 16px 20px`, gap 4 px.
- Logo : monogramme carré 36 px rayon 10 px fond `--hc-highlight-late` avec « H » (`title-2`), puis « HorseCo-Pilote » (`title-2`, inverse) et « Centre équestre » (`caption`, sidebar-muted). Marge basse 24 px.
- Libellé de section « MENU » / « GESTION » : `caption`, sidebar-muted, espacement des lettres 8 %.
- Éléments de menu par rôle : voir SKILL.md § 6.
- Bas : carte utilisateur (fond `--hc-brand-primary-hover`, rayon 10 px, padding `10px 12px`, avatar rond 32 px fond `--hc-brand-primary-soft` avec initiales `caption`, nom `body-strong` inverse, rôle `caption` sidebar-muted), puis lien « Se déconnecter » (`label`, sidebar-muted).

## En-tête de page — `hc-page-header`

Entrées : `title`, `subtitle?`. Slot `[actions]` projeté à droite.

- Ligne flex, `align-items: flex-end`, gap 12 px. Titre `display`, sous-titre `body` muted, gap 4 px.

## Carte — `hc-card`

Fond surface, bordure 1 px `--hc-border-default`, rayon `--hc-radius-lg`, padding 20 px, gap 12 px. Variante `flush` (padding 0) pour les tableaux.

## Encadré / bandeau — `hc-callout`

Entrée `tone: 'info' | 'warning' | 'late' | 'subtle'`.

- Rayon `--hc-radius-md`, padding `12px 16px`, gap 12 px, texte `body`.
- info : fond `status-info-soft`, texte `status-info` · warning : `status-warning-soft` / `status-warning` · late : fond `highlight-late-soft`, bordure 1 px `highlight-late`, texte `status-warning`, pastille ronde 10 px `highlight-late` · subtle : fond `bg-subtle`, texte muted.

## Tableau — pattern `hc-table`

- Conteneur : `hc-card` flush, `overflow: hidden`.
- En-tête : fond `--hc-bg-subtle`, padding `10px 20px`, libellés `caption` muted en MAJUSCULES.
- Lignes : padding `13px 20px`, bordure haute 1 px `--hc-border-default`, gap entre colonnes 16 px ; 1re colonne en `body-strong`, autres en `body`.
- Ligne passée / annulée : textes en `--hc-text-disabled` (les badges gardent leur couleur).

## Modale — `hc-modal`

Entrées : `title`, `open` (`model<boolean>`), `width` (520 par défaut, 600 pour les formulaires). Slots : corps et `[actions]`.

- Voile plein écran `--hc-scrim`. Boîte centrée : fond surface, rayon `--hc-radius-xl`, padding 28 px, gap 20 px, ombre `--hc-shadow-modal`.
- Titre `title-1`. Actions alignées à droite, gap 12 px : secondaire (« Annuler ») puis principale.
- Fermeture : Échap, clic sur le voile, focus piégé dans la modale.
- Récapitulatif dans une modale : bloc fond `--hc-bg-page`, rayon 10 px, padding 16 px, lignes clé (`body` muted) / valeur (`body-strong`) alignées de part et d'autre.

## Carte créneau — `hc-slot-card` (écran membre)

Entrées : `slot` (horaire, coach, niveau, places), `state: 'available' | 'enrolled' | 'full' | 'out-of-level'`. Sortie : `enroll`.

- Largeur fluide (colonne d'un jour), padding 14 px, gap 8 px, rayon `--hc-radius-lg`, bordure 1 px.
- Contenu : horaire (`body-strong`), coach (`body` muted), ligne méta = badge niveau (brand) + « 9/12 places » (`caption` muted), puis zone d'action.
- États : voir SKILL.md § 8 (disponible = bouton secondaire pleine largeur « S'inscrire »).

## Bloc de leçon — `hc-lesson-block` (agenda coach)

Entrées : `lesson` (horaire, type, lieu, détails), `state: 'normal' | 'late' | 'cancelled' | 'to-create'`. Sortie : `open`.

- Padding `8px 10px`, gap 2 px, rayon `--hc-radius-md`. Ligne haute : horaire (`caption` muted) + badge éventuel. Puis « TYPE · Lieu » (`body-strong`, 1 ligne, ellipse), puis détails (`caption` muted, 1 ligne, ellipse).
- Placé dans une grille horaire (colonne heures 64 px + 6 colonnes jours, lignes d'1 h) : un bloc occupe exactement sa ligne horaire, sans déborder sur la suivante.
- États : voir SKILL.md § 8.

## Cheval à attribuer — `hc-horse-option` (écran coach)

Entrées : `horse` (nom, race, poids, niveau requis, heures du jour), `selectable: boolean`, `reason: string | null`, `selected: boolean`. Sortie : `select`.

- Ligne flex : radio 16 px · bloc infos (nom `body-strong`, « Race · 520 kg · Galop 3 » en `caption` muted, motif éventuel en `caption` danger) · « 1/3 h » en `caption` muted à droite.
- Padding `10px 12px`, gap 12 px, rayon `--hc-radius-md`, bordure 1 px `--hc-border-default`.
- Non sélectionnable : fond `--hc-bg-disabled`, textes grisés, motif affiché, `aria-disabled="true"`, non cliquable.

## Écran de connexion — pattern

- Deux colonnes : panneau marque 620 px (fond sidebar, padding `56px 64px`, logo 44 px en haut, accroche Fraunces 40/50 inverse en bas + 3 points clés avec puce ambre) ; zone droite centrée avec la carte de connexion (440 px, padding 40 px, rayon `--hc-radius-xl`, ombre `--hc-shadow-card`).
- Carte : « Connexion » (`title-1`), sous-titre muted, champs « Adresse e-mail » et « Mot de passe », bouton principal pleine largeur « Se connecter », encadré subtle « Pas encore de compte ? Les comptes sont créés par l'administrateur du centre. »
