# All For One Server

## Description

All for One is a mobile application that allows you and your friends to play musics with your Spotify account. A host creates a room that people can join. The users in a room share a common queue containing a list of songs, everyone can add their song to the list. The host can then play the song in the queue from his device.

## Prerequisites

The server uses [Node and NPM](https://nodejs.org/en/). You will also need [ngrok](https://ngrok.com/) for the application to communicate with the server. Be sure you have a database server ready.

## Installation

1. Clone the Git repository
2. Create a .env file based on the .env.example. It contains the informations needed for the database connection and the secret key for JSON Web Token.
3. Run the following command to install dependencies.
```bash
$ npm install
```
4. Now you need to migrate the database using [Sequelize](http://docs.sequelizejs.com/manual/migrations.html).
```bash
$ npx sequelize-cli db:migrate
$ npx sequelize-cli db:seed:all
```
5. You can now run the server locally using the command
```bash
$ node .\index.js
```
By default, the port used is 8080, but you can choose the port by adding a PORT variable in your .env file.
6. The server is now running locally, but in order to communicate with the mobile application, it's preferable to open a [ngrok](https://ngrok.com/) tunnel.
```bash
$ ngrok http 8080
```
Save the tunnel's url somewhere and you're done for the server part.