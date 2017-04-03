Start on Development PC
Preparation.

Get latest codes from repositories. Use git pull <remote>

Rebuild all codes. Use .\RebuildAll.ps1

Run smoke test on your Development PC. See Appendix 1

Open remote desktop connection to:
Web Server 1: \\172.19.1.121
Web Server 2: \\172.19.1.122
Worker Server 1: \\10.1.16.106
Worker Server 2: \\10.1.16.107

Stop IIS on Web Server 1 and Web Server 2
	Open IIS Manager and stop this Web site: Ost

Empty these folders on Web Server 1 and Web Server 2:
c:\apps\rx\output
c:\apps\rx\sources

Delete all content from this folder except “Web.config” on Web Server 1 and Web Server 2:
c:\apps\rx\web
	Do not delete “Web.config”

Stop Rx Worker on Worker Server 1 and Worker Server 2
	Open services.msc and stop this service: Reactive Developer Server - regular

Empty these folders on Worker Server 1 and Worker Server 2:
c:\apps\rx\output
c:\apps\rx\sources



Now you are ready to deploy on the Deployment PCs.
Deploying Web.

Deploy sources:
	Copy all sources from Development PC to Web Server 1 and Web Server 2
		Copy all content except “_generated” from
		c:\project\work\entt.ost\sources
		to
		c:\apps\rx\sources
		Do not copy “_generated”

Deploy output:
Copy all output from Development PC to Web Server 1 and Web Server 2
		Copy all content from
		c:\project\work\entt.ost\output
		to
		c:\apps\rx\output

Deploy web:
Copy all web from Development PC to Web Server 1 and Web Server 2
		Copy all content except “Web.config” from
		c:\project\work\entt.ost\web
		to
		c:\apps\rx\sources
		Do not copy “Web.config”


Deploying Workers.

Deploy sources:
	Copy all sources from Development PC to Worker Server 1 and Worker Server 2
		Copy all content from
		c:\project\work\entt.ost\sources
		to
		c:\apps\rx\sources

Deploy output:
Copy all output from Development PC to Worker Server 1 and Worker Server 2
		Copy all content from
		c:\project\work\entt.ost\output
		to
		c:\apps\rx\output

Deploy subscribers:
Copy all output from Development PC to Worker Server 1 and Worker Server 2
		Copy all content from
		c:\project\work\entt.ost\output
		to
		c:\apps\rx\subscribers


Start All.

Start IIS on Web Server 1 and Web Server 2
	Open IIS Manager and start this Web site: Ost

Reset IIS on Web Server 1 and Web Server 2
	Open Powershell (as administrator) and execute: .\iisreset.exe

Start Rx Worker on Worker Server 1 and Worker Server 2
	Open services.msc and start this service: Reactive Developer Server - regular

Verify.

Open up OST Website at http://ost.pos.com.my and login as admin
	If you get successful login and landed on Rx Developer Start Page,
this means web deployment is good

Go to Rx Management Console at http://ost.pos.com.my/sph#management.console
	If you see there are some consumers at all queues
(except ms_dead_letter_queue and sph.retry.queue),
this means worker deployment is good

Run smoke test on OST Website. See Appendix 1

Good luck and have fun 
Should you face problem please contact me.

Regards,
Nazrul Hisham
March 29, 2017

Appendix 1 - Smoke Test

Open up OST Website

Check email generation
Reset password from login page (make sure it is successful)
Check for verify email (make sure you receive the e-mail)
On Development PC go to c:\temp\SphEmail
On OST website check email inbox (as specify in #2.a.)
Verify email and change password (make sure email is verified and password is changed)

Check Login
Login as user (make sure it is successful)
Modify and save Default Pickup Address on User Dashboard (make sure it is successful)

Check address book
Add new address on Address Book (make sure it is successful)
Delete any address on Address Book (make sure it is successful)

Check shipping cart
Add some parcels on Shipping Cart (make sure it is successful)
Delete any parcel on Shipping Cart (make sure it is successful)
Empty Shipping Cart (make sure it is successful)

Check tax invoice
Go to Paid Orders (make sure it is viewable)
Go to any Paid Order (make sure it is viewable)
View the Paid Invoice (make sure it is viewable)

Logout (make sure it is successful)

Add more steps when necessary...


Appendix 2 - Rx Components

OST Web Server:
\\172.19.1.121
\\172.19.1.122

OST Worker Server
\\10.1.16.106
\\10.1.16.107

OST Database
\\PMBIPTTSV

OST Elasticserach
http://10.1.16.106:9200/
http://10.1.16.107:9200/
http://10.1.16.106:9200/_cluster/health

OST RabbitMQ
http://10.1.16.106:15672/#/


