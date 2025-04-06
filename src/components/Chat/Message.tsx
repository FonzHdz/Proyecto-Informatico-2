import React from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface MessageProps {
  message: {
    id: string;
    content: string;
    date: string;
    type: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
    };
    fileURL?: string;
  };
  isCurrentUser: boolean;
}

const MessageContainer = styled.div<{ isCurrentUser: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.isCurrentUser ? 'flex-end' : 'flex-start'};
  margin-bottom: 15px;
`;

const MessageBubble = styled.div<{ $isCurrentUser: boolean }>`
  max-width: 70%;
  padding: 10px 15px;
  border-radius: ${props => 
    props.$isCurrentUser ? '18px 4px 18px 18px' : '4px 18px 18px 18px'};
  background: ${props => 
    props.$isCurrentUser ? 'linear-gradient(90deg, #4a90e2 0%, #7b1fa2 100%)' : '#fff'};
  color: ${props => props.$isCurrentUser ? 'white' : '#333'};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
`;

const SenderName = styled.span`
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
  font-weight: 500;
`;

const MessageTime = styled.span`
  font-size: 11px;
  color: #999;
  margin-top: 4px;
  align-self: flex-end;
`;

const MessageImage = styled.img`
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  margin-top: 8px;
`;

const MessageVideo = styled.video`
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  margin-top: 8px;
`;

const MessageFile = styled.a`
  display: inline-block;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  color: #4a90e2;
  text-decoration: none;
  margin-top: 8px;
  font-size: 14px;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
`;

const Message: React.FC<MessageProps> = ({ message, isCurrentUser }) => {
    const formattedDate = format(new Date(message.date), 'HH:mm', { locale: es });

    return (
        <MessageContainer isCurrentUser={isCurrentUser}>
        {!isCurrentUser && (
            <SenderName>{message.user.firstName} {message.user.lastName}</SenderName>
        )}
            <div className={isCurrentUser ? 'current-user' : 'other-user'}>
                <MessageBubble $isCurrentUser={isCurrentUser}>
                    {message.content}
                    
                    {message.fileURL && message.type === 'IMAGE' && (
                    <MessageImage src={message.fileURL} alt="Imagen enviada" />
                    )}
                    
                    {message.fileURL && message.type === 'VIDEO' && (
                    <MessageVideo controls>
                        <source src={message.fileURL} type="video/mp4" />
                        Tu navegador no soporta videos HTML5.
                    </MessageVideo>
                    )}
                    
                    {message.fileURL && message.type === 'FILE' && (
                    <MessageFile href={message.fileURL} target="_blank" rel="noopener noreferrer">
                        Descargar archivo
                    </MessageFile>
                    )} 
                    
                    <MessageTime>{formattedDate}</MessageTime>
                </MessageBubble>
            </div>
        </MessageContainer>
    );
};

export default Message;