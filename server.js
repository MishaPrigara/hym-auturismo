// CONSTANTS
var GAMELENGTH = 180;
var NEEDPLAYERS=4;
// VARIABLES

var express = require('express');
var saved = {};
var pass = {};
var users = {};
var groupIds = {};
var time = {};
var timerId = {};
var playerPosition = {};
var players = {};
var app = express();
var died = {};
var timer = 115;
var cnt = {};
var server = app.listen(3000);
var id = 0;
var groupTime = [];
var groupNames = [];
var timerIds = [];
var playerId = {};
// var SOCKETS = {};

app.use(express.static('public'));


var socket = require('socket.io');

var io = socket(server);

io.sockets.on('connection', newConnection);

function sqr(x){
	return x*x;
}
function find(arr,value){
	for (var i=0; i<arr.length; i++){
		if (arr[i]==value) return i;
	}
	return -1;
}
function insert(arr, value){
	for (var i=0; i<arr.length; i++){
		if (!arr[i]){
			arr[i]=value;
			return i;
		}
	}
	arr.push(value);
	return arr.length-1;
}
function dist(x1,y1,x2,y2){
	return Math.sqrt(sqr(x1-x2)+sqr(y1-y2));
}

function newConnection(socket) {
	// socket.loged = false;
	// SOCKETS[socket.id] = socket;
	socket.on('checkLogin', checkLogin);

	function checkLogin(user) {
		if(!groupIds[user.groupName] || !groupIds[user.groupName].length) {
			groupIds[user.groupName] = [];
			pass[user.groupName] = user.pass;
			saved[user.groupName] = null;
			var id=insert(groupNames,user.groupName);
			groupTime[id]=GAMELENGTH;
			players[id] = [];
			var curGroup = user.groupName;
			timerIds[id]=setInterval(function decrease(){
				groupTime[id]-=(groupIds[curGroup].length==NEEDPLAYERS);
				console.log(id + " " + groupTime[id]);
				if (groupTime[id]==0) clearTimeout(timerIds[id]);
			},1000, id, curGroup);
		}

		if(pass[user.groupName] === user.pass) {
      if(groupIds[user.groupName].length >= NEEDPLAYERS) {
        socket.emit('loggedIn', false);
        return;
      }
			users[socket.id] = user.groupName;
			groupIds[user.groupName].push(socket);
			var id = find(groupNames,users[socket.id]);
			if (id==-1) console.log("ERROR");
			for (var i=0; i<NEEDPLAYERS; i++){
				if (!players[id][i]){
					players[id][i]= {
						x : 0,
						y : 0,
						type : 0,
						dir : 0,
						locked : 0,
						id : 0
					};
					playerId[socket.id]=i;
					break;
				}
			}
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
			var currentGroupIndex = find(groupNames,users[socket.id]);
			if(index > -1) {
				groupIds[users[socket.id]].splice(index, 1);
				players[currentGroupIndex][playerId[socket.id]]=false;
			}
			if(!groupIds[users[socket.id]].length) {
				console.log("Deleted");
				pass[users[socket.id]] = null;
				groupNames.splice(find(groupNames,users[socket.id]),1);
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

  function receivePostion(receivedPlayer) {
    // console.log(curPlayerPosition.x + " " + curPlayerPosition.y + " received from " + socket.id);
    var currentGroup = groupIds[users[socket.id]];
		var data = [];
		if(!currentGroup || !currentGroup.length)return;
		/// CALCULATING TIME ///
		var currentGroupIndex=find(groupNames,users[socket.id]);
		console.log(currentGroupIndex + " " + users[socket.id]);
		console.log(groupTime[currentGroupIndex]);
		var lock=1;
		if (currentGroup.length == NEEDPLAYERS){
			lock = 0;
			//console.log("DA");
		}
		var cntAlive=0;
		for (var i = 0 ; i < players[currentGroupIndex].length; i++){
			cntAlive+=(players[currentGroupIndex][i].type>0);
		}
		if (groupTime[currentGroupIndex]==0 || (cntAlive==1 && groupTime[currentGroupIndex]<GAMELENGTH)){
			lock=-1;
			groupTime[currentGroupIndex]=1;
		}
		var prevtype = players[currentGroupIndex][receivedPlayer.id]=receivedPlayer.type;
		players[currentGroupIndex][receivedPlayer.id] = receivedPlayer;
		receivedPlayer.type=prevtype;
		//console.log("RECEIVED COORDS FROM " + receivedPlayer.id);
		for (var i = 0; i < players[currentGroupIndex].length ; i++){
			var newData = players[currentGroupIndex][i];
			newData.name = users[socket.id];
			newData.locked = lock;
			//console.log("LOCK of " + receivedPlayer.id + " = " + lock);
			data.push(newData);

		}
		/// CHECKING COLLISION WITH STOROZH ///
		for (var i = 0; i < data.length; i++){
			for (var j = 0; j < data.length; j++){
				if (i==j) continue;
				if (data[i].type==1 && data[j].type>=2){
					if (dist(data[i].x,data[i].y,
						data[j].x,data[j].y)<50){
							data[j].type=-1;
							players[currentGroupIndex][j].type = -1;
						}
				}
			}
		}
    socket.emit('receivePositions', data);
		socket.emit('receiveTime',groupTime[currentGroupIndex]);

  }








}
