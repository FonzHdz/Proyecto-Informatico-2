import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAlert } from '../../context/AlertContext';
import { getMediaType } from '../../utils/mediaUtils';
import PhotoViewer from './PhotoViewer';
import Modal from '../Modal';
import axios from 'axios';

const Container = styled.div`
  margin: 0 auto;
  width: 100%;
  padding-left: 80px;
  margin-right: -38px;
  background: white;
  overflow: auto;
  margin-top: -20px;
  margin-bottom: -20px;
`;

const BackButton = styled.button`
  background: linear-gradient(90deg, #4a90e2 0%, #7b1fa2 100%);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50px;
  cursor: pointer;
  margin-bottom: 20px;
  margin-top: 20px;
  display: flex;
  margin-left: -57px;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const BackIcon = styled.i`
  position: relative;
  top: 33%;
  left: 48%;
  transform: translate(-50%, -50%);
  font-size: 18px;
`;

const ActionButton = styled.button`
  background: #4a90e2;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  margin-left: 10px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  margin-left: -10px;
  flex-wrap: wrap;
`;

const AlbumTitle = styled.h2`
  color: #333;
  margin-bottom: 25px;
  font-size: 28px;
  display: flex;
  align-items: center;
  gap: 15px;
  font-weight: 600;
`;

const EditButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 18px;
  margin-top: 10px;
  transition: all 0.2s;

  &:hover {
    color: #4a90e2;
    transform: scale(1.1);
  }
`;

const YearSection = styled.div`
  margin-bottom: 50px;
`;

const YearHeader = styled.h3`
  color: #444;
  font-size: 22px;
  margin-bottom: 20px;
  padding-bottom: 8px;
  border-bottom: 2px solid #eee;
  width: 95%;
`;

const MonthSection = styled.div`
  margin-bottom: 30px;
`;

const MonthHeader = styled.h4`
  color: #555;
  font-size: 18px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PhotosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const PhotoWrapper = styled.div`
  position: relative;
  border-radius: 5px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }
`;

const MediaContainer = styled.div`
  height: 220px;
  position: relative;
  cursor: pointer;
`;

const ImageDisplay = styled.div<{ url: string }>`
  width: 100%;
  height: 100%;
  background-image: url(${props => props.url});
  background-size: cover;
  background-position: center;
`;

const VideoDisplay = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #000;
`;

const GifDisplay = styled.div<{ url: string }>`
  width: 100%;
  height: 100%;
  background-image: url(${props => props.url});
  background-size: cover;
  background-position: center;
  
  &::after {
    content: 'GIF';
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(0,0,0,0.7);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
  }
`;

const PhotoActions = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  padding: 15px 10px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 10;

  ${PhotoWrapper}:hover & {
    opacity: 1;
  }
`;

const PhotoActionButton = styled.button`
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  border: none;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;

  &:hover {
    background: white;
    transform: scale(1.05);
  }

  &.delete {
    background: rgba(255, 71, 87, 0.9);
    color: white;

    &:hover {
      background: #ff4757;
    }
  }
`;

const EmptyAlbum = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  color: #666;
  background: #f9f9f9;
  border-radius: 10px;
  margin: 20px 0;

  svg {
    font-size: 50px;
    margin-bottom: 20px;
    color: #ccc;
  }
`;

const TitleInput = styled.input`
  color: #333;
  margin-bottom: 25px;
  font-size: 28px;
  display: flex;
  align-items: center;
  gap: 15px;
  font-weight: 500;
  
  border: transparent;
  width: 100%;
  margin-bottom: 20px;
  transition: all 0.3s;

  &:focus {
    outline: none;
  }
`;

const AddPhotosModalContent = styled.div`
  max-height: 70vh;
  overflow-y: auto;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const ModalHeader = styled.div`
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-radius: 8px 8px 0 0;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: #333;
  font-size: 20px;
`;

const ModalCloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  padding: 5px;

  &:hover {
    color: #333;
  }
`;

const PostGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 15px;
  margin: 20px 0;
`;

const PostItem = styled.div<{ selected: boolean }>`
  position: relative;
  height: 180px;
  background-size: cover;
  background-position: center;
  border-radius: 5px;
  cursor: pointer;
  border: 3px solid ${props => props.selected ? '#4a90e2' : 'white'};
  transition: all 0.3s ease;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
