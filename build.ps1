# build.ps1 - Genera index.html concatenando archivos de src/
$ErrorActionPreference = "Stop"
$srcDir = Join-Path $PSScriptRoot "src"
$outFile = Join-Path $PSScriptRoot "index.html"

$files = @(
  "a2_head.html",
  "b2_data.js",
  "c2_logic.js",
  "c2b_classes.js",
  "d3a_sprites.js",
  "d3b_world.js",
  "d3c_chars.js",
  "d3c2_creat.js",
  "d3d_update.js",
  "d3e_draw.js",
  "d4a_ui.js",
  "d4b_input.js",
  "d5_backend.js",
  "d6_screens.js",
  "d7_multiplayer.js",
  "d9_extras.js",
  "d8_boot.js"
)

$sb = [System.Text.StringBuilder]::new()
foreach ($f in $files) {
  $p = Join-Path $srcDir $f
  if (Test-Path $p) {
    $txt = [System.IO.File]::ReadAllText($p, [System.Text.Encoding]::UTF8)
    [void]$sb.AppendLine($txt)
  } else {
    Write-Warning "No existe $p"
  }
}

[System.IO.File]::WriteAllText($outFile, $sb.ToString(), [System.Text.Encoding]::UTF8)
$len = (Get-Item $outFile).Length
Write-Host "index.html generado exitosamente: $len bytes"
