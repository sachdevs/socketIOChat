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
			io.emit('usernames', users);
		}
	});
    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    });
});

http.listen(3000, function(){
    console.log('listening on *: 3000');
});
