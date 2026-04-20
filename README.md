# MSP App — Melanie Services & Prest.

Application de gestion des partenaires, marchés et documents.

---

## Stack technique

- **Next.js 14** — App Router + API Routes
- **TypeScript**
- **Prisma + PostgreSQL** (Neon.tech)
- **NextAuth v5** — JWT
- **Resend** — emails transactionnels
- **Minio / S3** — stockage fichiers
- **Tailwind CSS**

---

## Installation locale

```bash
# 1. Cloner / extraire le projet
cd msp-app

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env.local
# → Remplir toutes les variables dans .env.local

# 4. Pousser le schéma Prisma vers la DB
npm run db:push

# 5. Générer le client Prisma
npm run db:generate

# 6. Créer le premier admin
npm run db:seed

# 7. Lancer en développement
npm run dev
```

---

## Variables d'environnement requises

```env
DATABASE_URL="postgresql://..."
DATABASE_URL_UNPOOLED="postgresql://..."
AUTH_SECRET="..."
NEXT_PUBLIC_APP_URL="https://votre-domaine.com"
RESEND_API_KEY="re_..."
ADMIN_EMAIL="admin@melanieservices.com"
MINIO_ENDPOINT="..."
MINIO_PORT="9000"
MINIO_USE_SSL="true"
MINIO_ACCESS_KEY="..."
MINIO_SECRET_KEY="..."
MINIO_BUCKET_NAME="msp-bucket"
```

---

## Déploiement sur Hetzner VPS (CX32)

### 1. Préparer le serveur

```bash
# Ubuntu 24.04
sudo apt update && sudo apt upgrade -y

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PM2 (process manager)
sudo npm install -g pm2

# Nginx
sudo apt install -y nginx

# Minio (stockage fichiers)
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
sudo mv minio /usr/local/bin/
```

### 2. Déployer l'application

```bash
# Uploader le code sur le serveur
scp -r msp-app/ root@VOTRE_IP:/home/msp/

cd /home/msp/msp-app
npm install
npm run db:push
npm run db:generate
npm run db:seed
npm run build

# Lancer avec PM2
pm2 start npm --name "msp-app" -- start
pm2 save
pm2 startup
```

### 3. Configurer Nginx

```nginx
server {
    server_name votre-domaine.com;

    location / {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 50M;
    }
}
```

### 4. SSL avec Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com
```

---

## Connexion initiale

- **Email** : `admin@melanieservices.com`
- **Mot de passe** : `Admin@MSP2026!`
- **⚠ Changez ce mot de passe immédiatement dans Paramètres**

---

## Modules

| Module | Description |
|--------|-------------|
| Partenaires | Gestion clients, fournisseurs, sous-traitants, prestataires |
| Documents | Coffre-fort entreprise + partage partenaires |
| Suivi marchés | Planning étapes, audits, CR, contentieux |
| Banques & Créances | Factures, relances, dettes internes |
| Messages | Informations transmises aux partenaires |
| Contrat | Versioning du contrat MSP |
| Notifications | Alertes in-app |
| Dashboard | Tableau de bord avec KPIs |

---

## Espace partenaire

Chaque partenaire dispose d'un lien unique :
```
https://votre-domaine.com/partner/[TOKEN_UNIQUE]
```
Ce lien est envoyé automatiquement par email à la création du partenaire.

---

## PWA — Installation de l'application

### Comment ça marche (aucune commande requise)

La PWA s'installe directement depuis le navigateur. Il n'y a **pas de commande** à taper ni de store à passer.

### Sur Android (Chrome, Edge, Samsung Internet)
1. Ouvrez l'app dans le navigateur
2. Un **modal d'installation** apparaît automatiquement après quelques secondes
3. Cliquez **"Installer l'application"**
4. L'icône MSP apparaît sur l'écran d'accueil

### Sur iPhone / iPad (Safari)
1. Ouvrez l'app dans **Safari** (pas Chrome iOS)
2. Un **modal avec les instructions** apparaît automatiquement
3. Appuyez sur le bouton **Partager** (↑) en bas de Safari
4. Appuyez sur **"Sur l'écran d'accueil"**
5. Appuyez sur **"Ajouter"**

### Sur PC / Mac (Chrome, Edge)
1. Ouvrez l'app dans le navigateur
2. Le modal d'installation apparaît
3. Ou cliquez l'icône **⊕** dans la barre d'adresse
4. L'app s'ouvre comme une application native

### Prérequis côté serveur
Pour que la PWA fonctionne, votre serveur doit :
- Servir l'app en **HTTPS** (obligatoire pour le Service Worker)
- Servir `/manifest.json` avec `Content-Type: application/manifest+json`
- Servir `/sw.js` avec `Content-Type: application/javascript`

Le fichier `next.config.ts` gère déjà ces headers automatiquement.
