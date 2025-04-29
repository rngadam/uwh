# Underwater Hockey 2D Simulation Specification

## Overview

This document outlines the design and implementation of a **2D overhead simulation** of Underwater Hockey. The simulation will provide a simplified, tactical view of the game, focusing on player movement, puck interaction, and goal scoring mechanics.

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
- A **dotted line** marks the **penalty shot area**, which is a restricted zone near the goal.

---

### 2. **Player Representation**
- **Stick Figures:** Players are represented as stick figures with:
  - Legs (lines), body (rectangle), head (circle), arms (lines), and a handheld stick (line orthogonal to the arm tip).
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
- The puck is a small circle.
- When a player has possession, the puck is shown as **"attached" to the front of the stick**.
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
  - The puck must cross the **goal tray lip** to score.

---

### 5. **Visualization**
- **Overhead View:**
  - The pool is visualized as a **rectangle** with a **meter grid system**.
  - Players are shown as **stick figures** with shading to indicate depth.
  - The puck is a small circle, visually distinct from players.
- **Depth Visualization:**
  - **Shading Intensity:**
    - **Darkest Shade:** Surface.
    - **Lightest Shade:** Bottom.
    - **Intermediate Shades:** For transitions (surfacing/diving).
- **Team and Role Indicators:**
  - **Team Colors:** Red vs. Blue.
  - **Role Labels:** Displayed as text near each player (e.g., LF, RW, CB).

---

## Applications
This 2D simulation is designed for:
- **Tactical Analysis:** Understanding team formations and strategies.
- **Educational Use:** Teaching the rules and dynamics of Underwater Hockey.
- **Entertainment:** Providing a simplified, engaging version of the sport.

---

## AI Heuristics

### General Principles & Priorities

- **Breath Management:** Staying surfaced to recover breath is the highest priority. Players must surface if their breath gets too low. Players can only dive again when they have fully recovered their breath.
- **Low Breath Action (Puck Possession):** If a player has the puck underwater and their breath is getting low, they will attempt to move the puck towards the opponent's goal before surfacing.

---

### Role Assignment

- Players are assigned positions based on standard team formations at the start of the game.
- Within each team, the strongest forward and back players are typically assigned the central positions in their respective lines.

---

### Game Start Logic

- Players start at their end walls, arranged by their assigned roles.
- Forwards dive immediately when the game starts and race towards the puck at the center.
- Backs initially remain on the surface and follow their corresponding forwards.
- Forwards commit to the race until they are close to the puck or it moves significantly.
- Backs continue following until their forward dives or the game situation changes.

---

### Surface Behavior

- While on the surface, players prioritize recovering breath.
- They will also move slowly towards their designated positions based on the team's formation.
- Players will only consider diving once their breath is fully recovered.
- Dive decisions are based on the puck's location (diving offensively if the puck is near the opponent's goal or defensively if it's near their own goal) and opponent possession.

---

### Underwater Behavior

- **Possessing the Puck:**
  - If in the opponent's half and close enough, the player will attempt a shot on goal.
  - If in their own half or near their own goal, the player will attempt to move the puck towards the side wall to clear it from the scoring area.
  - Otherwise, the player will attempt to advance the puck towards the opponent's goal.
  - Players with the puck will try to avoid nearby opponents by adjusting their movement angle.
- **Opponent Possessing Puck:**
  - If the puck is near their own goal, all nearby defenders will aggressively pressure the puck carrier.
  - Backs will position themselves between the puck carrier and their own goal to intercept.
  - Forwards will move towards the puck carrier to apply pressure.
- **Puck is Loose:**
  - If the loose puck is near their own goal, players prioritize chasing it directly.
  - Players who are on the opposite side of the pool from the puck may move towards the center or consider surfacing.
  - Generally, players balance chasing the loose puck with moving towards their assigned formation position. Defensive players prioritize maintaining formation more than forwards.

---

## Dynamic Formation Guidelines

### Vertical Guidelines

- Replace vertical lines with **dotted guidelines** in the color of the team in possession.
- These guidelines represent forward, mid, and back roles.
- The guidelines adjust dynamically based on the puck's position and the team in possession.
- Label the guidelines as "F" (Forward), "M" (Mid), and "B" (Back).

---

### Horizontal Guidelines

- Replace horizontal lines with **dotted guidelines** in the color of the team in possession.
- If the puck is on the left wall, the left guideline should be parallel to the wall, and the right guideline should be two meters to the right.
- Maintain a constant distance between all guidelines to guide player positioning.

---

### Persistent Guidelines

- Keep the dotted guidelines visible even when no team has possession of the puck, using their last known positions.
- Use a neutral color (e.g., gray) for the guidelines when no team has possession.

---

### Test the Changes

1. Start the simulation and observe the horizontal lines (`L` and `R`).
2. Verify that the lines adjust dynamically based on the puck's position when a team has possession.
3. Confirm that the lines remain visible and retain their last positions when no one has the puck.
