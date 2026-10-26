# OLT Location

Application web de location de voitures (Next.js + Tailwind CSS) avec:
- site public bilingue FR/AR
- tableau de bord d'administration
- thème clair / sombre
- réservation réelle côté client (stockée dans `localStorage`)

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## Accès admin

- URL: `/login`
- Email: `riadboumellah94@gmail.com`
- Mot de passe: `admin`

## Structure

```
app/                 pages publiques et /admin
components/frontend  header, recherche, cartes véhicules
components/admin     sidebar, KPI, tables, modal
lib/                 i18n, store, données, types
```
