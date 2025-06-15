import { WebSocketServer, WebSocket } from "ws";
const wss = new WebSocketServer({ port: 8080 });

interface User {
  socket: WebSocket;
  room: string;
}

let allSockets: User[] = [];

wss.on("connection", (socket) => {
  socket.on("message", (message) => {
    const parsedMessage = JSON.parse(message as unknown as string);
    if (parsedMessage.type === "join") {
      allSockets.push({
        socket,
        room: parsedMessage.payload.roomId,
      });
    }

    if (parsedMessage.type === "chat") {
      const currentUser = allSockets.find((x) => x.socket === socket);

      if (!currentUser) return;

      const currentUserRoom = currentUser.room;

      allSockets
        .filter((user) => user.room === currentUserRoom)
        .forEach((user) => {
          user.socket.send(parsedMessage.payload.message);
        });
    }
  });

  socket.on("disconnect", () => {});
});
