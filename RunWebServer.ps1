param
(
    [int]$LoggerWebSocketPort = 50238
)
& .\env.ost.ps1

Import-Module .\utils\sqlcmd.dll

$port = Get-Process controlcenter | Get-ProcessVariable -Variable RX_OST_LoggerWebSocketPort
$port1 = $LoggerWebSocketPort
if([System.Int32]::TryParse($port, [ref]$port1)){
    Write-Host "Getting WebSocket port value from controlcenter" -ForegroundColor Cyan
    Write-Host "Setting RX_OST_LoggerWebSocketPort value from ControlCenter : $port1"
    $env:RX_OST_LoggerWebSocketPort = $port1
}else{
    Write-Host "Setting RX_OST_LoggerWebSocketPort value from parameter : $LoggerWebSocketPort"
    $env:RX_OST_LoggerWebSocketPort = $LoggerWebSocketPort
}
Start-Process -FilePath '.\IIS Express\iisexpress.exe' -ArgumentList @("/config:.\config\applicationhost.config",  "/site:web.Ost",  "/trace:error")

