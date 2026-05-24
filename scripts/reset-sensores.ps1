$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Leer-Env($clave) {
  $archivo = Join-Path $root ".env.local"
  foreach ($linea in Get-Content $archivo) {
    if ($linea -match "^\s*$clave\s*=\s*(.+)$") {
      return $Matches[1].Trim().Trim('"').Trim("'")
    }
  }
  return $null
}

$port = Leer-Env "DB_PORT"
if (-not $port) { $port = "3307" }
$rootPass = Leer-Env "MYSQL_ROOT_PASSWORD"
if (-not $rootPass) { throw "Set MYSQL_ROOT_PASSWORD in .env.local" }

$mysql = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$sql = Join-Path $root "database\reset-sensores.sql"
& $mysql -u root "-p$rootPass" -h 127.0.0.1 -P $port -e "source $($sql -replace '\\','/')"
if ($LASTEXITCODE -eq 0) {
  Write-Host "Sensores restablecidos a niveles normales." -ForegroundColor Green
}
