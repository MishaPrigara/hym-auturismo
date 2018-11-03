WANTED.
commit notes (03.11.18):
-player cannot reconnect and become alive
-player reconnect as dead
-if storozh reconnect, game will be ended
-fixed bug with timer (probably)
-initialization is now made on server
 (server sends player his parameters but not player determines them himself)

BUGS
1) IF STOROZH LEAVES = ALL PLAYERS STUCK

TODO
1) REALIZE GAMESTATE ARRAY TO EASILY SEND TO CLIENTS AN INFORMATION ABOUT GAME STATE
...

1.5) PUT THE GAME ONTO SERVER (MAKE SERVER WORK STABLE WITHOUT RANDOM BUGS)
2) REALIZE SPAWN KEYS RANDOMLY ON THE MAP AND SPAWN RANDOMLY A DOOR
...

3) ADD NEW LEVELS


/---OUTDATED---/

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
