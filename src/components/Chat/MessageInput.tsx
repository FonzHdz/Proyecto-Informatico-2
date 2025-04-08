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
  position: relative;
  margin-bottom: -20px;
  padding-top: 20px;
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

interface MessageInputProps {
  onSend: (content: string) => void;
  onFileUploadClick?: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend, onFileUploadClick }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <InputContainer>
      <IconButtons>
        <i className="fi fi-rr-clip" title="Adjuntar archivo" onClick={onFileUploadClick} />
        <i className="fi fi-rr-smile" title="Emoji" onClick={() => setShowEmojiPicker(prev => !prev)} />
      </IconButtons>

      {showEmojiPicker && (
        <EmojiPickerWrapper>
          <Picker data={data} theme="light" onEmojiSelect={handleEmojiSelect} locale="es" />
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
    </InputContainer>
  );
};

export default MessageInput;