# ========================================
# SCRIPT POUR CRÉER UN UTILISATEUR SUPABASE (POWERSHELL)
# ========================================
# Usage: .\create-user.ps1 <email> <mot_de_passe>
# Exemple: .\create-user.ps1 test@example.com motdepasse123

param(
    [Parameter(Mandatory=$true)]
    [string]$Email,

    [Parameter(Mandatory=$true)]
    [SecureString]$Password
)

Write-Host "=> Création de l'utilisateur Supabase..." -ForegroundColor Cyan
Write-Host "-> Email: $Email" -ForegroundColor Yellow
Write-Host "-> Mot de passe: [masqué]" -ForegroundColor Yellow

# Convertir le mot de passe sécurisé en chaîne pour utilisation
$plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($Password))

# Vérifier si Supabase CLI est installé
try {
    supabase --version >$null 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Supabase CLI trouvée" -ForegroundColor Green
    }
    else {
        throw "Supabase CLI non trouvée"
    }
}
catch {
    Write-Host ""
    Write-Host "[ERREUR] Supabase CLI n'est pas installée" -ForegroundColor Red
    Write-Host ""
    Write-Host "[INFO] Installation de Supabase CLI :" -ForegroundColor Yellow
    Write-Host "   npm install -g supabase" -ForegroundColor Gray
    Write-Host "   ou" -ForegroundColor Gray
    Write-Host "   yarn global add supabase" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Puis réessayez : .\create-user.ps1 $Email $plainPassword" -ForegroundColor Yellow
    exit 1
}

# Demander le Project URL
Write-Host ""
Write-Host "[CONFIG] Configuration du projet :" -ForegroundColor Cyan
$projectUrl = Read-Host "Entrez votre Project URL (ex: https://abcdefgh1234.supabase.co): "

if ([string]::IsNullOrEmpty($projectUrl)) {
    Write-Host "[ERREUR] L'URL du projet ne peut pas être vide" -ForegroundColor Red
    exit 1
}

# Nettoyer l'URL pour extraire le project ID
$projectId = $projectUrl -replace "https://", "" -replace ".supabase.co", ""

Write-Host ""
Write-Host "[CONFIG] Configuration :" -ForegroundColor Cyan
Write-Host "   Project ID: $projectId" -ForegroundColor Gray
Write-Host "   Email: $Email" -ForegroundColor Gray
Write-Host "   Mot de passe: [masqué]" -ForegroundColor Gray

# Vérifier si le fichier .env.local existe
$envFile = ".env.local"
if (Test-Path $envFile) {
    Write-Host ""
    Write-Host "[OK] Fichier $envFile trouvé" -ForegroundColor Green
    Write-Host ""

    $updateEnv = Read-Host "Voulez-vous mettre à jour le projet dans $envFile ? (y/N): "

    if ($updateEnv -match '^[Yy]$') {
        # Mettre à jour le projet dans .env.local
        (Get-Content $envFile) -replace "VITE_SUPABASE_URL=.*", "VITE_SUPABASE_URL=$projectUrl" | Set-Content $envFile
        Write-Host "[OK] $envFile mis à jour" -ForegroundColor Green
    }
}
else {
    Write-Host ""
    Write-Host "[ATTENTION] Fichier $envFile non trouvé" -ForegroundColor Yellow
    Write-Host "Création du fichier $envFile..."

    # Créer le fichier .env.local
    @"
# Configuration Supabase pour le stockage des vidéos
# Remplacez ces valeurs par vos vraies clés Supabase
# Activer l'utilisation de Supabase (true/false)
VITE_USE_SUPABASE=true

# URL de votre projet Supabase
VITE_SUPABASE_URL=$projectUrl

# Clé anonyme de votre projet Supabase
# Trouvable dans Settings > API de votre dashboard Supabase
VITE_SUPABASE_ANON_KEY=

"@ | Out-File -FilePath $envFile -Encoding UTF8

    Write-Host "[OK] $envFile créé" -ForegroundColor Green
    Write-Host "[ATTENTION] Ajoutez votre clé ANON_KEY dans $envFile" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[AUTH] Tentative de création de l'utilisateur '$Email'..." -ForegroundColor Cyan

# Utiliser Invoke-RestMethod pour appeler l'API Supabase
try {
    $headers = @{
        "Content-Type" = "application/json"
    }

    $body = @{
        email    = $Email
        password = $plainPassword
    } | ConvertTo-Json -Depth 3

    $response = Invoke-RestMethod -Uri "$projectUrl/auth/v1/signup" -Method Post -Headers $headers -Body $body

    if ($response.StatusCode -eq 200) {
        Write-Host ""
        Write-Host "[OK] Utilisateur créé avec succès !" -ForegroundColor Green
        Write-Host ""
        Write-Host "[ETAPES] Prochaines étapes :" -ForegroundColor Cyan
        Write-Host "   1. Connectez-vous depuis l'application :" -ForegroundColor Gray
        Write-Host "      http://localhost:8081/auth" -ForegroundColor Blue
        Write-Host "   2. Ou utilisez l'utilisateur :" -ForegroundColor Gray
        Write-Host "      Email: $Email" -ForegroundColor Gray
        Write-Host "      Mot de passe: [masqué]" -ForegroundColor Gray
        Write-Host ""
        Write-Host "[EMAIL] Vérifiez votre email si la confirmation est requise" -ForegroundColor Yellow

        # Demander si on veut confirmer l'email manuellement
        Write-Host ""
        $confirmEmail = Read-Host "Voulez-vous confirmer l'email manuellement ? (y/N): "

        if ($confirmEmail -match '^[Yy]$') {
            Write-Host ""
            Write-Host "[EMAIL] Pour confirmer manuellement l'utilisateur :" -ForegroundColor Yellow
            Write-Host "   1. Allez dans votre dashboard Supabase" -ForegroundColor Gray
            Write-Host "   2. Authentication > Users" -ForegroundColor Gray
            Write-Host "   3. Trouvez l'utilisateur '$Email'" -ForegroundColor Gray
            Write-Host "   4. Cliquez sur 'Confirm email'" -ForegroundColor Gray
        }
    }
    else {
        Write-Host ""
        Write-Host "[ERREUR] Erreur lors de la création de l'utilisateur" -ForegroundColor Red
        Write-Host ""
        Write-Host "[API] Réponse API :" -ForegroundColor Yellow
        Write-Host "Status: $($response.StatusCode)" -ForegroundColor Red

        try {
            $responseContent = $response.Content | ConvertFrom-Json
            Write-Host "Détails: $($responseContent.message)" -ForegroundColor Red
        }
        catch {
            Write-Host "Réponse brute: $($response.Content)" -ForegroundColor Gray
        }

        Write-Host ""
        Write-Host "[DEBUG] Causes possibles :" -ForegroundColor Yellow
        Write-Host "   • Mauvais Project ID" -ForegroundColor Gray
        Write-Host "   • Email déjà existant" -ForegroundColor Gray
        Write-Host "   • Projet Supabase configuré avec restrictions" -ForegroundColor Gray
        Write-Host ""
        Write-Host "[SOLUTIONS] Solutions :" -ForegroundColor Cyan
        Write-Host "   1. Vérifiez votre Project URL dans le dashboard Supabase" -ForegroundColor Gray
        Write-Host "   2. Essayez avec un autre email" -ForegroundColor Gray
        Write-Host "   3. Vérifiez que l'authentification email est activée" -ForegroundColor Gray
    }
}
catch {
    Write-Host ""
    Write-Host "[ERREUR] Erreur réseau ou connexion" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "[FIN] Script terminé !" -ForegroundColor Green
