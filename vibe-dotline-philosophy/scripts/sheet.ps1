# 把 snap.ps1 截的几张图拼成一张对照图（每格左上角标时间）
# 用法：powershell -File sheet.ps1 -VideoDir <主题>-skill版\video -Times "1,12,40" -Out sheet.png
param([Parameter(Mandatory)][string]$VideoDir, [Parameter(Mandatory)][string]$Times, [string]$Out = "sheet.png", [int]$Cols = 3)
Add-Type -AssemblyName System.Drawing
$VideoDir = (Resolve-Path -LiteralPath $VideoDir).Path; $w = "$VideoDir\snapshots"
$ts = $Times.Split(','); $tw = 640; $th = 360; $rows = [Math]::Ceiling($ts.Count / $Cols)
$bmp = New-Object System.Drawing.Bitmap ($tw * $Cols), ($th * $rows)
$g = [System.Drawing.Graphics]::FromImage($bmp); $g.Clear([System.Drawing.Color]::Gray)
$font = New-Object System.Drawing.Font "Consolas", 16
for ($i = 0; $i -lt $ts.Count; $i++) {
  $img = [System.Drawing.Image]::FromFile("$w\t$($ts[$i]).png")
  $x = ($i % $Cols) * $tw; $y = [Math]::Floor($i / $Cols) * $th
  $g.DrawImage($img, $x, $y, $tw - 2, $th - 2); $img.Dispose()
  $g.DrawString("t=$($ts[$i])", $font, [System.Drawing.Brushes]::Lime, $x + 6, $y + 4)
}
$bmp.Save("$w\$Out", [System.Drawing.Imaging.ImageFormat]::Png); $g.Dispose(); $bmp.Dispose()
"saved $w\$Out"
