var socket;
var r = 30;
var fr = 30;
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

	socket = io.connect('http://46.101.126.212:3000/');
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

	// background(0);
	playerPosition.x += velocity.x;
	playerPosition.y += velocity.y;

	socket.emit('playerPosition', playerPosition);
	socket.on('receivePositions', function updatePlayers(data) {
		// console.log("PONAL PRINAL");
		if(data[0].name === user.getGroupName()) {
			// console.log("ZROZUMILO");

			background(0);
			for(var i = 0; i < data.length; i++) {
				// console.log(data[i].x + " " + data[i].y);
				drawPlayer(data[i]);
			}
		} else {
			// console.log("DENIED");
		}
	});
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
