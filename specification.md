# Underwater Hockey 2D Simulation Specification (simulator2.html)

## Overview

This document outlines the design and implementation of a **2D overhead simulation** of Underwater Hockey. The simulation will provide a simplified, tactical view of the game, focusing on player movement, puck interaction, and goal scoring mechanics.

simulator.html was the first version of the simulator; we're trying to improve on that with a clearer specification to create simulator2.html

---

## Applications
This 2D simulation is designed for:
- **Tactical Analysis:** Understanding team formations and strategies.
- **Educational Use:** Teaching the rules and dynamics of Underwater Hockey.
- **Entertainment:** Providing a simplified, engaging version of the sport.

---

## implementation

Sophisticated HTML5 (Javascript, HTML and CSS and 2d library) that adapts the visual size of the playing area and the game elements to the available window, dynamically adjusting and is visually appealing with fully implemented AI heuristics, depth shading, dynamic formation guidelines, scoreboard, status, team formations, random but realistic players attributes for max breath, stamina and swimming speed.

---

## Screen Layout
¨¨
- Layout should be scoreboard and game time (countdown) at the top and selected team formation
- as team formation can be different for either team, indicate formation for each team
- pool (game area) at the center
- Status table at the bottom.
- game should start on load
- Formation is randomly select for each team (3-3, 3-2-1, 2-2-2, etc)
- Games have two periods of 12  minutes
---

## Features

### 1. **Playing Area**

In underwater hockey, the walls are differentiated primarily by their function and placement within the playing area. The pool is divided into the following components:

#### Sidelines
- The **side walls** define the longer, parallel boundaries of the playing area.
- One sideline will be defined and named as the **near sideline**, and the other as the **far sideline**.

#### Endlines
- The **end walls** (shallow end and deep end) define the shorter boundaries of the pool and the areas where the goals are located.

#### Corners
- The **corner** is the area where a side wall and an end wall (or line) intersect.
- A **1-meter radius circular arc** from the intersection defines the corner area.

#### Goal Areas
- At each end of the pool, the **goal area** is defined by a solid line near the goal tray.
- The front and sides of the goal tray are surrounded by a border in the color of the team.
- A **dotted line** marks the **penalty shot area**, which is a restricted zone near the goal.

---

### 2. **Player Representation**
- **Stick Figures:** Players are represented as stick figures with:
  - Legs (lines), body (rectangle), head (circle), arms (lines), and a handheld stick
  - the handheld stick is a line orthogonal to the arm tip
  - As they are swimming: players are laying flat, oriented head first in the direction they are moving.
  - As they move, their stick figure should be rotated in the direction they are going
  - Dominant arm (left or right) is extended, other arm on the side
- **Team Colors:**
  - **Red Team:** Originally White.
  - **Blue Team:** Originally Black.
- **Depth Shading:**
  - **Darkest Shade:** At the surface.
  - **Lightest Shade:** At the bottom.
  - **Intermediate Shades:** For surfacing or diving.
- **Position Labels:** Each player has a text label indicating their role (e.g., LF for Left Forward, CB for Center Back).

---

