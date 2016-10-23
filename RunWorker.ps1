Param(
       [switch]$InMemory = $false,
       [switch]$Debug = $false,
       [string]$config = "all"
       
     )

if($Debug -ne $false){
  & .\subscribers.host\workers.console.runner.exe /log:console /config:$config /v:Ost /debug 
}else{
   & .\subscribers.host\workers.console.runner.exe /log:console /v:Ost /config:$config
}
    