`;

const Checkbox = styled.div<{ selected: boolean }>`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.selected ? '#4a90e2' : 'rgba(255, 255, 255, 0.8)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 250px);
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #4a90e2;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 15px 20px;
  border-top: 1px solid #eee;
  background: white;
  border-radius: 0 0 8px 8px;
`;

const SelectedCount = styled.span`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
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
    font-size: 25px;
  }
`;

const Icon = styled.i`
  position: absolute;
  top: 56%;
  left: 53%;
  transform: translate(-50%, -50%);
  font-size: 25px;
`;

interface PhotoData {
  id: string;
  url: string;
  createdAt: string;
}

interface AlbumDetailProps {
  album: {
    id: string;
    title: string;
    description: string;
    coverImageUrl: string;
    type: string;
    familyId: string;
  };
  onBack: () => void;
  userId: string;
  userRole: string;
  familyId: string;
}

const AlbumDetail: React.FC<AlbumDetailProps> = ({ 
    album: initialAlbum, 
    onBack, 
    userId,
    userRole,
    familyId
  }) => {
    const [album, setAlbum] = useState(initialAlbum);
    const [photos, setPhotos] = useState<PhotoData[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [showAddPhotos, setShowAddPhotos] = useState(false);
    const [showEditTitle, setShowEditTitle] = useState(false);
    const [albumTitle, setAlbumTitle] = useState(album.title);
    const [availablePosts, setAvailablePosts] = useState<any[]>([]);
    const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
    const { showAlert } = useAlert();

    const fetchAlbumPhotos = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8070/albums/${album.id}/photos`);
        setPhotos(response.data);
      } catch (error) {
        showAlert({ title: 'Error', message: 'No se pudieron cargar las fotos del álbum' });
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchAlbumPhotos();
    }, [album.id]);

    const groupedPhotos = photos.reduce((acc, photo) => {
      const date = new Date(photo.createdAt);
      const year = date.getFullYear();
      const month = date.toLocaleString('default', { month: 'long' });
      
      if (!acc[year]) {
        acc[year] = {};
      }
      
      if (!acc[year][month]) {
        acc[year][month] = [];
      }
      
      acc[year][month].push(photo);
      return acc;
    }, {} as Record<number, Record<string, PhotoData[]>>);

    const fetchAvailablePosts = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8070/publications/family/${familyId}/available-photos`,
          { params: { albumId: album.id } }
        );
        setAvailablePosts(response.data);
      } catch (error) {
        showAlert({ title: 'Error', message: 'No se pudieron cargar los posts disponibles' });
      }
    };

    const handleAddPhotos = async () => {
      try {
        await axios.post(`http://localhost:8070/albums/${album.id}/add-posts`, {
          postIds: selectedPosts
        });
        showAlert({ 
          title: 'Éxito', 
          message: `Se agregaron ${selectedPosts.length} fotos al álbum`,
        });
        setShowAddPhotos(false);
        setSelectedPosts([]);
        fetchAlbumPhotos();
      } catch (error) {
        showAlert({ title: 'Error', message: 'No se pudieron agregar las fotos' });
      }
    };

    const handleUpdateTitle = async () => {
      if (!albumTitle.trim()) {
        showAlert({ title: 'Error', message: 'El nombre del álbum no puede estar vacío' });
        return;
      }

      try {
        const response = await axios.put(`http://localhost:8070/albums/${album.id}`, {
          title: albumTitle
        });
        
        setAlbum(prev => ({ ...prev, title: albumTitle }));
        
        showAlert({ 
          title: 'Éxito', 
          message: 'Nombre del álbum actualizado',
        });
        setShowEditTitle(false);
      } catch (error) {
        showAlert({ title: 'Error', message: 'No se pudo actualizar el nombre' });
        setAlbumTitle(album.title);
      }
    };

    const handleSetCover = async (photoUrl: string) => {
      try {
        await axios.put(`http://localhost:8070/albums/${album.id}/cover`, {
          coverImageUrl: photoUrl
        });
        showAlert({ 
          title: 'Éxito', 
          message: 'Portada del álbum actualizada',
        });
      } catch (error) {
        showAlert({ title: 'Error', message: 'No se pudo actualizar la portada' });
      }
    };

    const handleDeletePhoto = async (photoId: string) => {
      try {
        await axios.delete(`http://localhost:8070/albums/${album.id}/photos/${photoId}`);
        
        const updatedPhotos = photos.filter(photo => photo.id !== photoId);
        setPhotos(updatedPhotos);
      } catch (error) {
        showAlert({ 
          title: 'Error', 
          message: 'No se pudo eliminar la foto'
        });
      }
    };

    const openPhotoViewer = (photoId: string) => {
      const flatPhotos = Object.values(groupedPhotos)
        .flatMap(year => Object.values(year))
        .flat();
      const index = flatPhotos.findIndex(p => p.id === photoId);
      setCurrentPhotoIndex(index);
      setViewerOpen(true);
    };

    const allPhotos = React.useMemo(() => {
      return Object.values(groupedPhotos)
        .flatMap(year => Object.values(year))
        .flat();
    }, [groupedPhotos]);

    if (loading) {
      return (
        <Container>
          <BackButton onClick={onBack}>
              <BackIcon className="fi fi-rr-left"></BackIcon>
          </BackButton>
          <LoadingContainer>
            <LoadingSpinner />
          </LoadingContainer>
        </Container>
      );
    }

    return (
      <Container>
        <BackButton onClick={onBack}>
          <BackIcon className="fi fi-rr-left"> </BackIcon>
        </BackButton>

        {showEditTitle ? (
          <div>
            <TitleInput 
              value={albumTitle}
              onChange={(e) => setAlbumTitle(e.target.value)}
              placeholder="Nuevo nombre del álbum"
              maxLength={50}
            />
            <ButtonGroup>
              <ActionButton onClick={handleUpdateTitle}>
                <i className="fi fi-rr-check"></i> Guardar Cambios
              </ActionButton>
              <ActionButton 
                onClick={() => {
                  setAlbumTitle(album.title);
                  setShowEditTitle(false);
                }}
                style={{ background: '#ff4757' }}
              >
                <i className="fi fi-rr-cross"></i> Cancelar
              </ActionButton>
            </ButtonGroup>
          </div>
        ) : (
          <AlbumTitle>
            {album.title}
            {(userRole === 'Madre' || userRole === 'Padre') && (
              <EditButton onClick={() => setShowEditTitle(true)}>
                <i className="fi fi-rr-edit"></i>
              </EditButton>
            )}
          </AlbumTitle>
        )}
        
        {Object.entries(groupedPhotos).length > 0 ? (
          Object.entries(groupedPhotos)
            .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
            .map(([year, months]) => {              
              return (
                <YearSection key={year}>
                  <YearHeader>{year}</YearHeader>
                  {Object.entries(months)
                    .sort(([monthA], [monthB]) => {
                      const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio", 
                                        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
                      return monthNames.indexOf(monthB) - monthNames.indexOf(monthA);
                    })
                    .map(([month, monthPhotos]) => {                      
                      return (
                        <MonthSection key={`${year}-${month}`}>
                          <MonthHeader>
                            <i className="fi fi-rr-calendar"></i>
                            {month.charAt(0).toUpperCase() + month.slice(1)}
                          </MonthHeader>
                          <PhotosGrid>
                          {monthPhotos.map(media => {
                            const mediaType = getMediaType(media.url);                            
                            return (
                              <PhotoWrapper key={media.id}>
                                <MediaContainer onClick={() => openPhotoViewer(media.id)}>
                                  {mediaType === 'video' ? (
                                    <>
                                      <VideoDisplay 
                                        src={media.url} 
                                        muted 
                                        loop
                                        playsInline
                                      />
                                      <div style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        color: 'white',
                                        fontSize: '40px',
                                        opacity: 0.8
                                      }}>
                                        <i className="fi fi-rr-play" />
                                      </div>
                                    </>
                                  ) : mediaType === 'gif' ? (
                                    <GifDisplay url={media.url} />
                                  ) : (
                                    <ImageDisplay url={media.url} />
                                  )}
                                </MediaContainer>
                              </PhotoWrapper>
                            );
                          })}
                          </PhotosGrid>
                        </MonthSection>
                      );
                    })}
                </YearSection>
              );
            })
        ) : (
          <EmptyAlbum>
            <i className="fi fi-rr-camera"></i>
            <h3>Este álbum está vacío</h3>
            <p>Agrega fotos para comenzar a llenar tus recuerdos</p>
            <ActionButton 
              onClick={() => {
                fetchAvailablePosts();
                setShowAddPhotos(true);
              }}
              style={{ marginTop: '20px' }}
            >
              <i className="fi fi-rr-plus"></i> Agregar Fotos
            </ActionButton>
          </EmptyAlbum>
        )}

        <Modal 
          isOpen={showAddPhotos} 
          onClose={() => {
            setShowAddPhotos(false);
            setSelectedPosts([]);
          }}
        >
          <ModalHeader>
            <ModalTitle>Agregar fotos al álbum</ModalTitle>
            <ModalCloseButton onClick={() => setShowAddPhotos(false)}>
              <i className="fi fi-rr-cross"></i>
            </ModalCloseButton>
          </ModalHeader>
          
          <AddPhotosModalContent>
            {availablePosts.length > 0 ? (
              <>
                <PostGrid>
                  {availablePosts.map(post => {
                    const mediaType = getMediaType(post.filesURL);
                    
                    return (
                      <PostItem
                        key={post.id}
                        style={{ 
                          backgroundImage: mediaType === 'image' || mediaType === 'gif' 
                            ? `url(${post.filesURL})` 
                            : 'none'
                        }}
                        selected={selectedPosts.includes(post.id)}
                        onClick={() => 
                          setSelectedPosts(prev => 
                            prev.includes(post.id) 
                              ? prev.filter(id => id !== post.id) 
                              : [...prev, post.id]
                          )
                        }
                      >
                        {mediaType === 'video' && (
                          <>
                            <VideoDisplay 
                              src={post.filesURL}
                              muted
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0
                              }}
                            />
                            <div style={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              color: 'white',
                              fontSize: '24px',
                              zIndex: 1
                            }}>
                              <i className="fi fi-rr-play"></i>
                            </div>
                          </>
                        )}
                        
                        <Checkbox selected={selectedPosts.includes(post.id)}>
                          {selectedPosts.includes(post.id) && <i className="fi fi-rr-check"></i>}
                        </Checkbox>
                      </PostItem>
                    );
                  })}
                </PostGrid>
              </>
            ) : (
              <EmptyAlbum>
                <i className="fi fi-rr-box-open"></i>
                <h3>No hay fotos disponibles</h3>
                <p>No se encontraron publicaciones con fotos para agregar a este álbum</p>
              </EmptyAlbum>
            )}
          </AddPhotosModalContent>
          
          <ModalFooter>
            <SelectedCount>
              {selectedPosts.length} {selectedPosts.length === 1 ? 'foto seleccionada' : 'fotos seleccionadas'}
            </SelectedCount>
            <div style={{ display: 'flex', gap: '10px' }}>
              <ActionButton 
                onClick={() => {
                  setShowAddPhotos(false);
                  setSelectedPosts([]);
                }}
                style={{ background: '#ff4757' }}
              >
                Cancelar
              </ActionButton>
              <ActionButton 
                onClick={handleAddPhotos}
                disabled={selectedPosts.length === 0}
              >
                Agregar {selectedPosts.length} {selectedPosts.length === 1 ? 'foto' : 'fotos'}
              </ActionButton>
            </div>
          </ModalFooter>
        </Modal>

        <FloatingActions>
          <FloatingButton onClick={() => {
              fetchAvailablePosts();
              setShowAddPhotos(true);
            }}
          >
          <Icon className="fi fi-rr-add-image"></Icon>
          </FloatingButton>
        </FloatingActions>

        {viewerOpen && (
          <PhotoViewer
            media={allPhotos.map(photo => ({
              ...photo,
              type: getMediaType(photo.url)
            }))}
            initialIndex={currentPhotoIndex}
            onClose={() => setViewerOpen(false)}
            onDelete={(photoId) => {
              if (userRole === 'Madre' || userRole === 'Padre') {
                handleDeletePhoto(photoId);
              }
            }}
            canDelete={userRole === 'Madre' || userRole === 'Padre'}
            onSetCover={(mediaUrl) => handleSetCover(mediaUrl)}
            canSetCover={userRole === 'Madre' || userRole === 'Padre'}
          />
        )}
      </Container>
    );
};

export default AlbumDetail;