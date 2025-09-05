import { useEffect, useRef, useState, useCallback } from 'react';
import { useUserContext } from '@/context/UserContext';
import { useToast } from './use-toast';

interface WebSocketMessage {
  type: string;
  data?: any;
  message?: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  metadata?: any;
  createdAt: string;
  isRead: boolean;
}

export function useWebSocket() {
  const { user, isAuthenticated } = useUserContext();
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!isAuthenticated || !user || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        reconnectAttempts.current = 0;
        
        // Authenticate the connection
        ws.send(JSON.stringify({
          type: 'auth',
          userId: user.id
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          switch (message.type) {
            case 'auth_success':
              break;
              
            case 'notification':
              const notification = message.data as Notification;
              setNotifications(prev => [notification, ...prev]);
              
              // Show toast notification
              toast({
                title: notification.title,
                description: notification.message,
                variant: notification.type.includes('error') ? 'destructive' : 'default',
              });
              break;
              
            case 'pong':
              // Heartbeat response
              break;
              
            case 'error':
              toast({
                title: 'Connection Error',
                description: message.message || 'WebSocket connection error',
                variant: 'destructive',
              });
              break;
              
            default:
          }
        } catch (error) {
        }
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        
        // Auto-reconnect with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // 1s, 2s, 4s, 8s, 16s
          
          setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        } else {
          toast({
            title: 'Connection Lost',
            description: 'Unable to maintain real-time connection. Please refresh the page.',
            variant: 'destructive',
          });
        }
      };

      ws.onerror = (error) => {
      };

    } catch (error) {
    }
  }, [isAuthenticated, user, toast]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  const markNotificationRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Effect to handle connection
  useEffect(() => {
    if (isAuthenticated && user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, user, connect, disconnect]);

  // Heartbeat to keep connection alive
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      sendMessage({ type: 'ping' });
    }, 30000); // Ping every 30 seconds

    return () => clearInterval(interval);
  }, [isConnected, sendMessage]);

  return {
    isConnected,
    notifications,
    unreadCount: notifications.filter(n => !n.isRead).length,
    markNotificationRead,
    clearNotifications,
    sendMessage,
    connect,
    disconnect
  };
}