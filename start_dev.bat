@echo off
echo ========================================================
echo   Starting Notula.ai Web SaaS (Whistle + Gemini Flash)
echo ========================================================
echo.

echo [1/2] Starting Frontend Vite Server...
start "Notula AI Frontend" cmd /k "cd frontend && npm run dev"

echo [2/2] Starting Backend FastAPI Server...
start "Notula AI Backend" cmd /k "cd backend && python main.py"

echo.
echo Kedua server telah dijalankan!
echo - Frontend: http://localhost:5173
echo - Backend:  http://localhost:8000 (Docs: http://localhost:8000/docs)
echo.
pause

