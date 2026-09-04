# Allo Doudou — Coming Soon / Next.js / Netlify

Landing page Allo Doudou pour **La Réunion**, avec capture d'email réelle, Supabase et protection anti-spam.

## Ce qui est déjà codé

- Next.js App Router
- animations d'entrée au scroll
- expérience vocale interactive
- formulaire `/api/waitlist`
- stockage des emails dans Supabase
- protection Cloudflare Turnstile côté client + validation côté serveur
- honeypot invisible anti-bot
- contrôle du temps minimum de remplissage
- email unique (pas de doublons)
- SEO La Réunion, canonical, Open Graph, robots et sitemap
- configuration Netlify via `netlify.toml`

## 1. Créer la base Supabase

1. Va sur https://supabase.com et crée un projet.
2. Ouvre **SQL Editor**.
3. Colle tout le contenu de `supabase.sql` et exécute-le.
4. Va dans **Project Settings > API**.
5. Récupère :
   - `Project URL`
   - `service_role key`

Dans `.env`, remplace :

```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

La `service_role key` est secrète. Elle ne doit jamais être préfixée par `NEXT_PUBLIC_`.

## 2. Tester en local

Le fichier `.env` est déjà présent.

Les clés Turnstile qu'il contient sont les clés officielles Cloudflare de **test**. Elles fonctionnent sur localhost et servent uniquement au développement.

```bash
npm install
npm run dev
```

Puis ouvre :

```text
http://localhost:3000
```

Une fois Supabase configuré, entre un email dans le formulaire. Tu dois le voir apparaître dans :

**Supabase > Table Editor > waitlist**

## 3. Configurer l'anti-spam pour la production

Le formulaire utilise **Cloudflare Turnstile**. Il fonctionne même si le site est hébergé chez Netlify.

1. Crée un compte Cloudflare si nécessaire.
2. Ouvre **Turnstile** dans le dashboard Cloudflare.
3. Crée un widget.
4. Ajoute le domaine Netlify, par exemple :

```text
allo-doudou.netlify.app
```

5. Après achat du domaine final, ajoute aussi ce domaine au widget.
6. Copie la **Site Key** et la **Secret Key**.

Sur Netlify, tu utiliseras :

```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=TA_VRAIE_SITE_KEY
TURNSTILE_SECRET_KEY=TA_VRAIE_SECRET_KEY
TURNSTILE_ALLOWED_HOSTNAMES=allo-doudou.netlify.app,www.tondomaine.re,tondomaine.re
```

Ne mets pas les clés de test Cloudflare en production.

## 4. Déployer sur Netlify

### Méthode recommandée : GitHub

1. Mets le dossier dans un repo GitHub.
2. Sur Netlify : **Add new project > Import an existing project**.
3. Sélectionne le repo.
4. Netlify détectera Next.js automatiquement.
5. Build command :

```text
npm run build
```

Le fichier `netlify.toml` est déjà inclus.

### Variables Netlify

Dans :

**Site configuration > Environment variables**

ajoute :

```env
NEXT_PUBLIC_SITE_URL=https://allo-doudou.netlify.app
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxx
NEXT_PUBLIC_TURNSTILE_SITE_KEY=xxxx
TURNSTILE_SECRET_KEY=xxxx
TURNSTILE_ALLOWED_HOSTNAMES=allo-doudou.netlify.app
```

Puis redéploie le site.

Quand tu branches le vrai domaine, modifie aussi `NEXT_PUBLIC_SITE_URL` et `TURNSTILE_ALLOWED_HOSTNAMES`.

## 5. Comment l'enregistrement fonctionne

```text
Visiteur
  ↓
Cloudflare Turnstile + honeypot
  ↓
POST /api/waitlist
  ↓
Validation serveur
  ↓
Supabase
  ↓
public.waitlist
```

La clé Supabase admin n'est jamais envoyée au navigateur.

## 6. Protection anti-spam présente

Il y a plusieurs couches :

1. **Cloudflare Turnstile** : vrai contrôle anti-bot avec vérification serveur.
2. **Honeypot** : champ invisible que les bots remplissent souvent.
3. **Timing** : un formulaire envoyé de manière absurdement rapide est refusé.
4. **Validation serveur** : email, taille et token sont contrôlés côté API.
5. **Email unique** : un même email n'est pas ajouté plusieurs fois.
6. **Hostname Turnstile** : en production, limite les tokens aux domaines autorisés.

## 7. SEO après le vrai domaine

Après connexion du domaine :

1. mets `NEXT_PUBLIC_SITE_URL=https://tondomaine.re` sur Netlify ;
2. redéploie ;
3. ajoute le domaine à Google Search Console ;
4. soumets `https://tondomaine.re/sitemap.xml`.

## Important sur `.env`

Le fichier `.env` est dans ce dossier parce qu'il a été demandé pour simplifier le setup local. Il est déjà ignoré par `.gitignore`.

**Ne l'envoie pas publiquement et ne commit jamais les vraies clés secrètes.** Sur Netlify, utilise les variables d'environnement du dashboard.
