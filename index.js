var express = require('express');
//Nous créons un objet de type Express. 
var app = express(); 

// Méthode rapide pour création d'un objet de type Express
//var app = require('express')();

const bodyParser = require('body-parser');
var db = require('./models/index');
var myRouter = express.Router();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const User = db.sequelize.import(__dirname + "/models/user")

app.get('/api/v1/users', (request, response) => {
    response.setHeader('content-type', 'application/json');
    	User.findAll({raw: true}).then( (val) => {
        response.send(val)
    });
});

app.post('/api/v1/login', (request, response) => {
    response.setHeader('content-type', 'application/json');
    User.sync().then(() => {
    	User.findOne({ 
        where: 
    	{
    		username: request.body.username
    	} 
    }).then(user => {
        if (request.body.password == user.password) {
            response.send(200, {login: true});
        } else {
            response.send(401, {login: false, error:'Incorrect Password'});
        }
    }).catch( () => {
        console.log("No user found deadass");
        response.send(400, {login: false, error:'No user found'});
    });
    	
    });
});

myRouter.route('/api/v1/user')
.post(function(request, response){
    response.setHeader('content-type', 'application/json');
    if (request.body.username && request.body.password) {
    	User.sync().then(() => {
    		User.create({
    	    username: request.body.username, 
        	password: request.body.password
//        	local_key: "ono"
        	
        }).then( (user) => {
            response.send(201, {created: true});
        }).catch( (err) => {
            response.send(400, {created: false, error: err});
        });
    });
    	
    } else {
        response.send(400, {error: "Invalid format"});
    }
    
})
.delete(function(request , response){
	response.setHeader('content-type', 'application/json');
//	response.json({message : "Suppresion d'un user selon son ID", 
//		  id : request.body.id,
//		  methode : request.method});
	
	User.sync().then(() => {
	  User.destroy({
	  where: {
	    id: request.body.id
	  }
	}).then( (user) => {
        response.send(204, {deleted: true});
    }).catch( (err) => {
        response.send(400, {deleted: false, error: err});
    });
	
	});
})
.put(function(request , response) {
	response.setHeader('content-type', 'application/json');
//	response.json({message : "Modification d'un user selon son ID", 
//		  id : request.body.id ,
//		  username : request.body.username,
//		  password : request.body.password,
//		  methode : request.method});
	
	
	User.sync().then(() => {
		User.update({
	    username : request.body.username ,
		password : request.body.password 
		} , {
		where: 
		{ 
			id : request.body.id
			
		}
	}).then( (user) => {
        response.send(204, {modified: true});
    }).catch( (err) => {
        response.send(400, {modified: false, error: err});
    });
		
	});
});

//Nous demandons à l'application d'utiliser notre routeur
app.use(myRouter);  

app.listen(8080,() => {
    console.log("Listening...");
})
