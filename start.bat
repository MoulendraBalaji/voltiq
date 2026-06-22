@echo off
echo ===================================================
echo VoltIQ Industrial Intelligence System Launcher
echo ===================================================
echo.

:: Check if database is already seeded, otherwise seed it
if not exist "voltiq.db" (
    echo [System] SQLite database voltiq.db not found. Seeding database...
    python -c "from backend.data.generators.db_seeder import seed_database; seed_database()"
    if errorlevel 1 (
        echo [Error] Failed to seed database. Make sure requirements are installed.
        pause
        exit /b 1
    )
    echo [System] Database seeded successfully!
) else (
    echo [System] Database voltiq.db exists. Skipping seeding.
)

echo.
echo [System] Launching FastAPI Backend (Port 8000)...
start "VoltIQ Backend API" cmd /k "title VoltIQ Backend API && python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000"

echo [System] Launching React Vite Frontend (Port 3000)...
start "VoltIQ Frontend WebApp" cmd /k "title VoltIQ Frontend && cd frontend && npm run dev"

echo.
echo ===================================================
echo All services launched successfully!
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo ===================================================
echo.
pause
