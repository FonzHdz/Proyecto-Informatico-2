import React, { useEffect, useRef, useState } from 'react';
import { getBackendUrl } from '../../utils/api';
import styled from 'styled-components';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Message from './Message';
import MessageInput from './MessageInput';
import { useAlert } from '../../context/AlertContext';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: calc(100% - 0px);
  margin-left: 50px;
  margin-right: -20px;
  overflow-y: auto;
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: -5px;
  margin-bottom: 35px;
`;

const NoMessages = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #666;
  font-size: 14px;
`;

const Header = styled.div`
  background: linear-gradient(90deg, #4a90e2 0%, #7b1fa2 100%);
  padding: 15px 40px;
  color: white;
  font-size: 24px;
  font-weight: 500;
  position: fixed;
  top: 0;
  left: 80px;
  right: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ConnectionStatus = styled.div<{ $status: string }>`
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 12px;
  background: ${props => 
    props.$status === 'connected' ? '#4CAF50' :
    props.$status === 'connecting' ? '#FFC107' :
    props.$status === 'error' ? '#F44336' : '#9E9E9E'};
  color: white;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 140px);
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

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  familyId: string | { id: string };
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
  fileName?: string;
  fileSize?: string;
}

const Chat: React.FC<{ user: User }> = ({ user }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'disconnected'>('connecting');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { showAlert } = useAlert();

  useEffect(() => {
    if (!user?.familyId) {
      setConnectionStatus('disconnected');
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(`${getBackendUrl()}/ws`),
      connectHeaders: {
        'user-id': user.id,
        'family-id': typeof user.familyId === 'string' ? user.familyId : user.familyId.id
      },
      debug: (str) => {
        console.debug(str);
      },
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
      const response = await fetch(`${getBackendUrl()}/chat/messages?familyId=${user.familyId}`);
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
      state: 'SENT',
      date: new Date().toISOString()
    };

    stompClient.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(message),
      headers: { 'content-type': 'application/json' }
    });
  };

  const sendFileMessage = async (fileUrl: string, type: 'IMAGE' | 'VIDEO' | 'FILE', fileName: string, fileSize: string) => {
    if (!stompClient?.connected) return;

    const message = {
      content: fileName,
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
      fileName,
      fileSize,
      state: 'SENT',
      date: new Date().toISOString()
    };

    stompClient.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(message),
      headers: { 'content-type': 'application/json' }
    });
  };

  const markMessagesAsRead = async () => {
    try {
      await fetch(`${getBackendUrl()}/chat/mark-as-read?familyId=${user.familyId}&userId=${user.id}`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleFileUpload = (type: 'image' | 'video' | 'file', file: File) => {
    if (!file || !user.familyId) return;
    
    const fileName = file.name;
    const fileSize = formatFileSize(file.size);
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${getBackendUrl()}/chat/upload`, true);
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };
      
      xhr.onload = () => {
        if (xhr.status === 200) {
          const fileUrl = xhr.responseText;
          let messageType: 'IMAGE' | 'VIDEO' | 'FILE' = 'FILE';
          if (type === 'image') messageType = 'IMAGE';
          if (type === 'video') messageType = 'VIDEO';
          sendFileMessage(fileUrl, messageType, fileName, fileSize);
        } else {
          console.error('Upload failed');
          showAlert({
            title: 'Error',
            message: 'Error al subir el archivo',
            showCancel: false
          });
        }
        setIsUploading(false);
        setUploadProgress(null);
      };
      
      xhr.onerror = () => {
        console.error('Upload error');
        setIsUploading(false);
        setUploadProgress(null);
        showAlert({
          title: 'Error',
          message: 'Error al subir el archivo',
          showCancel: false
        });
      };
      
      xhr.send(formData);
    } catch (error) {
      console.error('Error uploading file:', error);
      setIsUploading(false);
      setUploadProgress(null);
      showAlert({
        title: 'Error',
        message: 'Error al subir el archivo',
        showCancel: false
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (parseFloat((bytes / Math.pow(k, i)).toFixed(1)).toString() + ' ' + sizes[i]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (user.familyId) {
      markMessagesAsRead();
    }
  }, [user.familyId]);

  const getStatusText = () => {
    switch(connectionStatus) {
      case 'connected': return 'Conectado';
      case 'connecting': return 'Conectando...';
      case 'error': return 'Error de conexión';
      default: return 'Desconectado';
    }
  };

  return (
    <>
      <Header>
        <span>Chat familiar</span>
        {/* <ConnectionStatus $status={connectionStatus}>
          {getStatusText()}
        </ConnectionStatus> */}
      </Header>
      
      <ChatContainer>
        <MessagesContainer>
          {isLoading ? (
            <LoadingContainer>
              <LoadingSpinner />
            </LoadingContainer>
          ) : messages.length === 0 ? (
            <NoMessages>No hay mensajes aún. ¡Envía el primero!</NoMessages>
          ) : (
            messages.map((message, index) => (
              <Message
                key={message.id}
                message={message}
                isCurrentUser={message.user.id === user.id}
                previousMessage={index > 0 ? messages[index - 1] : undefined}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </MessagesContainer>
        
        <MessageInput 
          onSend={sendMessage} 
          onFileUpload={handleFileUpload}
          uploadProgress={uploadProgress}
          isUploading={isUploading}
        />
      </ChatContainer>
    </>
  );
};

export default Chat;