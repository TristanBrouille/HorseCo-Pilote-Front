# Architecture du front (identique au projet EPF Core)

Le front reprend l'organisation du front EPF Core (`EPF-Core/epfcore_frontend`) : **un dossier par écran à la racine de `src/app/`**, le service HTTP et les interfaces de l'écran rangés à côté du composant (pas de dossier `model/`), le cadre et les composants visuels partagés dans `decor/`, les intercepteurs dans `interceptors/`.

## Arborescence

```
src/
├── index.html                 # polices DM Sans + Fraunces
├── styles.scss                # @use 'styles/tokens'; @use 'styles/grid';
├── styles/_tokens.scss        # copie de references/tokens.scss
├── styles/_grid.scss          # classes de cellule AG Grid globales (hc-cell-strong…)
└── app/
    ├── app.ts / app.html / app.scss
    ├── app.config.ts          # provideRouter, provideHttpClient(withInterceptors([...]))
    ├── app.routes.ts          # une route lazy par écran : { path, loadComponent }
    ├── decor/                 # cadre (sidebar, header…) + composants partagés hc-*
    │   ├── button/  badge/  field/  modal/  page-header/  …   # chacun : .ts + .html + .scss
    │   ├── grid/              # hc-grid-theme.ts + cellRenderers génériques (BadgeCell, ActionsCell), avec .html/.scss
    │   └── labels.ts          # libellés FR des enums + tons de badge
    ├── interceptors/          # HttpInterceptorFn (ex. auth.interceptor.ts)
    ├── <ecran>/               # un dossier par écran, nom kebab-case
    │   ├── <ecran>.ts         # composant (classe PascalCase, sélecteur app-<ecran>)
    │   ├── <ecran>.html
    │   ├── <ecran>.scss
    │   ├── <ecran>.spec.ts    # facultatif
    │   ├── <ecran>-service.ts # service HTTP de la ressource (classe <Ecran>Service)
    │   ├── <ecran>Model.ts    # interfaces = DTO de requête/réponse du back (ex. weeklySlotModel.ts)
    │   └── <sous-partie>/     # code annexe de l'écran dans son propre sous-dossier (ex. calendar-layout/)
    └── <ressource>/           # ressource sans écran pour l'instant : <ressource>-service.ts + <ressource>Model.ts
```

Exemples actuels : `weekly-slots/` (écran admin des créneaux, `weekly-slots-service.ts`, `weeklySlotModel.ts`, `calendar-layout/`), `coaches/` (`coaches-service.ts` + `coachModel.ts`, utilisés par le formulaire des créneaux, accueillera l'écran CRUD des coachs), `auth/` (`authService.ts`, `authModel.ts`).

## Les 3 couches côté front

| Couche | Où | Rôle | Interdit |
|---|---|---|---|
| Présentation | `<ecran>/<ecran>.ts/.html/.scss`, `decor/` | Affichage, formulaires, état d'écran en signals, messages FR | Appeler `HttpClient` directement, recalculer une règle métier |
| Service | `<ecran>/<ecran>-service.ts` | Appels REST d'une ressource, URL de l'API | Toucher au DOM, aux formulaires ou aux signals d'écran |
| Données | `<ecran>/<ecran>Model.ts` (+ l'API du back) | Interfaces alignées sur les DTO du back, enums identiques aux enums Java | Logique |

Un composant peut injecter le service d'une autre ressource (ex. `WeeklySlots` injecte `CoachesService`) ; il n'importe jamais le composant d'un autre écran.

## Conventions de code

- **Service** : `@Injectable({ providedIn: 'root' })`, `private readonly baseUrl = 'http://localhost:8080/<ressource>'` (pas de préfixe `/api`), `inject(HttpClient)`, méthodes qui **renvoient des `Promise`** via `firstValueFrom(...)`.

  ```ts
  getAll(): Promise<WeeklySlot[]> {
    return firstValueFrom(this.http.get<WeeklySlot[]>(this.baseUrl));
  }
  ```

- **Composant** : standalone, template dans un fichier `.html` (`templateUrl`) et styles dans un fichier `.scss` (`styleUrl`), jamais de `template` ni de `styles` en ligne, y compris pour les composants de `decor/`, `ChangeDetectionStrategy.OnPush`, état en `signal()`, chargement dans `async ngOnInit()`, appels en `async/await` avec `try/catch` qui transforme l'erreur HTTP en message français (statut 404 / 409 / 400 → texte).
- **Routes** : une route lazy par écran (`{ path: 'admin/creneaux', loadComponent: () => import('./weekly-slots/weekly-slots').then((m) => m.WeeklySlots) }`), redirection `''` en dernier.
- **Tests (Vitest)** : facultatifs, l'équipe ne les exige pas ; ceux qui existent sont gardés et doivent passer. `provideHttpClient()` + `provideHttpClientTesting()`. Les services renvoient des promesses et AG Grid rend ses cellules Angular sur une frame suivante : après un `flush` ou un clic, attendre une macro-tâche (`setTimeout(…, 50)`) puis `fixture.whenStable()` avant de lire le DOM. jsdom n'implémente pas `<dialog>.showModal()` : le stubber dans le spec.

## Ce qu'on ne reprend pas d'EPF Core

- Pas de `any` : les services et composants sont typés avec les interfaces des fichiers `<ecran>Model.ts`.
- Pas de `ChangeDetectorRef.detectChanges()` : les signals déclenchent le rendu.
- Pas d'Angular Material ni de Bootstrap : les composants visuels sont les `hc-*` de `decor/` (direction artistique HorseCo).
- Routes lazy (`loadComponent`) au lieu de `component` : AG Grid pèse ~800 ko, en eager le bundle initial dépasse le budget d'erreur de 1 Mo d'`angular.json`.
