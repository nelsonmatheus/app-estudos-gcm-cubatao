# Configura o lembrete diario (notificacoes) no Supabase. Rode na pasta do projeto:
#   powershell -ExecutionPolicy Bypass -File .\configurar-notificacoes.ps1
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
$ref = "rueeyibvueukgsvfttmn"
$pub = "BIMlivFPUSFT94dQNyMxB-1kbCZQMbXYpKzH6pRiwCHnXkvIGCODjmRgLRKE_a1XX2r-cI5wMfuU_O1cBV2Nscc"

function Passo($n, $t) { Write-Host ""; Write-Host "== PASSO $n · $t ==" -ForegroundColor Yellow }
function Rodar($cmd) { Write-Host "> $cmd" -ForegroundColor DarkGray; cmd /c $cmd; if ($LASTEXITCODE -ne 0) { throw "Falhou: $cmd" } }

Passo 1 "Criar a tabela"
Get-Content -Raw -Encoding UTF8 "supabase\migrations\20261105000000_push_subscriptions.sql" | Set-Clipboard
Write-Host "Copiei o SQL da tabela. No Supabase: SQL Editor > New query > Ctrl+V > Run."
Read-Host "Quando aparecer 'Success', aperte Enter"

Passo 2 "Entrar no Supabase (abre o navegador)"
Rodar "npx -y supabase@latest login"
Rodar "npx -y supabase@latest link --project-ref $ref"

Passo 3 "Guardar as chaves no Supabase"
$priv = Read-Host "Cole a Private Key (a do 'npx web-push generate-vapid-keys')"
$mail = Read-Host "Seu e-mail (vai como contato do remetente)"
$segredo = [guid]::NewGuid().ToString("N")
Set-Content -Encoding UTF8 "supabase\.segredo-local.txt" $segredo
Rodar "npx -y supabase@latest secrets set VAPID_PUBLIC_KEY=$pub VAPID_PRIVATE_KEY=$priv VAPID_SUBJECT=mailto:$mail CRON_SECRET=$segredo ALLOWED_ORIGINS=https://nelsonmatheus.github.io"

Passo 4 "Publicar as funcoes"
Rodar "npx -y supabase@latest functions deploy push-subscribe --no-verify-jwt --project-ref $ref"
Rodar "npx -y supabase@latest functions deploy push-send --no-verify-jwt --project-ref $ref"

Passo 5 "Agendar o envio de hora em hora"
(Get-Content -Raw -Encoding UTF8 "supabase\cron.sql").Replace("SEU_SEGREDO", $segredo) | Set-Clipboard
Write-Host "Copiei o SQL do agendamento (ja com o segredo). No SQL Editor: New query > Ctrl+V > Run."
Read-Host "Quando aparecer 'Success', aperte Enter"

Passo 6 "Conferir"
$r = Invoke-RestMethod -Method Post -Uri "https://$ref.supabase.co/functions/v1/push-send" -Headers @{ "x-cron-secret" = $segredo } -ContentType "application/json" -Body '{}'
Write-Host "Servidor respondeu: enviados=$($r.sent) pulados=$($r.skipped) removidos=$($r.removed)" -ForegroundColor Green
Write-Host "Pronto! Avise o Claude para publicar o app com o lembrete ligado." -ForegroundColor Green
