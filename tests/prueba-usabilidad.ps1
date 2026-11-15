<#
.SYNOPSIS
  Prueba de usabilidad con eye tracking (WebGazer.js) y Hotjar (Contentsquare) a la vez.

.DESCRIPTION
  1. Instala WebGazer.js si falta.
  2. Arranca el servidor local (python -m http.server) en la raíz del repositorio.
  3. Opcional: verifica que la etiqueta de Hotjar/Contentsquare se dispara (-VerificarHotjar).
  4. Abre la herramienta de eye tracking con el participante y la tarea ya rellenados.
     Las páginas del sitio cargan su etiqueta de Hotjar dentro de la herramienta, así que
     Hotjar graba la misma sesión que WebGazer. Cada sesión se marca con ?et=<marca>
     en la URL y con el evento "eyetracking:<marca>".
  5. Al terminar, mueve los .json y vídeos descargados a tests\usabilidad\eyetracking\
     e indica cómo encontrar cada sesión en Hotjar.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File tests\prueba-usabilidad.ps1 -Participante P01 -Tarea "T1 Encontrar el CV"

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File tests\prueba-usabilidad.ps1 -VerificarHotjar
#>
param(
  [string]$Participante = '',
  [string]$Tarea = '',
  [string]$Pagina = 'index.html',
  [int]$Puerto = 3000,
  [ValidateSet('chrome', 'edge')] [string]$Navegador = 'chrome',
  [switch]$VerificarHotjar
)

$ErrorActionPreference = 'Stop'
$Raiz = Split-Path $PSScriptRoot -Parent
$CarpetaET = Join-Path $PSScriptRoot 'eyetracking'
$Destino = Join-Path $PSScriptRoot 'usabilidad\eyetracking'
$WebGazerVersion = '3.5.3'
$TagId = 'f344c87191775'
$Inicio = Get-Date

function Write-Paso([string]$texto) { Write-Host "`n==> $texto" -ForegroundColor Cyan }

function Test-Url([string]$url) {
  try { Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3 | Out-Null; return $true } catch { return $false }
}

function Install-WebGazer {
  $destino = Join-Path $CarpetaET 'vendor\webgazer'
  if (Test-Path (Join-Path $destino 'webgazer.js')) {
    Write-Host "WebGazer ya instalado en $destino"
    return
  }
  if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { throw 'Hace falta Node.js (npm) para descargar WebGazer.' }
  $tmp = Join-Path ([IO.Path]::GetTempPath()) ("webgazer-" + [guid]::NewGuid())
  New-Item -ItemType Directory -Path $tmp | Out-Null
  try {
    Push-Location $tmp
    npm pack "webgazer@$WebGazerVersion" --silent | Out-Null
    tar -xzf "webgazer-$WebGazerVersion.tgz"
    if (-not (Test-Path 'package\dist\webgazer.js')) { throw 'La descarga de WebGazer ha fallado.' }
    New-Item -ItemType Directory -Force -Path $destino | Out-Null
    Copy-Item (Join-Path $tmp 'package\dist\webgazer.js') $destino
    Copy-Item (Join-Path $tmp 'package\dist\mediapipe') $destino -Recurse -Force
    Copy-Item (Join-Path $tmp 'package\LICENSE.md') $destino
    Set-Content -Path (Join-Path $destino 'VERSION') -Value $WebGazerVersion -Encoding ascii
    Write-Host "WebGazer $WebGazerVersion instalado en $destino"
  } finally {
    Pop-Location
    Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
  }
}

function Get-Navegador([string]$nombre) {
  $rutas = @{
    chrome = @("$env:ProgramFiles\Google\Chrome\Application\chrome.exe", "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe", "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe")
    edge   = @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe")
  }
  foreach ($r in $rutas[$nombre]) { if (Test-Path $r) { return $r } }
  return $null
}

function Get-CarpetaDescargas {
  $clave = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders'
  try {
    $valor = (Get-ItemProperty -Path $clave -Name '{374DE290-123F-4565-9164-39C4925E467B}').'{374DE290-123F-4565-9164-39C4925E467B}'
    return [Environment]::ExpandEnvironmentVariables($valor)
  } catch {
    return Join-Path $env:USERPROFILE 'Downloads'
  }
}

