import { Express } from "express";
import http from "http";
import { AddressInfo } from "net";
import { Server } from "socket.io";

const createServerSideWebSocket = (app: Express, path: string) => {
  const httpServer = http.createServer(app);
  let port: number;
  httpServer.listen(() => {
    port = (httpServer.address() as AddressInfo).port;
  });

  const io = new Server(httpServer, {
    path: `ws://localhost/${port}${path}`,
  });

  io.on("connection", (socket) => {
    console.log(socket.id);
  });
};

export default createServerSideWebSocket;
