var express = require('express');
var saved = {};
var pass = {};
var users = {};
var groupIds = {};
var playerPosition = {};
var app = express();
var server = app.listen(3000);
var id = 0;

// var SOCKETS = {};

app.use(express.static('public'));


var socket = require('socket.io');

var io = socket(server);

io.sockets.on('connection', newConnection);



function newConnection(socket) {
	// socket.loged = false;
	// SOCKETS[socket.id] = socket;
	socket.on('checkLogin', checkLogin);

	function checkLogin(user) {
		if(!groupIds[user.groupName] || !groupIds[user.groupName].length) {
			groupIds[user.groupName] = [];
			pass[user.groupName] = user.pass;
			saved[user.groupName] = null;
		}

		if(pass[user.groupName] === user.pass) {
      if(groupIds[user.groupName].length >= 4) {
        socket.emit('loggedIn', false);
        return;
      }
			users[socket.id] = user.groupName;
			groupIds[user.groupName].push(socket);
			playerPosition[socket.id] = {
				x : 0,
				y : 0
			};
		}
		if(pass[user.groupName] === user.pass) {
      console.log("Somebody joined " + user.groupName + " maybe his name is " + socket.id);
    }
		socket.emit('loggedIn', (pass[user.groupName] === user.pass));
	}


	socket.on('disconnect', function () {
		if(users[socket.id] !== null && groupIds[users[socket.id]]) {
			console.log("Somebody left " + users[socket.id]);
	    var index = groupIds[users[socket.id]].indexOf(socket);
			if(index > -1) {
				groupIds[users[socket.id]].splice(index, 1);
			}
			if(!groupIds[users[socket.id]].lenght) {
				console.log("Deleted");
				pass[users[socket.id]] = null;
			}
			console.log("Now size of " + users[socket.id] + " is " + groupIds[users[socket.id]].length);
			users[socket.id] = null;
		}
  });

  socket.on('playerPosition', receivePostion);

  function receivePostion(curPlayerPosition) {
    console.log("PRINAL");
    // console.log(curPlayerPosition.x + " " + curPlayerPosition.y + " received from " + socket.id);
    playerPosition[socket.id] = curPlayerPosition;
    var currentGroup = groupIds[users[socket.id]];
    var currentPlayersPositions = [];
    if(!currentGroup || !currentGroup.length)return;
    for(var i = 0; i < currentGroup.length; i++) {
      var newData = {
        x : playerPosition[currentGroup[i].id].x,
        y : playerPosition[currentGroup[i].id].y,
        name : users[currentGroup[i].id]
      };
      currentPlayersPositions.push(newData);
      delete newDate;
    }


    socket.emit('receivePositions', currentPlayersPositions);
    delete currentGroup;
    delete currentPlayersPositions;
  }



}
