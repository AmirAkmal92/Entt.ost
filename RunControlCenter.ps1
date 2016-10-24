param(
    [string]$UpdateUrl = "http://alpha.rxdeveloper.com",
    [switch]$DontUpdate,
    [switch]$KeepDownloadedUpdates
)

$RxHome = "$PWD"
$machine = ($env:COMPUTERNAME).Replace("-","_")
[System.Environment]::SetEnvironmentVariable("RX_OST_HOME","$RxHome", "Process")
[System.Environment]::SetEnvironmentVariable("RX_OST_WebPath","$PWD\web", "Process")
[System.Environment]::SetEnvironmentVariable("RX_OST_WebsitePort","50430", "Process")
[System.Environment]::SetEnvironmentVariable("RX_OST_BaseUrl","http://localhost:50430", "Process")
[System.Environment]::SetEnvironmentVariable("RX_OST_IisExpressExecutable","$RxHome\IIS Express\iisexpress.exe", "Process")


[System.Environment]::SetEnvironmentVariable("RX_OST_RabbitMqPassword","guest", "Process")
[System.Environment]::SetEnvironmentVariable("RX_OST_RabbitMqManagementPort","15672", "Process")
[System.Environment]::SetEnvironmentVariable("RX_OST_RabbitMqUserName","guest", "Process")

[System.Environment]::SetEnvironmentVariable("RABBITMQ_BASE","$RxHome\rabbitmq_base", "Process")
[System.Environment]::SetEnvironmentVariable("RX_OST_RabbitMqBase","$RxHome\rabbitmq_base", "Process")
[System.Environment]::SetEnvironmentVariable("RX_OST_RabbitMqDirectory","$RxHome\rabbitmq_server", "Process")
[System.Environment]::SetEnvironmentVariable("PATH","$env:Path;$RxHome\rabbitmq_server\sbin", "Process")

[System.Environment]::SetEnvironmentVariable("RX_OST_ElasticsearchIndexNumberOfShards","1", "Process")
[System.Environment]::SetEnvironmentVariable("RX_OST_ElasticsearchHttpPort","9200", "Process")
[System.Environment]::SetEnvironmentVariable("RX_OST_ElasticSearchJar","$RxHome\elasticsearch\lib\elasticsearch-1.7.5.jar", "Process")
[System.Environment]::SetEnvironmentVariable("RX_OST_ElasticsearchClusterName","cluster_$machine""_OST", "Process")
[System.Environment]::SetEnvironmentVariable("RX_OST_ElasticsearchIndexNumberOfReplicas","0", "Process")
[System.Environment]::SetEnvironmentVariable("RX_OST_ElasticsearchNodeName","node_$machine" + "_OST", "Process")


[System.Environment]::SetEnvironmentVariable("RX_OST_LoggerWebSocketPort","50238", "Process")
[System.Environment]::SetEnvironmentVariable("RX_OST_SqlLocalDbName","ProjectsV13", "Process")
[System.Environment]::SetEnvironmentVariable("RX_OST_SqlConnectionString", "Data Source=(localdb)\ProjectsV13;Initial Catalog=Ost;Integrated Security=True;Connect Timeout=30;Encrypt=False;TrustServerCertificate=True;ApplicationIntent=ReadWrite;MultiSubnetFailover=False", "Process")


if($DontUpdate.IsPresent -eq $true){
   
    & .\control.center\controlcenter.exe
    return;
}


if((Test-Path(".\version.json")) -eq $false)
{
    $updateJson = @"
{   
    "build": 10326,
    "date" : "2016-10-20"
}
"@
$updateJson | Out-File .\version.json -Encoding ascii
}

$json = Get-Content .\version.json | ConvertFrom-Json
$build = $json.build
Write-Host "Please wait while we check for new RX build, current build is $build" -ForegroundColor Cyan

try{
    $release = Invoke-WebRequest -Method Get -UseBasicParsing -Uri "$UpdateUrl/binaries/$build.json" -ErrorAction Ignore
    Write-Host $release.StatusCode

    $jsonResponse = $release.Content | ConvertFrom-Json
    $vnext = $jsonResponse.vnext;
    # $updateScript = $jsonResponse["update-script"]
    #download update script
    Write-Host "There's a new update package, $vnext is available " -ForegroundColor Yellow
    Write-Host "Do you want to apply this update[Yes(y), No (n)] : " -ForegroundColor Yellow -NoNewline
 
    $applyUpdate = Read-Host
    if($applyUpdate -eq 'y')
    {        
        if((Test-Path(".\$vnext")) -eq $true)
        {
            Remove-Item ".\$vnext" -Force -Recurse
        }
        Write-Host "Downloading $UpdateUrl/binaries/$vnext/$vnext.ps1"

        if((Test-Path(".\$vnext.ps1")) -eq $true){
            Remove-Item ".\$vnext.ps1"
        }

        Invoke-WebRequest -Method Get -UseBasicParsing -Uri "$UpdateUrl/binaries/$vnext/$vnext.ps1" -OutFile ".\$vnext.ps1"

        # run 
        Write-Host "Runing... ./$vnext.ps1"
        & ".\$vnext.ps1"
        
        Write-Host "Successfully applying the update, please check your git status, see if there's any error"
        
        if($KeepDownloadedUpdates.IsPresent -eq $false)
        {
            # remove the folder and scripts
            Remove-Item ".\$vnext.ps1"
            Remove-Item ".\$vnext" -Recurse -Force
        }        
    }


}catch{
 $code = $_.Exception.Response.StatusCode.Value__
 if($code -eq 404){
    Write-Host "No update is avalailable" -ForegroundColor Cyan
    Write-Host "Starting control center"
 }
}


& .\control.center\controlcenter.exe