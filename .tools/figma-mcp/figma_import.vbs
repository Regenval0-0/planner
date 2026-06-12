Set WshShell = WScript.CreateObject("WScript.Shell")

' 1. Activate Figma
WshShell.AppActivate "Figma"
WScript.Sleep 1500

' 2. Send Ctrl+/
WshShell.SendKeys "^{/}"
WScript.Sleep 1500

' 3. Type "import plugin from manifest"
WshShell.SendKeys "import plugin from manifest"
WScript.Sleep 500
WshShell.SendKeys "{ENTER}"
WScript.Sleep 2500

' 4. Type manifest path
WshShell.SendKeys "C:\Ren\.tools\figma-mcp\plugins\supercharged-figma\manifest.json"
WScript.Sleep 500
WshShell.SendKeys "{ENTER}"
WScript.Sleep 5000

' 5. Launch plugin - Ctrl+/
WshShell.AppActivate "Figma"
WScript.Sleep 500
WshShell.SendKeys "^{/}"
WScript.Sleep 1500
WshShell.SendKeys "Supercharged Figma AI"
WScript.Sleep 500
WshShell.SendKeys "{ENTER}"
WScript.Sleep 3000

MsgBox "Done! Check Figma for plugin window with Channel ID"
