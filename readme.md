WANTED.
commit info:
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
1) IF SEVERAL LOBBYS ARE LAUCHED, THE TIMER CAN GO NEGATIVE
