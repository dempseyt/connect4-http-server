import { Notification } from "@/notification/types.d";
import { Server } from "socket.io";

const createDispatchNotification = (server: Server) => {
  return async (notification: Notification) =>
    server
      .of("/notification")
      .to(notification.recipient)
      .emit(notification.type, notification.payload);
};

export default createDispatchNotification;
