# ============================
# AUTOFLEX ORACLE BUILD
# ============================

$HostName = "localhost"
$Port = "1521"
$Service = "XE"

Write-Host "=== Criando banco Autoflex ==="

# pedir credenciais SYSTEM
$User = Read-Host "Usuario Oracle (SYSTEM)"
$Pass = Read-Host "Senha" -AsSecureString
$PassPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Pass)
)

$Conn = "$User/$PassPlain@//$HostName`:$Port/$Service"

$Setup = Join-Path $PSScriptRoot "setup.sql"
$Schema = Join-Path $PSScriptRoot "schema.sql"

Write-Host "Criando usuario..."

sqlplus -S $Conn @$Setup

Write-Host "Criando tabelas..."

sqlplus -S autoflex/autoflex@//$HostName`:$Port/$Service @$Schema

Write-Host ""
Write-Host "✅ Banco Autoflex pronto!"