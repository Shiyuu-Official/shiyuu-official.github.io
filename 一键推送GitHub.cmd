@echo off
chcp 65001 >nul
cd /d "%~dp0"
set "PORTFOLIO_NODE=node"
where node >nul 2>nul
if errorlevel 1 set "PORTFOLIO_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
echo 正在检查并推送当前内容到 GitHub，成功后会自动更新线上网站。
"%PORTFOLIO_NODE%" scripts\publish-github.mjs
set "PORTFOLIO_RESULT=%ERRORLEVEL%"
echo.
pause
exit /b %PORTFOLIO_RESULT%
