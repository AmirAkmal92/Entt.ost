
$RxHome = "$PWD"
$machine = ($env:COMPUTERNAME).Replace("-","_")
$env:RX_OST_HOME = "$RxHome"
$env:RX_OST_WebPath = "$PWD\web"
$env:RX_OST_WebsitePort = "50230"
$env:RX_OST_BaseUrl = "http://localhost:50230"
$env:RX_OST_IisExpressExecutable = "$RxHome\IIS Express\iisexpress.exe"

$env:RX_Ost_ApplicationFullName = "Pos Laju EziSend"

$env:RX_OST_RabbitMqPassword = "guest"
$env:RX_OST_RabbitMqManagementPort = "15672"
$env:RX_OST_RabbitMqUserName = "guest"

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
$env:RX_OST_SdsBaseUrl = "http://stagingsds.pos.com.my/apigateway"

$env:RX_OST_PaymentGatewayBaseUrl = "http://testv2paymentgateway.posonline.com.my"
$env:RX_OST_PaymentGatewayApplicationId = "OST"
$env:RX_OST_PaymentGatewayEncryptionKey = "WdVxp54wmQlGFBmvOQgfmpAqCJ23gyGI"

$computerName = $env:COMPUTERNAME
if((Test-Path("env.ost.$computerName.ps1")) -eq $true){
    & ".\env.ost.$computerName.ps1";
}
