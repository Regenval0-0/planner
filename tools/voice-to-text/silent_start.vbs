Set WshShell = CreateObject("WScript.Shell")
scriptDir = Left(WScript.ScriptFullName, InStrRev(WScript.ScriptFullName, "\") - 1)

' Пробуем точный путь к pythonw.exe из установки Python 3.12
pythonPath = "C:\Users\dasha\AppData\Local\Programs\Python\Python312\pythonw.exe"

Set fso = CreateObject("Scripting.FileSystemObject")
If Not fso.FileExists(pythonPath) Then
    pythonPath = "pythonw"
End If

cmd = "cmd /c chcp 65001 > nul & " & Chr(34) & pythonPath & Chr(34) & " " & Chr(34) & scriptDir & "\main_background.py" & Chr(34)
WshShell.Run cmd, 0, False
Set WshShell = Nothing
