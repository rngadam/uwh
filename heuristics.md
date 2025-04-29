# Underwater Hockey Simulator: High-Level AI Heuristics

This document outlines the general decision-making logic for the AI players in the Underwater Hockey Simulator.

## General Principles & Priorities

* **Breath Management:** Staying surfaced to recover breath is the highest priority. Players must surface if their breath gets too low. Players can only dive again when they have fully recovered their breath.
* **Low Breath Action (Puck Possession):** If a player has the puck underwater and their breath is getting low, they will attempt to move the puck towards the opponent's goal before surfacing.

## Role Assignment

* Players are assigned positions based on standard team formations at the start of the game.
* Within each team, the strongest forward and back players are typically assigned the central positions in their respective lines.

## Game Start Logic

* Players start at their end walls, arranged by their assigned roles.
* Forwards dive immediately when the game starts and race towards the puck at the center.
* Backs initially remain on the surface and follow their corresponding forwards.
* Forwards commit to the race until they are close to the puck or it moves significantly.
* Backs continue following until their forward dives or the game situation changes.

## Surface Behavior

* While on the surface, players prioritize recovering breath.
* They will also move slowly towards their designated positions based on the team's formation.
* Players will only consider diving once their breath is fully recovered.
* Dive decisions are based on the puck's location (diving offensively if the puck is near the opponent's goal or defensively if it's near their own goal) and opponent possession.

## Underwater Behavior

* **Possessing the Puck:**
    * If in the opponent's half and close enough, the player will attempt a shot on goal.
    * If in their own half or near their own goal, the player will attempt to move the puck towards the side wall to clear it from the scoring area.
    * Otherwise, the player will attempt to advance the puck towards the opponent's goal.
    * Players with the puck will try to avoid nearby opponents by adjusting their movement angle.
* **Opponent Possessing Puck:**
    * If the puck is near their own goal, all nearby defenders will aggressively pressure the puck carrier.
    * Backs will position themselves between the puck carrier and their own goal to intercept.
    * Forwards will move towards the puck carrier to apply pressure.
* **Puck is Loose:**
    * If the loose puck is near their own goal, players prioritize chasing it directly.
    * Players who are on the opposite side of the pool from the puck may move towards the center or consider surfacing.
    * Generally, players balance chasing the loose puck with moving towards their assigned formation position. Defensive players prioritize maintaining formation more than forwards.

## Suggestions for Additional Heuristics

* **Passing:** Implement logic for players to pass the puck to teammates, especially when under pressure, when low on breath, or using the wall.
* **Blocking/Tackling:** Add more sophisticated defensive behaviors like positioning to block opponents and more distinct tackle attempts.
* **More Sophisticated Formations:** Allow for formations that change dynamically based on the game situation (offense/defense) and specific pre-defined plays.
* **Stamina/Fatigue:** Introduce a system where high exertion depletes stamina, which in turn affects speed and breath recovery.
* **Substitutions:** Add a system for players to automatically substitute when fatigued and for fresh players to enter the game.
* **Varying AI Skill:** Create different AI profiles with varying attributes and decision-making tendencies to simulate different player skill levels.
* **Anticipation:** Allow AI to predict the future position of the puck or players to make more proactive movements.
* **Fouls (Basic):** Implement detection for simple fouls and temporarily remove fouling players from the game.
* **Team Communication (Simplified):** Allow players to coordinate their actions based on the movements and states of nearby teammates.
