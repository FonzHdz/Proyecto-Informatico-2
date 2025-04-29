import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import ChatBotMessage from './ChatBotMessage';
import MarkdownMessage from '../MarkdownMessage';
import { useAlert } from '../../context/AlertContext';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 92%;
  width: 100%;
  margin-left: 50px;
  margin-right: -20px;
  overflow-y: auto;
  margin-top: -10px;
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 20px;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 800px;
  margin-top: 10px;
  height: 75%;
`;


const NoMessages = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50%;
  color: #666;
  font-size: 14px;
  text-align: center;
  padding: 20px;
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

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(50vh);
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

const TypingIndicatorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #7b1fa2;
  font-size: 16px;
  font-style: italic;
  padding: 10px;
`;

const Dot = styled.span<{ color: string; delay: string }>`
  width: 8px;
  height: 8px;
  background: ${props => props.color};
  border-radius: 50%;
  animation: blinkMove 1.4s infinite both;
  animation-delay: ${props => props.delay};
  flex-shrink: 0;

  @keyframes blinkMove {
    0% { 
      opacity: 0.2; 
      transform: translateY(0px); 
    }
    20% { 
      opacity: 1; 
      transform: translateY(-3px); 
    }
    50% { 
      opacity: 0.8; 
      transform: translateY(0px); 
    }
    100% { 
      opacity: 0.2; 
      transform: translateY(0px); 
    }
  }
`;

const TypingIndicator: React.FC = () => {
    return (
      <TypingIndicatorContainer>
        <Dot color="#4a90e2" delay="0s" />
        <Dot color="#4a90e2" delay="0.2s" />
        <Dot color="#4a90e2" delay="0.4s" />
      </TypingIndicatorContainer>
    );
};  

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background: white;
  border-top: 1px solid #e0e0e0;
  position: fixed;
  bottom: 0;
  left: 80px;
  right: 0;
  z-index: 100;
`;

const InputField = styled.input<{ $hasNewChatButton?: boolean }>`

  flex: 1;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
  font-size: 14px;
  transition: all 0.3s ease;

  &:focus {
    border-color: #4a90e2;
  }
`;

const SendButton = styled.button<{ $disabled: boolean }>`
  position: relative;
  background: linear-gradient(90deg, #4a90e2 0%, #7b1fa2 100%);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-left: 10px;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 18px;
  opacity: ${props => props.$disabled ? 0.6 : 1};

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: scale(1.05);
  }
