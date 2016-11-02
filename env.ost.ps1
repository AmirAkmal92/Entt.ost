
$RxHome = "$PWD"
$machine = ($env:COMPUTERNAME).Replace("-","_")
[System.Environment]::SetEnvironmentVariable("RX_OST_HOME","$RxHome", "Process")
[System.Environment]::SetEnvironmentVariable("RX_OST_WebPath","$PWD\web", "Process")
[System.Environment]::SetEnvironmentVariable("RX_OST_WebsitePort","50230", "Process")
[System.Environment]::SetEnvironmentVariable("RX_OST_BaseUrl","http://localhost:50230", "Process")
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


$env:RX_OST_SnbReadSqlConnectionString="Data Source=(localdb)\ProjectsV13;Initial Catalog=SnBRead;Integrated Security=True;Connect Timeout=30;Encrypt=False;TrustServerCertificate=True;ApplicationIntent=ReadWrite;MultiSubnetFailover=False";

$computerName = $env:COMPUTERNAME
if((Test-Path("env.ost.$computerName.ps1")) -eq $true){
    & ".\env.ost.$computerName.ps1";
}