$servidor = $null
try {
  # ── 1. Sitio en local ─────────────────────────────────────────────────
  Write-Paso 'Comprobando WebGazer'
  Install-WebGazer

  Write-Paso "Servidor local en el puerto $Puerto"
  # La cámara solo se permite en https o en localhost: hay que abrir http://localhost, no 127.0.0.1 ni file://.
  $base = "http://localhost:$Puerto/"
  if (Test-Url $base) {
    Write-Host "Ya hay un servidor respondiendo en $base; se reutiliza."
  } else {
    if (-not (Get-Command python -ErrorAction SilentlyContinue)) { throw 'Hace falta Python para el servidor local.' }
    $servidor = Start-Process python -ArgumentList '-m', 'http.server', $Puerto `
      -WorkingDirectory $Raiz -WindowStyle Hidden -PassThru
    $listo = $false
    for ($i = 0; $i -lt 20 -and -not $listo; $i++) { Start-Sleep -Milliseconds 500; $listo = Test-Url $base }
    if (-not $listo) { throw "El servidor no responde en $base (¿puerto $Puerto ocupado?). Prueba con -Puerto 3001." }
    Write-Host "Servidor arrancado (PID $($servidor.Id))."
  }
  if (-not (Test-Url ($base + 'tests/eyetracking/'))) { throw "No se sirve la herramienta en ${base}tests/eyetracking/" }

  # ── 2. Hotjar ─────────────────────────────────────────────────────────
  if ($VerificarHotjar) {
    Write-Paso 'Verificando la etiqueta de Hotjar/Contentsquare'
    npx --yes '@contentsquare/wizard@2' verify --url $base --tag-id $TagId --json
  }

  # ── 3. Herramienta ────────────────────────────────────────────────────
  if (-not $Participante) { $Participante = Read-Host 'Participante (p. ej. P01)' }
  if (-not $Tarea) { $Tarea = Read-Host 'Tarea (p. ej. T1 Encontrar el CV)' }

  $query = 'participante=' + [uri]::EscapeDataString($Participante) +
           '&tarea=' + [uri]::EscapeDataString($Tarea) +
           '&pagina=' + [uri]::EscapeDataString($Pagina)
  $url = $base + 'tests/eyetracking/?' + $query

  Write-Paso 'Abriendo la herramienta'
  $exe = Get-Navegador $Navegador
  if ($exe) {
    Start-Process $exe -ArgumentList '--new-window', "`"$url`""
  } else {
    Write-Host "No encuentro $Navegador; se abre el navegador por defecto." -ForegroundColor Yellow
    Start-Process $url
  }
  Write-Host $url
  Write-Host @"

  1. Pulsa F11 (pantalla completa) y comprueba que el zoom está al 100 %.
  2. Activa la cámara, calibra y pasa la prueba de precisión.
  3. Inicia la sesión y elige «Esta pestaña» al compartir.
  4. Esc termina la tarea. «Otra tarea» repite sin recalibrar.
"@

  Read-Host "`nPulsa Enter aquí cuando hayas terminado TODAS las tareas"

  # ── 4. Recoger resultados ─────────────────────────────────────────────
  Write-Paso "Moviendo los resultados a $Destino"
  New-Item -ItemType Directory -Force -Path $Destino | Out-Null
  $descargas = Get-CarpetaDescargas
  $archivos = Get-ChildItem -Path $descargas -File -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -match '^et-.+\.(json|mp4|webm)$' -and $_.LastWriteTime -ge $Inicio.AddMinutes(-1) }

  if (-not $archivos) {
    Write-Host "No hay archivos et-* nuevos en $descargas." -ForegroundColor Yellow
  } else {
    foreach ($f in $archivos) {
      Move-Item -Path $f.FullName -Destination (Join-Path $Destino $f.Name) -Force
      Write-Host "  $($f.Name)"
    }
  }

  # ── 5. Cruce con Hotjar ───────────────────────────────────────────────
  $sesiones = Get-ChildItem -Path $Destino -Filter 'et-*.json' |
    Where-Object { $_.LastWriteTime -ge $Inicio.AddMinutes(-1) }
  if ($sesiones) {
    Write-Paso 'Cómo encontrar estas sesiones en Hotjar (Recordings / Session Replay)'
    foreach ($s in $sesiones) {
      $d = Get-Content $s.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
      $hora = ([datetime]$d.inicio).ToLocalTime().ToString('yyyy-MM-dd HH:mm')
      $seg = [math]::Round($d.duracionMs / 1000)
      Write-Host "  $($d.marca)  ·  $hora  ·  $seg s  ·  precisión $($d.precision.pct) %"
      Write-Host "     filtro: URL contiene 'et=$($d.marca)'  o  evento 'eyetracking:$($d.marca)'"
    }
    Write-Host "`nMapas de calor de la mirada: abre la herramienta > «Analizar sesiones grabadas» y carga los .json."
  }
} finally {
  if ($servidor -and -not $servidor.HasExited) {
    Stop-Process -Id $servidor.Id -Force
    Write-Host "`nServidor local detenido."
  }
}
