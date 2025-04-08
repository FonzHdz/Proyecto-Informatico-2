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
    fileName?: string;
    fileSize?: string;
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
  margin-bottom: 10px;
  width: 100%;
`;

const MessageBubble = styled.div<{ $isCurrentUser: boolean, $hasMedia: boolean }>`
  max-width: 40%;
  padding: ${props => props.$hasMedia ? '0' : '12px 16px'};
  border-radius: ${props =>
    props.$isCurrentUser ? '18px 4px 18px 18px' : '4px 18px 18px 18px'};
  background: ${props =>
    props.$isCurrentUser ? '#905BBC' : '#3498DB'};
  color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  overflow: hidden;
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

const MediaContainer = styled.div`
  width: 100%;
  max-width: 400px;

  img, video {
    width: 100%;
    max-height: 300px;
    object-fit: contain;
    display: block;
  }
`;

const MessageTime = styled.span`
  font-size: 11px;
  color: #999;
  font-weight: 400;
`;

const getFileIcon = (fileName: string) => {
  if (!fileName) return 'fi fi-rr-file';
  
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch(extension) {
    case 'pdf': return 'fi fi-rr-file-pdf';
    case 'doc':
    case 'docx': return 'fi fi-rr-file-word';
    case 'xls':
    case 'xlsx': return 'fi fi-rr-file-excel';
    case 'ppt':
    case 'pptx': return 'fi fi-rr-file-powerpoint';
    case 'txt': return 'fi fi-rr-file-alt';
    case 'zip':
    case 'rar':
    case '7z': return 'fi fi-rr-file-zip';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif': return 'fi fi-rr-picture';
    case 'mp4':
    case 'mov':
    case 'avi': return 'fi fi-rr-video-camera';
    default: return 'fi fi-rr-file';
  }
};

const FilePreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 300px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
`;

const FileHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.15);
`;

const FileIconContainer = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
`;

const FileMeta = styled.div`
  flex: 1;
  min-width: 0;
  overflow: hidden; // Mantiene el contenido dentro del contenedor
`;

const FileName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: white;
  white-space: normal;  // Cambiado de nowrap a normal
  overflow: visible;    // Asegura que el contenido no se oculte
  word-break: break-word; // Permite que las palabras largas se dividan
  max-width: 100%;      // Asegura que no exceda el ancho disponible
`;

const FileSize = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 2px;
`;

const DownloadButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  text-decoration: none;
  font-size: 13px;
  border-radius: 6px;
  transition: all 0.2s;
  margin-left: 8px;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  i {
    margin-right: 6px;
  }
`;

const FileTypeBadge = styled.span`
  display: inline-block;
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  font-size: 10px;
  color: white;
  margin-top: 4px;
  text-transform: uppercase;
`;

const getFileType = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  if (['pdf'].includes(extension)) return 'PDF';
  if (['doc', 'docx'].includes(extension)) return 'Word';
  if (['xls', 'xlsx'].includes(extension)) return 'Excel';
  if (['ppt', 'pptx'].includes(extension)) return 'PowerPoint';
  if (['zip', 'rar', '7z'].includes(extension)) return 'Comprimido';
  if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'Imagen';
  if (['mp4', 'mov', 'avi'].includes(extension)) return 'Video';
  
  return extension.toUpperCase() || 'Archivo';
};

const FilePreview = ({ fileUrl, fileName, fileSize }: { fileUrl?: string, fileName?: string, fileSize?: string }) => {
  const displayName = fileName || fileUrl?.split('/').pop() || 'Archivo';
  const fileType = getFileType(displayName);

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    const link = document.createElement('a');
    if (fileUrl) {
      link.href = fileUrl;
      link.setAttribute('download', displayName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <FilePreviewContainer>
      <FileHeader>
        <FileIconContainer>
          <i className={getFileIcon(displayName)} />
        </FileIconContainer>
        <FileMeta>
          <FileName title={displayName}>{displayName}</FileName>
          {fileSize && <FileSize>{fileSize}</FileSize>}
          <FileTypeBadge>{fileType}</FileTypeBadge>
        </FileMeta>
        <DownloadButton 
          href={fileUrl} 
          onClick={handleDownload}
          rel="noopener noreferrer"
          title="Descargar archivo"
        >
          <i className="fi fi-rr-download" />
          Descargar
        </DownloadButton>
      </FileHeader>
    </FilePreviewContainer>
  );
};

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

  const hasMedia = !!message.fileURL;
  const isFile = hasMedia && (message.type === 'FILE' || !message.type);

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

        <MessageBubble 
          $isCurrentUser={isCurrentUser}
          $hasMedia={hasMedia && !isFile}
        >
          {/* Mostrar contenido solo si no es un archivo multimedia */}
          {!hasMedia && message.content}
          
          {message.fileURL && message.type === 'IMAGE' && (
            <MediaContainer>
              <img src={message.fileURL} alt="Imagen enviada" />
            </MediaContainer>
          )}

          {message.fileURL && message.type === 'VIDEO' && (
            <MediaContainer>
              <video controls>
                <source src={message.fileURL} type="video/mp4" />
                Tu navegador no soporta videos HTML5.
              </video>
            </MediaContainer>
          )}

          {isFile && (
            <FilePreview 
              fileUrl={message.fileURL} 
              fileName={message.content}
              fileSize={message.fileSize}
            />
          )}
        </MessageBubble>
      </MessageContainer>
    </>
  );
};

export default Message;