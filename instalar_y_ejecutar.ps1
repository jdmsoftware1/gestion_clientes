# Script de instalación y ejecución automática - Gestión de Clientes
# Ejecutar como Administrador si es necesario

Write-Host "🚀 Instalación y ejecución automática del proyecto Gestión de Clientes..." -ForegroundColor Green
Write-Host "====================================================================" -ForegroundColor Yellow

# Función para verificar si un comando existe
function Test-CommandExists {
    param($command)
    $oldPreference = $ErrorActionPreference
    $ErrorActionPreference = 'stop'
    try {
        if (Get-Command $command) { return $true }
    } catch {
        return $false
    } finally {
        $ErrorActionPreference = $oldPreference
    }
}

# Función para actualizar el repositorio
function Update-Repository {
    Write-Host "`n🔄 Verificando actualizaciones del repositorio..." -ForegroundColor Cyan

    # Verificar si es un repositorio git
    if (-not (Test-Path "$PSScriptRoot\.git")) {
        Write-Host "⚠️ No es un repositorio git. Saltando actualización." -ForegroundColor Yellow
        return
    }

    # Verificar si git está disponible
    if (-not (Test-CommandExists git)) {
        Write-Host "⚠️ Git no está instalado. Saltando actualización." -ForegroundColor Yellow
        return
    }

    try {
        # Obtener el estado actual
        $currentBranch = git branch --show-current
        Write-Host "Rama actual: $currentBranch" -ForegroundColor Gray

        # Hacer fetch para obtener los últimos cambios
        Write-Host "Descargando últimas actualizaciones..." -ForegroundColor Gray
        git fetch origin --quiet

        # Verificar si hay cambios en origin/main
        $localCommit = git rev-parse HEAD
        $remoteCommit = git rev-parse origin/main 2>$null

        if ($LASTEXITCODE -eq 0 -and $localCommit -ne $remoteCommit) {
            Write-Host "📦 Hay actualizaciones disponibles. Aplicando..." -ForegroundColor Yellow

            # Verificar si hay cambios locales no commiteados
            $status = git status --porcelain
            if ($status) {
                Write-Host "⚠️ Hay cambios locales no guardados. Creando backup..." -ForegroundColor Yellow
                Write-Host "Guardando cambios locales..." -ForegroundColor Gray
                git stash push -m "Auto-backup before update $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" --quiet
                $stashed = $true
            }

            # Actualizar a la última versión de main
            git reset --hard origin/main --quiet
            git clean -fd --quiet

            Write-Host "✅ Repositorio actualizado correctamente" -ForegroundColor Green

            if ($stashed) {
                Write-Host "💡 Tus cambios locales fueron guardados. Puedes recuperarlos con 'git stash pop'" -ForegroundColor Cyan
            }

            # Reiniciar el script con la nueva versión
            Write-Host "`n🔄 Reiniciando script con la nueva versión..." -ForegroundColor Yellow
            Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -File `"$PSCommandPath`"" -NoNewWindow
            exit 0

        } else {
            Write-Host "✅ El repositorio ya está actualizado" -ForegroundColor Green
        }

    } catch {
        Write-Host "⚠️ Error verificando actualizaciones: $_" -ForegroundColor Yellow
        Write-Host "Continuando con la versión actual..." -ForegroundColor Gray
    }
}

# Ejecutar actualización del repositorio
Update-Repository

