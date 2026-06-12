@echo off
chcp 65001 > nul
echo ============================================
echo  УСТАНОВКА ВСЕХ VIBE-TOOLS (одной командой)
echo ============================================
echo.

:: 1. Framer Motion в проект planner
echo [1/7] Framer Motion (npm)...
cd /d "%~dp0frontend\planner"
call npm install motion --save 2> nul || npm install motion --save
echo    [OK] motion установлен в planner

:: 2. Agent Browser CLI + MCP
echo [2/7] Agent Browser (Vercel Labs)...
call npm install -g agent-browser 2> nul || npm install -g agent-browser
call npm install -g agent-browser-mcp 2> nul || npm install -g agent-browser-mcp
call agent-browser install 2> nul
echo    [OK] agent-browser + MCP

:: 3. UI-UX Pro Max MCP
echo [3/7] UI-UX Pro Max MCP...
call npm install -g @nextlevelbuilder/ui-ux-pro-max-mcp 2> nul || npm install -g @nextlevelbuilder/ui-ux-pro-max-mcp
echo    [OK] UI-UX Pro Max MCP

:: 4. Claude Code Skills (git clone)
echo [4/7] Claude Code Skills...
if not exist "%USERPROFILE%\.claude\skills" mkdir "%USERPROFILE%\.claude\skills"

if not exist "%USERPROFILE%\.claude\skills\frontend-design\SKILL.md" (
    cd /d "%USERPROFILE%\.claude\skills"
    git clone --depth 1 https://github.com/anthropics/skills.git _temp_skills 2> nul
    xcopy /E /I /Y "_temp_skills\skills\frontend-design" "frontend-design" > nul 2>&1
    rmdir /S /Q _temp_skills 2> nul
    echo    [OK] frontend-design skill
) else (
    echo    [SKIP] frontend-design уже установлен
)

if not exist "%USERPROFILE%\.claude\skills\ui-ux-pro-max\SKILL.md" (
    cd /d "%USERPROFILE%\.claude\skills"
    git clone --depth 1 https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git ui-ux-pro-max 2> nul
    copy "ui-ux-pro-max\.claude\skills\ui-ux-pro-max\SKILL.md" "ui-ux-pro-max\SKILL.md" > nul 2>&1
    echo    [OK] ui-ux-pro-max skill
) else (
    echo    [SKIP] ui-ux-pro-max уже установлен
)

if not exist "%USERPROFILE%\.claude\skills\minimal-design\SKILL.md" (
    cd /d "%USERPROFILE%\.claude\skills"
    git clone --depth 1 https://github.com/holger1411/minimal-design-system-skill.git minimal-design 2> nul
    xcopy /E /I /Y "minimal-design\minimal-design-system\*" "minimal-design\" > nul 2>&1
    rmdir /S /Q "minimal-design\minimal-design-system" 2> nul
    echo    [OK] minimal-design skill
) else (
    echo    [SKIP] minimal-design уже установлен
)

:: 5. MCP Config
echo [5/7] MCP конфигурация...
(
echo {
echo   "mcpServers": {
echo     "agent-browser": {
echo       "command": "npx",
echo       "args": ["-y", "agent-browser-mcp"]
echo     },
echo     "ui-ux-pro-max": {
echo       "command": "npx",
echo       "args": ["-y", "@nextlevelbuilder/ui-ux-pro-max-mcp"]
echo     }
echo   }
echo }
) > "%USERPROFILE%\.claude\mcp.json"
echo    [OK] mcp.json создан

:: 6. Python tools (faster-whisper, yt-dlp)
echo [6/7] Python tools...
call pip install -U faster-whisper yt-dlp opencv-python pillow 2> nul || pip install -U faster-whisper yt-dlp opencv-python pillow
echo    [OK] faster-whisper + yt-dlp + opencv

:: 7. twentyfour.dev components (скачиваем README + скрипт для копирования)
echo [7/7] twentyfour.dev helpers...
if not exist "%~dp0tools\twentyfour-dev" mkdir "%~dp0tools\twentyfour-dev"
(
echo // twentyfour.dev helper
echo // Открой https://twentyfour.dev, найди компонент,
echo // скопируй команду и вставь в Claude Code.
echo // Или используй: npx shadcn add <component>
) > "%~dp0tools\twentyfour-dev\README.md"
echo    [OK] twentyfour.dev helper создан

echo.
echo ============================================
echo  ГОТОВО! Все инструменты установлены.
echo ============================================
echo.
echo Проверка установки:
echo   motion:            cd frontend/planner ^&^& npm ls motion
echo   agent-browser:     agent-browser --version
echo   skills:            dir %%USERPROFILE%%\.claude\skills
echo   mcp:               type %%USERPROFILE%%\.claude\mcp.json
echo.
pause
