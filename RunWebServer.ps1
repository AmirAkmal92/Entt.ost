 netstat -ano | Select-String "50230"
 netsh http delete urlacl url=http://*:50230/
 netsh http add urlacl url=http://*:50230/ user=everyone
 & '.\IIS Express\iisexpress.exe' /config:.\config\applicationhost.config /site:web.Ost /trace:error