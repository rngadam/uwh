# Turn-based Strategy Game UWH - Specification

## Game Area

- Hexagonal tile grid.
- Dimensions: 25 rows (y, top to bottom), 15 columns (x, left to right).
- Blue team starts at the top (row 1), red team at the bottom (row 25).
- Goals:
  - Blue goal: tiles (1,7), (1,8), (1,9) (colored blue).
  - Red goal: tiles (25,7), (25,8), (25,9) (colored red).
- The puck starts at the center: (13,8).

## Teams and Units

- Two teams: blue and red.
- Each team has 6 units, numbered and named:
  1. LF: left forward
  2. CF: center forward
  3. RF: right forward
  4. LB: left back
  5. CB: center back
  6. RB: right back

## Initial Placement (Kickoff)

- Row 1: all blue units (blue goal).
- Row 25: all red units (red goal).
- Columns for **blue team** (looking down): LB (6), LF (7), CF (8), RF (9), RB (10), CB (11).
- Columns for **red team** (looking up): LB (11), LF (10), CF (8), RF (7), RB (6), CB (5).
  - For the red team, positions are mirrored horizontally so that "left" and "right" are always from the perspective of facing the opponent's goal.
- Forwards (LF, CF, RF) are aligned over the goal columns, backs (LB, CB, RB) on the sides.
- Both teams' CF are always on column 8.
- All units face the opponent's goal.

```
       1 2 3 4 5 6 7 8 9 0 1 2 3 4 5
    0  _______________________________
    1 |        RB RF CF LF CB LB      |  (Blue, looking down)
    ...                               ...
   13 |              o                |
    ...                               ...
   25 |     LB CB LF CF RF RB         |  (Red, looking up)
       _______________________________
```

Note that left and right is relative to where the team is facing towards.

## Unit Stats

Each unit has:

- recovery: breath points recovered per turn at the surface (1-5)
- max hold breath: max turns underwater (15-25)
- swim speed: tiles per turn (1-3)
- steal strength: probability to steal the puck (10%-80%)
- flick distance: max pass distance (1-3)
- turn speed: fraction of a turn to rotate (1/3, 2/3, 3/3)

## Player States and Actions

- **State**: surface or bottom (underwater)
  - At surface: breath increases by +1/turn (up to max hold breath)
  - Underwater: breath decreases by -1/turn (if breath = 0, automatically surfaces)
- **Direction**: each unit has an orientation (0-5, hex directions)
- **Possible actions per turn**:
  - move
  - rotate (curl)
  - surface (go up)
  - dive (go down)
  - flick (pass if holding the puck)
  - steal (try to steal the puck)

  Move can be combined with surface or dive

## The Puck

- Starts at the center.
- A player underwater who steps onto the puck's tile picks it up.
- The puck can only be possessed by a player underwater.
- If the puck holder surfaces, the puck becomes free.

## Movement Rules

- Two units cannot end on the same tile in the same plane (surface/bottom).
- Two units can occupy the same tile if one is at the surface and the other at the bottom.
- Units cannot "jump over" another on the same plane.
- Planned paths must not cross on the same plane.

## Puck Possession and Stealing

- If an opponent faces the puck holder, they can attempt to steal (probability = steal strength). If the steal is succesful, they now possess the puck. The stealer can only attempt to steal if underwater facing the player who has the puck.
- Teammates cannot steal the puck from each other.

## Turn Sequence

- Each turn, every unit plans an action.
- All plans are resolved simultaneously.
- If multiple units want the same tile/plane, a random draw decides who moves; others are placed in the freely available tile next to it.
- Units alternate between center and wings to surface and dive to cycle through and manage breath globally.

## AI

- AI controls all units.
- Heuristics:
  - Forwards dive for the puck at kickoff with CF taking the lead in reaching the puck
  - Underwater units move toward the free puck.
  - The puck holder advances toward the opponent's goal.
  - If breath is low, the puck holder tries to pass to a teammate before surfacing.
  - Teammates position themselves around the puck holder for support at a puck passing distance.
  - Opponents converge on the puck holder to attempt a steal.
- Units alternate diving to avoid the whole team being underwater at once.

## Victory Conditions

- The first team to reach 3 goals wins.

## User Interface

- Display the board, score, and turn number.
- Show unit stats on hover.
- Show planned actions (colored arrows from unit to its destination).
- Legend for colors and arrows.
- Visual indication of the puck holder.
- Status table for each team (position, breath, state, planned action).
- Message history (puck pickup, steal, goal, etc.).
- Units at the surface are shown darker, those at the bottom lighter.
- Units on the same hex but different levels are shown superimposed.

## layout

three columns:

- left: board, score, turn number, unit stats, legend
- center: game area
- right: button for next round (can also press space key), history of puck possession

## Implementation Constraints

- Plans are resolved with random draw in case of destination conflicts.
- Units cannot have negative breath.
- Initial placements and AI logic must follow the grid and rules above.
