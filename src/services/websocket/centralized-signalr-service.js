// signalr-service.js
import {
  HubConnectionBuilder,
  LogLevel,
  HubConnectionState,
} from "@microsoft/signalr";
import { getAccessToken } from "@/services/auth/auth-service";

let connection = null;

export const startConnection = async () => {
  if (!connection) {
    const token = getAccessToken();
    if (!token) {
      console.error("No JWT token found");
      return null;
    }

    const connectionUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL_WEBSOCKET}/notificationHub`;

    console.log(`Attempting to connect to SignalR hub at: ${connectionUrl}`);

    connection = new HubConnectionBuilder()
      .withUrl(`${connectionUrl}`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    await connection.start();
    console.log("Connected to notificationHub");
  }
  return connection;
};

export const subscribeToEvent = (eventName, callback) => {
  if (!connection) {
    console.error("No active SignalR connection");
    return;
  }

  connection.on(eventName, callback);
};

export const stopConnection = async () => {
  if (connection) {
    await connection.stop();
    console.log("Disconnected from notificationHub");
    connection = null;
  }
};
