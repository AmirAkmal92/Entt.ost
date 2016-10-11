Param(
       [string]$WorkingCopy = ".",
       [string]$ApplicationName = "",
       [string]$Port = 0,
       [string]$SqlServer = "Projects",
       [string]$DatabaseName = $ApplicationName,
       [string]$RabbitMqUserName = "guest",
       [string]$RabbitMqPassword = "guest",
       [string]$RabbitMqBase = "",
       [string]$ElasticSearchHost = "http://localhost:9200",
       [string]$ElasticSearchUserName = "",
       [string]$ElasticSearchPassword = "",
	   [switch]$Help = $false
     )


if(($Help -eq $true) -or ($ApplicationName -eq ""))
{
	Write-Output "	A script to help to create new SPH appp in your working copy, `
	You'll need to provide the path to your working copy and the application name`
	"	
	
	exit;
}
$WorkingCopy = pwd
if($RabbitMqBase -ne ""){
    [Environment]::SetEnvironmentVariable("RABBITMQ_BASE", "$RabbitMqBase", "Process")
    if((Test-Path("$RabbitMqBase")) -eq $false)
    {
        mkdir "$RabbitMqBase"
    }
}

if(!(Get-Command sqllocaldb -ErrorAction SilentlyContinue))
{
    Write-Warning "Cannot find sqllocaldb  in your path"
    exit;
}


Write-Debug "Seting up Rx Developer- $ApplicationName project in $WorkingCopy"

Import-Module .\utils\sqlcmd.dll

if(!(Get-Command Invoke-WebRequest -ErrorAction SilentlyContinue))
{
    Write-Warning "You will need at least powershell version 3.0"
    exit;
}


if(!(Test-Path("C:\Windows\Microsoft.NET\Framework\v4.0.30319\aspnet_regsql.exe")))
{
    Write-Warning "Cannot find aspnet_regsql in your path, you may not have .Net 4.6 SDK installed"
    Start-Process "http://www.bespoke.com.my/download"
    exit;
}


#verify the tools are in the path
if(!(Test-Path(".\rabbitmq_server\sbin\rabbitmqctl.bat")))
{
    Write-Warning "Cannot find rabbitmqctl"
    exit;
}
Try
{
   & SqlLocalDB create "$SqlServer"
   Invoke-SqlCmdRx -E -S "(localdb)\$SqlServer" -Q "SELECT * FROM sysdatabases"
}
Catch
{
    Write-Warning "Cannot cannot to $SqlServer , Please make sure the server instance is correct and trusted connection can be used"
    exit;
}


if($Port -eq 0)
{
	Write-Warning "Please provide a port no for your web app"	
	exit;
}
if($ApplicationName -eq "Dev")
{
	Write-Warning "Please provide a different name, Dev is a reserved keyword"	
	exit;
}

#remove all the configs from subscribers
ls -Path .\subscribers -Filter *.config | Remove-Item




if((Test-Path("$WorkingCopy\StartAspnetAdminWeb.bat")) -eq $false)
{
    $c0 = (gc "$WorkingCopy\StartAspnetAdminWeb.bat").replace("WorkingCopyPath","$WorkingCopy\web")
    Set-Content "$WorkingCopy\StartAspnetAdminWeb.bat" -Value $c0
}



#creates databases
Write-Debug "Creating database $DatabaseName"
if((Test-Path("$WorkingCopy\data")) -eq $false){
    mkdir "$WorkingCopy\data"
}
$ndf2 = $DatabaseName + "_2";
$ldf = $DatabaseName + "_log";

