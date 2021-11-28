import * as sdk from "matrix-js-sdk";
import httpServer from "http-server";
import WebSocketLib from  "websocket";
import http from "http";

var port = 8080;
var host = "0.0.0.0";
var server = httpServer.createServer({
	root: "."
});
var rid = "";
var connection;

server.listen(port, host, function () {
	console.log("Server started, on port " + port);
});
var WebSocketServer = WebSocketLib.server;
var wserver = http.createServer();
wserver.listen(8081);
var wsServer = new WebSocketServer({httpServer: wserver});
const client = sdk.createClient("https://matrix.org");
wsServer.on('request', function(request) {
	connection = request.accept(null, request.origin);
	connection.on('message', async function(message) {
		let msg = JSON.parse(message.utf8Data);

		if (msg.cmd == "joingame") {
				if (!client.getAccessToken()) {
					rid = msg.data.room;
					console.log("Attempting Matrix login and sync...");
					client.login("m.login.password", {
							"user": msg.data.user,
							"password": msg.data.password
					}).then((err, response) => {
							console.log("Connected to Matrix server...");
							client.startClient();
								client.on("Room.localEchoUpdated",
		                        	function(event, room, oEid, OStat) {
										//	console.log("Room.localEchoUpdated fired");
											connection.sendUTF(JSON.stringify({cmd: "clr", data: {}}));
									});

							client.once('sync', function(state, prevState, res) {
									console.log("Sync state: " + state);

									if (state == "PREPARED") {
											console.log("Adding room.timeline");
								client.on("Room.timeline", function(event, room, toStartOfTimeline) {

													if (event.getType() != "m.room.message") {
														return;
													}

													if (event.getRoomId() == rid) {
															connection.sendUTF(JSON.stringify({cmd: "rcv", data: {userId: event.sender.userId,
																	body: event.event.content.body}}));
													}
											});
									} else {
										console.log("Could not immediately sync with Matrix. Please try to login again.");
									}
							});
					});
				}
		} else if (msg.cmd == "send") {
				client.sendMessage(msg.data.rid, msg.data.data).then(function () {
		        //   console.log("sndMsg: msg sending...");
		       	}, function (err) {
						console.error("sndMsg: err %s", JSON.stringify(err));
					});
		}
	});
});
//console.log("Event: " + event.getType() + " with data: " + JSON.stringify(event.getContent()));
