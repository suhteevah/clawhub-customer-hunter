@echo off
REM Rocking-A Night Vision — proposal generator (no-terminal runner)
REM Walks the user through a prospect, then writes a .docx to output\

setlocal enabledelayedexpansion

cd /d "%~dp0"

REM Prefer the prebuilt binary in bin\, fall back to a fresh cargo build if missing
set RANV_BIN=bin\ranv-pitch.exe
if not exist "%RANV_BIN%" (
  if exist "%RANV_BIN%" (
    set RANV_BIN=%RANV_BIN%
  ) else (
    echo Building ranv-pitch from source ^(first run, takes ~2 minutes^)...
    cargo build --release
    if errorlevel 1 (
      echo.
      echo Build failed. Make sure Rust is installed: https://rustup.rs/
      pause
      exit /b 1
    )
    set RANV_BIN=%RANV_BIN%
  )
)

echo.
echo === Rocking-A Night Vision Proposal Generator ===
echo.
echo Audiences:
%RANV_BIN% audiences
echo.

set /p AUDIENCE=Audience key (le/rancher/outfitter/dealer/training/film):
set /p BIZNAME=Business name:
set /p CONTACT=Contact name:
set /p LOCATION=Location (optional, press enter to skip):
set /p HOOK=One-line hook (or press enter for default):

set SLUG=%BIZNAME: =_%
set TOML=prospects\%SLUG%.toml

if not exist prospects mkdir prospects

(
  echo business_name = "%BIZNAME%"
  echo contact_name  = "%CONTACT%"
  echo location      = "%LOCATION%"
  echo hook          = "%HOOK%"
) > "%TOML%"

echo.
echo Wrote prospect TOML: %TOML%
echo Generating proposal...
echo.

%RANV_BIN% generate --prospect "%TOML%" --audience %AUDIENCE%

if errorlevel 1 (
  echo.
  echo Generation failed. Check the prospect TOML and try again.
  pause
  exit /b 1
)

echo.
echo Done. Check the output\ folder.
pause
