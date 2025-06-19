import { WebSocketServer, WebSocket } from "ws";
const wss = new WebSocketServer({ port: 8080 });

interface User {
  socket: WebSocket;
  room: string;
  username:string;
}

let allSockets: User[] = [];

function boadcastRoomInfo(room: string) {
  const usersInRoom = allSockets.filter((u) => u.room === room);
  const onlineCount = usersInRoom.length;

  usersInRoom.forEach((user) => {
    user.socket.send(
      JSON.stringify({
        type: "roomInfo",
        payload: {
          roomId: room,
          onlineCount,
        },
      })
    );
  });
}

wss.on("connection", (socket) => {
  socket.on("message", (message) => {
    const parsedMessage = JSON.parse(message as unknown as string);
    if (parsedMessage.type === "join") {
      const { roomId, username } = parsedMessage.payload;
      allSockets.push({
        socket,
        room: roomId,
        username,
      });

      boadcastRoomInfo(roomId);
    }

    if (parsedMessage.type === "chat") {
      const currentUser = allSockets.find((x) => x.socket === socket);

      if (!currentUser) return;

      const currentUserRoom = currentUser.room;

      allSockets
        .filter((user) => user.room === currentUserRoom)
        .forEach((user) => {
          user.socket.send(
            JSON.stringify({
              type: "chat",
              payload: {
                message: parsedMessage.payload.message,
                username: currentUser.username,
              },
            })
          );
        });
    }
  });

  socket.on("close", () => {
    const user = allSockets.find((u) => u.socket === socket);
    if (!user) return;

    allSockets = allSockets.filter((u) => u.socket !== socket);

    boadcastRoomInfo(user.room);
  });
});
