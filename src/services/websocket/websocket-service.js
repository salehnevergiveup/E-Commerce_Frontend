// src/services/signalrService.js
import {
  HubConnectionBuilder,
  LogLevel,
  HubConnectionState,
} from "@microsoft/signalr";
import { getAccessToken } from "@/services/auth/auth-service";

// Singleton connection map
const connections = {};

/**
 * Retrieves or initializes the SignalR connection for a given hub.
 * @param {string} hubName - The name of the hub.
 * @returns {HubConnection|null} - The SignalR HubConnection instance or null if no token is found.
 */
const connectionRefs = {};
export const getOrCreateConnection = (hubName) => {
  if (!connections[hubName]) {
    const token = getAccessToken();
    if (!token) {
      console.error("No JWT token found");
      return null;
    }

    const connectionUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL_WEBSOCKET}/${hubName}`;
    console.log(`Creating new connection to: ${connectionUrl}`);

    const connection = new HubConnectionBuilder()
      .withUrl(connectionUrl, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    connection
      .start()
      .then(() => {
        console.log(`Connected to ${hubName}`);
      })
      .catch((err) => {
        console.error(`Connection to ${hubName} failed:`, err);
      });

    // Handle reconnection events
    connection.onreconnecting((error) => {
      console.warn(`Reconnecting to ${hubName} due to error:`, error);
    });
    connection.onreconnected((connectionId) => {
      console.log(`Reconnected to ${hubName} with ID: ${connectionId}`);
    });
    connection.onclose((error) => {
      console.error(`Connection to ${hubName} closed.`, error);
    });

    connections[hubName] = connection;
    connectionRefs[hubName] = 1;
  } else {
    connectionRefs[hubName] += 1; // Increment reference counter
  }

  return connections[hubName];
};

/**
 * Subscribes to a specific event on a given hub.
 * @param {string} hubName - The name of the hub.
 * @param {string} eventName - The name of the event.
 * @param {Function} callback - The callback to invoke when the event is received.
 */
export const subscribeToEvent = (hubName, eventName, callback) => {
  const connection = getOrCreateConnection(hubName);
  if (connection) {
    connection.off(eventName);

    connection.on(eventName, callback);
  } else {
    console.error(
      `Failed to subscribe to event "${eventName}" on hub "${hubName}".`
    );
  }
};

/**
 * Sends a message to a specific hub method.
 * @param {string} hubName - The name of the hub.
 * @param {string} methodName - The method to invoke on the hub.
 * @param  {...any} args - Arguments to pass to the hub method.
 */
export const sendMessage = (hubName, methodName, ...args) => {
  const connection = connections[hubName];
  if (!connection || connection.state !== HubConnectionState.Connected) {
    console.error(
      `Cannot send message. No active connection for hub "${hubName}".`
    );
    return;
  }

  connection.invoke(methodName, ...args).catch((err) => {
    console.error(
      `Error invoking method "${methodName}" on hub "${hubName}":`,
      err
    );
  });
};

/**
 * Stops the connection to a specific hub.
 * @param {string} hubName - The name of the hub.
 */
export const stopConnection = (hubName) => {
  if (connectionRefs[hubName]) {
    connectionRefs[hubName] -= 1; // Decrement reference counter
    if (connectionRefs[hubName] === 0) {
      const connection = connections[hubName];
      if (connection) {
        connection
          .stop()
          .then(() => {
            console.log(`Disconnected from ${hubName}`);
            delete connections[hubName];
            delete connectionRefs[hubName];
          })
          .catch((err) => {
            console.log(`Disconnection from ${hubName} error:`, err);
          });
      }
    }
  }
};

/**
 * Stops all active connections. Useful for cleanup.
 */
export const stopAllConnections = () => {
  Object.keys(connections).forEach((hubName) => {
    stopConnection(hubName);
  });
};
