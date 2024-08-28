# MBACHMET Backend

MBACHMET redefines collaborative gaming by seamlessly integrating smartphones as remote controllers in an online desktop video game. Players work together to tackle various challenges and objectives within a vibrant virtual setting. This repository contains the backend for the MBACHMET game, built using Express, Socket.IO, and MongoDB.

## Table of Contents
- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Usage](#usage)

## Features
- **Real-time Multiplayer**: Leverages Socket.IO for low-latency, real-time communication between desktop and smartphone controllers.
- **Express Server**: Manages the core game logic, player sessions, and networking.
- **MongoDB Integration**: Provides storage for player data, game sessions, and match history.
- **Scalable and Modular**: Easily scalable for future improvements and enhancements.

## Technologies
- **Express**: Backend framework for handling routes and APIs.
- **Socket.IO**: WebSocket framework for real-time, bi-directional communication between clients and the server.
- **MongoDB**: NoSQL database for handling persistent data storage.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mbachmet-backend.git
   cd mbachmet-backend
   ```
2. Install the dependencies:
    ```bash
    npm install
    ```
3. Set up your environment variables: Create a .env file in the root directory and add the following:
    ```bash
    MONGO_URI=your_mongo_db_connection_string
    PORT=your_port_number
    ```
4. Start the server:
    ```bash
    npm start
    ```

## Usage
The backend listens for game interactions and real-time events, making use of smartphones as controllers in an online desktop game. Players connect to the server, interact using their smartphones, and receive real-time updates during gameplay.

- Desktop Players: Connect to the game via a browser-based application.
- Smartphone Controllers: Serve as the input device for in-game actions.