### 3. **Puck Representation**
- The puck is a small circle in a pink color
- When a player has possession, the puck is shown as **"attached" to the front of the stick**.
- Player that has the puck is highlighted
- The puck interacts only with the **stick** (not the player's body).

---

### 4. **Gameplay Mechanics**
- **Starting Positions:**
  - All players start with the tips of their legs touching their team's wall.
  - **Formation:**
    - **Forwards:** Centered on top of their own goal.
      - The **Center Forward** (fastest swimmer) is aligned with the puck.
    - **Backs:** Positioned on either side of the forwards.
- **Player Movement:** Players move as stick figures, with their stick interacting with the puck.
- **Puck Interaction:**
  - Players can **push** or **flick** the puck using their stick.
  - The puck must cross the **goal tray lip** fully to score.
- Players on the same plane (surface or bottom of the pool) cannot overlap each other
- Players diving or surfacing can be midwater under a player at the surface or over a player at the bottom
- Players can stay at different depths

---

### 5. **Visualization**
- **Overhead View:**
  - The pool is visualized as a **rectangle** with a **meter grid system**.
  - Players are shown as **stick figures** with shading to indicate depth.
  - The puck is a small circle, visually distinct from players.
  - Goals: are three-meter-long trough at either end of the playing area.
    - Leading up to the trough is an angled lip
    - To score, the puck must be fully in the trough (pass the lip)
- **Depth Visualization:**
  - **Shading Intensity:**
    - **Darkest Shade:** Surface.
    - **Lightest Shade:** Bottom.
    - **Intermediate Shades:** For transitions (surfacing/diving).
- **Team and Role Indicators:**
  - **Team Colors:** Red vs. Blue.
  - **Role Labels:** Displayed as text near each player (e.g., LF, RW, CB).

---

## Player Status Table

The player status table provides real-time information about each player's current state and attributes. The table includes the following columns:

| **Column**         | **Description**                                                                 |
|---------------------|---------------------------------------------------------------------------------|
| **Team**           | The team the player belongs to (e.g., Red or Blue).                             |
| **Role**           | The player's assigned role (e.g., Left Forward, Center Back).                   |
| **Hand**           | Indicates whether the player is left-handed or right-handed.                   |
| **Depth**          | The player's current depth (e.g., Surface, Midwater, Bottom).                  |
| **Strategy**       | The player's current strategy (e.g., Defend, Attack, Support).                 |
| **State**          | The player's current state (e.g., Surfacing, Diving, Chasing Puck).            |
| **Breath (s)**     | The player's remaining breath time in seconds.                                 |
| **Max Breath (s)** | The player's maximum breath capacity in seconds.                                |
| **Speed**          | The player's current speed.                                                    |
| **Flick Str**      | The player's flick strength, which determines the power of their puck flicks.  |

This table is dynamically updated during the simulation and provides a detailed overview of each player's performance and status.

---

## Value range

- Depth is 3 meters; the time it takes to surface or dive takes into account the vertical diving or surfacing speed
- Breath holds while moving are generally between 10s and 20s, maximum 30s when relatively static
- left-handedness, a trait possessed by only 10 percent of the population, while the other 90 percent is right-handed. distribute left and right to be random but statistically correct.

---

## AI Heuristics

### General Principles & Priorities

- **Breath Management:** Staying surfaced to recover breath is required. Players must surface if their breath gets too low. Players can only dive again when they have fully recovered their breath. Breath recovery is twice as fast as the breath hold but is constrained by stamina.
- **Low Breath Action (Puck Possession):** If a player has the puck underwater and their breath is getting low, they will attempt to pass the puck to one of their team mate.

---

### Role Assignment

- Players are assigned positions based on standard team formations at the start of the game.
- Within each team, the strongest forward and back players are typically assigned the central positions in their respective lines.
- Formations are based on 6 players in the water simultaneously. Players are numbered from 1 to 6 and left-most forward player to right-most back player
- 6 players can be organized as :
  - 3-3: 3 forwards, 3 backs
    - This is a common formation in underwater hockey, with three players focused on offense (forwards) and three on defense (backs).¨
  - 3-2-1 (3 forwards, 2 midfielders and one full back)
    - This formation includes three forwards, two midfielders who can play both offensively and defensively, and one back.
  - 2-2-2 (2 forwards, 2 midfielders and 2 backs)
    - This formation has an even distribution of players, with two players in each of the three positions: forwards, midfielders, and backs.

---

### Game Start Logic

- Players start at their end walls, arranged by forwards in the middle (over the goal), midfielders on either side and backs on either side of the midfielders.
- Forwards dive immediately when the game starts and race towards the puck at the center.
- Backs initially remain on the surface and follow their corresponding forwards until forwards from either or both teams are close to the puck.
- Forwards commit to the race to the puck to try to get possession of the puck.

---

### Player Behavior

- While on the surface, players breathe
- While surfacing or at the surface, players move into position for the next dive
- While diving or at the bottom, players move to intercept or receive a pass from the puck holder
- They move towards their ideally designated positions based on the team's formation and opponents formation.
- Players will consider diving once their breath is fully recovered and they have an opportunity to intercept the puck or receive a pass.
- Dive decisions are based on the puck's location (diving offensively if the puck is near the opponent's goal or defensively if it's near their own goal) and opponent possession.

---

### Underwater Behavior

- **Possessing the Puck:**
  - If in the opponent's half and close to the goal, the player will attempt a shot on goal.
  - If in their own half or near their own goal, the player will attempt to move the puck towards the side wall to clear it from the scoring area.
  - Otherwise, the player will attempt to advance the puck towards the opponent's goal while trying to keep a distance from the opponents.
  - Players with the puck will try to avoid nearby opponents by adjusting their movement angle.

- **Opponent Possessing Puck:**
  - If the puck is near their own goal, all nearby defenders will aggressively pressure the puck carrier.
  - Backs will position themselves between the puck carrier and their own goal to intercept.
  - Forwards will move sandwich the puck carrier to apply pressure.

- **Puck is Loose:**

  - If the loose puck is near their own goal, players prioritize moving it away from the goal.
  - Generally, players balance chasing the loose puck with moving towards their assigned formation position.
  - Defensive players prioritize maintaining formation more than forwards.

---

## Dynamic Formation Guidelines

- We want to visualize the dynamic nature of the formations across the game area for both teams
- Formation position depends on
  - if own team or opponent is controlling the puck
  - how close to own goal or opponent goal we are
  - which players are at the bottom and which players are at the surface
- two sets of guidelines: one for red team, one for blue team.

### Lines Guidelines

- These guidelines represent forward, optionally mid (2-2-2, 3-2-1, 2-3-1 all have midfielders), and back lines.
- These guidelines connect from one sidelines to the otehr
- The guidelines, adjust dynamically based on the puck's position and the team in possession.
- Labeled guidelines as "F" (Forward), "M" (Mid), and "B" (Back). Labels appear in the team color;
  - one team labels is on the near sideline, the other team labels is on the far sidelines

---

### Position Guidelines

- These guidelines represent forward, optionally center (3-3 or 3-2-1 or 2-3-1 formations all have a center position), and backs left, center or right
- If the puck is on the near sideline, the left position guideline is closely parallel to the near sideline
  - and the right guideline should be two meters to the right.
- Maintain a constant distance between all guidelines to guide player positioning.

---

### Drawing Guidelines

- Keep the dotted guidelines visible even when no team has possession of the puck, using their target positions.
- Lines guidelines should be parallel to the end walls and position guidelines should be parallel to the sidelines. Both position and line guidelines are labeled. labeled appear outside the game area and follow the guidelines they label.
- left, center, right should be parallel to sidelines (near and far wall). labels are outside the endlines.
- forward, mid, back guidelines are parallel to the endlines
- extend both group of guidelines outside of the pool area so labels are displayed outside the walls.

---

### How the guidelines update dynamically

Guidelines represent tight formation moving across the playing area. They update according to the game dynamic.

Guidelines are equidistant by about a body length and relative to whichever player holds the puck and their own position.

For example, if the forward left has the puck, then the left guideline and forward guideline intersects on where the forward left is so that other players can know what their target position is when surfacing.

If the opposing team has the puck, then guidelines are drawn for optimal placement for defense around the opposing player holding the puck.


### AI used

- The intersection between a line guideline and a position guideline is where the corresponding player goal to optimally position themselves is
  - example : where the red forward guideline intersects the red left guideline is where player 1 of the red team will try to move to to ideally position themselves
- Guidelines are suggested relative to the player who has puck.

### Field Orientation and On-Screen Labels

The simulation visually labels the pool boundaries and axes to clarify orientation:

Red Wall (Endline): Labeled to the left of the left onscreen edge of the playing area.
Blue Wall (Endline): Labeled to the right of the right onscreen edge of the playing area.
Near Wall (Sideline): Labeled above the top onscreen edge of the playing area.
Far Wall (Sideline): Labeled below the bottom onscreen edge of the playing area.
Axis Indicators:
"X →" is labeled outside the onscreen bottom-right pool, pointing right (increasing X).
"Y ↓" is labeled outside the onscreen bottom-right pool, pointing down (increasing Y).

Corner and Axis Reference Points:
"X0, Y0" at the onscreen top-left (origin).
"Xmax" and "Y0" at the onscreen top-right.
"Ymax" at the onscreen bottom-left.
"Xmax, Ymax" at the onscreen bottom-right.

Guideline Drawing Orientation:

F/M/B (Forward, Mid, Back) guidelines are drawn as onscreen vertical lines (spanning left to right), parallel to the sidelines.
L/C/R (Left, Center, Right) guidelines are drawn as onscreen horizontal lines (spanning top to bottom), parallel to the endlines.

These visual aids help clarify the coordinate system and ensure correct feedback on field and guideline orientation.
