# OST Deployment Guide

Start on Development PC

## Preparation

1. Get latest codes from repositories. Use 
```
git pull <remote>
```

2. Rebuild all codes. Use 
```
.\RebuildAll.ps1
```

3. Run smoke test on your Development PC. *See Appendix 1*

4. Open remote desktop connection to:
   * __Web Server 1__: \\\\172.19.1.121
   * __Web Server 2__: \\\\172.19.1.122
   * __Worker Server 1__: \\\\10.1.16.106
   * __Worker Server 2__: \\\\10.1.16.107

5. Stop IIS on Web Server 1 and Web Server 2  
  Open IIS Manager and stop this Web site: `Ost`

6. Empty these folders on Web Server 1 and Web Server 2:
```
c:\apps\rx\output
c:\apps\rx\sources
```

7. Delete all content from this folder except “Web.config” on Web Server 1 and Web Server 2:
```
c:\apps\rx\web
```
_Do not delete_ `Web.config`

8. Stop Rx Worker on Worker Server 1 and Worker Server 2  
  Open services.msc and stop this service: `Reactive Developer Server - regular`

9. Empty these folders on Worker Server 1 and Worker Server 2:
```
c:\apps\rx\output
c:\apps\rx\sources
```

Now you are ready to deploy on the Deployment PCs.

## Deploying Web

1. Deploy sources:  
  Copy all sources from Development PC to Web Server 1 and Web Server 2 

> Copy all content except `_generated` from  
> c:\project\work\entt.ost\sources  
> to  
> c:\apps\rx\sources  
> Do not copy “_generated”  

2. Deploy output:  
  Copy all output from Development PC to Web Server 1 and Web Server 2  

> Copy all content from  
> c:\project\work\entt.ost\output  
> to  
> c:\apps\rx\output  

3. Deploy web:  
  Copy all web from Development PC to Web Server 1 and Web Server 2  

> Copy all content except `Web.config` from  
> c:\project\work\entt.ost\web  
> to  
> c:\apps\rx\sources  
  
_Do not copy_ `Web.config`  


## Deploying Workers

1. Deploy sources:  
  Copy all sources from Development PC to Worker Server 1 and Worker Server 2

> Copy all content from  
> c:\project\work\entt.ost\sources  
> to  
> c:\apps\rx\sources  

2. Deploy output:  
  Copy all output from Development PC to Worker Server 1 and Worker Server 2

> Copy all content from  
> c:\project\work\entt.ost\output  
> to  
> c:\apps\rx\output  

3. Deploy subscribers:  
  Copy all output from Development PC to Worker Server 1 and Worker Server 2

> Copy all content from  
> c:\project\work\entt.ost\output  
> to  
> c:\apps\rx\subscribers  

## Start All

1. Start IIS on Web Server 1 and Web Server 2  
  Open IIS Manager and start this Web site: `Ost`

2. Reset IIS on Web Server 1 and Web Server 2  
  Open Powershell (as administrator) and execute: `.\iisreset.exe`

3. Start Rx Worker on Worker Server 1 and Worker Server 2  
  Open services.msc and start this service: `Reactive Developer Server - regular`

## Verify

1. Open up OST Website at [http://ost.pos.com.my](http://ost.pos.com.my) and login as admin  
  If you get successful login and landed on Rx Developer Start Page,
**this means web deployment is good**

2. Go to Rx Management Console at [http://ost.pos.com.my/sph#management.console](http://ost.pos.com.my/sph#management.console)  
  If you see there are some consumers at all queues
(except `ms_dead_letter_queue` and `sph.retry.queue`),
**this means worker deployment is good**

3. Run smoke test on OST Website. *See Appendix 1*  

Good luck and have fun.  

## Appendix 1 - Smoke Test

1. Open up OST Website

2. Check email generation
    - Reset password from login page (make sure it is successful)
    - Check for verify email (make sure you receive the e-mail)
    - On Development PC go to `c:\temp\SphEmail`  
      On OST website check email inbox (as specify in #2.a.)  
      Verify email and change password (make sure email is verified and password is changed)

3. Check Login
    - Login as user (make sure it is successful)
    - Modify and save Default Pickup Address on User Dashboard (make sure it is successful)

4. Check address book
    - Add new address on Address Book (make sure it is successful)
    - Delete any address on Address Book (make sure it is successful)

5. Check shipping cart
    - Add some parcels on Shipping Cart (make sure it is successful)
    - Delete any parcel on Shipping Cart (make sure it is successful)
    - Empty Shipping Cart (make sure it is successful)

6. Check tax invoice
    - Go to Paid Orders (make sure it is viewable)
    - Go to any Paid Order (make sure it is viewable)
    - View the Paid Invoice (make sure it is viewable)

7. Logout (make sure it is successful)

8. Add more steps when necessary...


## Appendix 2 - Rx Components

1. OST Web Server:
    * \\\\172.19.1.121
    * \\\\172.19.1.122

2. OST Worker Server
    * \\\\10.1.16.106
    * \\\\10.1.16.107

3. OST Database
    * \\PMBIPTTSV

4. OST Elasticserach
    * http://10.1.16.106:9200/
    * http://10.1.16.107:9200/
    * http://10.1.16.106:9200/_cluster/health

5. OST RabbitMQ
    * http://10.1.16.106:15672/#/
    