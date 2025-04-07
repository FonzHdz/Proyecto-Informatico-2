import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios  from 'axios';

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
  padding: 20px;
  border-radius: 12px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  h2 {
    font-size: 18px;
    margin-bottom: 15px;
    color: #333;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FormLabel = styled.label`
  color: #666;
  font-size: 13px;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #4a90e2;
  }

  &::placeholder {
    color: #999;
  }
`;

const TextArea = styled.textarea`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;

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
  height: 150px;
  border: 2px dashed #ddd;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background-size: cover;
  background-position: center;
  color: #666;
  font-size: 14px;
`;

const MentionsContainer = styled.div`
  position: relative;
  width: 100%;
`;

const MentionsDropdown = styled.div<{ isVisible: boolean }>`
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  max-height: 180px;
  overflow-y: auto;
  display: ${props => props.isVisible ? 'block' : 'none'};
  z-index: 1001;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(74, 144, 226, 0.3);
    border-radius: 3px;
  }
`;

const MentionOption = styled.div`
  padding: 6px 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;

  &:hover {
    background: #f5f5f5;
  }
`;

const MentionAvatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #4a90e2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
  font-size: 13px;
`;

const MentionName = styled.span`
  color: #333;
  font-size: 13px;
`;

const SelectedMentions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 6px;
`;

const MentionTag = styled.div`
  background: #e3f2fd;
  color: #1976d2;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;

  button {
    background: none;
    border: none;
    color: #1976d2;
    cursor: pointer;
    padding: 0;
    font-size: 14px;
    display: flex;
    align-items: center;
    margin-left: 2px;
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 5px;

  &:hover {
    background: #357abd;
  }
`;

interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
}

interface CreatePostProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: any) => void;
  userId: string;
  familyId: string;
  familyMembers: FamilyMember[];
}

const CreatePost: React.FC<CreatePostProps> = ({ 
  isOpen, 
  onClose, 
  userId,
  familyId,
}) => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [location, setLocation] = useState('');
  const [mentionSearch, setMentionSearch] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [selectedMentions, setSelectedMentions] = useState<FamilyMember[]>([]);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && familyId) {
      const fetchFamilyMembers = async () => {
        try {
          setIsLoadingMembers(true);
          setMembersError(null);
          const response = await axios.get(`http://localhost:8070/family/${familyId}/members`);
          setFamilyMembers(response.data);
        } catch (err) {
          console.error('Error al obtener miembros de la familia:', err);
          setMembersError('No se pudieron cargar los miembros de la familia');
        } finally {
          setIsLoadingMembers(false);
        }
      };
      
      fetchFamilyMembers();
    }
  }, [isOpen, familyId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleMentionSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMentionSearch(value);
    setShowMentions(true);
  };

  const handleSelectMention = (member: FamilyMember) => {
    if (!selectedMentions.find(m => m.id === member.id)) {
      setSelectedMentions([...selectedMentions, member]);
    }
    setMentionSearch('');
    setShowMentions(false);
  };

  const handleRemoveMention = (memberId: string) => {
    setSelectedMentions(selectedMentions.filter(m => m.id !== memberId));
  };

  const filteredMembers = familyMembers.filter(
    member => `${member.firstName} ${member.lastName}`.toLowerCase()
      .includes(mentionSearch.toLowerCase()) &&
    !selectedMentions.find(m => m.id === member.id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) {
      setError('Por favor escribe una descripción');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      const postData = {
        description,
        location,
        userId,
        familyId
      };

      formData.append('post', new Blob([JSON.stringify(postData)], {
        type: 'application/json'
      }));
      
      if (image) {
        formData.append('file', image);
      }

      const response = await axios.post('http://localhost:8070/publications/new', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Enviando datos:', {
        description,
        location,
        userId,
        familyId,
        hasImage: !!image
      });
  
      console.log('Respuesta completa del servidor:', response.data);
  
      if (!response.data.id) {
        throw new Error('El servidor no devolvió un ID válido');
      }
  
      // Limpiar formulario
      setLocation('');
      setDescription('');
      setImage(null);
      setImagePreviewUrl('');
      setSelectedMentions([]);
      
      onClose();
  
    } catch (err) {
      setError('Error al crear la publicación. Por favor intenta nuevamente.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <PopupOverlay onClick={onClose}>
      <PopupContent onClick={e => e.stopPropagation()}>
        <h2>Crear nueva publicación</h2>
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        
        <Form onSubmit={handleSubmit}>
          <FormSection>
            <FormLabel htmlFor="image-input">Multimedia</FormLabel>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
              id="image-input"
            />
            <label htmlFor="image-input">
              <ImagePreview
                style={imagePreviewUrl ? { 
                  backgroundImage: `url(${imagePreviewUrl})`,
                  color: 'transparent'
                } : {}}
              >
                {!imagePreviewUrl && 'Haz clic para agregar un archivo multimedia'}
              </ImagePreview>
            </label>
          </FormSection>
          
          <FormSection>
            <FormLabel htmlFor="description">Descripción</FormLabel>
            <TextArea
              id="description"
              placeholder="¿Qué quieres compartir?"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </FormSection>
          
          <FormSection>
            <FormLabel htmlFor="location">Ubicación</FormLabel>
            <Input
              id="location"
              placeholder="Agrega una ubicación"
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
          </FormSection>
          
          <FormSection>
            <FormLabel htmlFor="mentions">Etiquetar personas</FormLabel>
            {membersError && <small style={{ color: 'red' }}>{membersError}</small>}
            <MentionsContainer>
              <Input
                id="mentions"
                placeholder={isLoadingMembers ? "Cargando miembros..." : "Buscar personas para etiquetar"}
                value={mentionSearch}
                onChange={handleMentionSearch}
                onFocus={() => setShowMentions(true)}
                onBlur={() => setTimeout(() => setShowMentions(false), 200)}
                disabled={isLoadingMembers}
              />
              
              {!isLoadingMembers && (
                <MentionsDropdown isVisible={showMentions && filteredMembers.length > 0}>
                  {filteredMembers.map(member => (
                    <MentionOption
                      key={member.id}
                      onClick={() => handleSelectMention(member)}
                    >
                      <MentionAvatar>
                        {member.firstName[0]}{member.lastName[0]}
                      </MentionAvatar>
                      <MentionName>
                        {member.firstName} {member.lastName}
                      </MentionName>
                    </MentionOption>
                  ))}
                </MentionsDropdown>
              )}
              
              <SelectedMentions>
                {selectedMentions.map(member => (
                  <MentionTag key={member.id}>
                    {member.firstName}
                    <button 
                      type="button"
                      onClick={() => handleRemoveMention(member.id)}
                    >
                      ×
                    </button>
                  </MentionTag>
                ))}
              </SelectedMentions>
            </MentionsContainer>
          </FormSection>
          
          <Button type="submit" disabled={isLoading || isLoadingMembers}>
            {isLoading ? 'Publicando...' : 'Publicar'}
          </Button>
        </Form>
      </PopupContent>
    </PopupOverlay>
  );
};

export default CreatePost;