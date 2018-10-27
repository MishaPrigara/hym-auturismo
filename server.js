var express = require('express');
var saved = {};
var pass = {};
var users = {};
var groupIds = {};
var time = {};
var timerId = {};
var playerPosition = {};
var app = express();
var died = {};
var timer = 115;
var cnt = {};
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

	socket.on('getData', sendData);

	function sendData() {
		if(!users[socket.id] || !saved[users[socket.id]])return;
		// console.log("Tried to check but smth went wrong :-( " + saved[users[socket.id]].length);
		// console.log(saved[users[socket.id]].length);
		socket.emit('mouse', saved[users[socket.id]]);
	}


	socket.on('disconnect', function () {
		if(users[socket.id] !== null && groupIds[users[socket.id]]) {
			console.log("Somebody left " + users[socket.id]);
	    var index = groupIds[users[socket.id]].indexOf(socket);
			if(index > -1) {
				groupIds[users[socket.id]].splice(index, 1);
			}
			if(!groupIds[users[socket.id]].length) {
				console.log("Deleted");
				pass[users[socket.id]] = null;
			}
			console.log("Now size of " + users[socket.id] + " is " + groupIds[users[socket.id]].length);
			users[socket.id] = null;
		}
  });


  socket.on('getGroupSize', function(key){
    var sz = 0;
    if(groupIds[users[socket.id]])sz = groupIds[users[socket.id]].length;
  	var fs = require('fs');
  	var contents = fs.readFileSync('public/assets/figures.txt', 'utf-8');
  	var numbers = contents.split(' ');
    // console.log(numbers.length);
    var id=0;
    var arr = [];
    for (var i=0; i<78; i++){
      arr[i] = [];
      var st=""
      for (var j=0; j<4; j++){
        arr[i][j]=parseInt(numbers[id++]);
        st+=arr[i][j]+" ";

      }
      // console.log(st);
    }
    var res = {
      size :sz,
      key : key,
      lvl : arr
    };
    socket.emit('receiveGroupSize', res);
  });






  socket.on('playerPosition', receivePostion);

  function receivePostion(curPlayerPosition) {
    // console.log(curPlayerPosition.x + " " + curPlayerPosition.y + " received from " + socket.id);
    playerPosition[socket.id] = curPlayerPosition;
    var currentGroup = groupIds[users[socket.id]];
    var currentPlayersPositions = [];
    if(!currentGroup || !currentGroup.length)return;
    for(var i = 0; i < currentGroup.length; i++) {
      var newData = {
        x : playerPosition[currentGroup[i].id].x,
        y : playerPosition[currentGroup[i].id].y,
        type : playerPosition[currentGroup[i].id].type,
        name : users[currentGroup[i].id],
        dir : playerPosition[currentGroup[i].id].dir
      };
      currentPlayersPositions.push(newData);
    }


    socket.emit('receivePositions', currentPlayersPositions);
  }

  // var timerFun = setInterval(function() {
  //   console.log(timer);
  //   timer--;
  // }, 1000);
socket.on('sendCnt',function(curPlayerPosition){
    playerPosition[socket.id] = curPlayerPosition;
    var currentGroup = groupIds[users[socket.id]];
    var currentPlayersPositions = [];
    if(!currentGroup || !currentGroup.length)return;
    var is4=false;
    var final=false;
    for (var i=0; i< currentGroup.length; i++){
      is4|=(playerPosition[currentGroup[i].id].type===4);
      final|=(playerPosition[currentGroup[i].id].locked===-1);
    }
    // console.log(perem);
    for(var i = 0; i < currentGroup.length; i++) {
      var perem=1;
      if (final) perem=-1;
      else if (is4) perem=0;
      var newData = {
        x : playerPosition[currentGroup[i].id].x,
        y : playerPosition[currentGroup[i].id].y,
        type : playerPosition[currentGroup[i].id].type,
        name : users[currentGroup[i].id],
        dir : playerPosition[currentGroup[i].id].dir,
        locked: perem
      };
      currentPlayersPositions.push(newData);
    }
    socket.emit('getCnt',currentPlayersPositions);
});

socket.on('died', function(data) {


  if(!died[data.name]) {
    died[data.name] = 1;
  } else {
    died[data.name]++;
  }
  if(died[data.name] == 3) {
    time[data.name] = 0;
  }
  var newData = {
      name: data.name,
      time: 0
  };
  socket.emit('updateTime', newData);
});

socket.on('startTimer', function (data) {
  time[data.name] = 180;

  if(!cnt[data.name]) {
    cnt[data.name] = [0, 0, 0, 0, 0];
  }
  timerId[data.name] = setInterval(function () {
    cnt[data.name][data.type] = 1;
    var sum = 1;
    for(var i = data.type - 1; i >= 1; i--) {
      if(cnt[data.name][i] > 0) {
        sum = 0;
        console.log("found " + i);
      }
    }
    console.log(sum);
    console.log("prev " + time[data.name]);
    time[data.name] = Math.max(0, time[data.name] - sum);

    console.log("after " + time[data.name]);
    var newData = {
      name : data.name,
      time : time[data.name]
    };
    socket.emit('updateTime', newData);
  }, 1000);
});


}
