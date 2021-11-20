# Chalupax
## Introduction
Chalupax is a way to play [chalupa](https://en.wikipedia.org/wiki/Loter%C3%ADa) with a web browser, online. It uses a slightly modifed version of the classic card set and requires a minimum of 2 players. Each player must have a [Matrix Element.io](https://element.io) account which they need to use to login to from the Chalupax index page.
## Usage
You can
* Clone the repository
	* In top-level directory run
	* Using yarn 1.22.17 (with npm 8.1.0) and node v16.13.0:
		* yarn add http-server matrix-js-sdk 
	* npm install websocket
	* node hserv.mjs
	* Wait for it to say "Server started"
* Or, if your browser CORS policy allows, click [here](https://newpath7.github.io/chalupax/)

Then you will need to
* Agree on which matrix room all players will use
* Enter username, password and matrix room and click "Login"
	* The user must already be in the room that will be used
* If using local node server, make sure the "use local server" checkbox is checked
* Players (up to 10) agree on a time to start the game
* When "Login" button is clicked, one will immediately wait for available game advertisements for about 10 seconds, and if no advertisements are seen, one will start advertising a game


## Contributions
[Jungle Moon](https://github.com/newpath7) is the creator and maintainer of this repository.
## License
Chalupax is under the [GNU GPL v3.0 license.](/LICENSE.txt)
## References
