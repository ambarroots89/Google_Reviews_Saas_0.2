param(
    [ValidateRange(1024, 65535)]
    [int]$Port = 8080,
    [switch]$Lan,
    [switch]$Open,
    [switch]$CustomerDemoOnly
)

$ErrorActionPreference = 'Stop'
if (!$CustomerDemoOnly) { . (Join-Path $PSScriptRoot 'fetch-website.ps1') }
$frontendRoot = Join-Path (Split-Path -Parent $PSScriptRoot) 'frontend'
$phoneDemoConfig = Join-Path $env:TEMP 'reviewflow-phone-preview/origin.json'
$customerLinksDir = Join-Path $env:TEMP 'reviewflow-phone-preview/links'
New-Item -ItemType Directory -Path $customerLinksDir -Force | Out-Null
$files = @{
    '/'                          = @('index.html', 'text/html; charset=utf-8')
    '/index.html'                = @('index.html', 'text/html; charset=utf-8')
    '/app.js'                    = @('app.js', 'text/javascript; charset=utf-8')
    '/website-analysis.js'       = @('website-analysis.js', 'text/javascript; charset=utf-8')
    '/styles.css'                = @('styles.css', 'text/css; charset=utf-8')
    '/assets/qrcode.js'          = @('assets/qrcode.js', 'text/javascript; charset=utf-8')
    '/assets/mark.svg'           = @('assets/mark.svg', 'image/svg+xml')
    '/assets/manrope.woff2'      = @('assets/manrope.woff2', 'font/woff2')
    '/assets/profile-3d.js'      = @('assets/profile-3d.js', 'text/javascript; charset=utf-8')
    '/assets/three.module.min.js' = @('assets/three.module.min.js', 'text/javascript; charset=utf-8')
    '/assets/three.core.min.js'  = @('assets/three.core.min.js', 'text/javascript; charset=utf-8')
}
if ($CustomerDemoOnly) {
    $files['/phone'] = $files['/index.html']
    $files.Remove('/')
    $files.Remove('/index.html')
}

$bindAddress = [Net.IPAddress]::Loopback
if ($Lan -and !$CustomerDemoOnly) {
    $bindAddress = [Net.IPAddress]::Any
}
$listener = [Net.Sockets.TcpListener]::new($bindAddress, $Port)
try {
    $listener.Start()
} catch [Net.Sockets.SocketException] {
    if ($Open) {
        $existing = try { Invoke-WebRequest -Uri "http://127.0.0.1:$Port/" -UseBasicParsing -TimeoutSec 2 } catch { $null }
        if ($existing -and $existing.Headers['X-ReviewFlow'] -eq 'live') {
            if ($Lan -and $existing.Headers['X-ReviewFlow-Preview'] -ne 'lan') {
                throw 'Close the existing ReviewFlow terminal, then run Open ReviewFlow.cmd again to enable phone previews.'
            }
            Start-Process "http://127.0.0.1:$Port/"
            return
        }
    }
    throw
}

