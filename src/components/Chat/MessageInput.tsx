import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background: #fff;
  border-top: 1px solid #e0e0e0;
  position: fixed;
  bottom: 0;
  left: 80px;
  right: 0;
  z-index: 100;
`;

const IconButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-right: 12px;
  font-size: 18px;
  color: #666;

  i {
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: #4a90e2;
    }
  }
`;

const FileUploadMenu = styled.div`
  position: relative;
  display: inline-block;
`;

const FileMenuDropdown = styled.div`
  position: absolute;
  bottom: 100%;
  left: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  z-index: 100;
  min-width: 150px;
  margin-bottom: 10px;

  button {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 16px;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    font-size: 14px;
    color: #333;

    &:hover {
      background: #f5f5f5;
    }

    i {
      font-size: 16px;
    }
  }
`;

const EmojiPickerWrapper = styled.div`
  position: absolute;
  bottom: 60px;
  left: 20px;
  z-index: 10;
`;

const InputField = styled.input`
  flex: 1;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
  font-size: 14px;
  transition: border 0.2s;

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

const SendIcon = styled.i`
  position: absolute;
  top: 56%;
  left: 48%;
  transform: translate(-50%, -50%);
  font-size: 18px;
`;

const HiddenImageInput = styled.input`
  display: none;
`;

const HiddenVideoInput = styled.input`
  display: none;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const UploadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 20px;
`;

const UploadProgress = styled.div`
  margin-top: 10px;
  font-size: 14px;
  color: #4a90e2;
  font-weight: 500;
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

interface MessageInputProps {
    onSend: (content: string) => void;
    onFileUpload: (type: 'image' | 'video' | 'file', file: File) => void;
    uploadProgress?: number | null;
    isUploading?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
    onSend, 
    onFileUpload, 
    uploadProgress,
    isUploading
  }) => {
    const [message, setMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showFileMenu, setShowFileMenu] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const handleSend = () => {
        if (message.trim()) {
        onSend(message);
        setMessage('');
        setShowEmojiPicker(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
        }
    };

    const handleEmojiSelect = (emoji: any) => {
        setMessage(prev => prev + emoji.native);
        if (inputRef.current) {
        inputRef.current.focus();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        let type: 'image' | 'video' | 'file' = 'file';
        
        if (e.target === imageInputRef.current) type = 'image';
        if (e.target === videoInputRef.current) type = 'video';
        
        onFileUpload(type, file);
        e.target.value = '';
        }
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
          const target = e.target as Element;
          
          if (target.closest('.emoji-picker') || target.closest('.fi-rr-smile')) {
            return;
          }
          
          if (showFileMenu && !target.closest('.file-menu-container')) {
            setShowFileMenu(false);
          }
          
          if (showEmojiPicker && !target.closest('.emoji-picker')) {
            setShowEmojiPicker(false);
          }
        };
      
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
      }, [showFileMenu, showEmojiPicker]);

    useEffect(() => {
        if (inputRef.current) {
        inputRef.current.focus();
        }
    }, []);

    return (
        <InputContainer>
            {isUploading && (
            <UploadingOverlay>
            <LoadingSpinner />
            {uploadProgress && (
                <UploadProgress>{uploadProgress}%</UploadProgress>
            )}
            </UploadingOverlay>
        )}
        <IconButtons>
            <FileUploadMenu className="file-menu-container">
            <i 
                className="fi fi-rr-clip" 
                title="Adjuntar archivo" 
                onClick={(e) => {
                e.stopPropagation();
                setShowFileMenu(!showFileMenu);
                }} 
            />
            {showFileMenu && (
                <FileMenuDropdown onClick={(e) => e.stopPropagation()}>
                <button onClick={(e) => {
                    e.stopPropagation();
                    imageInputRef.current?.click();
                }}>
                    <i className="fi fi-rr-picture"></i> Imagen
                </button>
                <button onClick={(e) => {
                    e.stopPropagation();
                    videoInputRef.current?.click();
                }}>
                    <i className="fi fi-rr-video-camera"></i> Video
                </button>
                <button onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                }}>
                    <i className="fi fi-rr-file"></i> Documento
                </button>
                </FileMenuDropdown>
            )}
            </FileUploadMenu>
            <i 
            className="fi fi-rr-smile" 
            title="Emoji" 
            onClick={(e) => {
                e.stopPropagation();
                setShowEmojiPicker(prev => !prev);
            }} 
            />
        </IconButtons>

        {showEmojiPicker && (
            <EmojiPickerWrapper className="emoji-picker">
                <Picker 
                data={data} 
                theme="light" 
                onEmojiSelect={handleEmojiSelect} 
                locale="es" 
                onClickOutside={() => setShowEmojiPicker(false)}
                />
            </EmojiPickerWrapper>
        )}

        <InputField
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
        />

        <SendButton 
            onClick={handleSend} 
            $disabled={!message.trim()}
            title="Enviar mensaje"
        >
            <SendIcon className="fi fi-rr-paper-plane" />
        </SendButton>

        <HiddenImageInput 
            type="file" 
            ref={imageInputRef} 
            onChange={handleFileChange} 
            accept="image/*"
        />
        <HiddenVideoInput 
            type="file" 
            ref={videoInputRef} 
            onChange={handleFileChange} 
            accept="video/*"
        />
        <HiddenFileInput 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
        />
        </InputContainer>
    );
};

export default MessageInput;