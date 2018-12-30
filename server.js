// CONSTANTS
var GAMELENGTH = 120;
var NEEDPLAYERS=2;
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
var server = app.listen(3005);
var id = 0;
var groupTime = [];
var groupNames = [];
var timerIds = [];
var playerId = {};
var gameStates = [];
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

function gameState(groupName){
	var id = find(groupNames,groupName);
	if (!players[id]) return "STANDBY";
	for (var i=0; i<NEEDPLAYERS; i++){
		if (!players[id][i]) continue;
		if (players[id][i].locked === 0) return "RUNNING";
		if (players[id][i].locked === -1) return "OVER";
	}
	return "STANDBY";

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
			console.log("FOUND PLACE FOR " + user.groupName + " : " + id);
			groupTime[id]=GAMELENGTH;
			gameStates[id]="STANDBY";
			console.log(gameStates[id]);
			players[id] = [];
			var curGroup = user.groupName;
			timerIds[id]=setInterval(function decrease(){
				groupTime[id]-=(gameState(user.groupName)==="RUNNING");
				console.log(user.groupName + " " + groupTime[id]);
				if (groupTime[id]<=0 || !groupIds[user.groupName].length) clearTimeout(timerIds[id]);
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
			console.log(gameStates[id]);
			for (var i=0; i<NEEDPLAYERS; i++){
				if (!players[id][i]){
					console.log("FOUND PLACE FOR " + socket.id + " " + i);
					players[id][i]= {
						x : 1000,
						y : 1000,
						type : i+1,
						dir : 3,
						locked : 1,
						id : i
					};
					if (i==0){
						players[id][i].x=660;
						players[id][i].y=4070;
					}
					if (gameStates[id] === "RUNNING"){
						players[id][i].type=-1;
						console.log("GAME IS IN PROGRESS, " + socket.id +" spawned as DEAD");
					}
					playerId[socket.id]=i;
					break;
				}
			}
			if (groupIds[user.groupName].length===NEEDPLAYERS && gameStates[id]==="STANDBY"){
				gameStates[id]="RUNNING";
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
				if (playerId[socket.id]===0){
					gameStates[currentGroupIndex]="OVER";
				}
			}
			if(!groupIds[users[socket.id]].length) {
				console.log("Deleted");
				pass[users[socket.id]] = null;
				var id=find(groupNames,users[socket.id]);
				groupNames.splice(id,1);
				gameStates.splice(id,1);
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
		var currentGroupIndex=find(groupNames,users[socket.id]);
		var playerIndex = playerId[socket.id];
    var res = {
      size :sz,
      key : key,
      lvl : arr,
			type: players[currentGroupIndex][playerIndex].type,
			x : players[currentGroupIndex][playerIndex].x,
			y : players[currentGroupIndex][playerIndex].y,
			dir : players[currentGroupIndex][playerIndex].dir,
			locked : players[currentGroupIndex][playerIndex].locked,
			id : players[currentGroupIndex][playerIndex].id

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
		var lock = 1;
		if (gameStates[currentGroupIndex]=="RUNNING"){
			lock = 0;
		}
		var cntAlive=0;
		for (var i = 0 ; i < players[currentGroupIndex].length; i++){
			cntAlive+=(players[currentGroupIndex][i].type>0);
		}
		if (gameStates[currentGroupIndex]=="RUNNING"){
			if (groupTime[currentGroupIndex]==0 || (cntAlive==1 && groupTime[currentGroupIndex]<GAMELENGTH)){
				groupTime[currentGroupIndex]=0;
				gameStates[currentGroupIndex]="OVER";
			}
		}
		if (gameStates[currentGroupIndex]==="OVER")lock=-1;

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
