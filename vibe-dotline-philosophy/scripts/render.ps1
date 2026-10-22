# 后台渲染。用 Win32_Process.Create 独立起进程：agent 的命令结束也不会被连带杀掉；
# 工具版本写死 + --yes 自动确认，不会卡在看不见的下载确认上。
# HyperFrames 渲的是目录里的 index.html：
#   整片  -VideoDir <主题>-skill版\video   -Out renders\<主题>-整片.mp4
#   样片  -VideoDir <主题>-skill版\sample  -Out renders\<主题>-样片.mp4
#         （sample\ 里放：sample-模板.html 改名 index.html + sample.js + engine.js + scenes-*.js + assets\）
# 进度看 <VideoDir>\render.log（START / EXIT 两行）和 render-out.txt
param([Parameter(Mandatory)][string]$VideoDir, [string]$Out = "renders\out.mp4", [int]$Workers = 1, [switch]$NoLowMemory)
$VideoDir = (Resolve-Path -LiteralPath $VideoDir).Path
$proj = Split-Path $VideoDir -Parent; $name = Split-Path $VideoDir -Leaf
New-Item -ItemType Directory -Force (Join-Path $VideoDir (Split-Path $Out -Parent)) | Out-Null
$lm = if ($NoLowMemory) { "" } else { "--low-memory-mode" }
$job = Join-Path $VideoDir "_render.cmd"
@"
@echo off
cd /d "$proj"
echo START %date% %time% > "$VideoDir\render.log"
call npx --yes hyperframes@0.8.143 render "$name" -o "$name\$Out" --workers $Workers $lm > "$VideoDir\render-out.txt" 2>&1
echo EXIT %errorlevel% %date% %time% >> "$VideoDir\render.log"
"@ | Out-File -LiteralPath $job -Encoding oem
$r = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = "cmd.exe /c `"$job`""; CurrentDirectory = $proj }
"launched pid=$($r.ProcessId) rc=$($r.ReturnValue)"
