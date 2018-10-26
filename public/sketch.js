var socket;
var r = 30;
var fr = 120;
var locked = false;
var playerPosition = {};
var velocity = {};
var user = new User();


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
	background(160, 169, 204);

	// console.log(frameRate());

	socket = io.connect('http://localhost:3000/');
	// socket.on('mouse', newDrawing);
	// socket.on('init', initDrawing);
	socket.on('checkedLogin', processLogin);
	socket.on('loggedIn', function(data) {
		user.setLogged(data);
		processLogin(data);
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
	if(!user.isLogged()) return;
	playerPosition.x += velocity.x;

	socket.emit('playerPosition', playerPosition);
}

function keyReleased() {
	velocity.x = 0;
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    velocity.x += -0.1;
  } else if (keyCode === RIGHT_ARROW) {
    velocity.x += 0.1;
  }
}
