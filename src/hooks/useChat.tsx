import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Client } from '@stomp/stompjs';

interface User {
  id: string;
  familyId?: string;
}

interface Message {
  id: string;
  content: string;
  date: string;
  type: string;
  state: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  fileURL?: string;
}

const useChat = (user: User) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Cargar mensajes iniciales
  useEffect(() => {
    if (user.familyId) {
      const fetchMessages = async () => {
        try {
          const response = await fetch(`https://backend-hc.up.railway.app/chat/messages?familyId=${user.familyId}`);
          const data = await response.json();
          setMessages(data);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };

      fetchMessages();
    }
  }, [user.familyId]);

  // Configurar WebSocket
  useEffect(() => {
    if (user.familyId) {
      const newSocket = io('https://backend-hc.up.railway.app/', {
        path: '/ws',
        transports: ['websocket'],
        query: { familyId: user.familyId, userId: user.id }
      });

      newSocket.on('connect', () => {
        console.log('Connected to WebSocket');
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from WebSocket');
      });

      newSocket.on(`/topic/family.${user.familyId}`, (message: Message) => {
        setMessages(prev => [...prev, message]);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user.familyId, user.id]);

  // Enviar mensaje de texto
  const sendMessage = useCallback((content: string) => {
    if (socket && user.familyId) {
      socket.emit('/app/chat.send', {
        content,
        type: 'TEXT',
        state: 'SENT',
        user: { id: user.id },
        family: { id: user.familyId }
      });
    }
  }, [socket, user.id, user.familyId]);

  // Enviar mensaje con archivo
  const sendFileMessage = useCallback((fileUrl: string, type: 'IMAGE' | 'VIDEO' | 'FILE') => {
    if (socket && user.familyId) {
      socket.emit('/app/chat.send', {
        content: type === 'IMAGE' ? 'Imagen enviada' : 
                type === 'VIDEO' ? 'Video enviado' : 'Archivo enviado',
        type,
        state: 'SENT',
        user: { id: user.id },
        family: { id: user.familyId },
        fileURL: fileUrl
      });
    }
  }, [socket, user.id, user.familyId]);

  // Marcar mensajes como leídos
  const markMessagesAsRead = useCallback(async () => {
    if (user.familyId) {
      try {
        await fetch('https://backend-hc.up.railway.app/chat/mark-as-read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            familyId: user.familyId,
            userId: user.id
          })
        });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    }
  }, [user.familyId, user.id]);

  return { messages, sendMessage, sendFileMessage, markMessagesAsRead };
};

export default useChat;