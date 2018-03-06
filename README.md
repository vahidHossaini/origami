# Description
The OrigamiCore Is Sipmle Framework For Small And Medium Projects.

# Installation
npm install origamicore --save

# SubModule
These Module Are Under Development 
- Database Manager [Doc](https://github.com/vahidHossaini/origami/tree/master/database)
- Authentication [Doc](https://github.com/vahidHossaini/origam/tree/master/authi)
- Authorization [Doc](https://github.com/vahidHossaini/origami/tree/master/authz)
- Telegram Bot [Doc](https://github.com/vahidHossaini/origami/tree/master/botrunner)
- Service Dispatcher [Doc](https://github.com/vahidHossaini/origami/tree/master/endpoint)
- Notification [Doc](https://github.com/vahidHossaini/origami/tree/master/notify)
- Profile [Doc](https://github.com/vahidHossaini/origami/tree/master/profile)
- Manual Service [Doc](https://github.com/vahidHossaini/origami/tree/master/service)

These Module Are Coming Soon
- Organization And Structure
- Reporting
- Dashboard
- Payment
- Billing
- Online Store
- Accounting


## Quick Start
	var origami=require('origamicore')
	var config=[]
	var server=new origami(config)


config Contains SubModule Configuration.
For More Information , See The Documentation For Each Module 

### Sample
Run Http Service On Port 8080

	var origami=require('origamicore')
    global.path=__dirname 
	var config=[
	{
		name:'endpoint',	
		express:[{
			name:'publicService',
			'public':'/{path of public files}',
			CrossDomain:'http://localhost:4200',//If You Want Test Using Angular In Local System Without CrossDomainOrgin Error
			http:{port:'8080'}
		}]	
	}
	]
	var server=new origami(config)
