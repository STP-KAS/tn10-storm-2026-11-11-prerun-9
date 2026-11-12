# sixteen.ps1: pre-run 9's sixteen-family hash path on the desk. Run with PowerShell 7 (pwsh).
# Build the sixteen genesis transactions (no submit), write SIXTEEN.md and the private bundle, then publish it to
# pre-run 9 origin with an On origin line. Never prints an id. Not the old 8/32 publisher (tn10-hash-publish.*).
# Hashes first: publish does not wait for PRE-RUN-OPEN or MINI-ARMED. It stops on BOT-HALT, FAILED, or an existing
# SIXTEEN.md. It is not an arm and not a send. After a publish, do not rebuild: the family submit uses that bundle.
#
#   pwsh -NoProfile -File sixteen.ps1 -Mode check     gates on origin + node + coins + build, local only, nothing pushed
#   pwsh -NoProfile -File sixteen.ps1 -Mode publish   the same build, then push hashes/SIXTEEN.md (two commits), once
#
# Paths are in sixteen.local.json next to this file (not committed): config, repo, git.
param([Parameter(Mandatory = $true)][ValidateSet('check', 'publish')][string]$Mode)
$ErrorActionPreference = 'Stop'
if ($PSVersionTable.PSVersion.Major -lt 7) { Write-Output '{"ok":0,"reason":"needs_pwsh_7"}'; exit 2 }
$Here = Split-Path -Parent $MyInvocation.MyCommand.Path
$L = Get-Content (Join-Path $Here 'sixteen.local.json') -Raw | ConvertFrom-Json
$Cfg = Get-Content $L.config -Raw | ConvertFrom-Json
$Run = $Cfg.run_dir
New-Item -ItemType Directory -Force -Path "$Run\logs", "$Run\private", "$Run\out" | Out-Null
$log = "$Run\logs\sixteen.log"
function Note([string]$m) { Add-Content -Path $log -Value ('{0} {1} {2}' -f [DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ'), $Mode, $m) }

if (-not (Test-Path (Join-Path $L.repo '.git'))) { Note 'STOP no_repo'; Write-Output '{"ok":0,"reason":"no_repo"}'; exit 2 }
$out = "$Run\out\SIXTEEN.md"
$bundle = "$Run\private\genesis-bundle.json"
if ($Mode -eq 'check') { $out = "$Run\out\SIXTEEN.check.md"; $bundle = "$Run\private\genesis-bundle.check.json" }

# Gates first in publish mode, so nothing is built for a held run. In check mode the gate state is only reported.
$g = & node (Join-Path $Here 'publish-sixteen.mjs') --repo $L.repo --git $L.git --gates-only 2>&1 | Out-String
$gcode = $LASTEXITCODE
Note ("GATES exit={0} {1}" -f $gcode, ($g -replace '\s+', ' ').Trim())
Write-Output $g.Trim()
if ($Mode -eq 'publish' -and $gcode -ne 0) { exit $gcode }
$b = & node (Join-Path $Here 'hash-sixteen.mjs') --config $L.config --out $out --bundle $bundle 2>&1 | Out-String
$bcode = $LASTEXITCODE
Note ("BUILD exit={0} {1}" -f $bcode, ($b -replace '\s+', ' ').Trim())
Write-Output $b.Trim()
if ($bcode -ne 0) { exit $bcode }
$v = & node (Join-Path $Here 'hash-sixteen.mjs') --verify $out --bundle $bundle 2>&1 | Out-String
$vcode = $LASTEXITCODE
Note ("VERIFY exit={0} {1}" -f $vcode, ($v -replace '\s+', ' ').Trim())
Write-Output $v.Trim()
if ($vcode -ne 0) { exit 4 }
if ($Mode -eq 'check') { Note 'CHECK_DONE pushed=0'; Write-Output '{"ok":1,"mode":"check","pushed":0}'; exit 0 }
$pubArgs = @('--repo', $L.repo, '--git', $L.git, '--file', $out, '--bundle', $bundle)
$p = & node (Join-Path $Here 'publish-sixteen.mjs') @pubArgs 2>&1 | Out-String
$pcode = $LASTEXITCODE
Note ("PUBLISH exit={0} {1}" -f $pcode, ($p -replace '\s+', ' ').Trim())
Write-Output $p.Trim()
exit $pcode
