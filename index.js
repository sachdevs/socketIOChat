var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);//new instance of socket using http server object
var users = {};

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');//serves html file
});

io.on('connection', function(socket){
	socket.on('new user', function(data, callback){
		if(data in users)
			callback(false);
		else{
			callback(true);
			socket.username = data;
			users[socket.username] = socket; //key value pair. key = username value = socket.
			updateUsernames(socket.username);
		}
	});
    socket.on('chat message', function(msg, callback){
    	var trimMsg = msg.trim();
    	if(trimMsg.substr(0,3)==='/w '){
    		trimMsg = trimMsg.substr(3);
    		var a = trimMsg.split(' ');
    		var actualMessage = trimMsg.substr(a[0].length);
    		if(a[0] in users && socket.username !== a[0]){
    			users[a[0]].emit('whisper', {username: socket.username, message: actualMessage, to: a[0]});
    			users[socket.username].emit('whisper', {username: socket.username, message: actualMessage, to: a[0]});
    		}
    		else
    			callback('Error, invalid username');
    	}
    	else{
        	io.emit('chat message', {username: socket.username, message: msg});
        }
    });

    socket.on('typing',function(){
    	socket.broadcast.emit('typing');
    });

    socket.on('notTyping',function(){
    	socket.broadcast.emit('notTyping');
    });

    socket.on('disconnect', function(){
    	if(!socket.username) return;
    	io.emit('disconnect', socket.username);
    	delete users[socket.username];
        updateUsernames(null);
    });

    function updateUsernames(name){
		io.emit('usernames', {list: Object.keys(users), lastAdded: name});
    }
});

http.listen(process.env.PORT || 3000, function(){
    console.log('listening on: 3000');
});
