' Pokrece lokalni UI server (http://localhost:3009) bez konzolnog prozora. Koristi ga Scheduled Task "MarketingPosloviServer".
Set sh = CreateObject("WScript.Shell")
root = Left(WScript.ScriptFullName, InStrRev(WScript.ScriptFullName, "\") - 1)
sh.CurrentDirectory = root
sh.Run "cmd /c node --experimental-strip-types --disable-warning=ExperimentalWarning src\server.ts >> data\server.out 2>&1", 0, True
