import React, { useState, useEffect } from 'react';
import { useAlert } from '../../context/AlertContext';
import { getBackendUrl } from '../../utils/api';
import styled from 'styled-components';
import axios from 'axios';

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
  z-index: 1000;
`;

const PopupContent = styled.div`
  background: white;
  padding: 28px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  h2 {
    font-size: 18px;
    color: #333;
    margin-bottom: 24px;
    font-weight: 500;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  color: #666;
  font-size: 13px;
  font-weight: 500;
`;

const EmotionSelect = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const EmotionOption = styled.button<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid ${props => props.selected ? '#4a90e2' : '#ddd'};
  border-radius: 20px;
  background: ${props => props.selected ? '#e3f2fd' : 'white'};
  color: ${props => props.selected ? '#1976d2' : '#666'};
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;

  &:hover {
    border-color: #4a90e2;
    background: #f5f9ff;
  }
`;

const TextArea = styled.textarea`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  color: #666;

  &:focus {
    outline: none;
    border-color: #4a90e2;
  }

  &::placeholder {
    color: #999;
  }
`;

const ImagePreview = styled.div`
  width: 100%;
  height: 200px;
  border: 1px dashed #ddd;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background-size: cover;
  background-position: center;
  color: #999;
  font-size: 13px;
  transition: all 0.2s;

  &:hover {
    border-color: #4a90e2;
    color: #4a90e2;
  }
`;

const Button = styled.button`
  padding: 12px;
  background: linear-gradient(90deg, #4a90e2 0%, #7b1fa2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s;
  margin-top: 20px;

  &:hover {
    opacity: 0.95;
  }
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: right;
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

const DeleteButton = styled(ActionButton)`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 71, 87, 0.9);
  color: white;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  padding: 0;

  &:hover {
    background: rgba(255, 71, 87, 1);
    color: white;
    .fi {
      transform: scale(1);
    }
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 180px;

  &:hover ${DeleteButton} {
    opacity: 1;
  }
`;

interface EditEmotionProps {
  isOpen: boolean;
  onClose: () => void;
  emotionId: string;
  onUpdate: () => void;
  initialEmotion?: string;
  initialDescription?: string;
  initialImage?: string;
}

const emotions = [
  { id: 'tristeza', icon: '☹️', label: 'Tristeza' },
  { id: 'alegria', icon: '☺️', label: 'Alegría' },
  { id: 'calma', icon: '😌', label: 'Calma' },
  { id: 'enojo', icon: '😠', label: 'Enojo' },
  { id: 'miedo', icon: '😨', label: 'Miedo' },
  { id: 'sorpresa', icon: '😲', label: 'Sorpresa' }
];

const getEmotionId = (emotionLabel: string) => {
  const emotion = emotions.find(e => e.label.toLowerCase() === emotionLabel.toLowerCase());
  return emotion ? emotion.id : '';
};

const EditEmotion: React.FC<EditEmotionProps> = ({ 
  isOpen, 
  onClose, 
  emotionId, 
  onUpdate,
  initialEmotion = '',
  initialDescription = '',
  initialImage = ''
}) => {
  const [selectedEmotion, setSelectedEmotion] = useState(getEmotionId(initialEmotion));
  const [description, setDescription] = useState(initialDescription);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(initialImage);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [keepCurrentImage, setKeepCurrentImage] = useState(true);
  const { showAlert } = useAlert();

  useEffect(() => {
    if (isOpen) {
      setSelectedEmotion(getEmotionId(initialEmotion));
      setDescription(initialDescription);
      setImagePreview(initialImage);
      setImage(null);
      setKeepCurrentImage(true);
      setError('');
    }
  }, [isOpen, initialEmotion, initialDescription, initialImage]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setKeepCurrentImage(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview('');
    setKeepCurrentImage(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const user = JSON.parse(localStorage.getItem('harmonichat_user') || '{}');
    if (!user?.id) {
      showAlert({
        title: 'Error de autenticación',
        message: 'No se encontró usuario. Por favor inicia sesión.',
        showCancel: false
      });
      return;
    }
    
    if (!selectedEmotion || !description) {
      showAlert({
        title: 'Campos requeridos',
        message: 'Por favor selecciona una emoción y escribe una descripción',
        showCancel: false
      });
      return;
    }
  
    setIsLoading(true);
    setError('');
  
    try {
      const emotionObj = emotions.find(e => e.id === selectedEmotion);
      const emotionLabel = emotionObj?.label || selectedEmotion;
  
      const formData = new FormData();
      const emotionData = {
        name: emotionLabel,
        description: description,
        userId: user.id
      };
  
      // Convertir el objeto a JSON string
      formData.append('emotion', JSON.stringify(emotionData));
  
      if (image && !keepCurrentImage) {
        formData.append('file', image);
      } else if (!keepCurrentImage && !image) {
        formData.append('removeImage', 'true');
      }
      
      const response = await axios.patch(
        `${getBackendUrl()}/emotion/update/${emotionId}`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Verificar respuesta exitosa
      if (response.status === 200) {
        setSelectedEmotion('');
        setDescription('');
        setImage(null);
        setImagePreview('');
        
        if (onUpdate) {
          onUpdate();
        }
  
        onClose();
      } else {
        throw new Error('Error al actualizar la emoción');
      }
  
    } catch (err) {
      console.error('Error:', err);
      showAlert({
        title: 'Error',
        message: 'Error al actualizar la emoción. Por favor revisa los datos e intenta nuevamente.',
        showCancel: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <PopupOverlay onClick={onClose}>
      <PopupContent onClick={e => e.stopPropagation()}>
        <h2>Editar emoción</h2>
        <Form onSubmit={handleSubmit}>
          <FormSection>
            <Label>¿Cómo te sientes?</Label>
            <EmotionSelect>
              {emotions.map(emotion => (
                <EmotionOption
                  key={emotion.id}
                  type="button"
                  selected={selectedEmotion === emotion.id}
                  onClick={() => setSelectedEmotion(emotion.id)}
                >
                  {emotion.icon} {emotion.label}
                </EmotionOption>
              ))}
            </EmotionSelect>
          </FormSection>

          <FormSection>
            <Label>Cuéntanos más sobre cómo te sientes</Label>
            <TextArea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe tus emociones..."
            />
          </FormSection>

          <FormSection>
            <Label>Imagen actual</Label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
              id="media-upload"
            />
            <label htmlFor="media-upload">
              <ImageContainer>
                <ImagePreview
                  style={imagePreview ? { 
                    backgroundImage: `url(${imagePreview})`,
                    cursor: 'pointer'
                  } : {}}
                >
                  {!imagePreview && 'Haz clic para cambiar la imagen'}
                </ImagePreview>
                {imagePreview && (
                  <DeleteButton onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}>
                    <i className="fi fi-rr-trash"></i>
                  </DeleteButton>
                )}
              </ImageContainer>
            </label>
          </FormSection>

          {error && <div style={{ color: 'red', fontSize: '14px' }}>{error}</div>}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </Form>
      </PopupContent>
    </PopupOverlay>
  );
};

export default EditEmotion;