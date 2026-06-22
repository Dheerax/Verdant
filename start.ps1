# Launch VERDANT — backend (ML API) + frontend (Vite) in separate terminals
$root = $PSScriptRoot

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; .\run.ps1"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"

Write-Host "VERDANT launching:" -ForegroundColor Green
Write-Host "  • ML API  -> http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "  • Web app -> http://localhost:5173"  -ForegroundColor Cyan
