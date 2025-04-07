import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Message from './Message';
import MessageInput from './MessageInput';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
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

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f5f5f5;
`;

const ChatHeader = styled.div`
  padding: 15px 20px;
  background: linear-gradient(90deg, #4a90e2 0%, #7b1fa2 100%);
  color: white;
  font-size: 18px;
  font-weight: 500;
`;

const NoMessages = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #666;
`;

const FileInputContainer = styled.div`
  display: flex;
  gap: 10px;
  padding: 10px 20px;
  background: #f0f0f0;
  border-top: 1px solid #e0e0e0;
`;

const FileInputButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 20px;
  padding: 5px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    color: #4a90e2;
    background: rgba(0, 0, 0, 0.05);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  height: calc(100vh - 80px); /* Resta la altura del header */
  margin-top: -15px; /* Compensa el padding del header */
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4a90e2;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Chat: React.FC<{ user: User }> = ({ user }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!user?.familyId) {
            setConnectionStatus('disconnected');
            return;
        }

        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8070/ws'),
            connectHeaders: {
                'user-id': user.id,
                'family-id': user.familyId
            },
            debug: (str) => console.debug(str),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = (frame) => {
            console.log('STOMP Connected');
            setConnectionStatus('connected');
            
            client.subscribe(`/topic/family.${user.familyId}`, (message) => {
                try {
                    const newMessage: Message = JSON.parse(message.body);
                    setMessages(prev => {
                        // Evitar duplicados verificando si el mensaje ya existe
                        const messageExists = prev.some(m => m.id === newMessage.id);
                        return messageExists ? prev : [...prev, newMessage];
                    });
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            });

            fetchMessages();
        };

        client.onStompError = (frame) => {
            console.error('STOMP Error:', frame.headers.message);
            setConnectionStatus('error');
        };

        client.onWebSocketError = (event) => {
            console.error('WebSocket error:', event);
            setConnectionStatus('error');
        };

        client.onDisconnect = () => {
            console.log('STOMP Disconnected');
            setConnectionStatus('disconnected');
        };

        client.activate();
        setStompClient(client);

        return () => {
            if (client.connected) {
                client.deactivate();
            }
        };
    }, [user?.familyId, user?.id]);

    const fetchMessages = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`http://localhost:8070/chat/messages?familyId=${user.familyId}`);
            if (!response.ok) throw new Error('Failed to fetch messages');
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessage = (content: string) => {
        if (!content.trim() || !stompClient?.connected) return;

        const message = {
            content: content.trim(),
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName
            },
            family: {
                id: user.familyId
            },
            type: 'TEXT',
            state: 'SENT'
        };

        stompClient.publish({
            destination: '/app/chat.send',
            body: JSON.stringify(message),
            headers: { 'content-type': 'application/json' }
        });
    };

    const sendFileMessage = async (fileUrl: string, type: 'IMAGE' | 'VIDEO' | 'FILE') => {
        if (!stompClient?.connected) return;

        const message = {
            content: '',
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName
            },
            family: {
                id: user.familyId
            },
            type,
            fileURL: fileUrl,
            state: 'SENT'
        };

        stompClient.publish({
            destination: '/app/chat.send',
            body: JSON.stringify(message),
            headers: { 'content-type': 'application/json' }
        });
    };

    const markMessagesAsRead = async () => {
        try {
            await fetch(`http://localhost:8070/chat/mark-as-read?familyId=${user.familyId}&userId=${user.id}`, {
                method: 'POST'
            });
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };

    const handleFileUpload = (type: 'image' | 'video' | 'file') => {
        if (fileInputRef.current) {
            fileInputRef.current.accept = 
                type === 'image' ? 'image/*' : 
                type === 'video' ? 'video/*' : '*';
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0] || !user.familyId) return;
        
        const file = e.target.files[0];
        const fileType = file.type.split('/')[0] as 'image' | 'video';
        
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const uploadResponse = await fetch(`http://localhost:8070/chat/upload`, {
                method: 'POST',
                body: formData,
            });
            
            if (!uploadResponse.ok) throw new Error('Upload failed');
            
            const { fileUrl } = await uploadResponse.json();
            sendFileMessage(fileUrl, fileType === 'image' ? 'IMAGE' : 'VIDEO');
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (user.familyId) {
            markMessagesAsRead();
        }
    }, [user.familyId]);

    return (
        <ChatContainer>
            <ChatHeader>
                Chat Familiar 
                {isLoading && <span> - Cargando...</span>}
                {connectionStatus === 'error' && <span> - Error de conexión</span>}
            </ChatHeader>
            
            <MessagesContainer>
                {isLoading ? (
                    <LoadingContainer>
                        <LoadingSpinner />
                    </LoadingContainer>
                ) : messages.length === 0 ? (
                    <NoMessages>No hay mensajes aún. ¡Envía el primero!</NoMessages>
                ) : (
                    messages.map((message) => (
                        <Message 
                            key={message.id} 
                            message={message} 
                            isCurrentUser={message.user.id === user.id}
                        />
                    ))
                )}
                <div ref={messagesEndRef} />
            </MessagesContainer>
            
            <FileInputContainer>
                <FileInputButton onClick={() => handleFileUpload('image')} aria-label="Subir imagen">
                    📷
                </FileInputButton>
                <FileInputButton onClick={() => handleFileUpload('video')} aria-label="Subir video">
                    🎥
                </FileInputButton>
                <FileInputButton onClick={() => handleFileUpload('file')} aria-label="Subir archivo">
                    📎
                </FileInputButton>
                
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    aria-hidden="true"
                />
            </FileInputContainer>
            
            <MessageInput onSend={sendMessage} />
        </ChatContainer>
    );
};

export default Chat;