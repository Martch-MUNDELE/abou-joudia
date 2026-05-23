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

## Session — 2026-05-15 : Fix pickup mode — page admin commandes

### Travaux validés

**Commit :** `ff441c8`
**Branche :** `main`
**Fichier modifié :** page admin commandes

- Ajout `WA_BUTTON_LABELS_PICKUP` : libellé "Envoyer message Retrait confirmé" pour status `livrée` en mode pickup.
- Message WhatsApp `livrée` conditionnel : détecte `order.delivery_mode === 'pickup'` → envoie "a bien été retirée" au lieu de "a bien été livrée".
- Transitions statut pickup : suppression de l'étape `en_livraison` pour les commandes pickup (remplacée directement par `livrée`).
- Labels select admin : affichage correct selon mode pickup/livraison.
- Fix aligné avec le même correctif déjà appliqué sur `black-deew`.

### Dette technique

- `package-lock.json` modifié dans le commit — vérifier si c'est intentionnel ou bruit de diff.
- Doc maître (ARIA_DOC) en v6.5 du 14 mai 2026 — non mise à jour depuis la session livreurs ni ce fix pickup.
- Vérifier que `WA_BUTTON_LABELS_PICKUP` est effectivement utilisé dans le rendu (diff tronqué, utilisation non confirmée).
- Template projet : s'assurer que le même fix a bien été propagé (mentionné dans la tâche mais non visible dans le diff).

### Prochaines étapes

1. Confirmer propagation du fix sur le **template projet** (second objectif de la session, non visible dans le diff fourni).
2. Mettre à jour ARIA_DOC v6.6 : documenter le comportement pickup dans la section admin commandes.
3. Tester en local les deux chemins (pickup / livraison) avant push prod.
4. Vérifier l'utilisation de `WA_BUTTON_LABELS_PICKUP` dans le JSX complet (diff tronqué à 3000 chars).
```