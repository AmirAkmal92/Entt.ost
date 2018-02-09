Import-Module posh-git

$RxHome = "$PWD"
$machine = ($env:COMPUTERNAME).Replace("-","_")
$env:RX_OST_HOME = "$RxHome"
$env:RX_OST_WebPath = "$PWD\web"
$env:RX_OST_WebsitePort = "50230"
$env:RX_OST_BaseUrl = "http://localhost:50230"
$env:RX_OST_IisExpressExecutable = "$RxHome\IIS Express\iisexpress.exe"

$env:RX_Ost_ApplicationFullName = "Pos Laju EziSend"

$env:RX_OST_RabbitMqManagementPort = "15672"
$env:RX_OST_RabbitMqUserName = "guest"
$env:RX_OST_RabbitMqPassword = "guest"

$env:RABBITMQ_BASE = "$RxHome\rabbitmq_base"
$env:RX_OST_RabbitMqBase = "$RxHome\rabbitmq_base"
$env:RX_OST_RabbitMqDirectory = "$RxHome\rabbitmq_server"
$env:PATH = "$env:Path;$RxHome\rabbitmq_server\sbin"

$env:RX_OST_ElasticsearchIndexNumberOfShards = "1"
$env:RX_OST_ElasticsearchHttpPort = "9200"
$env:RX_OST_ElasticSearchJar = "$RxHome\elasticsearch\lib\elasticsearch-1.7.5.jar"
$env:RX_OST_ElasticsearchClusterName = "cluster_$machine" + "_OST"
$env:RX_OST_ElasticsearchIndexNumberOfReplicas = "0"
$env:RX_OST_ElasticsearchNodeName = "node_$machine" + "_OST"

$env:RX_OST_LoggerWebSocketPort = "50238"
$env:RX_OST_SqlLocalDbName = "ProjectsV13"
$env:RX_OST_SqlConnectionString = "Data Source=(localdb)\ProjectsV13;Initial Catalog=Ost;Integrated Security=True;"

$env:RX_OST_SnbReadSqlConnectionString = "Data Source=(localdb)\ProjectsV13;Initial Catalog=SnBRead;Integrated Security=True;"
$env:RX_OST_SnbWebApp = "http://localhost:20597"
$env:RX_OST_SnbWebApi = "http://localhost:3330"

$env:RX_OST_SdsBaseUrl = "https://apis.pos.com.my"
$env:RX_OST_SdsApi_GenerateConnote = "apigateway/as01/api/genconnote/v1";
$env:RX_OST_SdsSecretKey_GenerateConnote = "MjkzYjA5YmItZjMyMS00YzNmLWFmODktYTc2ZTAxMDgzY2Mz";
$env:RX_OST_SdsApi_GenerateConnoteEst = "apigateway/as01/api/generateconnotebaby/v1";
$env:RX_OST_SdsSecretKey_GenerateConnoteEst = "NjloNDVKSUtiRm05MGdHR1dtbkdpQ09NOVpSN3hObWU=";
$env:RX_OST_SdsApi_PickupWebApi = "apigateway/as2poslaju/api/ezisendpickupwebapi/v1";
$env:RX_OST_SdsSecretKey_PickupWebApi = "ckk1cjZ4V2NwSHJWVFZCTVVsSmZGSWtESUpBanNra0g=";
$env:RX_OST_SdsApi_SdsTrackTrace_WebApi = "apigateway/as2corporate/api/v2trackntracewebapijson/v1";
$env:RX_OST_SdsSecretKey_SdsTrackTrace_WebApi = "YTk3ZDYyNTgtMzAwMS00ZDQ0LWJjZGUtYTZlYzAxMTY5NDE3";
$env:RX_OST_SdsApi_SdsTrackTrace_WebApiHeader = "apigateway/as2corporate/api/trackntracewebapiheader/v1";
$env:RX_OST_SdsSecretKey_SdsTrackTrace_WebApiHeader = "ZjE3NTc3ZTgtNDg0NC00ZGFhLTlkNWEtYTcyODAwYzk2MGU1";

$env:RX_OST_PaymentGatewayBaseUrl = "https://ezipay.pos.com.my"
$env:RX_OST_PaymentGatewayApplicationId = "OST"
$env:RX_OST_PaymentGatewayEncryptionKey = "WdVxp54wmQlGFBmvOQgfmpAqCJ23gyGI"

$env:RX_OST_AdminToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlcyI6WyJhZG1pbmlzdHJhdG9ycyIsImNhbl9lZGl0X2VudGl0eSIsImNhbl9lZGl0X3dvcmtmbG93IiwiZGV2ZWxvcGVycyJdLCJlbWFpbCI6ImFkbWluQHlvdXJjb21wYW55LmNvbSIsInN1YiI6IjYzNjIwNDQ2NTgyNzk2MDA0NDYwOGNjMzdjIiwibmJmIjoxNTAwNDU5MzgzLCJpYXQiOjE0ODQ4MjA5ODMsImV4cCI6MTUxNDY3ODQwMCwiYXVkIjoiT3N0In0.qIA-b-0XTI_GpgMCGJC1yAAtw04UoPaNYoxMSXeBrPk"
$env:RX_OST_SapFolder = "C:\temp"
$env:RX_OST_ESocFolder = "C:\temp"

$env:RX_OST_RtsBaseUrl = "http://10.1.3.141"
$env:RX_OST_RtsAdminToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlcyI6WyJhZG1pbmlzdHJhdG9ycyIsImNhbl9lZGl0X2VudGl0eSIsImNhbl9lZGl0X3dvcmtmbG93IiwiZGV2ZWxvcGVycyJdLCJlbWFpbCI6ImFkbWluQGJlc3Bva2UuY29tLm15Iiwic3ViIjoiNjM2Mjk1MDY0NDg4MTQxNjEyOTM0Zjk2NTEiLCJuYmYiOjE1MDk3Nzg0NDksImlhdCI6MTQ5Mzg4MDg0OSwiZXhwIjoxNjA5MzcyODAwLCJhdWQiOiJQb3NFbnR0In0.2xo6v2yiWpGMY1BnuErIFTrFBpJHrOVqwkbJEuqjxLs"

$computerName = $env:COMPUTERNAME
if((Test-Path("env.ost.$computerName.ps1")) -eq $true){
    & ".\env.ost.$computerName.ps1";
}
