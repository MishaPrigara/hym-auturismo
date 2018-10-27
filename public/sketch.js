var socket;
var r = 30;
var fr = 30;
var locked = false;
var playerPosition = {};
var velocity = {};
var user = new User();
var center = { };

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
	background(160, 169, 204);

	// console.log(frameRate());

	socket = io.connect('http://localhost:3000/');
	// socket.on('mouse', newDrawing);
	// socket.on('init', initDrawing);

	var key=Math.random();

	socket.on('receiveGroupSize', function (data){
		console.log("SECOND " + data.key + " got " + data.size);
		if (data.key === key)
			playerPosition.type = data.size;
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
		x : 0,
		y : 0,
		type: 0
	};


	socket.on('receivePositions', initDraw)
}

function draw() {
	if(!user.isLogged()) return;

	// background(0);
	playerPosition.x += velocity.x;
	playerPosition.y += velocity.y;

	socket.emit('playerPosition', playerPosition);

}
function initDraw(data){
	if (data[0].name == user.getGroupName()){

		clear();
		var toAdd = {
			x : center.x-playerPosition.x,
			y : center.y-playerPosition.y
		};
		for (var i=0; i<data.length; i++){
			data[i].x+=toAdd.x;
			data[i].y+=toAdd.y;
			//console.log(data[i].x+ " " + data[i].y);
			drawObj(data[i]);
		}

	}
}
function drawObj(position) {
	// console.log("Maluem");
	noStroke();
	if(position.type == 1) {
		fill(255, 0, 0);
	} else if(position.type == 2) {
		fill(0, 255, 0);
	} else if(position.type == 3) {
		fill(0, 0, 255);
	} else if(position.type == 4) {
		fill(50, 50, 50);
		rect(position.x, position.y, 50, 50);
		return;
	}
  ellipse(position.x,position.y,50,50);
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
    velocity.x += -10;
  } else if (keyCode === RIGHT_ARROW) {
    velocity.x += 10;
  } else if (keyCode === UP_ARROW){
		velocity.y += -10;
	} else if (keyCode === DOWN_ARROW){
		velocity.y += 10;
	}
}
