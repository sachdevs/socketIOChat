var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);//new instance of socket using http server object
var users = [];

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');//serves html file
});

io.on('connection', function(socket){
	socket.on('new user', function(data, callback){
		if(users.indexOf(data) != -1)
			callback(false);
		else{
			callback(true);
			socket.username = data;
			users.push(socket.username);
			updateUsernames();
		}
	});
    socket.on('chat message', function(msg){
        io.emit('chat message', {username: socket.username, message: msg});
    });

    socket.on('disconnect', function(){
    	if(!socket.username) return;
    	console.log(socket.username + ' has disconnected');
    	users.splice(users.indexOf(socket.username), 1);
    	updateUsernames();
    });

    function updateUsernames(){
		io.emit('usernames', users);
    }
});

http.listen(3000, function(){
    console.log('listening on *: 3000');
});
