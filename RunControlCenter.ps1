param(
    [string]$UpdateUrl = "http://alpha.rxdeveloper.com",
    [switch]$DontUpdate,
    [switch]$KeepDownloadedUpdates
)

& ".\env.ost.ps1"

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



while($true){


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
            $today = [System.DateTime]::Today.ToString("yyyy-MM-dd");
            
                $updateJson = @"
{   
    "build": $vnext,
    "date" : "$today"
}
"@
$updateJson | Out-File .\version.json -Encoding ascii        
        }


    }catch{
     $code = $_.Exception.Response.StatusCode.Value__
     if($code -eq 404){
        Write-Host "No update is avalailable" -ForegroundColor Cyan
        Write-Host "Starting control center"
     }
     break;
    }




}




& .\control.center\controlcenter.exe