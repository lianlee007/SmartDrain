# Reset MySQL root password to MYSQL_ROOT_PASSWORD from .env.local
# Run PowerShell AS ADMINISTRATOR: npm run db:reset-root

#Requires -RunAsAdministrator

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Leer-Env($clave) {
  $archivo = Join-Path $root ".env.local"
  if (-not (Test-Path $archivo)) { throw "Missing .env.local" }
  foreach ($linea in Get-Content $archivo) {
    if ($linea -match "^\s*$clave\s*=\s*(.+)$") {
      return $Matches[1].Trim().Trim('"').Trim("'")
    }
  }
  return $null
}

$newPass = Leer-Env "MYSQL_ROOT_PASSWORD"
$port = Leer-Env "DB_PORT"
if (-not $port) { $port = "3307" }
if (-not $newPass) { throw "Set MYSQL_ROOT_PASSWORD in .env.local" }

$myIni = "C:\ProgramData\MySQL\MySQL Server 8.0\my.ini"
$initSql = "C:\ProgramData\MySQL\MySQL Server 8.0\smartdrain-init-root.sql"

if (-not (Test-Path $myIni)) { throw "my.ini not found" }

$escaped = $newPass -replace "'", "''"
$sql = "ALTER USER 'root'@'localhost' IDENTIFIED BY '$escaped';`nFLUSH PRIVILEGES;`n"
[System.IO.File]::WriteAllText($initSql, $sql)

Write-Host "Stopping MySQL80..." -ForegroundColor Cyan
Stop-Service MySQL80 -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

$iniContent = Get-Content $myIni -Raw
if ($iniContent -notmatch 'init_file\s*=') {
  $initPath = $initSql -replace '\\', '/'
  Add-Content $myIni "`r`n# SmartDrain temp init`r`ninit_file=$initPath`r`n"
  Write-Host "Added init_file to my.ini (temporary)" -ForegroundColor Yellow
}

Write-Host "Starting MySQL to apply new root password..." -ForegroundColor Cyan
Start-Service MySQL80
Start-Sleep -Seconds 6

Write-Host "Restarting MySQL without init_file..." -ForegroundColor Cyan
Stop-Service MySQL80 -Force
Start-Sleep -Seconds 2

$lines = Get-Content $myIni | Where-Object {
  $_ -notmatch 'smartdrain-init-root' -and $_ -notmatch 'init_file=' -and $_ -notmatch 'SmartDrain temp init'
}
Set-Content $myIni ($lines -join "`r`n") -Encoding ASCII
Remove-Item $initSql -Force -ErrorAction SilentlyContinue

Start-Service MySQL80
Start-Sleep -Seconds 3

$mysql = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$prevErr = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
& $mysql -u root "-p$newPass" -h 127.0.0.1 -P $port -e "SELECT 'root OK' AS estado;" 2>$null | Out-Host
$ok = $LASTEXITCODE -eq 0
$ErrorActionPreference = $prevErr
if ($ok) {
  Write-Host "Root password updated. Now run: npm run db:setup" -ForegroundColor Green
} else {
  Write-Host "Could not verify root. Try MySQL Installer or mysql -u root -p" -ForegroundColor Red
  exit 1
}
