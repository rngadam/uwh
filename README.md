# Simplified 2D Underwater Hockey Browser Simulator Specification

This document outlines a simplified specification for a 2D browser-based simulation of Underwater Hockey (UWH). The aim is to capture the core mechanics and rules of the sport in a basic, accessible format.

## 1. Introduction

This specification describes a simplified, 2D representation of an Underwater Hockey game intended for implementation in a web browser. It focuses on the essential elements of UWH gameplay, environment, and player interaction within a two-dimensional plane, abstracting away complex 3D physics and physiological modeling for a basic simulation.

## 2. Gameplay Mechanics

The simulation will represent a basic UWH match between two teams in a 2D top-down view.

* **Objective:** Score by maneuvering the puck into the opponent's goal trough using player sticks[cite: 8]. The team with the most goals at the end of the game wins[cite: 8].
* **Duration:** The game consists of two halves. The duration of each half will be a configurable parameter (e.g., a simplified time like 5 minutes per half)[cite: 2].
* **Scoring:** A goal is scored when the puck completely enters the designated goal area at the opponent's end[cite: 73]. The simulation must detect this using 2D collision geometry.
* **Game Start/Restart:** Play begins with the puck at the center of the playing area. Players start at their respective end lines[cite: 74]. Restarts after a goal follow a similar procedure[cite: 75].
* **Teams:** Two teams (e.g., Black/Blue and White) will compete, each with a fixed number of players on the field (e.g., 6 per team)[cite: 1]. Basic player identification (team color) will be present[cite: 79]. Substitution rules will be simplified or omitted for this basic 2D version.
* **Fouls and Penalties:** A simplified system for detecting basic fouls (e.g., illegal puck contact, obstruction) and applying simple consequences (e.g., stopping play, awarding possession) will be included. Time penalties and penalty shots will be omitted for this simplified version.

## 3. Environment

The playing area will be represented as a 2D rectangle in the browser window.

* **Playing Area:** A rectangular area representing the pool bottom[cite: 4]. Dimensions will be simplified and fixed (e.g., a standard aspect ratio) rather than fully configurable to CMAS ranges[cite: 34, 35].
* **Goals:** Represented as 2D rectangles or lines at each end of the playing area[cite: 43]. The goal "trough" will be simplified to a scoring line or zone[cite: 73].
* **Boundaries:** The edges of the 2D rectangle represent the pool walls[cite: 38, 39].
* **Markings:** Basic 2D markings on the playing area will indicate the center spot and goal areas[cite: 39, 40].

## 4. Equipment

The essential equipment (puck and player gear) will be represented in a simplified 2D form.

* **Puck:** A 2D circle or disk representing the puck[cite: 46]. It will have basic physical properties relevant to 2D movement (mass, friction)[cite: 48]. Flicking (lifting the puck off the bottom) will be simplified or represented visually without complex 3D trajectory physics.
* **Player Equipment:** Players will have visual representations of sticks (short lines or shapes attached to the player)[cite: 61]. The stick is the primary tool for interacting with the puck[cite: 63]. Fins will be implied by player movement speed rather than explicitly simulated with complex physics[cite: 59]. Masks and snorkels are visual elements but not functionally simulated in this simplified 2D version[cite: 58].

## 5. Player Agents

Player agents will be represented as 2D circles or simple sprites.

* **Attributes:** Players will have basic attributes like speed and a simplified stamina or breath indicator that limits their ability to perform actions continuously[cite: 116, 120]. These attributes can have an element of randomization[cite: 115]. Breath-holding and surfacing for air will be a simplified mechanic (e.g., a timer that requires players to move to the "surface" edge of the 2D area periodically)[cite: 6].
* **Movement:** Players can move within the 2D playing area. Movement speed is influenced by their speed attribute and simplified physiological state (stamina/breath)[cite: 157].
* **Actions:** Players can perform simplified actions:
    * **Push:** Move the puck along the 2D bottom when in contact with the stick[cite: 161].
    * **Flick:** A simplified action to move the puck a short distance, possibly over other objects or players (visual only)[cite: 161].
    * **Curl:** Rotate while keeping the puck close for basic possession[cite: 163].
    * **Tackle:** Attempt to take the puck from an opponent by moving the stick into contact with the puck[cite: 167].

## 6. Artificial Intelligence (AI)

Basic AI will control player agents to simulate gameplay.

* **Behavior:** AI agents will have simple behaviors for offense (moving towards the opponent's goal, pushing the puck) and defense (moving towards their own goal, trying to take the puck)[cite: 195, 196].
* **Roles:** Basic positional roles (e.g., forward, back) can influence target positions[cite: 194].
* **Resource Management:** AI will monitor the simplified breath/stamina and move the player to the surface area when needed[cite: 206, 207].
* **Visualization of AI State:** As a key feature, the simulation will allow a toggle to display simple indicators on AI players showing their current basic state (e.g., "Attacking", "Defending", "Surfacing")[cite: 268].

## 7. Physics

A simplified 2D physics model will govern interactions.

* **Puck Physics:** Model 2D movement with inertia, friction with the bottom, and simple drag[cite: 225, 226]. Stick interaction applies force to the puck[cite: 228].
* **Player Physics:** Model player movement with inertia and simple drag[cite: 239, 240]. Collision detection between players, the puck, and boundaries will be handled[cite: 244].
* **Buoyancy:** Simplified to the need for players to surface periodically for air rather than a constant force simulated in 3D.

## 8. Visualization

The simulation will be rendered in a web browser using 2D graphics.

* **Rendering:** Use standard web technologies (e.g., Canvas, SVG, or a 2D game library) to draw the environment, players, and puck.
* **View:** A fixed 2D top-down view of the playing area[cite: 14].
* **Elements:**
    * Clearly render the playing area, goals, and markings[cite: 261].
    * Render player agents with team colors and sticks[cite: 262].
    * Render the puck[cite: 263].
    * Implement the AI state visualization overlay as described in Section 6[cite: 265].
    * Basic UI elements for score and game time[cite: 278].

## 9. Implementation Notes

* **Technology:** Implement using HTML, CSS, and JavaScript. A 2D game library might simplify rendering and physics.
* **Simplification:** Focus on implementing the core game loop, basic physics, and simple AI behaviors. Defer complex features like full CMAS rules, detailed physiology, and advanced tactics.
* **Modularity:** Structure the code to separate game logic, physics, AI, and rendering.
