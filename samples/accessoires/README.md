# NOOR — نور · échantillon boutique accessoires

Un **échantillon de boutique en ligne** pour la spécialité *accessoires* :
sac, bijoux, cheveux, parfums et cadeaux. C'est le lien que tu envoies à un
client pour lui montrer à quoi ressemblerait son magasin.

**En ligne :** https://noor-accessoires.walidhamrit.workers.dev

## Ce que le client peut faire dans l'échantillon

- Parcourir la boutique, filtrer par rayon et par prix, trier
- Ouvrir une fiche produit, choisir une couleur/finition, la quantité
- Ajouter au panier, voir la jauge « livraison offerte dès 250 LYD »
- Aller jusqu'à la commande : confirmation immédiate, **sans paiement**
- Changer la langue (**arabe par défaut, RTL** · français · anglais)
- Changer de thème (six palettes) et passer en mode sombre

Tout fonctionne **dans le navigateur** : pas de serveur, pas de base de
données, aucun envoi de données. Le pied de page l'indique clairement.

## Le publier

Le site est reconstruit automatiquement à chaque `git push` par
[`.github/workflows/samples-pages.yml`](../../.github/workflows/samples-pages.yml),
depuis ce dossier :

```sh
cd app
VITE_DEMO=1 SITE_BASE=/store.pinokio/accessoires/ npx vite build
```

Deux variables d'environnement suffisent :

| Variable | Effet |
|---|---|
| `VITE_DEMO=1` | catalogue embarqué, commande confirmée localement, `/admin` masqué |
| `SITE_BASE=/store.pinokio/accessoires/` | le sous-chemin où le site est servi (Pages projet) |

Sans ces variables, l'application tourne normalement derrière son Worker
(catalogue et commandes dans Cloudflare D1, tableau de bord sur `/admin`).

## Personnaliser pour un client

1. **La boutique** — `app/src/data/shop.ts` : nom, adresse, horaires,
   téléphone, WhatsApp, Facebook, lien Maps, note, ligne de livraison.
2. **Le catalogue** — `app/src/data/seed.json` (10 pièces, trois langues) ou,
   en version Worker, le tableau de bord `/admin`.
3. **Les textes** — `app/src/app/i18n/dict.ts`, une clé par langue.
4. **Les images** — `app/public/images/` (ratios 4:5 pour les fiches).
5. **Les couleurs et les polices** — `app/src/styles.css`.

Pour un autre métier, il suffit de recopier ce dépôt et de changer ces cinq
endroits : la structure (accueil, boutique, fiche, panier, commande, à propos)
ne bouge pas.

## Développer en local

```sh
cd app
npm install
npm run dev        # http://localhost:5173 — version complète, avec Worker
npm test           # vitest
```

Pour prévisualiser exactement la version statique :

```sh
cd app
VITE_DEMO=1 SITE_BASE=/store.pinokio/accessoires/ npx vite build
npx vite preview --base=/store.pinokio/accessoires/
```

## Version complète (pour un vrai client)

Le même code, installé dans Pinokio (`install.js`, `start.js`) ou déployé sur
Cloudflare Workers, ajoute ce que l'échantillon n'a pas : catalogue modifiable
depuis `/admin`, commandes enregistrées, abonnés à la lettre d'information.
Voir [`../../app/README.md`](../../app/README.md), qui décrit l'API, le tableau
de bord et le déploiement Cloudflare — et [`../../app/`](../../app) pour le
modèle d'origine, gardé intact.

---

Marque, adresse et téléphone de l'échantillon sont **fictifs**.

## Pourquoi un dossier séparé

`app/` à la racine est le **modèle** (version DAOS, Worker + tableau de bord).
`samples/accessoires/` en est un **exemplaire indépendant** : marque fictive,
aucun serveur, publié en statique. Copier ce dossier dans un autre dépôt suffit
pour obtenir un lien propre du type `https://<compte>.github.io/accessoires/`.

Limite de GitHub Pages : un lien profond partagé (`/accessoires/product/...`)
retombe sur la page d'accueil. Le lien à envoyer est la racine du site.

## Où le site est publié

| Adresse | État |
|---|---|
| https://noor-accessoires.walidhamrit.workers.dev | **en ligne** — Worker statique Cloudflare, publié par [`.github/workflows/sample-cloudflare.yml`](../../.github/workflows/sample-cloudflare.yml) |
| https://walidhamrit-blip.github.io/store.pinokio/accessoires/ | en attente de GitHub Pages (voir plus bas) |

Le Worker ne demande que la permission *Workers Scripts:Edit* du jeton
`CLOUDFLARE_API_TOKEN` déjà utilisé par la boutique : aucune autorisation
supplémentaire, aucune base de données, aucun coût. À chaque push touchant
`samples/accessoires/`, le site est reconstruit et republié.

## GitHub Pages : pourquoi l'URL 404

Pages est bien activé (`build_type: workflow`), mais l'environnement
`github-pages` n'autorise **que la branche `main`** comme source de
déploiement. Un workflow lancé depuis `arena/bb8a518e-store-pinokio` est refusé
par GitHub :

> Branch "arena/bb8a518e-store-pinokio" is not allowed to deploy to github-pages
> due to environment protection rules.

Deux façons de l'obtenir, au choix :

1. **Autoriser la branche** — Settings → Environments → `github-pages` →
   *Deployment branches and tags* → **Add deployment branch** →
   `arena/bb8a518e-store-pinokio` (ou *Any branch*). Le workflow
   [`samples-pages.yml`](../../.github/workflows/samples-pages.yml) reprend
   alors son rôle : l'échantillon arrive sur `/store.pinokio/accessoires/`.
2. **Passer par `main`** — fusionner ce travail dans `main` : la politique
   d'environnement l'accepte déjà, et le workflow publie l'index des
   échantillons sur `/store.pinokio/` et l'échantillon sur `/accessoires/`.

## Sans Pages du tout

`accessoires-site.zip` (racine du dépôt, non versionné) contient le build prêt
à glisser-déposer sur Netlify Drop, Cloudflare Pages (*Upload assets*) ou
Vercel — URL fournie en quelques secondes.