# 1. Verificar e instalar Node.js
Write-Host "`n📦 Verificando Node.js..." -ForegroundColor Cyan
if (Test-CommandExists node) {
    $nodeVersion = node --version
    Write-Host "✅ Node.js ya está instalado: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js no está instalado. Instalando..." -ForegroundColor Yellow

    # Instalar usando winget
    if (Test-CommandExists winget) {
        Write-Host "Instalando Node.js con winget..." -ForegroundColor Cyan
        winget install OpenJS.NodeJS
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Error instalando Node.js con winget" -ForegroundColor Red
            Write-Host "Descarga e instala Node.js manualmente desde https://nodejs.org" -ForegroundColor Yellow
            exit 1
        }
        # Recargar PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    } else {
        Write-Host "❌ winget no está disponible" -ForegroundColor Red
        Write-Host "Instala Node.js manualmente desde https://nodejs.org" -ForegroundColor Yellow
        exit 1
    }

    # Verificar instalación
    if (Test-CommandExists node) {
        $nodeVersion = node --version
        Write-Host "✅ Node.js instalado correctamente: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Error: Node.js no se instaló correctamente" -ForegroundColor Red
        exit 1
    }
}

# Verificar npm
if (-not (Test-CommandExists npm)) {
    Write-Host "❌ npm no está disponible" -ForegroundColor Red
    exit 1
}

# 2. Instalar dependencias del backend
Write-Host "`n📦 Instalando dependencias del backend..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\backend"
try {
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "Error instalando dependencias del backend"
    }
    Write-Host "✅ Dependencias del backend instaladas" -ForegroundColor Green
} catch {
    Write-Host "❌ Error instalando dependencias del backend: $_" -ForegroundColor Red
    exit 1
}

# 3. Instalar dependencias del frontend
Write-Host "`n📦 Instalando dependencias del frontend..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\frontend"
try {
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "Error instalando dependencias del frontend"
    }
    Write-Host "✅ Dependencias del frontend instaladas" -ForegroundColor Green
} catch {
    Write-Host "❌ Error instalando dependencias del frontend: $_" -ForegroundColor Red
    exit 1
}

# 4. Iniciar backend
Write-Host "`n🔧 Iniciando backend..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\backend"
Start-Process powershell -ArgumentList "-Command npm start" -NoNewWindow

# Esperar a que el backend esté listo
Write-Host "⏳ Esperando que el backend inicie (puerto 5000)..." -ForegroundColor Yellow
$attempts = 0
do {
    Start-Sleep -Seconds 2
    $attempts++
    if ($attempts -gt 15) {
        Write-Host "❌ El backend no pudo iniciar correctamente" -ForegroundColor Red
        exit 1
    }
} while (-not (Test-NetConnection -ComputerName localhost -Port 5000 -WarningAction SilentlyContinue).TcpTestSucceeded)

Write-Host "✅ Backend ejecutándose en puerto 5000" -ForegroundColor Green

# 5. Iniciar frontend
Write-Host "`n🌐 Iniciando frontend..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\frontend"
Start-Process powershell -ArgumentList "-Command npm run dev" -NoNewWindow

# Esperar a que el frontend esté listo
Write-Host "⏳ Esperando que el frontend inicie (puerto 5173)..." -ForegroundColor Yellow
$attempts = 0
do {
    Start-Sleep -Seconds 3
    $attempts++
    if ($attempts -gt 10) {
        Write-Host "❌ El frontend no pudo iniciar correctamente" -ForegroundColor Red
        exit 1
    }
} while (-not (Test-NetConnection -ComputerName localhost -Port 5173 -WarningAction SilentlyContinue).TcpTestSucceeded)

Write-Host "`n🎉 ¡APLICACIÓN DECORACIONES ANGEL E HIJAS COMPLETA INICIADA!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Yellow
Write-Host "🌐 Frontend disponible en: http://localhost:5173" -ForegroundColor White
Write-Host "🔧 Backend API disponible en: http://localhost:5000" -ForegroundColor White
Write-Host "===============================================" -ForegroundColor Yellow
Write-Host "ℹ️  Los servicios están ejecutándose en segundo plano" -ForegroundColor Gray
Write-Host "ℹ️  Para detener, cierra las ventanas de PowerShell que se abrieron" -ForegroundColor Gray
Write-Host "===============================================" -ForegroundColor Yellow

# Mantener el script abierto para que no se cierre automáticamente
Read-Host "`nPresiona Enter para cerrar este script (los servicios seguirán ejecutándose)"
