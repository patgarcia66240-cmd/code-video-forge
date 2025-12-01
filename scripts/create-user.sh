#!/bin/bash

# ========================================
# SCRIPT POUR CRÉER UN UTILISATEUR SUPABASE
# ========================================
# Usage: ./create-user.sh <email> <mot_de_passe>
# Exemple: ./create-user.sh test@example.com motdepasse123

set -e

# Vérifier les arguments
if [ "$#" -ne 2 ]; then
    echo "❌ Usage: $0 <email> <mot_de_passe>"
    echo "Exemple: $0 test@example.com motdepasse123"
    exit 1
fi

EMAIL=$1
PASSWORD=$2

echo "🚀 Création de l'utilisateur Supabase..."
echo "📧 Email: $EMAIL"
echo "🔑 Mot de passe: [masqué]"

# Couleurs pour le output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier si Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo ""
    echo "❌ Supabase CLI n'est pas installée"
    echo ""
    echo "📦 Installation de Supabase CLI :"
    echo "   npm install -g supabase"
    echo "   ou"
    echo "   yarn global add supabase"
    echo ""
    echo "Puis réessayez : $0 $EMAIL $PASSWORD"
    exit 1
fi

echo ""
echo "✅ Supabase CLI trouvée"

# Demander le project ID
echo ""
echo "🔍 Configuration du projet :"
read -p "Entrez votre Project URL (ex: https://abcdefgh1234.supabase.co): " PROJECT_URL

if [ -z "$PROJECT_URL" ]; then
    echo "❌ L'URL du projet ne peut pas être vide"
    exit 1
fi

# Nettoyer l'URL pour extraire le project ID
PROJECT_ID=$(echo "$PROJECT_URL" | sed 's/https:\/\///g' | sed 's/\.supabase\.co//g')

echo ""
echo "📋 Configuration :"
echo "   Project ID: $PROJECT_ID"
echo "   Email: $EMAIL"
echo "   Mot de passe: [masqué]"

# Vérifier si le fichier .env.local existe
ENV_FILE=".env.local"
if [ -f "$ENV_FILE" ]; then
    echo ""
    echo "📄 Fichier $ENV_FILE trouvé"
    echo ""
    read -p "Voulez-vous mettre à jour le projet dans $ENV_FILE ? (y/N): " UPDATE_ENV

    if [[ "$UPDATE_ENV" =~ ^[Yy]$ ]]; then
        # Mettre à jour le projet dans .env.local
        sed -i "s|VITE_SUPABASE_URL=.*|VITE_SUPABASE_URL=$PROJECT_URL|g" "$ENV_FILE"
        echo "✅ $ENV_FILE mis à jour"
    fi
else
    echo ""
    echo "⚠️  Fichier $ENV_FILE non trouvé"
    echo "Création du fichier $ENV_FILE..."

    # Créer le fichier .env.local
    cat > "$ENV_FILE" << EOF
# Configuration Supabase
VITE_SUPABASE_URL=$PROJECT_URL
VITE_SUPABASE_ANON_KEY=
VITE_USE_SUPABASE=true
EOF
    echo "✅ $ENV_FILE créé"
    echo "⚠️  Ajoutez votre clé ANON_KEY dans $ENV_FILE"
fi

echo ""
echo "🔑 Tentative de connexion au projet Supabase..."
echo "   Project ID: $PROJECT_ID"

# Tenter de créer l'utilisateur
echo ""
echo "👤 Création de l'utilisateur '$EMAIL'..."

# Utiliser curl pour appeler l'API Supabase
response=$(curl -s -X POST "$PROJECT_URL/auth/v1/signup" \
  -H "apikey: $(grep VITE_SUPABASE_ANON_KEY .env.local 2>/dev/null || echo '')" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

# Vérifier la réponse
if echo "$response" | grep -q "id"; then
    echo ""
    echo "✅ Utilisateur créé avec succès !"
    echo ""
    echo "🎯 Prochaines étapes :"
    echo "   1. Connectez-vous depuis l'application :"
    echo "      http://localhost:8081/auth"
    echo "   2. Ou utilisez l'utilisateur :"
    echo "      Email: $EMAIL"
    echo "      Mot de passe: $PASSWORD"
    echo ""
    echo "📧 Vérifiez votre email si la confirmation est requise"

    # Essayer de confirmer l'email automatiquement (optionnel)
    echo ""
    read -p "Voulez-vous confirmer l'email manuellement ? (y/N): " CONFIRM_EMAIL

    if [[ "$CONFIRM_EMAIL" =~ ^[Yy]$ ]]; then
        echo ""
        echo "📧 Pour confirmer manuellement l'utilisateur :"
        echo "   1. Allez dans votre dashboard Supabase"
        echo "   2. Authentication > Users"
        echo "   3. Trouvez l'utilisateur '$EMAIL'"
        echo "   4. Cliquez sur 'Confirm email'"
    fi
else
    echo ""
    echo "❌ Erreur lors de la création de l'utilisateur"
    echo ""
    echo "📋 Réponse API :"
    echo "$response"
    echo ""
    echo "🔍 Causes possibles :"
    echo "   • Mauvais Project ID"
    echo "   • Email déjà existant"
    echo "   • Projet Supabase configuré avec restrictions"
    echo ""
    echo "💡 Solutions :"
    echo "   1. Vérifiez votre Project URL dans le dashboard Supabase"
    echo "   2. Essayez avec un autre email"
    echo "   3. Vérifiez que l'authentification email est activée"
fi

echo ""
echo "🎉 Script terminé !"