try {
    $allowedHosts = @("127.0.0.1:$Port", "localhost:$Port")
    $previewOrigin = ''
    $previewMode = 'local'
    Write-Host "ReviewFlow is running at http://127.0.0.1:$Port/"
    if ($Lan -and !$CustomerDemoOnly) {
        $previewMode = 'lan'
        $interfaces = [Net.NetworkInformation.NetworkInterface]::GetAllNetworkInterfaces() |
            Where-Object { $_.OperationalStatus -eq 'Up' -and $_.NetworkInterfaceType -in 'Wireless80211', 'Ethernet', 'GigabitEthernet' }
        $networkAddresses = foreach ($interface in $interfaces) {
            $properties = $interface.GetIPProperties()
            $gateway = $properties.GatewayAddresses | Where-Object { $_.Address.AddressFamily -eq 'InterNetwork' }
            foreach ($address in $properties.UnicastAddresses) {
                if ($address.Address.AddressFamily -eq 'InterNetwork' -and $address.Address.ToString() -notmatch '^(127\.|169\.254\.)') {
                    [pscustomobject]@{
                        IP = $address.Address.ToString()
                        HasGateway = [bool]$gateway
                        Wireless = $interface.NetworkInterfaceType -eq 'Wireless80211'
                    }
                }
            }
        }
        $networkAddresses = $networkAddresses | Sort-Object HasGateway, Wireless -Descending | Select-Object -ExpandProperty IP -Unique
        foreach ($address in $networkAddresses) {
            $allowedHosts += ('{0}:{1}' -f $address, $Port)
            if (!$previewOrigin) { $previewOrigin = 'http://{0}:{1}' -f $address, $Port }
            Write-Host "Network preview http://${address}:$Port/"
        }
    }
    Write-Host 'Press Ctrl+C to stop.'
    if ($Open) { Start-Process "http://127.0.0.1:$Port/" }

    while ($true) {
        if (!$listener.Pending()) {
            Start-Sleep -Milliseconds 45
            continue
        }
        $connection = $listener.AcceptTcpClient()
        try {
            $stream = $connection.GetStream()
            $stream.ReadTimeout = 1500
            $stream.WriteTimeout = 3000
            $reader = [IO.StreamReader]::new($stream)
            $request = $reader.ReadLine()
            if ($request -notmatch '^(GET|HEAD) (/[^ ]*) HTTP/1\.[01]$') {
                continue
            }
            $method = $Matches[1]
            $path, $query = $Matches[2].Split('?', 2)
            $requestHeaders = @{}
            for ($line = 0; $line -lt 100; $line++) {
                $header = $reader.ReadLine()
                if (!$header) { break }
                if ($header -match '^([^:]+):\s*(.*)$') {
                    $requestHeaders[$Matches[1]] = $Matches[2]
                }
            }
            $file = $files[$path]
            if (!$CustomerDemoOnly -and $path -eq '/api/customer-link' -and $method -eq 'GET' -and
                $requestHeaders['X-ReviewFlow-Request'] -eq 'customer-link' -and $requestHeaders['Host'] -in $allowedHosts) {
                $mime = 'application/json; charset=utf-8'
                try {
                    $target = [uri]::UnescapeDataString(($query -replace '^data=', ''))
                    if ($target.Length -gt 1200 -or !$target.StartsWith('#review/')) { throw 'Invalid customer page.' }
                    $bytes = [Text.Encoding]::UTF8.GetBytes($target)
                    $hasher = [Security.Cryptography.SHA256]::Create()
                    try { $digest = $hasher.ComputeHash($bytes) } finally { $hasher.Dispose() }
                    $id = ([BitConverter]::ToString($digest)).Replace('-', '').Substring(0, 24).ToLowerInvariant()
                    [IO.File]::WriteAllText((Join-Path $customerLinksDir ($id + '.txt')), $target, [Text.Encoding]::UTF8)
                    $status = '200 OK'
                    $body = [Text.Encoding]::UTF8.GetBytes((@{ id = $id } | ConvertTo-Json -Compress))
                } catch {
                    $status = '400 Bad Request'
                    $body = [Text.Encoding]::UTF8.GetBytes('{"error":"Could not create customer link."}')
                }
            } elseif ($path -eq '/api/customer-link' -and $method -eq 'GET' -and $query -match '^id=([a-f0-9]{24})$') {
                $mime = 'application/json; charset=utf-8'
                $linkFile = Join-Path $customerLinksDir ($Matches[1] + '.txt')
                if (Test-Path -LiteralPath $linkFile) {
                    $status = '200 OK'
                    $body = [Text.Encoding]::UTF8.GetBytes((@{ hash = [IO.File]::ReadAllText($linkFile, [Text.Encoding]::UTF8) } | ConvertTo-Json -Compress))
                } else {
                    $status = '404 Not Found'
                    $body = [Text.Encoding]::UTF8.GetBytes('{"error":"Customer page not found."}')
                }
            } elseif (!$CustomerDemoOnly -and $path -eq '/api/preview-address') {
                $status = '200 OK'
                $mime = 'application/json; charset=utf-8'
                $data = @{ origin = $previewOrigin; publicDemo = $false }
                try {
                    if (Test-Path -LiteralPath $phoneDemoConfig) {
                        $config = Get-Content -Raw -LiteralPath $phoneDemoConfig | ConvertFrom-Json
                        $tunnel = Get-Process -Id $config.processId -ErrorAction SilentlyContinue
                        if ($tunnel.ProcessName -eq 'cloudflared' -and $config.origin -match '^https://[a-z0-9-]+\.trycloudflare\.com$') {
                            $data = @{ origin = $config.origin; publicDemo = $true }
                        }
                    }
                } catch { # A stale or incomplete tunnel config falls back to the LAN preview.
                }
                $body = [Text.Encoding]::UTF8.GetBytes(($data | ConvertTo-Json -Compress))
            } elseif (!$CustomerDemoOnly -and $path -eq '/api/analyse') {
                $mime = 'application/json; charset=utf-8'
                if ($method -ne 'GET' -or $requestHeaders['X-ReviewFlow-Request'] -ne 'website' -or
                    $requestHeaders['Host'] -notin $allowedHosts) {
                    $status = '403 Forbidden'
                    $data = @{ error = 'Open the local ReviewFlow page to analyse a website.' }
                } else {
                    try {
                        $target = [uri]::UnescapeDataString(($query -replace '^url=', ''))
                        $data = Get-WebsiteHtml $target
                        $status = '200 OK'
                    } catch {
                        $data = @{ error = $_.Exception.Message }
                        $status = '422 Unprocessable Content'
                    }
                }
                $body = [Text.Encoding]::UTF8.GetBytes(($data | ConvertTo-Json -Compress))
            } elseif ($file) {
                $status = '200 OK'
                $body = [IO.File]::ReadAllBytes((Join-Path $frontendRoot $file[0]))
                $mime = $file[1]
            } else {
                $status = '404 Not Found'
                $body = [Text.Encoding]::UTF8.GetBytes('Not found')
                $mime = 'text/plain; charset=utf-8'
            }
            $headers = "HTTP/1.1 $status`r`nContent-Type: $mime`r`nContent-Length: $($body.Length)`r`nCache-Control: no-store`r`nX-Content-Type-Options: nosniff`r`nX-ReviewFlow: live`r`nX-ReviewFlow-Preview: $previewMode`r`nConnection: close`r`n`r`n"
            $headerBytes = [Text.Encoding]::ASCII.GetBytes($headers)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            if ($method -eq 'GET') {
                $stream.Write($body, 0, $body.Length)
            }
        } catch [IO.IOException] {
            # Browsers can close speculative sockets before sending a request.
        } finally {
            $connection.Dispose()
        }
    }
} finally {
    $listener.Stop()
}