Invoke-SqlCmdRx -S "(localdb)\$SqlServer" -E -d master -Q "IF  EXISTS (
	SELECT name 
		FROM sys.databases 
		WHERE name = N'$DatabaseName'
)
DROP DATABASE [$DatabaseName]"
Invoke-SqlCmdRx -S "(localdb)\$SqlServer" -E -d master `
-Q "CREATE DATABASE [$DatabaseName]  ON  PRIMARY
( NAME = N'jpaod',
FILENAME = N'$WorkingCopy\data\$ApplicationName.mdf' ,
SIZE = 3072KB , FILEGROWTH = 1024KB ),
FILEGROUP [Secondary] ( NAME = N'$ndf2',
FILENAME = N'$WorkingCopy\DATA\$ndf2.ndf' ,
SIZE = 3072KB , FILEGROWTH = 1024KB )
LOG ON
( NAME = N'$ldf',
FILENAME = N'$WorkingCopy\data\$ldf.ldf' ,
SIZE = 1024KB , FILEGROWTH = 10%)"


Write-Debug "Created database $DatabaseName"
#Start-Sleep -Seconds 10
Invoke-SqlCmdRx -S "(localdb)\$SqlServer" -E -d "$DatabaseName" -Q "CREATE SCHEMA [Sph] AUTHORIZATION [dbo]"
Invoke-SqlCmdRx -S "(localdb)\$SqlServer" -E -d "$DatabaseName" -Q "CREATE SCHEMA [$ApplicationName] AUTHORIZATION [dbo]"
Write-Debug "Created schema [SPH]"

Get-ChildItem -Filter *.sql -Path $WorkingCopy\database\Table `
| %{
    Write-Debug "Creating table $_"
    $sqlFileName = $_.FullName    
    Invoke-SqlCmdRx -S "(localdb)\$SqlServer" -E -d "$DatabaseName" -i "$sqlFileName"
}


#Rabbitmqctl
& .\rabbitmq_server\sbin\rabbitmqctl.bat add_vhost "$ApplicationName"
& .\rabbitmq_server\sbin\rabbitmqctl.bat set_permissions -p "$ApplicationName" $RabbitMqUserName ".*" ".*" ".*"
& .\rabbitmq_server\sbin\rabbitmq-plugins.bat enable "rabbitmq_management"

#elastic search mappings
$esindex = $ElasticSearchHost + "/" + $ApplicationName.ToLowerInvariant() + "_sys"
Invoke-WebRequest -Method Put -Body "" -Uri $esindex  -ContentType "application/javascript"

Get-ChildItem -Filter *.json -Path .\database\mapping `
| %{
    $mappingUri = $esindex + "/" + $_.Name.ToLowerInvariant().Replace(".json", "") + "/_mapping"
    Write-Debug "Creating elastic search mapping for $mappingUri"
    Invoke-WebRequest -Method PUT -Uri $mappingUri -InFile $_.FullName -ContentType "application/javascript"
}

Get-ChildItem -Filter *.template -Path .\database\mapping `
| %{
    $templateName = $_.Name.ToLowerInvariant().Replace(".template", "")
    $templateUri = "$ElasticSearchHost/_template/$templateName"
    $templateContent = Get-Content $_.FullName
    $templateJson = $templateContent.Replace("<<application_name>>", $ApplicationName.ToLowerInvariant());

    Write-Debug "Creating elasticsearch index template for $templateName"
    Invoke-WebRequest -Method PUT -Uri $templateUri -ContentType "application/javascript" -Body $templateJson
}



#configs value
$allConfigs = @("$WorkingCopy\web\web.config"
, "$WorkingCopy\schedulers\scheduler.delayactivity.exe.config"
, "$WorkingCopy\schedulers\scheduler.data.import.exe.config"
, "$WorkingCopy\schedulers\scheduler.workflow.trigger.exe.config"
, "$WorkingCopy\subscribers.host\workers.console.runner.exe.config"
, "$WorkingCopy\subscribers.host\workers.windowsservice.runner.exe.config"
, "$WorkingCopy\tools\sph.builder.exe.config"
)


[Environment]::SetEnvironmentVariable("RX_$ApplicationName" + "_BaseUrl", 'http://localhost:' + $Port, "User")
[Environment]::SetEnvironmentVariable("RX_$ApplicationName" + "_HOME", "$WorkingCopy", "User")
[Environment]::SetEnvironmentVariable("RX_$ApplicationName" + "_ApplicationFullName", "$ApplicationName", "User")
    
