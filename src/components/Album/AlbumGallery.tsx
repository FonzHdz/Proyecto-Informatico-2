import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import AlbumCard from '../Album/AlbumCard';
import { useAlert } from '../../context/AlertContext';
import { getBackendUrl } from '../../utils/api';
import axios from 'axios';

const GalleryContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  padding: 20px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  background: white;
`;

const Header = styled.div`
  background: linear-gradient(90deg, #4a90e2 0%, #7b1fa2 100%);
  padding: 15px 40px;
  color: white;
  font-size: 24px;
  font-weight: 500;
  position: fixed;
  top: 0;
  left: 80px;
  right: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: 60px;
`;

const FloatingActions = styled.div`
  position: fixed;
  bottom: 30px;
  right: 30px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 150;
`;

const FloatingButton = styled.button`
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

  &:hover {
    transform: scale(1.05);
    opacity: 0.95;
  }

  i {
    font-size: 20px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 140px);
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

// Estilos del modal de creación
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 200;
`;

const ModalContent = styled.div`
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.h2`
  font-size: 22px;
  margin-bottom: 20px;
  color: #333;
  font-weight: 600;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #555;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #4a90e2;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #4a90e2;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #4a90e2;
  }
`;

const PostGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 15px;
`;

const PostCard = styled.div<{ selected?: boolean }>`
  border: 2px solid ${props => props.selected ? '#4a90e2' : '#eee'};
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.selected ? '#f0f7ff' : 'white'};

  &:hover {
    border-color: ${props => props.selected ? '#4a90e2' : '#ccc'};
  }
`;

const PostImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PostTitle = styled.div`
  padding: 8px;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 25px;
`;

const Button = styled.button<{ primary?: boolean }>`
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${props => props.primary 
    ? `
      background: linear-gradient(90deg, #4a90e2 0%, #7b1fa2 100%);
      color: white;
    `
    : `
      background: #f5f5f5;
      color: #666;
    `
  }

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

// Interfaces
interface Album {
  id: string;
  userId: string;
  title: string;
  description: string;
  coverImageUrl: string;
  postCount: number;
  type: string;
  creationDate: string;
  familyId: string;
  posts?: any[];
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  familyId: string | { id: string };
  phoneNumber: string;
}

interface Post {
  id: string;
  filesURL: string;
  description: string;
  creationDate: string;
}

interface AlbumGalleryProps {
  user: User;
  setActiveSection: (section: string) => void;
  setSelectedAlbum: (album: Album) => void;
}

