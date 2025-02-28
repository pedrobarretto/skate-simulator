# Skate Park Simulator

A 3D skateboarding game built with Three.js, JavaScript, HTML, and CSS.

## Features

- 3D skate park environment with various obstacles:
  - Half-pipe
  - Quarter pipe
  - Fun box with ramps
  - Rails for grinding
- Skateboard physics
- Multiple tricks (kickflip, heelflip, 360 flip, shuvit)
- Score system
- Third-person camera

## Controls

- **W/A/S/D**: Move the skater
- **SPACE**: Jump
- **Arrow Keys**: Perform tricks (when in the air)
  - **UP**: Kickflip
  - **DOWN**: Heelflip
  - **LEFT**: 360 Flip
  - **RIGHT**: Shuvit

## Running the Game

1. Clone this repository
2. Open the `index.html` file in a modern web browser
   - You can use a local development server like `http-server` (npm), `python -m http.server`, or Live Server in VSCode
3. Click "Start Skating" to begin

## Technologies Used

- **Three.js**: 3D graphics and rendering
- **JavaScript**: Game logic and physics
- **HTML/CSS**: UI and layout

## Project Structure

- `index.html`: Main HTML file
- `style.css`: Styling for the game UI
- `js/`: JavaScript files
  - `game.js`: Main game initialization and loop
  - `skater.js`: Skater character and controls
  - `skatepark.js`: 3D environment and obstacles
  - `physics.js`: Basic physics simulation

## Extending the Game

Feel free to modify and extend the game with:

- More tricks
- Additional obstacles
- More realistic physics
- Custom skateboard and character models
- Mobile touch controls

## License

MIT
