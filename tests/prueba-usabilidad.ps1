<#
.SYNOPSIS
  Prueba de usabilidad en local con eye tracking (WebGazer.js) y Hotjar (Contentsquare) a la vez.

.DESCRIPTION
  1. Instala WebGazer.js si falta.
  2. Arranca tests\eyetracking\servidor.py: sirve el sitio en http://localhost:<puerto>/ y
     guarda cada sesión (.json + vídeo) directamente en tests\usabilidad\eyetracking\.
  3. Opcional: verifica que la etiqueta de Hotjar/Contentsquare se dispara (-VerificarHotjar).
  4. Abre la herramienta de eye tracking con el participante y la tarea ya rellenados.
     Las páginas del sitio cargan su etiqueta de Hotjar dentro de la herramienta, así que
     Hotjar graba la misma visita (clics, scroll) que WebGazer (mirada). Cada sesión se
     marca con ?et=<marca> en la URL y con el evento "eyetracking:<marca>".
  5. Al terminar, abre la página de análisis (mapas de calor) e indica cómo encontrar
     cada sesión en Hotjar. El servidor sigue activo hasta que pulses Enter.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File tests\prueba-usabilidad.ps1 -Participante P01 -Tarea "T1 Encontrar el CV"

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File tests\prueba-usabilidad.ps1 -SoloAnalisis
#>
param(
  [string]$Participante = '',
  [string]$Tarea = '',
  [string]$Pagina = 'index.html',
  [int]$Puerto = 3000,
  [ValidateSet('chrome', 'edge')] [string]$Navegador = 'chrome',
  [switch]$VerificarHotjar,
  [switch]$SoloAnalisis
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

# Busca el navegador en las rutas habituales y en el registro (App Paths), que
# también cubre instalaciones por usuario o en otras unidades.
function Get-Navegador([string]$nombre) {
  $exe = @{ chrome = 'chrome.exe'; edge = 'msedge.exe' }[$nombre]
  $rutas = @{
    chrome = @("$env:ProgramFiles\Google\Chrome\Application\chrome.exe", "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe", "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe")
    edge   = @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe")
  }[$nombre]
  foreach ($r in $rutas) { if ($r -and (Test-Path $r)) { return $r } }
  foreach ($hive in 'HKCU:', 'HKLM:') {
    $clave = "$hive\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\$exe"
    try {
      $r = (Get-ItemProperty -Path $clave -ErrorAction Stop).'(default)'
      if ($r) { $r = $r.Trim('"') }
      if ($r -and (Test-Path $r)) { return $r }
    } catch { }
  }
  return $null
}

# Abre la URL en el navegador pedido; si no está, en el otro (Chrome/Edge) y si no, en el predeterminado.
function Open-Url([string]$url) {
  $orden = @($Navegador) + (@('chrome', 'edge') | Where-Object { $_ -ne $Navegador })
  foreach ($n in $orden) {
    $exe = Get-Navegador $n
    if ($exe) {
      if ($n -ne $Navegador) { Write-Host "No encuentro $Navegador; se usa $n." -ForegroundColor Yellow }
      Start-Process $exe -ArgumentList '--new-window', "`"$url`""
      return
    }
  }
  Write-Host 'No encuentro Chrome ni Edge; se abre el navegador predeterminado (la grabación de pestaña puede no funcionar).' -ForegroundColor Yellow
  Start-Process $url
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
  # ── 1. Servidor local ─────────────────────────────────────────────────
  if (-not $SoloAnalisis) {
    Write-Paso 'Comprobando WebGazer'
    Install-WebGazer
  }

  Write-Paso "Servidor local en el puerto $Puerto"
  # La cámara solo se permite en https o en localhost (no con file://).
  $base = "http://localhost:$Puerto/"
  $api = $base + 'api/eyetracking/sesiones'
  if (Test-Url $api) {
    Write-Host "El servidor de pruebas ya está en marcha en $base; se reutiliza."
  } elseif (Test-Url $base) {
    throw "Hay otro servidor en el puerto $Puerto (¿python -m http.server?) que no guarda las sesiones. Ciérralo o usa -Puerto 3001."
  } else {
    if (-not (Get-Command python -ErrorAction SilentlyContinue)) { throw 'Hace falta Python para el servidor local.' }
    $script = Join-Path $CarpetaET 'servidor.py'
    $servidor = Start-Process python -ArgumentList "`"$script`"", $Puerto -WorkingDirectory $Raiz -WindowStyle Hidden -PassThru
    $listo = $false
    for ($i = 0; $i -lt 20 -and -not $listo; $i++) { Start-Sleep -Milliseconds 500; $listo = Test-Url $api }
    if (-not $listo) { throw "El servidor no responde en $base (¿puerto $Puerto ocupado?). Prueba con -Puerto 3001." }
    Write-Host "Servidor arrancado (PID $($servidor.Id)). Las sesiones se guardan en $Destino"
  }

  if (-not $SoloAnalisis) {
    # ── 2. Hotjar ───────────────────────────────────────────────────────
    if ($VerificarHotjar) {
      Write-Paso 'Verificando la etiqueta de Hotjar/Contentsquare'
      npx --yes '@contentsquare/wizard@2' verify --url $base --tag-id $TagId --json
    }

    # ── 3. Herramienta ──────────────────────────────────────────────────
    if (-not $Participante) { $Participante = Read-Host 'Participante (p. ej. P01)' }
    if (-not $Tarea) { $Tarea = Read-Host 'Tarea (p. ej. T1 Encontrar el CV)' }

    $query = 'participante=' + [uri]::EscapeDataString($Participante) +
             '&tarea=' + [uri]::EscapeDataString($Tarea) +
             '&pagina=' + [uri]::EscapeDataString($Pagina)
    $url = $base + 'tests/eyetracking/?' + $query

    Write-Paso 'Abriendo la herramienta'
    Open-Url $url
    Write-Host $url
    Write-Host @"

  1. Pulsa F11 (pantalla completa) y comprueba que el zoom está al 100 %.
  2. Activa la cámara, calibra y pasa la prueba de precisión.
  3. Inicia la sesión y elige «Esta pestaña» al compartir.
  4. Esc termina la tarea; espera a ver «Guardado en tests/usabilidad/eyetracking/».
     «Otra tarea» repite sin recalibrar.
"@

    Read-Host "`nPulsa Enter aquí cuando hayas terminado TODAS las tareas"

    # ── 4. Por si algo acabó en Descargas (navegador sin servidor) ───────
    New-Item -ItemType Directory -Force -Path $Destino | Out-Null
    $descargas = Get-CarpetaDescargas
    $sueltos = Get-ChildItem -Path $descargas -File -ErrorAction SilentlyContinue |
      Where-Object { $_.Name -match '^et-.+\.(json|mp4|webm)$' -and $_.LastWriteTime -ge $Inicio.AddMinutes(-1) }
    foreach ($f in $sueltos) {
      Move-Item -Path $f.FullName -Destination (Join-Path $Destino $f.Name) -Force
      Write-Host "  movido desde Descargas: $($f.Name)"
    }

    # ── 5. Resumen y cruce con Hotjar ───────────────────────────────────
    $sesiones = @(Get-ChildItem -Path $Destino -Filter 'et-*.json' -ErrorAction SilentlyContinue |
      Where-Object { $_.LastWriteTime -ge $Inicio.AddMinutes(-1) })
    if ($sesiones.Count -eq 0) {
      Write-Host "`nNo se ha guardado ninguna sesión. Comprueba que llegaste a pulsar Esc / «■ Terminar»" -ForegroundColor Yellow
      Write-Host 'y que la pantalla final decía «Guardado en tests/usabilidad/eyetracking/».' -ForegroundColor Yellow
    } else {
      Write-Paso "Sesiones guardadas ($($sesiones.Count)) y cómo encontrarlas en Hotjar"
      foreach ($s in $sesiones) {
        $d = Get-Content $s.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
        $hora = ([datetime]$d.inicio).ToString('yyyy-MM-dd HH:mm')
        $seg = [math]::Round($d.duracionMs / 1000)
        Write-Host "  $($d.marca)  ·  $hora  ·  $seg s  ·  precisión $($d.precision.pct) %"
        Write-Host "     Hotjar: URL contiene 'et=$($d.marca)'  o  evento 'eyetracking:$($d.marca)'"
        Write-Host "     Variables de sesión: et_marca, et_participante, et_tarea, et_precision = $($d.precision.pct)"
        $eventos = @($d.hotjar.eventos | ForEach-Object { $_.e } | Select-Object -Unique)
        if ($eventos.Count -gt 0) {
          Write-Host "     Eventos de mirada enviados ($($eventos.Count)): $(($eventos | Select-Object -First 6) -join ', ')"
        }
      }
    }
  }

  # ── 6. Análisis ───────────────────────────────────────────────────────
  Write-Paso 'Abriendo el análisis (mapas de calor)'
  Open-Url ($base + 'tests/eyetracking/analisis.html')
  Write-Host ($base + 'tests/eyetracking/analisis.html')
  Write-Host 'El enlace de la página guarda la selección; puedes recargarla o volver a ella mientras el servidor esté activo.'
  Read-Host "`nPulsa Enter para cerrar el servidor"
} finally {
  if ($servidor -and -not $servidor.HasExited) {
    Stop-Process -Id $servidor.Id -Force
    Write-Host "`nServidor local detenido."
  }
}