$connectionString = "Data Source=(localdb)\$SqlServer;Initial Catalog=$DatabaseName;Integrated Security=True;Connect Timeout=30;Encrypt=False;TrustServerCertificate=False"
[Environment]::SetEnvironmentVariable("RX_$ApplicationName" + "_SqlConnectionString", "$connectionString", "User")

[Environment]::SetEnvironmentVariable("RX_$ApplicationName" + "_RabbitMqVirtualHost", "$ApplicationName", "User")
[Environment]::SetEnvironmentVariable("RX_$ApplicationName" + "_RabbitMqUserName", "$RabbitMqUserName", "User")
[Environment]::SetEnvironmentVariable("RX_$ApplicationName" + "_RabbitMqPassword", "$RabbitMqPassword", "User")
 
 
$taskscheduler = $WorkingCopy   + "\schedulers\scheduler.delayactivity.exe"       
[Environment]::SetEnvironmentVariable("RX_$ApplicationName" + "_TaskScheduler", "$taskscheduler", "User")


foreach($configFile in $allConfigs){
    Write-Debug "Processing $configFile"

    $xml = (Get-Content $configFile) -as [xml]
    $xml.SelectSingleNode('//appSettings/add[@key="sph:ApplicationName"]/@value').'#text' = $ApplicationName
    $xml.Save($configFile)
}
#set the IIS config
$apc = (Get-Content .\config\applicationhost.config) -as [xml]
$site = $apc.SelectSingleNode("//configuration/system.applicationHost/sites/site[@id=1]")
$site.SetAttribute("name", "web.$ApplicationName")
$site.SelectSingleNode("application/virtualDirectory").SetAttribute("physicalPath", "$WorkingCopy\web")
$bindingInformation = "*:" + $Port.ToString() + ":localhost"
$site.SelectSingleNode("bindings/binding").SetAttribute("bindingInformation","$bindingInformation")
$apc.Save("$WorkingCopy\config\applicationhost.config")


#web
if((Test-Path("$WorkingCopy\web\SphApp\partial")) -eq $false)
{
    mkdir "$WorkingCopy\web\SphApp\partial"
}

#email folder
if((Test-Path("C:\temp\sphEmail")) -eq $false)
{
    mkdir "C:\temp\sphEmail"
}

# endpoint-permissions
if((Test-Path(".\sources\EndpointPermissionSetting")) -eq $false)
{
    mkdir ".\sources\EndpointPermissionSetting"
    copy  ".\database\EndpointPermissionSetting\default.json" ".\sources\EndpointPermissionSetting\"   
}




#asp.net memberships
Write-Debug "Executing Aspnet membership provider"
Start-Process -RedirectStandardOutput "v1.log" -Wait -WindowStyle Hidden -FilePath "C:\Windows\Microsoft.NET\Framework\v4.0.30319\aspnet_regsql.exe" `
-ArgumentList  @("-E","-S",'"(localdb)\' + $SqlServer+ '"',"-d " + $DatabaseName,"-A mr")


Write-Debug "Aspnet membership has been added"
Write-Debug "Please wait....."

#roles
& .\utils\mru.exe -r administrators -r developers -r can_edit_entity -r can_edit_workflow -c "$WorkingCopy\web\web.config" -env -app $ApplicationName
& .\utils\mru.exe -u admin -p 123456 -e admin@$ApplicationName.com -r administrators -r developers -r can_edit_entity -r can_edit_workflow -c "$WorkingCopy\web\web.config" -env -app $ApplicationName



#delete all accidentally added config
$rubbishConfigs = @("$WorkingCopy\subscribers\subscriber.workflow.dll.config"
,"$WorkingCopy\schedulers\scheduler.delayactivity.config"
,"$WorkingCopy\schedulers\razor.template.dll.config"
,"$WorkingCopy\schedulers\scheduler.workflow.trigger.config"
,"$WorkingCopy\schedulers\sql.repository.dll.config"
,"$WorkingCopy\subscribers\razor.template.dll.config"
,"$WorkingCopy\subscribers\sql.repository.dll.config"
)
foreach($ucon in $rubbishConfigs)
{
    if((Test-Path $ucon) -eq $true){
        Remove-Item $ucon
    }
}