`;

const NewChatButton = styled.button`
  position: relative;
  background: linear-gradient(90deg, #4a90e2 0%, #7b1fa2 100%);
  color: white;
  border: none;
  padding: 12px 15px;
  border-radius: 50px;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 18px;
  cursor: pointer;
  overflow: hidden;
  width: 40px; /* <-- tamaño base reducido */
  height: 40px;
  
  .icon {
    font-size: 20px;
    transition: opacity 0.3s;
  }

  .text {
    position: absolute;
    opacity: 0;
    transition: opacity 0.3s, transform 0.3s;
    white-space: nowrap;
    transform: scale(0.8); /* opcional: animación más suave */
  }

  &:hover {
    width: 100px; /* <-- en hover, el botón se expande */
    font-size: 14px; /* <-- tamaño de fuente ajustado */
  }

  &:hover .icon {
    opacity: 0;
  }

  &:hover .text {
    opacity: 1;
    transform: scale(1);
  }
`;

const SendIcon = styled.i`
  position: absolute;
  top: 56%;
  left: 48%;
  transform: translate(-50%, -50%);
  font-size: 18px;
`;

const SuggestedQuestionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  `;

const QuestionButton = styled.button`
  background: linear-gradient(90deg, #4a90e2 0%, #7b1fa2 100%);
  color: white;
  border: none;
  border-radius: 20px;
  padding: 12px 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  min-width: 240px;
  text-align: center;
  white-space: nowrap;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const SuggestedQuestions: React.FC<{ onSelect: (q: string) => void }> = ({ onSelect }) => {
  const questions = [
    "¿Qué actividades familiares podemos hacer?",
    "¿Cómo mejorar la comunicación en casa?",
    "¿Cómo resolver peleas entre hermanos?",
    "Ideas para un fin de semana divertido",
    "¿Qué hacer cuando los niños no obedecen?",
  ];

  return (
    <SuggestedQuestionsContainer>
      {questions.map((q, idx) => (
        <QuestionButton key={idx} onClick={() => onSelect(q)}>
          {q}
        </QuestionButton>
      ))}
    </SuggestedQuestionsContainer>
  );
};

type ChatRole = 'user' | 'assistant';

interface ChatMessage {
  role: ChatRole;
  content: string;
  timestamp: Date;
}

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const savedChat = localStorage.getItem('harmoniBotChatHistory');
    if (savedChat) {
      try {
        return (JSON.parse(savedChat) as ChatMessage[]).map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
      } catch {
        localStorage.removeItem('harmoniBotChatHistory');
      }
    }
    return [];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const stompClient = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { showAlert } = useAlert();
  const user = useRef(JSON.parse(localStorage.getItem('harmonichat_user') || 'null'));

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8070/ws'),
      connectHeaders: { 'user-id': user.current?.id || 'anonymous' },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('Connected');
        if (user.current?.familyId) {
          client.subscribe(`/topic/family.${user.current.familyId}.chatbot`, handleBotMessage);
        }
        client.subscribe(`/user/queue/chatbot`, handleBotMessage);
        client.subscribe(`/user/queue/chatbot.errors`, handleBotError);
      },
    });

    stompClient.current = client;
    client.activate();

    return () => {
      client.deactivate();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    localStorage.setItem('harmoniBotChatHistory', JSON.stringify(messages));
  }, [messages]);

  const handleBotMessage = (message: IMessage) => {
    const response = JSON.parse(message.body);
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: response.content, timestamp: new Date() },
    ]);
    setIsLoading(false);
  };

  const handleBotError = (message: IMessage) => {
    showAlert({ title: 'Error', message: 'Error en la respuesta del asistente.' });
    setIsLoading(false);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const text = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    if (stompClient.current?.connected) {
      stompClient.current.publish({
        destination: '/app/chatbot.send',
        body: JSON.stringify({ content: text, familyId: user.current?.familyId }),
        headers: { 'content-type': 'application/json' },
      });
    } else {
      try {
        const response = await fetch('http://localhost:8070/chatbot/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: text }),
        });
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.content, timestamp: new Date() },
        ]);
      } catch (error) {
        console.error('HTTP error:', error);
        showAlert({ title: 'Error', message: 'No se pudo enviar el mensaje.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = async () => {
    const confirmed = await showAlert({
        title: 'Crear nuevo chat',
        message: '¿Estás seguro de que quieres comenzar un nuevo chat?', 
        confirmText: 'Crear',
        cancelText: 'Cancelar'
      });
      
      if (!confirmed) return;

    setMessages([]);
    localStorage.removeItem('harmoniBotChatHistory');
  };

  return (
    <>
      <Header>
        <span>HarmoniBot</span>
      </Header>

      <ChatContainer>
        <MessagesContainer>
          {messages.length === 0 && (
            <>
              <NoMessages>¡Empieza una conversación o elige una sugerencia!</NoMessages>
              <SuggestedQuestions onSelect={(q) => setInputMessage(q)} />
            </>
          )}
          {messages.map((msg, idx) => (
            <ChatBotMessage
              key={idx}
              message={msg.role === 'assistant' ? <MarkdownMessage content={msg.content} /> : msg.content}
              isUser={msg.role === 'user'}
            />
          ))}
          {isLoading && (
            <LoadingContainer>
                <TypingIndicator />
            </LoadingContainer>
          )}
          <div ref={messagesEndRef} />
        </MessagesContainer>

        <InputContainer>
            {messages.length > 0 && (
            <NewChatButton onClick={handleNewChat}>
                <SendIcon className="fi fi-rr-comment-medical icon"/>
                <span className="text">Nuevo chat</span>
            </NewChatButton>
            )}
          <InputField
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            $hasNewChatButton={messages.length > 0}
          />
          <SendButton
            onClick={handleSendMessage}
            $disabled={!inputMessage.trim()}
          >
            <SendIcon className="fi fi-rr-paper-plane" />
          </SendButton>
        </InputContainer>
      </ChatContainer>
    </>
  );
};

export default ChatBot;