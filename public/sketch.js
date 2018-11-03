// CONSTANS
var NEEDPLAYERS=3;
// VARIABLES

var socket;
var r = 30;
var fr = 30;
var locked = true;
var playerPosition = {};
var velocity = {};
var user = new User();
var center = { };
var board;
var timer = 180;
var timeId;
var guy = [];
var shadow;
var storozh_it = 0;
var font, fontsize = 40;
var timeEnd = false;
var waitForOthers = "Waiting for other players to join";
var joined = 0;
var key = 0;
var firstReceive = false;
var prevWidth = 0, prevHeight = 0;
var player = {
	speed: 16
};

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

	font = loadFont('assets/OCRAEXT.TTF');
	socket = io.connect('http://192.168.1.13:3000');
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
	background_song = document.getElementById("background-music");

	textFont(font);
  textSize(fontsize);
  textAlign(CENTER, CENTER);

	background(159, 163, 165);
	console.log(windowWidth + " <> " + windowHeight);
	frameRate(fr);

	center = {
		x : windowWidth/2,
		y: windowHeight/2
	}

	// console.log(frameRate());

	// socket.on('mouse', newDrawing);
	// socket.on('init', initDrawing);

	key=Math.random();

	createCanvas(windowWidth, windowHeight);


	socket.on('receiveGroupSize', function (data){
		//console.log("SECOND " + data.key + " got " + data.size);
		if(data.key === key) joined = data.size;
		if (data.key === key){
			joined = data.size;
			board = data.lvl;
			playerPosition.x = data.x;
			playerPosition.y = data.y;
			playerPosition.type = data.type;
			playerPosition.dir = data.dir;
			playerPosition.locked = data.locked;
			playerPosition.id = data.id;
			if (playerPosition.type == 1){
				player.speed = 15;
			}
		}
	});

	socket.on('checkedLogin', processLogin);
	socket.on('loggedIn', function(data) {
		user.setLogged(data);
		processLogin(data);
		if (data)
		socket.emit('getGroupSize', key);
	});


	velocity = {
		x : 0,
		y : 0
	};
	playerPosition = {
		x : 1000,
		y : 1000,
		type: 1,
		dir : 3,
		locked : 1,
		name : user.getGroupName(),
		id : 0
	};

	background_song.play();

	socket.on('receivePositions', initDraw);
	socket.on('receiveTime',function(data){
		timer=data;
	});

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
		//console.log("DA1");
	if(!user.isLogged() || timeEnd || !board) return;


	//	console.log("DA2");
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

		if(playerPosition.locked) {
			socket.emit('playerPosition', playerPosition);
			return;
		}
		if(intersect(playerPosition, velocity, a,b,c,d)) {
			playerPosition.x -= velocity.x;
			playerPosition.y -= velocity.y;
			socket.emit('playerPosition', playerPosition);
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

function drawWords(words, x) {
  // The text() function needs three parameters:
  // the text to draw, the horizontal position,
  // and the vertical position
  if(playerPosition.type == 1)fill(0); else fill(255);
  text(words, x, 80);

}
function initDraw(data){

	if(user.getGroupName() != data[0].name)return;
	clear();

	playerPosition=data[playerPosition.id];

	/// BACKGROUND FILL ///

	fill(159, 163, 165);
	rect(0, 0, windowWidth, windowHeight);

	/// MAP DRAWING ///

	for(var i = 0; i < board.length; i++) {
		drawObj(5, i, i, 0);
	}
	for(var i = 0; i < data.length; i++) {
		if (!data[i])continue;
		drawObj(data[i].type, data[i].y, data[i].x, data[i].dir);
	}

	/// DRAWING FIELD OF VIEW OF STUDENT ///

	if (playerPosition.type!=1 && playerPosition.type!=-1){
		image(shadow,center.x - center.y, 0 , center.y*2,center.y*2);
		fill(0,0,0);
		rect(0,0,center.x-center.y + 50,center.y*2);
		rect(center.x-center.y+center.y*2 - 50,0,center.x-center.y+200,center.y*2);
	}

	/// GAME LOGIC ///
	/*var cnt=data.length;
	var cntLockedBeforeStart=0;
	var cntLockedAfterStart=0;
	var cntAlive=0;
	for (var i=0; i < data.length; i++){
		cntLockedBeforeStart+=(data[i].locked==1);
		cntAlive+=(data[i].type!=-1);
		cntLockedAfterStart+=(data[i].locked==-1);
	}
	if (cntLockedBeforeStart>0 && cnt==NEEDPLAYERS){
		playerPosition.locked=0;
	}
	if ((cntAlive==1 && cntLockedBeforeStart==0) || cntLockedAfterStart==NEEDPLAYERS){
		playerPosition.locked=-1;
	}
	*/

	/// TEXT DRAW ///

	textAlign(CENTER);
	if(playerPosition.locked == -1) {
		drawWords("GAME OVER", width * .5);
	} else if(!playerPosition.locked) {
	  drawWords("" + timer, width * .5 );
	} else {
		var joined=data.length;
		waitForOthers = "Wait for other players to join (" + joined + "/" + NEEDPLAYERS + ")";
		drawWords(waitForOthers, width * .5);
	}

}
function drawObj(type, i, j, direction) {
	// console.log("Maluem");
	if (type==0 || type == -1) return;
	//console.log(type);
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
	if (keyCode === LEFT_ARROW){
		velocity.x+=player.speed;
	} else if (keyCode === RIGHT_ARROW){
		velocity.x-=player.speed;
	} else if (keyCode === UP_ARROW){
		velocity.y+=player.speed;
	} else if (keyCode === DOWN_ARROW){
		velocity.y-=player.speed;
	}

}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    velocity.x += -player.speed;
  } else if (keyCode === RIGHT_ARROW) {
    velocity.x += player.speed;
  } else if (keyCode === UP_ARROW){
		velocity.y += -player.speed;
	} else if (keyCode === DOWN_ARROW){
		velocity.y += player.speed;
	}
}
