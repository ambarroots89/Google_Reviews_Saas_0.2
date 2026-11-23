$ErrorActionPreference = 'Stop'
$previewDir = Join-Path $env:TEMP 'reviewflow-phone-preview'
New-Item -ItemType Directory -Path $previewDir -Force | Out-Null
$tunnelExe = Join-Path $previewDir 'cloudflared.exe'
$configPath = Join-Path $previewDir 'origin.json'
$tunnelLog = Join-Path $previewDir 'tunnel.log'
$startedProcesses = @()

$existingAgency = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue
$existingCustomer = Get-NetTCPConnection -LocalPort 8083 -State Listen -ErrorAction SilentlyContinue
if ($existingAgency -and $existingCustomer) {
    $agencyOwner = Get-CimInstance Win32_Process -Filter "ProcessId=$($existingAgency.OwningProcess)"
    $customerOwner = Get-CimInstance Win32_Process -Filter "ProcessId=$($existingCustomer.OwningProcess)"
    $launcher = Get-CimInstance Win32_Process -Filter "ProcessId=$($agencyOwner.ParentProcessId)"
    $serverPath = [regex]::Escape((Join-Path $PSScriptRoot 'serve.ps1'))
    $launcherPath = [regex]::Escape((Join-Path $PSScriptRoot 'start-reviewflow.ps1'))
    $ownedServers = $agencyOwner.CommandLine -match $serverPath -and $customerOwner.CommandLine -match $serverPath
    $sameLauncher = $launcher.CommandLine -match "(?:$launcherPath|start-reviewflow\.ps1)" -and
        $agencyOwner.ParentProcessId -eq $customerOwner.ParentProcessId
    if ($ownedServers -and $sameLauncher) {
        $runningTunnel = Get-CimInstance Win32_Process -Filter "ParentProcessId=$($launcher.ProcessId)" |
            Where-Object { $_.Name -eq 'cloudflared.exe' -and $_.ExecutablePath -eq $tunnelExe } |
            Select-Object -First 1
        if ($runningTunnel -and (Test-Path -LiteralPath $tunnelLog)) {
            $logText = Get-Content -Raw -LiteralPath $tunnelLog
            if ($logText -match 'https://[a-z0-9-]+\.trycloudflare\.com') {
                $savedOrigin = $Matches[0]
                $data = @{ origin = $savedOrigin; processId = $runningTunnel.ProcessId } | ConvertTo-Json -Compress
                [IO.File]::WriteAllText($configPath, $data)
                Write-Host 'ReviewFlow is already running. Opening the existing session.'
                Start-Process 'http://127.0.0.1:8080/'
                exit 0
            }
        }
        Write-Host 'ReviewFlow is already starting. Wait for its first window to show that it is ready.'
        exit 0
    }
}

