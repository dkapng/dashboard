
@echo off
echo ===========================================
echo   ATUALIZANDO DASHBOARD VENTANA NO NOTION  
echo ===========================================
echo.

cd /d "%~dp0"
node sync-notion.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERRO] Ocorreu um problema ao sincronizar.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [SUCESSO] Dashboard atualizado!
echo Abrindo o dashboard no seu navegador padrão...
start index.html
timeout /t 3 >nul
exit
