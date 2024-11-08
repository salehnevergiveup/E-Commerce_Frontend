// src/services/signalrService.js
import { HubConnectionBuilder, LogLevel, HubConnectionState } from "@microsoft/signalr";
import { getAccessToken } from '@/services/auth/auth-service';

// Maintain a map of active connections to ensure singleton per hub
const connections = {};

/**
 * Starts a connection to the specified hub.
 * @param {string} hubName - The name of the hub (e.g., 'cartHub', 'chatHub').
 * @returns {HubConnection|null} - The HubConnection instance or null if no token is found.
 */
export const startConnection = (hubName) => {
    const existingConnection = connections[hubName];

    if (existingConnection) {
        const state = existingConnection.state;
        if (state === HubConnectionState.Connected || state === HubConnectionState.Connecting || state === HubConnectionState.Reconnecting) {
            console.log(`Existing connection for ${hubName} is in state ${state}. Reusing it.`);
            return existingConnection;
        } else {
            console.log(`Existing connection for ${hubName} is in state ${state}. Creating a new connection.`);
            stopConnection(hubName); // Clean up the stale connection
        }
    }

    const token = getAccessToken();

    if (!token) {
        console.error("No JWT token found");
        return null;
    }
    const connectionUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL_WEBSOCKET}/${hubName}`;

    console.log(`Attempting to connect to SignalR hub at: ${connectionUrl}`);

    const connection = new HubConnectionBuilder()
        .withUrl(`${connectionUrl}`, {
            accessTokenFactory: () => token,
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

    connection.start()
        .then(() => {
            console.log(`Connected to ${hubName}`);
        })
        .catch((err) => {
            console.error(`Connection to ${hubName} failed: `, err);
        });

    // Handle reconnection events
    connection.onreconnecting(error => {
        console.warn(`Connection to ${hubName} lost due to error "${error}". Reconnecting.`);
    });

    connection.onreconnected(connectionId => {
        console.log(`Reconnected to ${hubName} with connection ID "${connectionId}".`);
    });

    connection.onclose(error => {
        console.error(`Connection to ${hubName} closed due to error "${error}".`);
        // Optionally implement further reconnection logic here
    });

    connections[hubName] = connection;
    return connection;
};

/**
 * Subscribes to a specific event on a given hub.
 * @param {string} hubName  
 * @param {string} eventName 
 * @param {Function} callback - this is  function will be excuted when then event is recived from the hub ,  this will be used for the shopping cart 
 */
export const subscribeToEvent = (hubName, eventName, callback) => {
    const connection = connections[hubName];
    if (!connection) {
        console.error(`No connection found for hub "${hubName}"`);
        return;
    }

    connection.on(eventName, callback);
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
        console.error(`Cannot send message. No active connection for hub "${hubName}".`);
        return;
    }

    connection.invoke(methodName, ...args)
        .catch(err => {
            console.error(`Error invoking method "${methodName}" on hub "${hubName}": `, err);
        });
};

/**
 * Stops the connection to a specific hub.
 * @param {string} hubName - The name of the hub.
 */
export const stopConnection = (hubName) => {
    const connection = connections[hubName];
    if (connection) {
        connection.stop()
            .then(() => {
                console.log(`Disconnected from ${hubName}`);
                delete connections[hubName];
            })
            .catch((err) => {
                console.log(`Disconnection from ${hubName} error: `, err);
            });
    }
};

/**
 * Stops all active connections. Useful for cleanup.
 */
export const stopAllConnections = () => {
    Object.keys(connections).forEach(hubName => {
        stopConnection(hubName);
    });
};
