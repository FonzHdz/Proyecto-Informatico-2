import React from 'react';
import styled from 'styled-components';
import { format, isSameDay, isToday, isYesterday, isAfter, subMinutes } from 'date-fns';
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
  previousMessage?: {
    date: string;
    user: {
      id: string;
    };
  };
}

const MessageContainer = styled.div<{ $isCurrentUser: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.$isCurrentUser ? 'flex-end' : 'flex-start'};
  margin-bottom: -10px;
`;

const MessageBubble = styled.div<{ $isCurrentUser: boolean }>`
  max-width: 40%;
  padding: 12px 16px;
  border-radius: ${props =>
    props.$isCurrentUser ? '18px 4px 18px 18px' : '4px 18px 18px 18px'};
  background: ${props =>
    props.$isCurrentUser ? '#905BBC' : '#3498DB'};
  color: ${props => props.$isCurrentUser ? 'white' : 'white'};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
  font-weight: 500;
`;

const SenderName = styled.span`
  margin-right: 5px;
`;

const TimeSeparator = styled.div`
  font-size: 12px;
  color: #999;
  text-align: center;
  margin: 20px 0 10px;
  font-weight: 500;
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

const MessageTime = styled.span`
  font-size: 11px;
  color: #999;
  font-weight: 400;
`;

const Message: React.FC<MessageProps> = ({ message, isCurrentUser, previousMessage }) => {
  const messageDate = new Date(message.date);
  const formattedTime = format(messageDate, 'hh:mm aaaa', { locale: es }).replace('.', '').toLowerCase();
  const showDateSeparator =
    !previousMessage || !isSameDay(messageDate, new Date(previousMessage.date));
  const formattedDate = isToday(messageDate)
    ? 'Hoy'
    : isYesterday(messageDate)
    ? 'Ayer'
    : format(messageDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });

  const showHeader = !previousMessage ||
    message.user.id !== previousMessage.user.id ||
    isAfter(messageDate, subMinutes(new Date(previousMessage.date), -2));
  

  return (
    <>
      {showDateSeparator && <TimeSeparator>{formattedDate}</TimeSeparator>}

      <MessageContainer $isCurrentUser={isCurrentUser}>
        {showHeader && (
          <HeaderRow>
            <SenderName>
              {isCurrentUser ? 'Yo' : `${message.user.firstName} ${message.user.lastName}`}
            </SenderName>
            <MessageTime>{formattedTime}</MessageTime>
          </HeaderRow>
        )}

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
        </MessageBubble>
      </MessageContainer>
    </>
  );
};

export default Message;