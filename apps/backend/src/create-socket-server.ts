import { Express } from "express";
import { createServer as createHTTPServer } from "http";
import { jwtDecrypt, KeyLike } from "jose";
import { AddressInfo } from "net";
import { Server } from "socket.io";

type ServerSideWebSocketOptions = {
  path?: string;
  privateKey: KeyLike;
};

export type ExpressWithPortAndSocket = Express & {
  port?: number;
  server?: Server;
};

const createSocketServer = (
  app: ExpressWithPortAndSocket,
  { privateKey, path }: ServerSideWebSocketOptions
) => {
  const httpServer = createHTTPServer(app).listen();
  const port = (httpServer.address() as AddressInfo).port;
  const io = new Server(httpServer);

  io.of(path).on("connection", async (socket) => {
    const token = socket.handshake.auth.token;
    const {
      payload: { username },
    } = await jwtDecrypt(token, privateKey);

    socket.join(username as string);
    socket.emit("connection_established");
  });

  app.server = io;
  app.port = port;
};

export default createSocketServer;