try {
    if (!(Test-Path -LiteralPath $tunnelExe)) {
        Write-Host 'Downloading the phone preview connector...'
        & curl.exe -fLsS --max-time 120 -o $tunnelExe 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe'
        if ($LASTEXITCODE -ne 0) {
            if (Test-Path -LiteralPath $tunnelExe) { Remove-Item -LiteralPath $tunnelExe -Force }
            throw 'Could not download the phone preview connector. Check your internet connection and try again.'
        }
    }

    foreach ($port in @(8080, 8083)) {
        if (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue) {
            throw "Port $port is already in use. Close the other ReviewFlow window and try again."
        }
    }

    if (Test-Path -LiteralPath $configPath) { Remove-Item -LiteralPath $configPath -Force }
    if (Test-Path -LiteralPath $tunnelLog) { Remove-Item -LiteralPath $tunnelLog -Force }
    $serverScript = Join-Path $PSScriptRoot 'serve.ps1'
    $serverArgs = '-NoProfile -ExecutionPolicy Bypass -File "{0}" -Port 8083 -CustomerDemoOnly' -f $serverScript
    $customerServer = Start-Process powershell.exe -ArgumentList $serverArgs -WindowStyle Hidden -PassThru
    $startedProcesses += $customerServer
    $serverArgs = '-NoProfile -ExecutionPolicy Bypass -File "{0}" -Port 8080 -Lan' -f $serverScript
    $agencyServer = Start-Process powershell.exe -ArgumentList $serverArgs -WindowStyle Hidden -PassThru
    $startedProcesses += $agencyServer

    $serverReady = $false
    for ($attempt = 0; $attempt -lt 50; $attempt++) {
        try {
            $agency = Invoke-WebRequest 'http://127.0.0.1:8080/' -UseBasicParsing -TimeoutSec 1
            $customer = Invoke-WebRequest 'http://127.0.0.1:8083/phone' -UseBasicParsing -TimeoutSec 1
            if ($agency.Headers['X-ReviewFlow'] -eq 'live' -and $customer.Headers['X-ReviewFlow'] -eq 'live') {
                $serverReady = $true
                break
            }
        } catch {}
        if ($agencyServer.HasExited -or $customerServer.HasExited) { break }
        Start-Sleep -Milliseconds 300
    }
    if (!$serverReady) { throw 'ReviewFlow could not start its local servers.' }

    Write-Host 'Starting the phone preview...'
    $tunnelArgs = 'tunnel --url http://127.0.0.1:8083 --protocol http2 --no-autoupdate --logfile "{0}"' -f $tunnelLog
    $tunnel = Start-Process -FilePath $tunnelExe -ArgumentList $tunnelArgs -WindowStyle Hidden -PassThru
    $startedProcesses += $tunnel
    $origin = ''
    for ($attempt = 0; $attempt -lt 100; $attempt++) {
        if (Test-Path -LiteralPath $tunnelLog) {
            $logText = Get-Content -Raw -LiteralPath $tunnelLog
            if ($logText -match 'https://[a-z0-9-]+\.trycloudflare\.com') {
                $origin = $Matches[0]
                break
            }
        }
        if ($tunnel.HasExited) { break }
        Start-Sleep -Milliseconds 300
    }
    if (!$origin) { throw 'The phone preview could not connect. Check your internet connection and try again.' }
    $publicReady = $false
    for ($attempt = 0; $attempt -lt 120; $attempt++) {
        $tunnelHost = ([uri]$origin).Host
        $addresses = @(Resolve-DnsName -Server 1.1.1.1 -Name $tunnelHost -Type A -ErrorAction SilentlyContinue | Where-Object IPAddress)
        $response = ''
        if ($addresses.Count) {
            $resolve = '{0}:443:{1}' -f $tunnelHost, $addresses[0].IPAddress
            $response = & curl.exe -fLs --max-time 3 --resolve $resolve "$origin/phone"
        }
        if ($LASTEXITCODE -eq 0 -and ($response -join '').Contains('ReviewFlow')) {
            $publicReady = $true
            break
        }
        Start-Sleep -Milliseconds 500
    }
    if (!$publicReady) { throw 'The phone preview could not be reached. Check your internet connection and try again.' }
    $config = @{ origin = $origin; processId = $tunnel.Id } | ConvertTo-Json -Compress
    [IO.File]::WriteAllText($configPath, $config)
    Write-Host 'ReviewFlow is ready. Keep this window open while using the phone preview.'
    Start-Process 'http://127.0.0.1:8080/'
    while (!$agencyServer.HasExited -and !$customerServer.HasExited -and !$tunnel.HasExited) {
        Start-Sleep -Seconds 1
    }
    throw 'A ReviewFlow service stopped. Open ReviewFlow again to restart the phone preview.'
} finally {
    if (Test-Path -LiteralPath $configPath) { Remove-Item -LiteralPath $configPath -Force }
    foreach ($process in $startedProcesses) {
        if (!$process.HasExited) { Stop-Process -Id $process.Id -ErrorAction SilentlyContinue }
    }
}
