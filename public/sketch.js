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
	background(160, 169, 204);

	// console.log(frameRate());

	socket = io.connect('http://localhost:3000/');
	// socket.on('mouse', newDrawing);
	// socket.on('init', initDrawing);

	var key=Math.random();

	socket.on('receiveGroupSize', function (data){
		console.log("SECOND " + data.key + " got " + data.size);
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
function check(p1,p2){
	if (board[parseInt(p2.y/5)][parseInt(p2.x/5)]==0) {
		board[parseInt(p1.y/5)][parseInt(p1.x/5)]=0;
		console.log(p1.y/5+ " " +p1.x/5);
		return 1;
	}
	console.log(p2.y/5+ " "+ p2.x/5);
	return 0;
}
function draw() {
	if(!user.isLogged()) return;
	if (!playerPosition.type) return;

	// background(0);
	var newPos = playerPosition;
	newPos.x +=velocity.x;
	newPos.y +=velocity.y;

	if (check(playerPosition,newPos))
	{
		console.log("DA");
		playerPosition=newPos;
		socket.emit('playerPosition', playerPosition);
	}
	else {
		console.log("NET");
	}



}
function initDraw(data){
	if (data[0].name == user.getGroupName()){
		clear();
		for (var i=0; i<data.length; i++){
			console.log(data[i].y/5+ " " + data[i].x/5);
			board[data[i].y/5][data[i].x/5]=data[i].type;
		}
		for (var i=Math.max(0,playerPosition.y/5 - 50) ; i<playerPosition.y/5 + 50; i++)
		{
			for (var j=Math.max(0,playerPosition.x/5 - 50); j<playerPosition.x/5 + 50; j++){
				drawObj(board[i][j], i, j)
			}
		}

	}
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
	} else if(type >= 4) {
		fill(50, 50, 50);
		rect(j*5 + toAdd.x, i*5 + toAdd.y, 50, 50);
		return;
	}
  ellipse(j*5 + toAdd.x ,i*5 + toAdd.y,50,50);
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
