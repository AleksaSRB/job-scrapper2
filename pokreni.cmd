@echo off
rem Dupli klik = pokreni server (ako vec ne radi) i otvori http://localhost:3009.
rem Posle restarta racunara NIJE potrebno: task "MarketingPosloviServer" se sam dize pri logovanju,
rem a "MarketingPosloviScraper" nastavlja da proverava sajtove svakih 15 min. Ovo je rezerva ako se UI ne otvara.
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$p=3009; try { $p=(Get-Content '%~dp0config.json' -Raw | ConvertFrom-Json).port } catch {};" ^
  "$up = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue;" ^
  "if ($up) { Write-Host ('Server vec radi: http://localhost:' + $p) }" ^
  "elseif (Get-ScheduledTask -TaskName MarketingPosloviServer -ErrorAction SilentlyContinue) { Start-ScheduledTask -TaskName MarketingPosloviServer; Write-Host 'Server pokrenut preko zadatka.' }" ^
  "else { Start-Process wscript.exe -ArgumentList ('//B \"' + '%~dp0run-server-hidden.vbs' + '\"'); Write-Host 'Server pokrenut (zadatak ne postoji - pokreni setup.cmd da se instalira trajno).' }" ^
  "Start-Sleep 2; Start-Process ('http://localhost:' + $p)"
