var socket;
var r = 30;
var fr = 30;
var locked = false;
var playerPosition = {};
var velocity = {};
var user = new User();
var center = { };
var board;
var guy = [];
var shadow;
var storozh_it = 0;
function keypressed() {
	if(event.key === 'Enter') {
		login();
	}
}

function login() {
	user.login();

	var data = {
		groupName: user.getGroupName(),
		pass: user.getPass()
	}
	socket.emit('checkLogin', data);
}

function processLogin(ok) {
	if(!ok) {
		location.reload();
	}
	user.deleteLogin();
	background(15);
	socket.emit('getData', user.getGroupName());
}
function preload(){
	background_song = document.getElementById("background-music");
	guy[0] = [];
	guy[1] = [loadImage("assets/storozh1_LEFT.png"),  loadImage("assets/storozh1_DOWN.png"),
						loadImage("assets/storozh1_RIGHT.png"), loadImage("assets/storozh1_UP.png")];

	guy[2] = [loadImage("assets/guy1_LEFT.png"),  loadImage("assets/guy1_DOWN.png"),
						loadImage("assets/guy1_RIGHT.png"), loadImage("assets/guy1_UP.png")];

	guy[3] = [loadImage("assets/guy2_LEFT.png"),  loadImage("assets/guy2_DOWN.png"),
						loadImage("assets/guy2_RIGHT.png"), loadImage("assets/guy2_UP.png")];

	guy[4] = [loadImage("assets/guy3_LEFT.png"),  loadImage("assets/guy3_DOWN.png"),
						loadImage("assets/guy3_RIGHT.png"), loadImage("assets/guy3_UP.png")];

	shadow = loadImage("assets/shadow.png");
}
function setup() {
	// console.log(frameRate());
	frameRate(fr);
	createCanvas(windowWidth, windowHeight);
	center = {
		x : windowWidth/2,
		y: windowHeight/2
	}
	background(160, 169, 204);

	// console.log(frameRate());

	socket = io.connect('http://localhost:3000/');
	// socket.on('mouse', newDrawing);
	// socket.on('init', initDrawing);

	var key=Math.random();

	socket.on('receiveGroupSize', function (data){
		//console.log("SECOND " + data.key + " got " + data.size);
		if (data.key === key){
			playerPosition.type = data.size;
			if (playerPosition.type === 1){
				playerPosition.x=660;
				playerPosition.y=4070;
			}
			board = data.lvl;
		}
	});
	socket.on('checkedLogin', processLogin);
	socket.on('loggedIn', function(data) {
		user.setLogged(data);
		processLogin(data);
		socket.emit('getGroupSize', key);
	});

	velocity = {
		x : 0,
		y : 0
	};
	playerPosition = {
		x : 1000,
		y : 1000,
		type: 0,
		dir : 3
	};

	background_song.play();
	socket.on('receivePositions', initDraw)
}

function sqr(x) {
	return x * x;
}

function distance(x, y, a, b) {
	return Math.sqrt(sqr(x - a) + sqr(y - b));
}

function intersect(newPosition, velocity, a,b,c,d) {
	newPosition.x += velocity.x;
	newPosition.y += velocity.y;
	if(newPosition.type == -1)return false;
	var figure =[a,b,c,d];
	var width = figure[2];
	var height = figure[3];
	figure[2] = figure[0] + width;
	figure[3] = figure[1] + height;

	if(newPosition.x <= figure[2] && newPosition.x >= figure[0]) {
		if(Math.abs(newPosition.y - figure[1]) < 25) return true;
		if(Math.abs(newPosition.y - figure[3]) < 25)return true;
		return false;
	}
	if(newPosition.y <= figure[3] && newPosition.y >= figure[1]) {
		if(Math.abs(newPosition.x - figure[0]) < 25) return true;
		if(Math.abs(newPosition.x - figure[2]) < 25)return true;
		return false;
	}

	if(distance(newPosition.x, newPosition.y, figure[0], figure[1]) < 25)return true;
	if(distance(newPosition.x, newPosition.y, figure[0], figure[3]) < 25)return true;
	if(distance(newPosition.x, newPosition.y, figure[2], figure[1]) < 25)return true;
	if(distance(newPosition.x, newPosition.y, figure[2], figure[3]) < 25)return true;
	return false;
}

function isPlaying(audio) {
	return !audio.paused;
}

