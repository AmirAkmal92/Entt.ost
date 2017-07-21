# EziSend Istallation Guide

## Prerequisites

1. Operating System

      Rx Developer only runs on these **Microsoft Windows** operating system:   
      - Windows 10
      - Windows 8.1
      - Windows 8
      - Windows 7

2. Microsoft .NET Framework

      **Microsoft .NET Framework** is the runtime for all the Rx Developer.  
      The .NET Framework provides a comprehensive programming model for building all kinds of applications on Windows, from mobile to web to desktop. 
      
      Download and install Microsoft .NET Framework 4.6.2 [[here](https://www.microsoft.com/en-us/download/details.aspx?id=53344)]

3. Windows PowerShell

      **PowerShell** is a task automation and configuration management framework. It consist of a command-line shell and associated scripting language built on the .NET Framework.  

      Download and install a PowerShell package for any of the following platforms:
      - Windows 10 [[here](https://github.com/PowerShell/PowerShell/releases/download/v6.0.0-beta.4/PowerShell-6.0.0-beta.4-win10-win2016-x64.msi)]
      - Windows 8.1 [[here](https://github.com/PowerShell/PowerShell/releases/download/v6.0.0-beta.4/PowerShell-6.0.0-beta.4-win81-win2012r2-x64.msi)]
      - Windows 7 (x64) [[here](https://github.com/PowerShell/PowerShell/releases/download/v6.0.0-alpha.18/PowerShell-6.0.0-alpha.18-win7-win2008r2-x64.msi)]
      - Windows 7 (x86) [[here](https://github.com/PowerShell/PowerShell/releases/download/v6.0.0-alpha.18/PowerShell-6.0.0-alpha.18-win7-x86.msi)]   

4. Database

      Rx Developer uses **Microsoft SQL Server LocalDB** as a database. LocalDB is a lightweight version of Microsoft SQL Server Express that has all its programmability features, yet runs in user mode and has a fast, zero-configuration installation and short list of prerequisites.

      Download and install Microsoft SQL LocalDb 2012 from:
      - 64-bit Windows [[here](http://download.microsoft.com/download/8/D/D/8DD7BDBA-CEF7-4D8E-8C16-D9F69527F909/ENU/x64/SqlLocalDB.MSI)]
      - 32-bit Windows [[here](http://download.microsoft.com/download/8/D/D/8DD7BDBA-CEF7-4D8E-8C16-D9F69527F909/ENU/x86/SqlLocaLDB.MSI)]

      Also, download and install both utilities:
      - Microsoft ODBC Driver 11 for SQL Server [[here](http://www.microsoft.com/en-us/download/details.aspx?id=36434)]
      - SQLServer Command Line Utilities 11 [[here](http://www.microsoft.com/en-us/download/details.aspx?id=36433)]

5. Java
      
      **ElasticSearch** is the default content indexer for Rx Developer and built using Java.

      Donwload and install latest Oracle Java runtime [[here](http://www.java.com/en/download/)]

      Once installed on your machine, path to Java directory needs to be added in the Environment Variables. Make sure JAVA_HOME variable is correctly set:
      - Open System Properties.
      - In Advance tab, click Environment Variables…
      - In System variables box, click New…
      - Set `JAVA_HOME` as New System Variable. (use actual install path for Variable Value).

6. Message Queuing
      
      Rx Developer has a built in message broker which depends on **Erlang** runtime. This runtime needs to be installed before you can start using Rx Developer.

      Download and install Erlang (32-bit/64-bit) [[here](http://www.erlang.org/download.html)]

      Once installed on your machine, path to Erlang directory needs to be added in the Environment Variables. Make sure ERLANG_HOME variable is correctly set:
      - Open System Properties.
      - In Advance tab, click Environment Variables…
      - In System variables box, click New…
      - Set `ERLANG_HOME` as New System Variable. (use actual install path for Variable Value).


## Get Rx Developer

Rx Developer website at is located at [http://www.reactivedeveloper.com](http://www.reactivedeveloper.com).  
Download latest Rx Developer package [sph.package.1.0.10350-01].

## Get Source Code

EziSend code repositories is hosted on Visual Studio Team Services (previously a.k.a Visual Studio Online) at [http://bespoke.visualstudio.com/pos.entt/_git/entt.ost](http://bespoke.visualstudio.com/pos.entt/_git/entt.ost).  
Clone the git repository.

## Prepare EziSend root Directory

1. Extract Rx Developer package to local drive; preferbaly at `C:\project\work\temp`.  
   This folder may be deleted later.

2. Extract EziSend codes to local drive; preferbaly at `C:\project\work\entt.ost`. 

3. Copy these items from `C:\project\work\temp` package into `C:\project\work\entt.ost`.

      - config
      - control.center
      - elasticsearch
      - IIS Express
      - output
      - packages
      - rabbitmq_base
      - rabbitmq_server
      - schedulers
      - subscribers
      - subscribers.host
      - tools
      - utils
      - web\bin (mind the path)
      - web\Web.config (mind the path)      
      - ControlCenter.bat
      - Setup-SphApp.ps1
      - version.json

## Edit Elasticsearch Config

Edit `elasticsearch\config\elasticsearch.yml`:

 ```
cluster.name={yourmachinename}_ost
node.name={your-machinename}_ost_001

index.number_of_shards: 1
index.number_of_replicas: 0

http.port: 9200
```

## Run Setup Script

1. Make sure `JAVA_HOME` and `ERLANG_HOME` has been setup correctly.

2. Run `Setup.ps1` from PowerShell.

## Verify Installation

1. Start Control Center:
- Start RabbitmMQ
- Start SQL LocalDB  
- Start Elasticsearch

2. Verify:
- RabbitmMQ  
   Go to [http://localhost:15672](http://localhost:15672), see if the broker is running.  
   Login:
   - Username: guest
   - Password: guest

- SQL LocalDB  
   Use LINQPad in utils to connect to your `localdb\ProjectsV13` and see if there's **Ost database** created, check there are tables with **Sph** schemas and dbo for aspnet* objects.

- Elasticsearch  
   Go to [http://localhost:9200/_cat/indices](http://localhost:9200/_cat/indices), you see at least `ost_sys`.

## Building

Use `RebuildAll.ps1` script to invoke \tool\sph.builder.exe, where it would clean the solutions, build all the *.dll and deploy them to \web\bin and \subscribers folder.

Run `RebuildAll.ps1` from PowerShell.

_*make sure **SPH Worker** is switched off while building the codes._

## Customize Settings

`RebuildAll.ps1` and `RunControlCenter.ps1` use `env.ost.ps1` to set the default environment variable EziSend.  

To custom the setting, do not edit `env.ost.ps1` but create a new file, called 
`env.ost.<computer-name>.ps`.  
To get the `computer-name` variable run `$env:COMPUTERNAME` in your PowerShell.

Below is the suggested **environment variables** for development or testing.  
It allows change on the environment variables from **production mode** to **staging mode**.  

```
### env.ost.<computer-name>.ps

### for calculating product price from Snb Staging
$env:RX_OST_SnbWebApp = "http://10.1.1.119:9001"
$env:RX_OST_SnbWebApi = "http://10.1.1.119:9002/api"

### for SAP-FI Posting (development)
$env:RX_OST_AdminToken = "your-admin-token-here"
$env:RX_OST_SapFolder = "C:\temp"

### for Payment Gateway (Staging)
$env:RX_OST_PaymentGatewayBaseUrl = "http://testv2paymentgateway.posonline.com.my"
$env:RX_OST_PaymentGatewayApplicationId = "OST"
$env:RX_OST_PaymentGatewayEncryptionKey = "WdVxp54wmQlGFBmvOQgfmpAqCJ23gyGI"

### for SDS (Staging)
$env:RX_OST_SdsBaseUrl = "http://stagingsds.pos.com.my/apigateway"
$env:RX_OST_SdsApi_GenerateConnote = "as2corporate/api/generateconnote/v1";
$env:RX_OST_SdsSecretKey_GenerateConnote = "ODA2MzViZTAtODk3MS00OGU5LWFiNGEtYTcxYjAxMjU4NjM1";
$env:RX_OST_SdsApi_PickupWebApi = "devposlaju/api/pickupwebapi/v1";
$env:RX_OST_SdsSecretKey_PickupWebApi = "ZGQxNGJjMDEtZGMyMy00YjQwLWFiODUtYTcxYjAxMzAyMjdk";
```

#### Note:
By doing this, **Track N Trace** will be pointed to staging mode resulting in 'result not found'.  
Track N Trace may be changed back to production mode by uncommenting this line:

```
//m_client = new HttpClient { BaseAddress = new Uri("https://apis.pos.com.my") };
```

in `...\web\App_Code\TrackTraceController.cs`.

## Run EziSend
1. Restart Control Center.

2. Start all services:
- Start RabbitmMQ
- Start SQL LocalDB  
- Start Elasticsearch
- Start SPH Worker
- Start IIS Express

3. Start EziSend
- Open Chrome browser.
- EziSend is located at: [http://localhost:50230](http://localhost:50230)
