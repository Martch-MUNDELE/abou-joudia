```markdown
# abou-joudia

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Session — 2026-05-14 : Extension PhoneInput 49 pays

### Travaux validés

**Commit :** `d37e257`
**Fichier modifié :** `components/PhoneInput.tsx` (+32 lignes, -3 lignes)

Pays ajoutés par région :

| Région | Pays ajoutés |
|---|---|
| Europe | Suède, Norvège, Danemark, Autriche, Irlande, Pologne |
| Afrique centrale | RD Congo (+243), Congo (+242), Gabon (+241), Guinée Équatoriale (+240), Angola (+244), Cameroun (+237) |
| Afrique de l'Est | Burundi, Rwanda, Kenya, Éthiopie, Madagascar |
| Afrique de l'Ouest | Sénégal, Mali, Guinée, Côte d'Ivoire, Burkina Faso, Niger, Togo, Bénin, Mauritanie |
| Afrique du Nord | Libye (+218) |
| Moyen-Orient | Arabie Saoudite, Émirats, Qatar, Koweït, Turquie |

**Pays déjà présents conservés :** Maroc, France, Belgique, Suisse, Luxembourg, Espagne, Italie, Allemagne, Pays-Bas, Portugal, Royaume-Uni, États-Unis, Canada, Algérie, Tunisie, Égypte.

---

## Session — 2026-05-15 : Push git branche main — PhoneInput 49 pays

### Travaux validés

**Branche :** `main`
**Projet git :** `black-deew`
**Flags utilisés :** `--trust-sensitive --allow-push`
**Fichier modifié :** `components/PhoneInput.tsx` — 1 fichier, +32 lignes, -3 lignes

- Extension de la constante `COUNTRIES` dans `PhoneInput.tsx` portant la couverture à 49 pays.
- Pays : Maroc en tête, Europe occidentale, Afrique subsaharienne, Maghreb, Moyen-Orient inclus.
- Le composant conserve sa structure `'use client'` avec gestion du dropdown par `useState`, `useRef`, `useEffect`.
- Les indicatifs téléphoniques (`dial`), drapeaux emoji (`flag`) et noms localisés en français (`name`) sont présents pour chaque entrée.

### Bugs corrigés

Aucun bug documenté corrigé dans cette session.

---

## Session — 2026-05-15 01:00 : Tour 2 — Extension COUNTRIES + push origin/main

### Travaux validés

**Branche :** `main`
**Projet git :** `black-deew`
**Flags utilisés :** `--trust-sensitive --allow-push`
**Fichier modifié :** `components/PhoneInput.tsx` — modification additive pure

- Extension de la liste `COUNTRIES` : passage de 49 pays documentés à une liste élargie.
- Ajout net : **32 insertions, 3 suppressions** (refactoring mineur de lignes existantes + nouveaux pays).
- Pays ajoutés (non exhaustif — diff tronqué) : Burkina Faso, Niger, Togo, Bénin, Cameroun, RD Congo, Congo, Gabon, Guinée Équatoriale, Angola, Burundi, Rwanda, Kenya, Éthiopie, Madagascar, Arabie Saoudite, Émirats, Qatar, Koweït, Turquie.
- Le composant reste `'use client'` avec `useState`, `useRef`, `useEffect`.

---

## Session — 2026-05-17 23:33 : Correction bug uploadHeroImage + métadonnées dynamiques

### Travaux validés

**Tours :** 25 | **Commits :** 2

Deux commits livrés en production. Le premier corrige le bug de cache sur l'image hero en remplaçant le nom de fichier fixe par un nom horodaté et en ajoutant un upsert immédiat en base. Le second ajoute la gestion des métadonnées OG/favicon dynamiques, un champ `site_description` en admin, et le toggle visibilité des arguments.

#### Commit `a422920` — fix: uploadHeroImage timestamp + cache-buster + upsert immédiat

- **Nom de fichier dynamique :** `hero.ext` remplacé par `hero-{timestamp}.ext` dans la fonction `uploadHeroImage` — élimine le cache navigateur et CDN sur les remplacements successifs
- **Upsert immédiat :** après upload réussi dans Supabase Storage, un upsert est exécuté immédiatement dans la table `settings` avec la clé `hero_image` et l'URL publique de la nouvelle image — évite l'état désynchronisé si l'utilisateur quitte sans sauvegarder
- **Cache-buster URL :** paramètre `?t={timestamp}` ajouté à l'URL retournée pour forcer le rechargement côté client

#### Commit `c95fd4c` — feat: OG image, favicon, generateMetadata dynamique, site_description admin, toggle arguments

- **`generateMetadata` dynamique :** lecture de `site_name`, `site_description`, `hero_image` depuis `settings` pour générer les balises Open Graph et Twitter Card côté serveur
- **OG image :** `hero_image` depuis `settings` utilisée comme `og:image` si présente
- **Favicon :** configurable depuis les settings (clé non précisée dans le diff disponible)
- **Champ `site_description` :** ajouté dans `app/admin/settings/page.tsx` onglet Identité — état `siteDescription` + `setSiteDescription` + champ de saisie admin
- **Toggle arguments :** les 3 features (arguments marketing) ont chacune un toggle actif/inactif — états `feature1Active`, `feature2Active`, `feature3Active` déjà présents, interface de bascule ajoutée dans l'onglet Arguments
- **Fichier modifié :** `app/admin/settings/page.tsx` — +5 lignes / -2 lignes

### Bugs corrigés

| # | Bug |