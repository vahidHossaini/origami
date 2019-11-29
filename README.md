# Description
The OrigamiCore Is Sipmle Framework For Small And Medium Projects.

# Installation
install cli :
npm i -g oricli

create new project :
oricli new


# SubModule
These Module Are Under Development 
- Database Manager [Doc](https://github.com/vahidHossaini/oridatabase)
- Endpoint [Doc](https://github.com/vahidHossaini/oriendpoint)
- Redis [Doc](https://github.com/vahidHossaini/oriredis)

## Quick Start
	var origami=require('origamicore')
	global.path=__dirname
	var config=[]
	var server=new origami(config)


config Contains SubModule Configuration.
For More Information , See The Documentation For Each Module 

### Sample
- Endpoint [Doc](https://github.com/vahidHossaini/oriendpoint)

Run Http Service On Port 8080
change config.js to :

	module.exports =[
	{
		id: '1',
		name: 'baseclass'
	},
	{
		id: '2',
		name: 'module',
		type: 'endpoint',
		isNpm:true,
		config: {
			connections: [{
					name: 'PublicSite',
					'type': 'express', 
					protocol: {
						type: 'http',
						port: 8080
					},
					public: ['./public']
				}]
		}
	}
	]