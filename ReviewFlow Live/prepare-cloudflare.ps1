$ErrorActionPreference = 'Stop'
$output = Join-Path $PSScriptRoot 'cloudflare-dist'
$frontend = Join-Path $PSScriptRoot 'frontend'
$backend = Join-Path $PSScriptRoot 'backend'
New-Item -ItemType Directory -Path $output -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $output 'assets') -Force | Out-Null
foreach ($name in @('index.html', 'app.js', 'styles.css', 'website-analysis.js')) {
    Copy-Item -LiteralPath (Join-Path $frontend $name) -Destination (Join-Path $output $name) -Force
}
foreach ($name in @('qrcode.js', 'qrcode-license.txt', 'mark.svg', 'manrope.woff2', 'manrope-license.txt')) {
    Copy-Item -LiteralPath (Join-Path $frontend "assets/$name") -Destination (Join-Path $output "assets/$name") -Force
}
Copy-Item -LiteralPath (Join-Path $backend 'cloudflare-worker.js') -Destination (Join-Path $output '_worker.js') -Force
[IO.File]::WriteAllLines((Join-Path $output '.assetsignore'), @('_worker.js', '.assetsignore'))
Write-Host "Cloudflare upload folder ready at $output"