function draw() {
	if(!user.isLogged()) return;
	if (playerPosition.type==0) return;
	// background(0);
	if(!isPlaying(background_song)) {
		background_song.currentTime = 0;
		background_song.play();
	}

	for(var i = 0; i < board.length; i++) {
		var a=board[i][0];
		var b=board[i][1];
		var c=board[i][2];
		var d=board[i][3];

		if(intersect(playerPosition, velocity, a,b,c,d)) {
			playerPosition.x -= velocity.x;
			playerPosition.y -= velocity.y;
			return;
		} else {
			playerPosition.x -= velocity.x;
			playerPosition.y -= velocity.y;
		}
	}

	playerPosition.x += velocity.x;
	playerPosition.y += velocity.y;

	socket.emit('playerPosition', playerPosition);


}
function initDraw(data){
	if(user.getGroupName() != data[0].name)return;
	clear();
	for(var i = 0; i < board.length; i++) {
		drawObj(5, i, i, 0);

	}
	var it = 0, guy_it = 0;
	for(var i = 0; i < data.length; i++) {
		if(data[i].type == 1)it = i;
		if(data[i].type == playerPosition.type)guy_it = i;
	}

	if(playerPosition.type != -1 && playerPosition.type != 1
			&& distance(playerPosition.x, playerPosition.y, data[it].x, data[it].y) < 50) {
				playerPosition.type = -1;
				data[guy_it].type = -1;
			}

	for(var i = 0; i < data.length; i++) {
		drawObj(data[i].type, data[i].y, data[i].x, data[i].dir);
	}
	if (playerPosition.type!=1 && playerPosition.type!=-1){
		image(shadow,center.x - center.y, 0 , center.y*2,center.y*2);
		//image(shadow,center.x,center.y);
		fill(0,0,0);
		rect(0,0,center.x-center.y,center.y*2);
		rect(center.x-center.y+center.y*2,0,center.x-center.y,center.y*2);
	}
}
function drawObj(type, i, j, direction) {
	// console.log("Maluem");
	if (type==0 || type == -1) return;
	var toAdd = {
		x : center.x-playerPosition.x,
		y : center.y-playerPosition.y
	};
	noStroke();

	if(type == 4) {
		if (playerPosition.type == 4) {
			if(velocity.x < 0) playerPosition.dir = 0;
			else if(velocity.x > 0)playerPosition.dir = 2;
			else if(velocity.y > 0)playerPosition.dir = 1;
			else if(velocity.y < 0) playerPosition.dir = 3;
			image(guy[playerPosition.type][playerPosition.dir],j+toAdd.x-guy[4][0].width / 2,i+toAdd.y - guy[4][0].height / 2);
		} else
			image(guy[4][direction],j+toAdd.x-guy[4][0].width / 2,i+toAdd.y - guy[4][0].height / 2);
	} else if(type == 2) {
		if (playerPosition.type == 2) {
			if(velocity.x < 0) playerPosition.dir = 0;
			else if(velocity.x > 0)playerPosition.dir = 2;
			else if(velocity.y > 0)playerPosition.dir = 1;
			else if(velocity.y < 0) playerPosition.dir = 3;
			image(guy[playerPosition.type][playerPosition.dir],j+toAdd.x-guy[2][0].width / 2,i+toAdd.y - guy[2][0].height / 2);
		} else
			image(guy[2][direction],j+toAdd.x-guy[2][0].width / 2,i+toAdd.y - guy[2][0].height / 2);
	} else if(type == 3) {
		if (playerPosition.type == 3) {
			if(velocity.x < 0) playerPosition.dir = 0;
			else if(velocity.x > 0)playerPosition.dir = 2;
			else if(velocity.y > 0)playerPosition.dir = 1;
			else if(velocity.y < 0) playerPosition.dir = 3;
			image(guy[playerPosition.type][playerPosition.dir],j+toAdd.x-guy[3][0].width / 2,i+toAdd.y - guy[3][0].height / 2);
		} else
			image(guy[3][direction],j+toAdd.x-guy[3][0].width / 2,i+toAdd.y - guy[3][0].height / 2);
	} else if (type == 1){
		if (playerPosition.type == 1) {
			if(velocity.x < 0) playerPosition.dir = 0;
			else if(velocity.x > 0)playerPosition.dir = 2;
			else if(velocity.y > 0)playerPosition.dir = 1;
			else if(velocity.y < 0) playerPosition.dir = 3;
			image(guy[playerPosition.type][playerPosition.dir],j+toAdd.x-guy[1][0].width / 2,i+toAdd.y - guy[1][0].height / 2);
		} else
			image(guy[1][direction],j+toAdd.x-guy[1][0].width / 2,i+toAdd.y - guy[1][0].height / 2);

		return;
	} else if(type >= 5) {
		fill(50, 50, 50);
		rect(board[i][0] + toAdd.x, board[i][1] + toAdd.y, board[i][2], board[i][3]);

		return;
	}
  //ellipse(j + toAdd.x ,i + toAdd.y,50,50);
}

function keyReleased() {
	if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW){
		velocity.x=0;
	} else if (keyCode === UP_ARROW || keyCode === DOWN_ARROW){
		velocity.y=0;
	}
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    velocity.x += -15;
  } else if (keyCode === RIGHT_ARROW) {
    velocity.x += 15;
  } else if (keyCode === UP_ARROW){
		velocity.y += -15;
	} else if (keyCode === DOWN_ARROW){
		velocity.y += 15;
	}
}
