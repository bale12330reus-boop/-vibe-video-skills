# 用无头 Edge 截某一刻的画面，核对用（不走 HyperFrames，很快，约 150MB 内存）
# 用法：powershell -File snap.ps1 -VideoDir <主题>-skill版\video -Items "index.html?t=12|12,index.html?t=40|40"
# 输出：<VideoDir>\snapshots\t<名字>.png；然后用 sheet.ps1 拼成一张对照图
param([Parameter(Mandatory)][string]$VideoDir, [string]$Items = "index.html?t=1|1", [int]$Width = 1920, [int]$Height = 1080)
$VideoDir = (Resolve-Path -LiteralPath $VideoDir).Path
New-Item -ItemType Directory -Force "$VideoDir\snapshots" | Out-Null
$edge = @("C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe", "C:\Program Files\Microsoft\Edge\Application\msedge.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $edge) { throw "找不到 Edge" }
$base = "file:///" + ($VideoDir -replace '\\', '/')
foreach ($it in $Items.Split(',')) {
  $u, $n = $it.Split('|'); $out = "$VideoDir\snapshots\t$n.png"
  if (Test-Path -LiteralPath $out) { Remove-Item -LiteralPath $out }
  $a = @('--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', "--user-data-dir=$VideoDir\edge-prof", '--virtual-time-budget=3000', "--window-size=$Width,$Height", "--screenshot=$out", "$base/$u")
  Start-Process -FilePath $edge -ArgumentList $a -Wait -WindowStyle Hidden
  if (Test-Path -LiteralPath $out) { "ok $n" } else { "MISSING $n" }
}
