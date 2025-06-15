"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
let allSockets = [];
wss.on("connection", (socket) => {
    socket.on("message", (message) => {
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.type === "join") {
            allSockets.push({
                socket,
                room: parsedMessage.payload.roomId,
            });
        }
        if (parsedMessage.type === "chat") {
            const currentUser = allSockets.find((x) => x.socket === socket);
            if (!currentUser)
                return;
            const currentUserRoom = currentUser.room;
            allSockets
                .filter((user) => user.room === currentUserRoom)
                .forEach((user) => {
                user.socket.send(parsedMessage.payload.message);
            });
        }
    });
    socket.on("disconnect", () => { });
});
