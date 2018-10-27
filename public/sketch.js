var socket;
var r = 30;
var fr = 30;
var locked = false;
var playerPosition = {};
var velocity = {};
var user = new User();
var center = { };
var board;
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

function setup() {
	// console.log(frameRate());
	frameRate(fr);
	createCanvas(windowWidth, windowHeight);
	center = {
		x : windowWidth/2,
		y: windowHeight/2
	}
	shadow = loadImage("assets/shadow.png");
	storozh = loadImage("assets/storozh.png");
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
		type: 0
	};


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

function draw() {
	if(!user.isLogged()) return;
	if (playerPosition.type==0) return;
	// background(0);

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
		drawObj(5, i, i);

	}
	for(var i = 0; i < data.length; i++) {
		drawObj(data[i].type, data[i].y, data[i].x);
	}
	//image(shadow,center.x - center.y, 0 , center.y*2,center.y*2);
	fill(0,0,0);
	rect(0,0,center.x-center.y,center.y*2);
	rect(center.x-center.y+center.y*2,0,center.x-center.y,center.y*2);
}
function drawObj(type, i, j) {
	// console.log("Maluem");
	if (type==0) return;
	noStroke();
	var toAdd = {
		x : center.x-playerPosition.x,
		y : center.y-playerPosition.y
	};

	if(type == 1) {
		fill(255, 0, 0);
	} else if(type == 2) {
		fill(0, 255, 0);
	} else if(type == 3) {
		fill(0, 0, 255);
	} else if (type == 4){
		fill(0, 255, 255);
		image(storozh,j+toAdd.x,i+toAdd.y,50,50);
		return;
	} else if(type >= 5) {
		fill(50, 50, 50);
		rect(board[i][0] + toAdd.x, board[i][1] + toAdd.y, board[i][2], board[i][3]);

		return;
	}
  ellipse(j + toAdd.x ,i + toAdd.y,50,50);
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
