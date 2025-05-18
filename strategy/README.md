# Turn-based Strategy game UWH

## Game area

* 25 tiles height and 15 tiles width
* tiles are hexagon
* grid layed out so that the blue team is at the top and the red team at the bottom
* blue vs red teams
* 3 tiles at the top, center are the goal for the blue team
* 3 tiles at the bottom, center are the goal for the red team

## Teams

* each team (blue and red) has 6 units each numbered 1 to 6 and named as follow:
  * 1: left forward
  * 2: center forward
  * 3: right forward
  * 4: left back
  * 5: center back
  * 6: right back

## starting positions

* at the start, the players are layed out as follows:

             1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6
          0 _________________________________
          1 |        6 5 3 2 1 4            |
          2 |                               |
          3 |                               |
          4 |                               |
          5 |                               |
          6 |                               |
          7 |                               |
          8 |                               |
          9 |                               |
         10 |                               |
         11 |                               |
         12 |                               |
         13 |                               |
         14 |                               |
         15 |                               |
         16 |                               |
         17 |                               |
         18 |                               |
         19 |                               |
         20 |                               |
         21 |                               |
         22 |                               |
         23 |                               |
         24 |                               |
         25 |                               |
         26 |         4 1 2 3 5 6           |
            _________________________________


forwards are lined up on top of the goal and backs on both sides, facing the opponent goal

## Units

* each unit has stats (generated randomly)
  * recovery: units of time per turn that the unit recovers at the surface (1 to 5)
  * max hold breath: maximum turns that the player can stay underwater (15 to 25)
  * swim speed: tiles per turn that the player can move (1 to 3)
  * steal strength: a probability of stealing the puck from another player (10% to 80%)
  * flick distance: number of tiles a player can flick the puck (1 to 3)
  * turn speed: fraction of a turn to orient themselves (1/3, 2/3, 3/3)

## Unit state

* unit state
  * surface: this increases the player breath counter by +1 for each turn
    * if the counter is at the value of the player max hold breath, the counter stops
  * underwater: this decreases the player breath counter by -1 for each turn
    * if the counter is at zero, the player automatically changes state to surface
* unit direction: unit can face in any direction of the hexagon tile and can rotate (the turn speed determines how fast it can rotate)
  * rotation is called a curl

## The puck

* another game piece is the puck
* at the start of a round, the puck is placed at the center tile of the play grid
  * a "free" puck is possessed by the player that steps on the same tile as where the puck is
* the puck only moves when possessed by a player

## Stealing the puck

If player possesses the puck and an opposing player faces each other, the opponent can try to steal the puck.

This has a probability of success determined by the steal probability.

## Restrictions on movement

* if two units are underwater, they cannot "jump" over each other
* if two units are at the surface, they cannot "jump over each other
* if one unit is a the surface and the other is underwater, they can cross or occupy the same tile

## scoring

* objective is for the blue team to take posession of the puck and bring it to one of the 3 goal tiles of the red team and vice-versa
* once the puck is in the goal zone, score increments by 1 for the scoring team and units position reset at their starting point.

## turn

each turn, both team units can plan to do one of the following action:

* move
* rotate
* surface (if underwater)
* dive (if at the surface)
* flick (if in possession of the puck)
* steal puck

Once next round is initiated, all pieces execute the plan move

## AI players

AI controls all players, both blue and red players except for a single unit selected by the human player.

Each turn, AI plans the move for all units in both team.

Once the human player has planned the move for the unit it controls, the next turn proceeds.

## heuristics

* both team generally move towards the puck
* once a team has possession, passes smartly to its team player by flicking
* players alternate surface and underwater position

## victory condition

a game ends for the first team reaching 3 points.

## user interface

display:

* scoreboard
* number of turns

have an hovercard that displays unit stats when hovering over it

visually show what the next action is planned for each unit using arrows (from unit to target) and colors

add a legend explaining what each arrow and its color means