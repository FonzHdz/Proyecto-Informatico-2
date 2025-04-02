import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import CreateEmotion from './CreateEmotion';
import axios from 'axios';

import { wait } from '@testing-library/user-event/dist/utils';

const EmotionContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  padding: 20px;
  margin: 0 auto;
`;

const EmotionCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  height: fit-content;
`;

const EmotionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const EmotionIcon = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
`;

const EmotionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-left: 4px;
`;

const EmotionTitle = styled.h3`
  font-size: 16px;
  color: #333;
  font-weight: 500;
  margin: 0;
`;

const EmotionDate = styled.span`
  font-size: 13px;
  color: #666;
`;

const EmotionImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
`;

const EmotionText = styled.p`
  color: #666;
  line-height: 1.5;
  margin: 0;
  font-size: 14px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 4px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 4px;
  font-size: 14px;

  &:hover {
    color: #4a90e2;
  }

  i {
    font-size: 16px;
  }
`;

const CreateButton = styled.button`
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  border-radius: 8px;
  background: linear-gradient(90deg, #4a90e2 0%, #7b1fa2 100%);
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 150;

  &:hover {
    transform: scale(1.05);
    opacity: 0.95;
  }

  i {
    font-size: 24px;
    color: white;
  }
`;

const getEmotionIcon = (emotion: string) => {
  switch (emotion.toLowerCase()) {
    case 'tristeza':
      return '☹️';
    case 'alegria':
      return '☺️';
    case 'calma':
      return '😌';
    default:
      return '😐';
  }
};

interface EmotionEntry {
  id: number;
  emotion: string;
  date: string;
  image: string;
  description: string;
}

const EmotionDiary: React.FC = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [emotions, setEmotions] = useState<EmotionEntry[]>([]);
// Cargar datos desde la API
useEffect(() => {
  const fetchEmotions = async () => {
    try {
      const response = await axios.get('http://localhost:8070/emotion/all');
      
      // Transformamos los datos a la estructura esperada
      const formattedEmotions = response.data.map((item: any) => ({
        id: item.id,
        emotion: item.emocion, // Ajustar clave si es diferente
        date: item.date,
        image: item.fileUrl, // Ajustar clave si es diferente
        description: item.description
      }));

      setEmotions(formattedEmotions);
    } catch (error) {
      console.error('Error al obtener las emociones:', error);
    }
  };

  fetchEmotions();
}, []);

  const handleCreateEmotion = (emotion: any) => {
    console.log('Nueva emoción:', emotion);
    setIsCreateOpen(false);
  };

  return (
    <EmotionContainer>
      {emotions.map(entry => (
        <EmotionCard key={entry.id}>
          <EmotionHeader>
            <EmotionIcon>{getEmotionIcon(entry.emotion)}</EmotionIcon>
            <EmotionInfo>
              <EmotionTitle>{entry.emotion}</EmotionTitle>
              <EmotionDate>{entry.date}</EmotionDate>
            </EmotionInfo>
          </EmotionHeader>
          <EmotionImage src={entry.image} alt={entry.emotion} />
          <EmotionText>{entry.description}</EmotionText>
          <ActionButtons>
            <ActionButton>
              <i className="fi fi-rr-edit"></i>
            </ActionButton>
            <ActionButton>
              <i className="fi fi-rr-trash"></i>
            </ActionButton>
          </ActionButtons>
        </EmotionCard>
      ))}

      <CreateButton onClick={() => setIsCreateOpen(true)}>
        <i className="fi fi-rr-plus"></i>
      </CreateButton>

      <CreateEmotion
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateEmotion}
      />
    </EmotionContainer>
  );
};

export default EmotionDiary; 