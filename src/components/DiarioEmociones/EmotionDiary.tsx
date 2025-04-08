import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import CreateEmotion from './CreateEmotion';
import EditEmotion from './EditEmotion';
import axios from 'axios';

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
    .fi {
      transform: scale(1.1);
    }
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

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  height: calc(100vh - 80px); /* Resta la altura del header */
  margin-top: -15px; /* Compensa el padding del header */
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

const DeleteButton = styled(ActionButton)`
  &:hover {
    color: #ff4757;
    
    .fi {
      transform: scale(1.1);
    }
  }
`;

const getEmotionIcon = (emotion: string) => {
  if (!emotion) return '😐';
  
  switch (emotion.toLowerCase()) {
    case 'tristeza':
      return '☹️';
    case 'alegría':
      return '😊';
    case 'calma':
      return '😌';
    case 'enojo':
      return '😠';
    case 'miedo':
      return '😨';
    case 'sorpresa':
      return '😮';
    default:
      return '😐';
  }
};

interface EmotionEntry {
  id: string;
  emotion: string;
  date: string;
  image: string;
  description: string;
}

interface EmotionDiaryProps {
  userId: string;
}

const EmotionDiary: React.FC<EmotionDiaryProps> = ({ userId }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [emotions, setEmotions] = useState<EmotionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingEmotion, setEditingEmotion] = useState<EmotionEntry | null>(null);

  // Cargar emociones del usuario
  useEffect(() => {
    const fetchEmotions = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:8070/emotion/user/${userId}`);
        
        const formattedEmotions = response.data
        .map((item: any) => ({
          id: item.id,
          emotion: item.emotion || item.name,
          date: item.date,
          image: item.fileUrl,
          description: item.description,
          creationDate: new Date(item.date) // Convertir a Date para ordenar
        }))
        .sort((a: any, b: any) => a.creationDate - b.creationDate); // Orden ascendente
        
        setEmotions(formattedEmotions);
        setError(null);
      } catch (err) {
        console.error('Error al obtener las emociones:', err);
        setError('No se pudieron cargar las emociones. Intenta nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchEmotions();
    }
  }, [userId]);

  const handleCreateEmotion = async () => {
    try {
      const response = await axios.get(`http://localhost:8070/emotion/user/${userId}`);
      const formattedEmotions = response.data
        .map((item: any) => ({
          id: item.id,
          emotion: item.name || item.emotion,
          date: item.date,
          image: item.fileUrl,
          description: item.description,
          creationDate: new Date(item.date),
        }))
        .sort((a: any, b: any) => b.creationDate - a.creationDate); // Más reciente primero
  
      setEmotions(formattedEmotions);
      setError(null);
    } catch (err) {
      console.error('Error al obtener las emociones:', err);
      setError('No se pudieron cargar las emociones. Intenta nuevamente.');
    }
  };
  

  const handleDeleteEmotion = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta emoción?')) {
      return;
    }
    
    try {
      await axios.delete(`http://localhost:8070/emotion/delete/${id}`);
      setEmotions(prev => prev.filter(emotion => emotion.id !== id));
    } catch (err) {
      console.error('Error al eliminar la emoción:', err);
      alert('Error al eliminar la emoción');
    }
  };

  if (isLoading) return (
    <LoadingContainer>
      <LoadingSpinner />
    </LoadingContainer>
  );

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <>
      <EmotionContainer>
        {emotions.length > 0 ? (
          emotions.map(entry => (
            <EmotionCard key={entry.id}>
              <EmotionHeader>
                <EmotionIcon>{getEmotionIcon(entry.emotion)}</EmotionIcon>
                <EmotionInfo>
                  <EmotionTitle>{entry.emotion}</EmotionTitle>
                  <EmotionDate>{entry.date}</EmotionDate>
                </EmotionInfo>
              </EmotionHeader>
              {entry.image && (
                <EmotionImage 
                  src={entry.image} 
                  alt={`Emoción: ${entry.emotion}`} 
                />
              )}
              <EmotionText>{entry.description}</EmotionText>
              <ActionButtons>
                <ActionButton onClick={() => setEditingEmotion(entry)}>
                  <i className="fi fi-rr-edit"></i>
                </ActionButton>
                <DeleteButton onClick={() => handleDeleteEmotion(entry.id)}>
                  <i className="fi fi-rr-trash"></i>
                </DeleteButton>
              </ActionButtons>
            </EmotionCard>
          ))
        ) : (
          <div style={{ color: '#666', gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
            No hay emociones registradas
          </div>
        )}
      </EmotionContainer>

      <CreateButton onClick={() => setIsCreateOpen(true)}>
        <i className="fi fi-rr-plus"></i>
      </CreateButton>

      <CreateEmotion
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateEmotion}
      />
      {editingEmotion && (
        <EditEmotion
          isOpen={true}
          onClose={() => setEditingEmotion(null)}
          emotionId={editingEmotion.id}
          onUpdate={handleCreateEmotion} // Reutilizamos la misma función para refrescar
          initialEmotion={editingEmotion.emotion}
          initialDescription={editingEmotion.description}
          initialImage={editingEmotion.image}
        />
      )}
    </>
  );
};

export default EmotionDiary;