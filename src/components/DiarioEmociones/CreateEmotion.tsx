import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

interface CreateEmotionProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (emotion: any) => void;
}

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
  height: 180px;
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

  &:hover {
    opacity: 0.95;
  }
`;

const emotions = [
  { id: 'tristeza', icon: '☹️', label: 'Tristeza' },
  { id: 'alegria', icon: '☺️', label: 'Alegría' },
  { id: 'calma', icon: '😌', label: 'Calma' },
  { id: 'enojo', icon: '😠', label: 'Enojo' },
  { id: 'miedo', icon: '😨', label: 'Miedo' },
  { id: 'sorpresa', icon: '😲', label: 'Sorpresa' }
];

const CreateEmotion: React.FC<CreateEmotionProps> = ({ isOpen, onClose, onSubmit }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEmotion || !description) {
      setError('Por favor selecciona una emoción y escribe una descripción');
      return;
    }
  
    setIsLoading(true);
    setError('');
  
    try {
      const emotionObj = emotions.find(e => e.id === selectedEmotion);
      const emotionLabel = emotionObj?.label || selectedEmotion;
  
      // Crear FormData en lugar de JSON
      const formData = new FormData();
      formData.append('emotion', JSON.stringify({
        name: emotionLabel,
        description: description
      }));
      
      // Agregar la imagen si existe
      if (image) {
        formData.append('file', image);
      }
  
      const response = await axios.post('http://localhost:8070/emotion/new', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
  
      console.log('Emoción creada:', response.data);
      
      // Limpiar formulario
      setSelectedEmotion('');
      setDescription('');
      setImage(null);
      setImagePreview('');
      setIsCreateOpen(false);
  
      // Opcional: llamar a onSubmit para actualizar la lista
      if (onSubmit) {
        onSubmit(response.data);
      }
  
    } catch (err) {
      setError('Error al crear la emoción. Por favor intenta nuevamente.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };


  if (!isOpen) return null;

  return (
    <PopupOverlay onClick={onClose}>
      <PopupContent onClick={e => e.stopPropagation()}>
        <h2>Nueva entrada en el diario</h2>
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
            <Label>Agrega una foto o video</Label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
              id="media-upload"
            />
            <label htmlFor="media-upload">
              <ImagePreview
                style={imagePreview ? { backgroundImage: `url(${imagePreview})` } : {}}
              >
                {!imagePreview && 'Haz clic para subir una imagen o video'}
              </ImagePreview>
            </label>
          </FormSection>

          <Button type="submit">Guardar entrada</Button>
        </Form>
      </PopupContent>
    </PopupOverlay>
  );
};

export default CreateEmotion; 