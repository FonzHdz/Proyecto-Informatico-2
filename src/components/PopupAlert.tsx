import React from 'react';
import styled from 'styled-components';

const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(1px);
`;

const PopupContent = styled.div`
  background: white;
  padding: 25px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  text-align: center;
`;

const PopupTitle = styled.h3`
  color: #333;
  font-size: 20px;
  margin-bottom: 15px;
  font-weight: 600;
`;

const PopupMessage = styled.p`
  color: #666;
  font-size: 16px;
  margin-bottom: 25px;
  line-height: 1.5;
`;

const PopupButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
`;

const PopupButton = styled.button<{ $primary?: boolean }>`
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  ${props => props.$primary ? `
    background: linear-gradient(90deg, #4a90e2 0%, #7b1fa2 100%);
    color: white;
    
    &:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
  ` : `
    background:rgb(228, 228, 228);
    color: #333;
    
    &:hover {
      background:rgb(244, 244, 244);
    }
  `}
`;

// Exportamos la interfaz correctamente
export interface PopupAlertProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

export const PopupAlert: React.FC<PopupAlertProps> = ({
  isOpen,
  title,
  message,
  onConfirm = () => {},
  onCancel = () => {},
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  showCancel = true
}) => {
  if (!isOpen) return null;

  return (
    <PopupOverlay>
      <PopupContent>
        <PopupTitle>{title}</PopupTitle>
        <PopupMessage>{message}</PopupMessage>
        <PopupButtons>
          {showCancel && (
            <PopupButton onClick={onCancel}>
              {cancelText}
            </PopupButton>
          )}
          <PopupButton $primary onClick={onConfirm}>
            {confirmText}
          </PopupButton>
        </PopupButtons>
      </PopupContent>
    </PopupOverlay>
  );
};