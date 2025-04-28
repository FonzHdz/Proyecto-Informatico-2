import React from 'react';
import styled from 'styled-components';

interface ChatBotMessageProps {
  message: React.ReactNode;
  isUser: boolean;
}

const MessageContainer = styled.div<{ $isUser: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
  margin-bottom: 8px;
  width: 100%;
`;

const UserMessageBubble = styled.div`
  max-width: 80%;
  padding: 10px 16px;
  border-radius: 18px 4px 18px 18px;
  background: linear-gradient(90deg, #4a90e2 0%, #7b1fa2 100%);
  color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
`;

const BotMessageContent = styled.div`
  max-width: 90%;
  padding: 0 4px;
  margin-top: 10px;
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  word-wrap: break-word;
`;

const MessageTime = styled.div<{ $isUser: boolean }>`
  font-size: 11px;
  color: ${props => props.$isUser ? 'rgba(255, 255, 255, 0.7)' : '#666'};
  margin-top: 4px;
  text-align: ${props => props.$isUser ? 'right' : 'left'};
`;

const ChatBotMessage: React.FC<ChatBotMessageProps> = ({ message, isUser }) => {
  return (
    <MessageContainer $isUser={isUser}>
      {isUser ? (
        <UserMessageBubble>
          {message}
          <MessageTime $isUser={isUser}></MessageTime>
        </UserMessageBubble>
      ) : (
        <BotMessageContent>
          {message}
          <MessageTime $isUser={isUser}></MessageTime>
        </BotMessageContent>
      )}
    </MessageContainer>
  );
};

export default ChatBotMessage;