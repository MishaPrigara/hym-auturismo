var socket;
var r = 30;
var fr = 30;
var locked = false;
var playerPosition = {};
var velocity = {};
var user = new User();
var localGroupName;


function keypressed() {
	console.log("keyp");
	if(event.key === 'Enter') {
		login();
	}
}

function login() {
	console.log("log");
	user.login();

	var data = {
		groupName: user.getGroupName(),
		pass: user.getPass()
	}
	socket.emit('checkLogin', data);
}

function processLogin(ok) {
	console.log("proc log");
	if(!ok) {
		location.reload();
	}
	user.deleteLogin();
	background(15);
	socket.emit('getData', user.getGroupName());
}
p5.disableFriendlyErrors = true; // disables FES
function setup() {
	console.log("setup");
	// console.log(frameRate());
	frameRate(fr);
	createCanvas(windowWidth, windowHeight);
	background(160, 169, 204);

	// console.log(frameRate());

	socket = io.connect('http://localhost:3000/');
	// socket.on('mouse', newDrawing);
	// socket.on('init', initDrawing);
	socket.on('checkedLogin', processLogin);
	socket.on('loggedIn', function(data) {
		user.setLogged(data);
		processLogin(data);
		localGroupName = user.getGroupName();
	});

	velocity = {
		x : 0,
		y : 0
	};
	playerPosition = {
		x : 0,
		y : 0
	};
}

function draw() {

	// background(0);
	playerPosition.x += velocity.x;
	playerPosition.y += velocity.y;
	if (velocity.x || velocity.y){
		socket.emit('playerPosition', playerPosition);
		//console.log("otp");
		socket.on('receivePositions', drawPlayer);
		//console.log("PONAL PRINAL");
		clear();
		//drawPlayer(playerPosition);
	}

}

function drawPlayer(position) {
	// console.log("Maluem");
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
