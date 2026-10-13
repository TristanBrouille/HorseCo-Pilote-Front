# Architecture du front (identique au projet EPF Core)

Le front reprend l'organisation du front EPF Core (`EPF-Core/epfcore_frontend`) : **un dossier par écran à la racine de `src/app/`**, le service HTTP de l'écran rangé à côté du composant, les interfaces dans `model/`, le cadre et les composants visuels partagés dans `decor/`, les intercepteurs dans `interceptors/`.

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
    ├── model/                 # interfaces TypeScript = DTO de réponse/requête du back
    │   ├── coach.ts
    │   └── weekly-slot.ts
    ├── decor/                 # cadre (sidebar, header…) + composants partagés hc-*
    │   ├── button/  badge/  field/  modal/  page-header/  …
    │   ├── grid/              # hc-grid-theme.ts + cellRenderers génériques (BadgeCell, ActionsCell)
    │   └── labels.ts          # libellés FR des enums + tons de badge
    ├── interceptors/          # HttpInterceptorFn (ex. auth.interceptor.ts)
    ├── <ecran>/               # un dossier par écran, nom kebab-case
    │   ├── <ecran>.ts         # composant (classe PascalCase, sélecteur app-<ecran>)
    │   ├── <ecran>.html
    │   ├── <ecran>.scss
    │   ├── <ecran>.spec.ts
    │   └── <ecran>-service.ts # service HTTP de la ressource (classe <Ecran>Service)
    └── <ressource>/           # ressource sans écran pour l'instant : seulement <ressource>-service.ts
```

Exemples actuels : `weekly-slots/` (écran admin des créneaux + `weekly-slots-service.ts`), `coaches/coaches-service.ts` (utilisé par le formulaire des créneaux, accueillera l'écran CRUD des coachs).

## Les 3 couches côté front

| Couche | Où | Rôle | Interdit |
|---|---|---|---|
| Présentation | `<ecran>/<ecran>.ts/.html/.scss`, `decor/` | Affichage, formulaires, état d'écran en signals, messages FR | Appeler `HttpClient` directement, recalculer une règle métier |
| Service | `<ecran>/<ecran>-service.ts` | Appels REST d'une ressource, URL de l'API | Toucher au DOM, aux formulaires ou aux signals d'écran |
| Données | `model/` (+ l'API du back) | Interfaces alignées sur les DTO du back, enums identiques aux enums Java | Logique |

Un composant peut injecter le service d'une autre ressource (ex. `WeeklySlots` injecte `CoachesService`) ; il n'importe jamais le composant d'un autre écran.

## Conventions de code

- **Service** : `@Injectable({ providedIn: 'root' })`, `private readonly baseUrl = 'http://localhost:8080/api/<ressource>'`, `inject(HttpClient)`, méthodes qui **renvoient des `Promise`** via `firstValueFrom(...)`.

  ```ts
  getAll(): Promise<WeeklySlot[]> {
    return firstValueFrom(this.http.get<WeeklySlot[]>(this.baseUrl));
  }
  ```

- **Composant** : standalone, `ChangeDetectionStrategy.OnPush`, état en `signal()`, chargement dans `async ngOnInit()`, appels en `async/await` avec `try/catch` qui transforme l'erreur HTTP en message français (statut 404 / 409 / 400 → texte).
- **Routes** : une route lazy par écran (`{ path: 'admin/creneaux', loadComponent: () => import('./weekly-slots/weekly-slots').then((m) => m.WeeklySlots) }`), redirection `''` en dernier.
- **Tests (Vitest)** : `provideHttpClient()` + `provideHttpClientTesting()`. Les services renvoient des promesses et AG Grid rend ses cellules Angular sur une frame suivante : après un `flush` ou un clic, attendre une macro-tâche (`setTimeout(…, 50)`) puis `fixture.whenStable()` avant de lire le DOM. jsdom n'implémente pas `<dialog>.showModal()` : le stubber dans le spec.

## Ce qu'on ne reprend pas d'EPF Core

- Pas de `any` : les services et composants sont typés avec les interfaces de `model/`.
- Pas de `ChangeDetectorRef.detectChanges()` : les signals déclenchent le rendu.
- Pas d'Angular Material ni de Bootstrap : les composants visuels sont les `hc-*` de `decor/` (direction artistique HorseCo).
- Routes lazy (`loadComponent`) au lieu de `component` : AG Grid pèse ~800 ko, en eager le bundle initial dépasse le budget d'erreur de 1 Mo d'`angular.json`.
