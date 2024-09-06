import { Express } from "express";
import { createServer as createHTTPServer, Server as HTTPServer } from "http";
import { jwtDecrypt, KeyLike } from "jose";
import { Server, Socket } from "socket.io";

type ServerSideWebSocketOptions = {
  privateKey: KeyLike;
  httpServer: HTTPServer;
};

const createSocketServer = (
  app: Express,
  { privateKey, httpServer }: ServerSideWebSocketOptions
) => {
  httpServer = httpServer
    ? httpServer.on("request", app)
    : createHTTPServer(app).listen();
  const socketServer = new Server(httpServer);
  const onConnectCallback = async (socket: Socket) => {
    if (typeof socket.handshake.auth.token === "string") {
      const decryptedJWT = await jwtDecrypt(
        socket.handshake.auth.token,
        privateKey
      );
      const username = decryptedJWT.payload.email as string;
      await socket.join(username);
    }
    socket.emit("connection_established");
  };
  socketServer.on("connect", onConnectCallback);
  socketServer.on("new_namespace", (namespace) =>
    namespace.on("connect", onConnectCallback)
  );
  socketServer.of("/notifications");
  return socketServer;
};

export default createSocketServer;
