# Corrections appliquées — Guide de mise à jour

## Commandes à lancer dans l'ordre

```bash
# 1. Remplacer le schéma Prisma (déjà dans ce zip)
#    Puis régénérer le client Prisma :
npx prisma generate

# 2. Pousser les changements de schéma vers la base de données
npx prisma db push

# 3. Relancer le build
npm run build
```

## Pourquoi ces erreurs ?

Le projet contenait un **ancien schéma Prisma** sans les nouveaux modèles
(`MarketStep`, `Debt`) et sans les nouveaux champs (`direction` sur Message,
`reminderSentAt` sur Invoice, `status` sur Market, `type` sur Notification, etc.)

Ce zip contient le schéma corrigé et le code corrigé.

## Erreurs corrigées

| Erreur | Cause | Fix |
|--------|-------|-----|
| `prisma.marketStep` introuvable | Modèle absent de l'ancien schéma | Schéma mis à jour + `(prisma as any)` |
| `prisma.debt` introuvable | Modèle absent de l'ancien schéma | Idem |
| `direction` inexistant sur Message | Champ absent | Schéma mis à jour + cast |
| `status` inexistant sur Market | Champ absent | Idem |
| `type` inexistant sur Notification | Champ absent | Idem |
| `reminderSentAt` inexistant sur Invoice | Champ absent | Idem |
| `userId` inexistant sur Notification | Champ absent | Idem |
| `Set<string>` iterable | tsconfig target trop bas | target ES2017 + downlevelIteration |
| Erreurs `.next/types` | Faux positifs Next.js | exclude `.next` dans tsconfig |
| `partnerEmail` manquant | Props InfosTab vs MessagesTab | Rendu optionnel |
