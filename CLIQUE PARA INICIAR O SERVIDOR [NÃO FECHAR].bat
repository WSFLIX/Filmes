@echo off
echo ========================================
echo    Iniciando Servidor WS FLIX (Vite + Node)
echo ========================================
echo.
cd /d "c:\Users\bielm\OneDrive\Documentos\Projetos\Filmes e Séries"

echo [1/2] Iniciando Backend (Node)...
start "Backend - NAO FECHAR" node server.js

echo.
echo [2/2] Iniciando Frontend (Vite)...
echo Aguardando Backend iniciar...
timeout /t 3 >nul
start "Frontend - Vite" cmd /k "npm run dev"

echo.
echo ======================================== 
echo Tudo iniciado! 
echo - A janela do Backend deve ficar aberta.
echo - A janela do Frontend deve mostrar o link (localhost).
echo ========================================
pause
