import { Server } from "socket.io";

const createDispatchNotification = (server: Server) => {
  const dispatchNotification = (notification: {
    recipient: string;
    type: string;
    payload: object;
  }) => {
    server
      .of("/notification")
      .to(notification.recipient)
      .emit(notification.type, notification.payload);
  };
  return dispatchNotification;
};

export default createDispatchNotification;
