# Crea la base de datos SmartDrain en MySQL local
# Uso: npm run db:setup
# Requiere: MySQL 8 en ejecución y MYSQL_ROOT_PASSWORD en .env.local

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Leer-Env($clave) {
  $archivo = Join-Path $root ".env.local"
  if (-not (Test-Path $archivo)) {
    $archivo = Join-Path $root ".env"
  }
  if (-not (Test-Path $archivo)) {
    Write-Host "No se encontró .env.local. Copia .env.example a .env.local primero." -ForegroundColor Red
    exit 1
  }
  foreach ($linea in Get-Content $archivo) {
    if ($linea -match "^\s*$clave\s*=\s*(.+)$") {
      return $Matches[1].Trim().Trim('"').Trim("'")
    }
  }
  return $null
}

$rootPass = Leer-Env "MYSQL_ROOT_PASSWORD"
if (-not $rootPass) {
  Write-Host "Define MYSQL_ROOT_PASSWORD en .env.local (contraseña de root de MySQL)." -ForegroundColor Yellow
  $rootPass = Read-Host "Contraseña root MySQL" -AsSecureString
  $rootPass = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($rootPass)
  )
}

$mysql = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
if (-not (Test-Path $mysql)) {
  $cmd = Get-Command mysql -ErrorAction SilentlyContinue
  if ($cmd) { $mysql = $cmd.Source } else { throw "No se encontró mysql.exe" }
}

$port = Leer-Env "DB_PORT"
if (-not $port) { $port = "3307" }

$schema = Join-Path $root "database\schema.sql"
Write-Host "Iniciando MySQL80 si está detenido..." -ForegroundColor Cyan
$svc = Get-Service MySQL80 -ErrorAction SilentlyContinue
if ($svc -and $svc.Status -ne "Running") {
  Start-Service MySQL80
  Start-Sleep -Seconds 4
}

Write-Host "Ejecutando schema.sql en puerto $port ..." -ForegroundColor Cyan
& $mysql -u root "-p$rootPass" -h 127.0.0.1 -P $port --default-character-set=utf8mb4 -e "source $($schema -replace '\\','/')"

if ($LASTEXITCODE -eq 0) {
  Write-Host "Base de datos 'smartdrain' lista." -ForegroundColor Green
  Write-Host "DBeaver: localhost:$port / BD smartdrain / usuario smartdrain" -ForegroundColor Green
} else {
  Write-Host ""
  Write-Host "1045 Access denied = wrong MYSQL_ROOT_PASSWORD for user root." -ForegroundColor Yellow
  Write-Host "Fix: PowerShell AS ADMIN -> npm run db:reset-root -> npm run db:setup" -ForegroundColor Yellow
  Write-Host "Error SQL. Puerto DB_PORT=$port." -ForegroundColor Red
  exit $LASTEXITCODE
}
