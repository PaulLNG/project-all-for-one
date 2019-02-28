var express = require('express');
//Nous créons un objet de type Express. 
var app = express(); 

// Méthode rapide pour création d'un objet de type Express
//var app = require('express')();

const bodyParser = require('body-parser');
var db = require('./models/index');
var myRouter = express.Router();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const User = db.sequelize.import(__dirname + "/models/user")

/** verifyToken method - this method verifies token */
function verifyToken(req, res, next){
    
    //Request header with authorization key
    const bearerHeader = req.headers['authorization'];
    
    //Check if there is  a header
    if(typeof bearerHeader !== 'undefined'){
        const bearer = bearerHeader.split(' ');
        
        //Get Token arrray by spliting
        const bearerToken = bearer[1];
        req.token = bearerToken;
        //call next middleware
        next();
    }else{
        res.sendStatus(403);
    }
}

myRouter.route('/api/v1/users')
.get(function(request, response){
    response.setHeader('content-type', 'application/json');
    	User.findAll({raw: true}).then( (val) => {
        response.send(val)
    });
});

myRouter.route('/api/v1/signin')
.post(function (request, response){
	response.setHeader('content-type', 'application/json');
    const user = {
        id: 1,
        username: "johndoe",
        email: "john.doe@test.com"
    }
    jwt.sign({user},'SuperSecRetKey', { expiresIn: 60 * 60 }, (err, token) => {
    	response.json({token});
    });
});

myRouter.route('/api/v1/login')
.post(function(request, response){
    response.setHeader('content-type', 'application/json');
    
//    var passwordEnter = bcrypt.hashSync(request.body.password);
    
    User.sync().then(() => {
    	User.findOne({ 
        where: 
    	{
    		username: request.body.username
    	} 
    }).then(user => {
        if (bcrypt.compareSync(request.body.password , user.password)) {
        	jwt.sign({user},'SuperSecRetKey', { expiresIn: 60 * 60 }, (err, token) => {
//        	 response.json({user});
        	 response.send(200, {login: true});
            });
           
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
//.post(verifyToken , function(request, response){
.post(function(request, response){
    response.setHeader('content-type', 'application/json');

//    // Vérifie le token
//    jwt.verify(request.token, 'SuperSecRetKey', (err, authData)=>{
//        if(err){
//        	response.sendStatus(403);
//        }else{
//        	response.json({
//                msg: "A new post is created",
//                authData
//            });
//        }
//    });
    
    if (request.body.username && request.body.password) {
    	
    	var passwordEncoded = bcrypt.hashSync(request.body.password , salt );
    	
    	User.sync().then(() => {
    		User.create({
    	    username: request.body.username, 
        	password: passwordEncoded
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
