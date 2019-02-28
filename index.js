//Server
var express = require('express');
var app = express(); 
const server = require('http').createServer(app);
const bodyParser = require('body-parser');

var io = require('socket.io')(server);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var router = express.Router();

//Models
var db = require('./models/index');
const User = db.sequelize.import(__dirname + "/models/user")

//Auth
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

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
    } else{
        res.sendStatus(403);
    }
}

/**-------------------------------------------------------------------USER API---------------------------------------------------------------- **/

// (GET) All users
router.route('/api/v1/users')
.get(function(request, response){
    response.setHeader('content-type', 'application/json');
    	User.findAll({raw: true}).then( (val) => {
        response.send(val)
    });
});

// (POST) Login route
router.route('/api/v1/login')
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


// (POST) Create a user
router.route('/api/v1/user')
.post(function(request, response){
    response.setHeader('content-type', 'application/json');
    if (request.body.username && request.body.password) {
    	
    	var passwordEncoded = bcrypt.hashSync(request.body.password , salt );
    	
    	User.sync().then(() => {
    		User.create({
    	    username: request.body.username, 
        	password: passwordEncoded
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

// (DELETE) Delete a user
.delete(function(request , response){
	response.setHeader('content-type', 'application/json');
	
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

// (PUT) Edit a user
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

/**-----------------------------------------------------------------------------SOCKET ROOMS---------------------------------------------------------------**/

var openedRooms = {};

//Namespace global
io.of('/music-rooms').on('connection', (socket) => {

    var user;

    //Client
    console.log("AFO_", 'Somebody joined the global namespace');

    //Join a room
    socket.on('join-room', (datas) => {
        if (!user) { user = datas.user; }
        if( datas.uuid in openedRooms ){
            socket.join(datas.uuid); // On rejoint la room donnée en paramètre
            console.log("AFO_", datas.user + " has joined the room " + datas.roomName + "(" + datas.uuid + ")");

            io.of('/music-rooms').in(datas.uuid).emit('new-participant', { nbParticipants : io.nsps['/music-rooms'].adapter.rooms[datas.uuid].length, user: datas.user});
            console.log("AFO_", datas.roomName + " has " + io.nsps['/music-rooms'].adapter.rooms[datas.uuid].length + " participant(s)");
        }
    });

    //Room creation
    socket.on('create-room', (datas) => {
        if (!user) { user = datas.host; }
        openedRooms[datas.uuid] = datas;  //On ajoute la room dans la liste des rooms existantes
        openedRooms[datas.uuid].songsQueue = [];
        console.log("AFO_", datas.host + " has created the room " + datas.roomName + "(" + datas.uuid + ")");

        socket.join(datas.uuid);  //Crée la room et y ajoute l'utilisateur
        console.log(
            "AFO_", datas.host + " has joined the room " + datas.roomName + "(" + datas.uuid + ")" + "\n" +
            "AFO_", datas.roomName + "(" + datas.uuid + ") has " + io.nsps['/music-rooms'].adapter.rooms[datas.uuid].length + " participant(s)"
        );
    });

    //Add a song to the queue of a room
    socket.on('enqueue-song', (datas) => {
        openedRooms[datas.roomUuid].songsQueue.push( datas.songID, datas.songName );
        io.of('/music-rooms').to(datas.roomUuid).emit('new-song-enqueued', { songID: datas.songID, songName: datas.songName });
        console.log("AFO_", datas.user + ' has enqueued the song ' + datas.songName + ' in the room ' + datas.roomUuid);
    });

    //Disconnected
    socket.on('disconnect', () => {
        console.log("AFO_", user + " disconnected from the server");
    });
});

router.route('/api/v1/search-room')
.post(function(request, response){
    response.setHeader('content-type', 'application/json');
    if (request.body.needle && request.body.needle != ""){
        res = {}
        let regx = new RegExp("(.*)" + request.body.needle + "(.*)");

        for( var roomUuid in openedRooms ){
            if ( openedRooms[roomUuid].roomName.match(regx) ){
                openedRooms[roomUuid].nbParticipants = io.nsps['/music-rooms'].adapter.rooms[openedRooms[roomUuid].uuid].length;
                res[roomUuid] = openedRooms[roomUuid];
            }
        }

        if ( Object.keys(res).length !== 0 && res.constructor === Object ){ response.status(200).send(res); }
        else { response.status(200).send({ error: "No room found for the given needle" }) }
    } else {
        response.status(200).send({ error: 'No needle found in the body' });
    }
});

app.use(router);  
server.listen(8080,() => {
    console.log("Listening...");
})
