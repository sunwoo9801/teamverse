import React, { createContext, useRef, useEffect } from "react";
import { getStompClient } from "../api/websocket";

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const stompClientRef = useRef(null);

    useEffect(() => {
        const stompClient = getStompClient();
        stompClientRef.current = stompClient;
        stompClient.activate();

        return () => {
            stompClient.deactivate();
        };
    }, []);

    return (
        <WebSocketContext.Provider value={stompClientRef}>
            {children}
        </WebSocketContext.Provider>
    );
};
