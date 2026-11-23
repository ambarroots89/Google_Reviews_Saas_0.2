function Get-PublicAddress([uri]$Uri) {
    if ($Uri.Scheme -notin 'http', 'https' -or !$Uri.IsDefaultPort -or $Uri.UserInfo -or
        $Uri.HostNameType -ne [UriHostNameType]::Dns -or $Uri.DnsSafeHost -notmatch '\.') {
        throw 'Enter a public website with a standard HTTP or HTTPS address.'
    }
    $lookup = [Net.Dns]::GetHostAddressesAsync($Uri.IdnHost)
    if (!$lookup.Wait(2500)) { throw 'The website name took too long to resolve.' }
    $addresses = @($lookup.Result | Where-Object AddressFamily -eq InterNetwork)
    foreach ($address in $addresses) {
        $a, $b, $c, $d = $address.GetAddressBytes()
        if ($a -eq 0 -or $a -eq 10 -or $a -eq 127 -or $a -ge 224 -or
            ($a -eq 100 -and $b -ge 64 -and $b -le 127) -or
            ($a -eq 169 -and $b -eq 254) -or ($a -eq 172 -and $b -ge 16 -and $b -le 31) -or
            ($a -eq 192 -and ($b -eq 168 -or ($b -eq 0 -and $c -in 0, 2))) -or
            ($a -eq 198 -and ($b -in 18, 19 -or ($b -eq 51 -and $c -eq 100))) -or
            ($a -eq 203 -and $b -eq 0 -and $c -eq 113)) {
            throw 'Analysis is available for public websites only.'
        }
    }
    if ($addresses.Count -eq 0) { throw 'The website has no public IPv4 address.' }
    return $addresses[0].IPAddressToString
}

function Read-WebsiteResponse([uri]$Uri, [string]$Ip, [int]$Seconds) {
    $url = $Uri.GetComponents([UriComponents]::AbsoluteUri, [UriFormat]::UriEscaped)
    if ($url -match '["\r\n]') { throw 'Enter a valid public website URL.' }
    $headerFile = [IO.Path]::GetTempFileName()
    $body = [IO.MemoryStream]::new()
    $start = [Diagnostics.ProcessStartInfo]::new('curl.exe')
    $start.UseShellExecute = $false
    $start.CreateNoWindow = $true
    $start.RedirectStandardOutput = $true
    $pin = '{0}:{1}:{2}' -f $Uri.IdnHost, $Uri.Port, $Ip
    $start.Arguments = ('--disable --silent --noproxy "*" --proto "=http,https" --connect-timeout 5 --max-time {0} --compressed --resolve "{1}" --header "Accept: text/html,application/xhtml+xml" --user-agent "Mozilla/5.0 (compatible; ReviewFlow Website Analyzer/1.0)" --dump-header "{2}" --url "{3}"' -f $Seconds, $pin, $headerFile, $url)
    $process = $null
    try {
        $process = [Diagnostics.Process]::Start($start)
        $stream = $process.StandardOutput.BaseStream
        $limit = 5MB
        $buffer = [byte[]]::new(32768)
        $deadline = [DateTime]::UtcNow.AddSeconds($Seconds + 1)
        while ($body.Length -lt $limit) {
            $remainingMs = [Math]::Max(1, [int]($deadline - [DateTime]::UtcNow).TotalMilliseconds)
            $read = $stream.ReadAsync($buffer, 0, [int][Math]::Min($buffer.Length, ($limit - $body.Length)))
            if (!$read.Wait($remainingMs)) { throw 'The website took too long to respond.' }
            if ($read.Result -eq 0) { break }
            $body.Write($buffer, 0, $read.Result)
        }
        $truncated = $body.Length -eq $limit
        if ($truncated -and !$process.HasExited) { $process.Kill() }
        if (!$process.WaitForExit(1000) -or (!$truncated -and $process.ExitCode -ne 0)) {
            throw 'Could not read the website. Check the URL or try again shortly.'
        }
        $headerText = [IO.File]::ReadAllText($headerFile, [Text.Encoding]::ASCII)
        $responseHeaders = [regex]::Matches($headerText, '(?m)^HTTP/\S+\s+(\d{3})[^\r\n]*\r?\n([^\x00]*?)(?:\r?\n\r?\n|\z)')
        if (!$responseHeaders.Count) { throw 'The website did not return a readable HTTP response.' }
        $last = $responseHeaders[$responseHeaders.Count - 1]
        $fields = @{}
        foreach ($line in ($last.Groups[2].Value -split '\r?\n')) {
            if ($line -match '^([^:]+):\s*(.*)$') { $fields[$Matches[1]] = $Matches[2] }
        }
        return @{ status = [int]$last.Groups[1].Value; fields = $fields; bytes = $body.ToArray(); truncated = $truncated }
    } finally {
        if ($process) {
            if (!$process.HasExited) { $process.Kill(); $process.WaitForExit() }
            $process.Dispose()
        }
        $body.Dispose()
        [IO.File]::Delete($headerFile)
    }
}

function Get-WebsiteHtml([string]$Address) {
    $uri = $null
    if ($Address.Length -gt 2048 -or ![uri]::TryCreate($Address, [UriKind]::Absolute, [ref]$uri)) {
        throw 'Enter a valid public website URL.'
    }
    $deadline = [DateTime]::UtcNow.AddSeconds(16)
    for ($redirect = 0; $redirect -le 4; $redirect++) {
        try {
            $ip = Get-PublicAddress $uri
        } catch [AggregateException] {
            throw 'The website address could not be found. Check the URL and try again.'
        }
        $remaining = [Math]::Floor(($deadline - [DateTime]::UtcNow).TotalSeconds)
        if ($remaining -lt 1) { throw 'The website took too long to respond.' }
        $result = Read-WebsiteResponse $uri $ip ([int][Math]::Min($remaining, 10))
        $status = $result.status
        if ($status -in 301, 302, 303, 307, 308 -and $result.fields['Location']) {
            $uri = [uri]::new($uri, $result.fields['Location'])
            continue
        }
        if ($status -in 401, 403, 429) { throw "The website restricted automated access (HTTP $status). Try another public page." }
        if ($status -lt 200 -or $status -ge 300) { throw "The website returned HTTP $status. Check the URL and try again." }
        $contentType = $result.fields['Content-Type']
        if ($contentType -notmatch '^(text/html|application/xhtml\+xml)(;|$)') {
            throw 'This URL does not point to an HTML page. Try the business homepage.'
        }
        $encoding = [Text.Encoding]::UTF8
        if ($contentType -match 'charset\s*=\s*["'']?([\w-]+)') {
            try { $encoding = [Text.Encoding]::GetEncoding($Matches[1]) } catch [ArgumentException] {}
        }
        $reader = [IO.StreamReader]::new([IO.MemoryStream]::new($result.bytes), $encoding, $true)
        try {
            return @{ url = $uri.AbsoluteUri; html = $reader.ReadToEnd(); truncated = $result.truncated }
        } finally { $reader.Dispose() }
    }
    throw 'The website redirected too many times. Try the final page address.'
}
