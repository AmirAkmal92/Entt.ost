Param(
       [switch]$InMemory = $false,
       [switch]$Debug = $false,
       [string]$config = "all"
       
     )

if($Debug -ne $false){
   Start-Process -FilePath .\subscribers.host\workers.console.runner.exe -ArgumentList @( "/log:console", "/config:$config", "/v:Ost",  "/debug" )
}else{
   Start-Process -FilePath .\subscribers.host\workers.console.runner.exe -ArgumentList @( "/log:console", "/config:$config", "/v:Ost" )
}
    