// Componente principal
const AlbumGallery: React.FC<AlbumGalleryProps> = ({ user, setActiveSection, setSelectedAlbum }) => {
  // Estados
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [availablePosts, setAvailablePosts] = useState<Post[]>([]);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [newAlbumData, setNewAlbumData] = useState({
    title: '',
    description: '',
    type: 'THEMATIC'
  });
  const { showAlert } = useAlert();

  const familyId = typeof user.familyId === 'string' ? user.familyId : user.familyId.id;

  // Efectos
  useEffect(() => {
    fetchAlbums();
  }, [familyId]);

  useEffect(() => {
    if (showCreateModal) {
      fetchAvailablePosts();
    }
  }, [showCreateModal, albums]);

  // Funciones
  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${getBackendUrl()}/albums/family/${familyId}`);
      setAlbums(response.data);
    } catch (error) {
      console.error('Error fetching albums:', error);
      showAlert({
        title: 'Error',
        message: 'No se pudieron cargar los álbumes',
        showCancel: false
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePosts = async () => {
    try {
      const response = await axios.get(`${getBackendUrl()}/publications/family/${familyId}/available-photos`);
      if (response.data && response.data.length > 0) {
        setAvailablePosts(response.data);
      } else {
        showAlert({
          title: 'Información',
          message: 'No hay posts con imágenes disponibles',
          showCancel: false
        });
      }
    } catch (error) {
      console.error('Error fetching available photos:', error);
      showAlert({
        title: 'Error',
        message: 'No se pudieron cargar las fotos disponibles',
        showCancel: false
      });
    }
  };

  const handleGenerateAlbums = async () => {
    try {
      setLoading(true);
      const initialAlbumCount = albums.length;
      
      const response = await axios.post(`${getBackendUrl()}/albums/generate/${familyId}`);
      
      const updatedResponse = await axios.get(`${getBackendUrl()}/albums/family/${familyId}`);
      const updatedAlbums = updatedResponse.data;
      setAlbums(updatedAlbums);
      
      const newAlbumsCount = updatedAlbums.length - initialAlbumCount;
      
      if (newAlbumsCount > 0) {
        showAlert({
          title: 'Éxito',
          message: `Se crearon ${newAlbumsCount} ${newAlbumsCount === 1 ? 'álbum nuevo' : 'álbumes nuevos'}`,
          showCancel: false
        });
      } else {
        showAlert({
          title: 'Información',
          message: 'No se crearon nuevos álbumes. No hay suficientes fotos para generar un nuevo álbum.',
          showCancel: false
        });
      }
    } catch (error) {
      console.error('Error generating albums:', error);
      showAlert({
        title: 'Error',
        message: 'Error al generar álbumes automáticos',
        showCancel: false
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlbum = async (albumId: string) => {
    const confirmed = await showAlert({
      title: 'Eliminar álbum',
      message: '¿Estás seguro de que deseas eliminar este álbum?',
      showCancel: true,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    });

    if (confirmed) {
      try {
        await axios.delete(`${getBackendUrl()}/albums/delete/${albumId}`);
        setAlbums(prev => prev.filter(album => album.id !== albumId));
        showAlert({
          title: 'Éxito',
          message: 'Álbum eliminado correctamente',
          showCancel: false
        });
      } catch (error) {
        console.error('Error deleting album:', error);
        showAlert({
          title: 'Error',
          message: 'No se pudo eliminar el álbum',
          showCancel: false
        });
      }
    }
  };

  const handleCreateAlbum = async () => {
    if (!newAlbumData.title.trim()) {
      showAlert({ title: 'Error', message: 'El título del álbum es requerido' });
      return;
    }
    
    if (selectedPosts.length === 0) {
      showAlert({
        title: 'Error',
        message: 'Por favor, selecciona al menos una foto',
        showCancel: false
      });
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${getBackendUrl()}/albums/create`, selectedPosts, {
        params: {
          title: newAlbumData.title,
          description: newAlbumData.description,
          familyId: familyId
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      showAlert({
        title: 'Éxito',
        message: 'Álbum creado correctamente',
        showCancel: false
      });
      setShowCreateModal(false);
      setNewAlbumData({ title: '', description: '', type: 'FAMILIA' });
      setSelectedPosts([]);
      await fetchAlbums();
    } catch (error) {
      console.error('Error creating album:', error);
      showAlert({
        title: 'Error',
        message: 'Error al crear el álbum',
        showCancel: false
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePostSelection = (postId: string) => {
    setSelectedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId) 
        : [...prev, postId]
    );
  };

  const canDeleteAlbum = (album: Album) => {
    return user.role === 'Madre' || user.role === 'Padre' || album.userId === user.id;
  };

  return (
    <>
      <Header>Álbum familiar</Header>

      {loading ? (
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      ) : (
        albums.length > 0 ? (
          <GalleryContainer>
            {albums.map(album => (
              <AlbumCard
                key={album.id}
                album={album}
                onClick={() => {
                  setSelectedAlbum(album);
                  setActiveSection('albumDetail');
                }}
                onDelete={() => handleDeleteAlbum(album.id)}
                showDelete={canDeleteAlbum(album)}
              />
            ))}
          </GalleryContainer>
        ) : (
          <div style={{ color: '#666', gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
            No hay álbumes creados
          </div>
        )
      )}

      <FloatingActions>
        <FloatingButton onClick={handleGenerateAlbums} title="Generar Álbumes Automáticos">
          <i className="fi fi-rr-artificial-intelligence"></i>
        </FloatingButton>
        <FloatingButton 
          onClick={() => setShowCreateModal(true)} 
          title="Crear Álbum Manual"
        >
          <i className="fi fi-rr-plus"></i>
        </FloatingButton>
      </FloatingActions>

      {showCreateModal && (
        <ModalOverlay onClick={() => setShowCreateModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>Crear nuevo álbum</ModalHeader>
            
            <FormGroup>
              <Label>Título del álbum *</Label>
              <Input
                type="text"
                value={newAlbumData.title}
                onChange={(e) => setNewAlbumData({...newAlbumData, title: e.target.value})}
                placeholder="Ej: Vacaciones en la playa 2023"
              />
            </FormGroup>
{/* 
            <FormGroup>
              <Label>Descripción</Label>
              <TextArea
                value={newAlbumData.description}
                onChange={(e) => setNewAlbumData({...newAlbumData, description: e.target.value})}
                placeholder="Añade una descripción para este álbum..."
              />
            </FormGroup> */}

            <FormGroup>
              <Label>Tipo de álbum</Label>
                <Select
                  value={newAlbumData.type}
                  onChange={(e) => setNewAlbumData({...newAlbumData, type: e.target.value})}
                >
                  <option value="FAMILIA">Familia</option>
                  <option value="VACACIONES">Vacaciones</option>
                  <option value="CELEBRACIONES">Celebraciones</option>
                  <option value="EVENTOS">Eventos</option>
                  <option value="MASCOTAS">Mascotas</option>
                  <option value="NATURALEZA">Naturaleza</option>
                  <option value="GASTRONOMIA">Gastronomía</option>
                  <option value="DEPORTES">Deportes</option>
                  <option value="ARTE">Arte</option>
                  <option value="ESCUELA">Escuela</option>
                  <option value="TRADICIONES">Tradiciones</option>
                  <option value="HOBBIES">Hobbies</option>
                  <option value="DECORACION">Decoración</option>
                  <option value="PROYECTOS">Proyectos</option>
                </Select>
            </FormGroup>

            <FormGroup>
              <Label>Selecciona posts para incluir ({selectedPosts.length} seleccionados) *</Label>
              {availablePosts.length > 0 ? (
                <PostGrid>
                  {availablePosts.map(post => (
                    <PostCard 
                      key={post.id}
                      selected={selectedPosts.includes(post.id)}
                      onClick={() => togglePostSelection(post.id)}
                    >
                      <PostImage 
                        src={post.filesURL} 
                        alt={post.description || post.filesURL} 
                      />
                      <PostTitle/>
                    </PostCard>
                  ))}
                </PostGrid>
              ) : (
                <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                  No hay posts disponibles para agregar a un álbum
                </div>
              )}
            </FormGroup>

            <ButtonGroup>
              <Button onClick={() => setShowCreateModal(false)}>
                Cancelar
              </Button>
              <Button 
                primary 
                onClick={handleCreateAlbum}
                disabled={loading || !newAlbumData.title || selectedPosts.length === 0}
              >
                {loading ? 'Creando...' : 'Crear Álbum'}
              </Button>
            </ButtonGroup>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

export default AlbumGallery;