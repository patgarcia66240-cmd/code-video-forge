# ========================================
# SCRIPT D'INSTALLATION SUPABASE CLI (POWERSHELL)
# ========================================

Write-Host "[INFO] Installation de Supabase CLI..." -ForegroundColor Cyan

# Définir le répertoire d'installation
$installDir = "$env:USERPROFILE\bin"
$exePath = "$installDir\supabase.exe"

# Créer le répertoire bin s'il n'existe pas
if (-not (Test-Path $installDir)) {
    New-Item -ItemType Directory -Path $installDir -Force | Out-Null
    Write-Host "[OK] Répertoire $installDir créé" -ForegroundColor Green
}

# URL de téléchargement pour Windows
$downloadUrl = "https://github.com/supabase/cli/releases/latest/download/supabase_windows_amd64.exe"

try {
    Write-Host "[INFO] Téléchargement de Supabase CLI..." -ForegroundColor Yellow
    Write-Host "       URL: $downloadUrl" -ForegroundColor Gray

    # Télécharger le fichier
    Invoke-WebRequest -Uri $downloadUrl -OutFile $exePath -UseBasicParsing

    if (Test-Path $exePath) {
        Write-Host "[OK] Supabase CLI téléchargé avec succès" -ForegroundColor Green
        Write-Host "       Emplacement: $exePath" -ForegroundColor Gray

        # Vérifier que l'exécutable fonctionne
        $version = & $exePath --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] Supabase CLI fonctionne correctement" -ForegroundColor Green
            Write-Host "       Version: $version" -ForegroundColor Gray
        } else {
            Write-Host "[ERREUR] Supabase CLI ne fonctionne pas correctement" -ForegroundColor Red
        }

        # Ajouter au PATH si nécessaire
        $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
        if ($currentPath -notlike "*$installDir*") {
            Write-Host "[INFO] Ajout de $installDir au PATH utilisateur..." -ForegroundColor Yellow
            $newPath = $currentPath + ";$installDir"
            [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
            Write-Host "[OK] Ajouté au PATH utilisateur" -ForegroundColor Green
            Write-Host "[ATTENTION] Redémarrez votre terminal pour que les changements prennent effet" -ForegroundColor Yellow
        } else {
            Write-Host "[OK] $installDir est déjà dans le PATH" -ForegroundColor Green
        }

    } else {
        Write-Host "[ERREUR] Le téléchargement a échoué" -ForegroundColor Red
        exit 1
    }

} catch {
    Write-Host "[ERREUR] Erreur lors du téléchargement: $($_.Exception.Message)" -ForegroundColor Red

    # Alternative: suggestion d'installation manuelle
    Write-Host ""
    Write-Host "[SOLUTIONS] Installation manuelle alternative :" -ForegroundColor Cyan
    Write-Host "1. Allez sur https://github.com/supabase/cli/releases" -ForegroundColor Gray
    Write-Host "2. Téléchargez 'supabase_windows_amd64.exe'" -ForegroundColor Gray
    Write-Host "3. Renommez-le en 'supabase.exe'" -ForegroundColor Gray
    Write-Host "4. Placez-le dans un dossier de votre PATH (ex: C:\Windows\System32)" -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "[FIN] Installation terminée !" -ForegroundColor Green
Write-Host "[INFO] Vous pouvez maintenant utiliser 'supabase --version'" -ForegroundColor Cyan