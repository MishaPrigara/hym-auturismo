[Teaser](https://youtu.be/wYnXzVKCy7c)

WANTED.

commit notes(03.11.18 22:45)

1) can be put on server
2) if storozh disconnect, the game will be overed
3) removed lags if the connection is not stable
4) rewritten sketch.js, mostly draw function
5) removed a bug when initialization was not successfull
6) added gameStates[] in server.js

BUGS

TODO

1) REALIZE SPAWN KEYS RANDOMLY ON THE MAP AND SPAWN RANDOMLY A DOOR
\n...

2) ADD NEW LEVELS

/---OUTDATED---/
commit notes (03.11.18):
-player cannot reconnect and become alive
-player reconnect as dead
-if storozh reconnect, game will be ended
-fixed bug with timer (probably)
-initialization is now made on server
 (server sends player his parameters but not player determines them himself)

BUGS
1) IF STOROZH LEAVES = ALL PLAYERS STUCK [FIXED]

TODO
1) REALIZE GAMESTATE ARRAY TO EASILY SEND TO CLIENTS AN INFORMATION ABOUT GAME STATE [DONE 1/2]
...

1.5) PUT THE GAME ONTO SERVER (MAKE SERVER WORK STABLE WITHOUT RANDOM BUGS) [DONE 1/2]
2) REALIZE SPAWN KEYS RANDOMLY ON THE MAP AND SPAWN RANDOMLY A DOOR
...

3) ADD NEW LEVELS



commit notes (02.11.18):
-almost fully rewritten server.js
  -now following calculations are made on server:
    -collision with storozh
    -game is started or not
    -player is killed or not
  -now you can after "Game over" reload page (all players have to do that) and you can play again in this lobby
-changes in sketch.js
  -each player has an ID
  -this way you can easily receive data from server and change playerPosition without
    any other socket.emit's

BUGS TO BE FIXED:
1) IF SEVERAL LOBBYS ARE LAUCHED, THE TIMER CAN GO NEGATIVE [(50% fixed)]
