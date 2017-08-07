<#
[Environment]::SetEnvironmentVariable("RX_OST_Environment", "prod", "Machine")
[Environment]::SetEnvironmentVariable("RX_Ost_ApplicationFullName", "Pos Laju EziSend", "Machine")
[Environment]::SetEnvironmentVariable("RX_OST_ApplicationName", "Ost", "Machine")
[Environment]::SetEnvironmentVariable("RX_OST_Home", "c:\apps\rx", "Machine")
[Environment]::SetEnvironmentVariable("RX_OST_WebPath", "c:\apps\rx\web", "Machine")
[Environment]::SetEnvironmentVariable("RX_OST_SqlConnectionString", "Data Source=PMBIPTTSV;Initial Catalog=Ost;User Id=sa;Password=P@ssw0rd;", "Machine")

[Environment]::SetEnvironmentVariable("ERLANG_HOME", "C:\Program Files\erl8.1", "Machine")
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Java\jre1.8.0_101", "Machine")
#>

<#
# Worker Server 1: \\10.1.16.106
[Environment]::SetEnvironmentVariable("BaseUrl", "http://172.19.1.121", "Machine")
[Environment]::SetEnvironmentVariable("RX_OST_BaseUrl", "http://172.19.1.121", "Machine")
# Worker Server 2: \\10.1.16.107
[Environment]::SetEnvironmentVariable("BaseUrl", "http://172.19.1.122", "Machine")
[Environment]::SetEnvironmentVariable("RX_OST_BaseUrl", "http://172.19.1.122", "Machine")
# Web Server 1: \\172.19.1.121
# Web Server 2: \\172.19.1.122
[Environment]::SetEnvironmentVariable("BaseUrl", "https://ezisend.poslaju.com.my/", "Machine")
[Environment]::SetEnvironmentVariable("RX_OST_BaseUrl", "https://ezisend.poslaju.com.my/", "Machine")
#>

<#
[Environment]::SetEnvironmentVariable("RX_OST_ElasticSearchHost", "http://10.1.16.106:9200", "Machine")
[Environment]::SetEnvironmentVariable("RX_OST_RabbitMqHost", "10.1.16.106", "Machine")
[Environment]::SetEnvironmentVariable("RX_OST_RabbitMqPassword", "manowar", "Machine")
[Environment]::SetEnvironmentVariable("RX_OST_RabbitMqUserName", "OstApp", "Machine")
#>

<#
# SAPFI Posting
[Environment]::SetEnvironmentVariable("RX_OST_AdminToken", "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlcyI6WyJhZG1pbmlzdHJhdG9ycyIsImNhbl9lZGl0X2VudGl0eSIsImNhbl9lZGl0X3dvcmtmbG93IiwiZGV2ZWxvcGVycyJdLCJlbWFpbCI6ImFkbWluQHlvdXJjb21wYW55LmNvbSIsInN1YiI6IjYzNjI1ODg3Nzc4NjYwMDg3NTVmMTgxMDQ0IiwibmJmIjoxNTA2MTU5Nzc5LCJpYXQiOjE0OTAyNjIxNzksImV4cCI6MTc2NzEzOTIwMCwiYXVkIjoiT3N0In0.DBMfLcyIdXsOl65p34hA7MOhUFimpGJYXGRn4-alfBI", "Machine")
[Environment]::SetEnvironmentVariable("RX_OST_SapFolder", "C:\temp", "Machine")
#>

<#
# Payment Gateway
[Environment]::SetEnvironmentVariable("RX_OST_PaymentGatewayApplicationId", "OST", "Machine")
[Environment]::SetEnvironmentVariable("RX_OST_PaymentGatewayBaseUrl", "https://ezipay.pos.com.my", "Machine")
[Environment]::SetEnvironmentVariable("RX_OST_PaymentGatewayEncryptionKey", "WdVxp54wmQlGFBmvOQgfmpAqCJ23gyGI", "Machine")

# SnB
[Environment]::SetEnvironmentVariable("RX_OST_SnbReadSqlConnectionString", "Data Source=10.1.1.120;Initial Catalog=SnBReadProdOst;User Id=sa;Password=P@ssw0rd;", "Machine")
[Environment]::SetEnvironmentVariable("RX_OST_SnbWebApi", "http://10.1.1.119:9002/api", "Machine")
[Environment]::SetEnvironmentVariable("RX_OST_SnbWebApp", "http://10.1.1.119:9001", "Machine")

# SDS for CMS, PSS & Track&Trace
[Environment]::SetEnvironmentVariable("RX_OST_SdsBaseUrl", "https://apis.pos.com.my", "Machine")
[Environment]::SetEnvironmentVariable("RX_OST_SdsApi_GenerateConnote", "apigateway/as01/api/genconnote/v1", "Machine")
[Environment]::SetEnvironmentVariable("RX_OST_SdsSecretKey_GenerateConnote", "MjkzYjA5YmItZjMyMS00YzNmLWFmODktYTc2ZTAxMDgzY2Mz", "Machine")
[Environment]::SetEnvironmentVariable("RX_OST_SdsApi_PickupWebApi", "apigateway/as2poslaju/api/pickupwebapi/v1", "Machine")
[Environment]::SetEnvironmentVariable("RX_OST_SdsSecretKey_PickupWebApi", "Nzc1OTk0OTktYzYyNC00MzhhLTk5OTAtYTc2ZTAxMGJiYmMz", "Machine")
[Environment]::SetEnvironmentVariable("RX_OST_SdsApi_SdsTrackTrace_WebApi", "apigateway/as2corporate/api/v2trackntracewebapijson/v1", "Machine")
[Environment]::SetEnvironmentVariable("RX_OST_SdsSecretKey_SdsTrackTrace_WebApi", "YTk3ZDYyNTgtMzAwMS00ZDQ0LWJjZGUtYTZlYzAxMTY5NDE3", "Machine")
[Environment]::SetEnvironmentVariable("RX_OST_SdsApi_SdsTrackTrace_WebApiHeader", "apigateway/as2corporate/api/trackntracewebapiheader/v1", "Machine")
[Environment]::SetEnvironmentVariable("RX_OST_SdsSecretKey_SdsTrackTrace_WebApiHeader", "ZjE3NTc3ZTgtNDg0NC00ZGFhLTlkNWEtYTcyODAwYzk2MGU1", "Machine")
#>

<#
# switch to staging!!!
[Environment]::SetEnvironmentVariable("RX_OST_SdsBaseUrl", "http://stagingsds.pos.com.my/apigateway", "Machine")
[Environment]::SetEnvironmentVariable("RX_OST_SdsApi_GenerateConnote", "as2corporate/api/generateconnote/v1", "Machine")
[Environment]::SetEnvironmentVariable("RX_OST_SdsSecretKey_GenerateConnote", "ODA2MzViZTAtODk3MS00OGU5LWFiNGEtYTcxYjAxMjU4NjM1", "Machine")
[Environment]::SetEnvironmentVariable("RX_OST_SdsApi_PickupWebApi", "devposlaju/api/pickupwebapi/v1", "Machine")
[Environment]::SetEnvironmentVariable("RX_OST_SdsSecretKey_PickupWebApi", "ZGQxNGJjMDEtZGMyMy00YjQwLWFiODUtYTcxYjAxMzAyMjdk", "Machine")
[Environment]::SetEnvironmentVariable("RX_OST_PaymentGatewayBaseUrl", "http://testv2paymentgateway.posonline.com.my", "Machine")
#>