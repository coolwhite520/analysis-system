@echo off
start /w .\WinLicense\WinLicense64.exe  /protect analysis-system

if errorlevel 3 goto 3
if errorlevel 2 goto 2
if errorlevel 1 goto 1
if errorlevel 0 goto 0
goto done

:0
echo Application protected successfully
goto done

:1
echo ERROR: File already protected
goto done 

:2
echo ERROR: File to protect cannot be opened 
goto done 

:3
echo ERROR: An internal error occurred while protecting
:done
 
