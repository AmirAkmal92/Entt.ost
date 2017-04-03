# OST Installation guide

Clone the repository to your desired location, normally I would go and do
```
git clone https://bespoke.visualstudio.com/DefaultCollection/pos.entt/_git/entt.ost c:\project\work\entt.ost
```

Extract the package from my OneDrive [Download 10350](https://1drv.ms/u/s!AnfOLTS4EYc4g5s3blltwHm5h_0tPw) 

Since web already been extracted you may want to leave it out , except you still need to copy web/bin


## Edit Elasticsearch config manually

Now edit `elasticsearch\config\elasticsearch.yml`

 ```yaml
 
cluster.name={yourmachinename}_ost
node.name={your-machinename}_ost_001

ndex.number_of_shards: 1
index.number_of_replicas: 0


http.port: 9200

```


Now run `Setup.ps1` , use the "-" to override any setup parameters

make sure you have setup your `ERLANG_HOME` and your `JAVA_HOME` correctly


## Verify your installation

## RabbitmMQ
Go to http://localhost:15672, see if the broker is running

## SQL Server 
Use LINQPad in utils to connect to your localdb\ProjectsV13  and see if there's `Ost` database created, check there are tables with Sph schemas and dbo for aspnet* objects


## Elasticsearch
Go to http://localhost:9200/_cat/indices, you see at least `ost_sys`


# IIS
got to your `config/applicationHost.config` , now find the line when it says 
```
<sites...


</sites>
```

there should be an entry fo `web.ost` that point to your `PWD\web` with binding to port 50230


## Building

Once set up, you can use `RebuildAll.ps1` script to invoke `tool\sph.builder.exe`, where it would clean the solutions, build all the dll and deploy to web\bin and subscribers folder


## Customize your setting
`RebuildAll.ps1` and `RunControlCenter.ps1` use `env.ost.ps1` to set the default environment variable for your app, to custom the setting, do not edit `env.ost.ps1` but create a new file, called
`env.ost.<computer-name>.ps` to get the `computer-name` variable run `$env:COMPUTERNAME` in your powershell

```
### env.ost.<computer-name>.ps

### for email subject
$env:RX_Ost_ApplicationFullName = "Ost"

### for calculating product price from Snb Staging
$env:RX_OST_SnbWebApp = "http://10.1.1.119:9001"
$env:RX_OST_SnbWebApi = "http://10.1.1.119:9002/api"

### for SAP-FI Posting
$env:RX_OST_AdminToken = "your-admin-token-here"
$env:RX_OST_SapFolder = "C:\temp"
```
