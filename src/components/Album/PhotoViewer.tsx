import React, { useState } from 'react';
import styled from 'styled-components';
import { useAlert } from '../../context/AlertContext';
import { getMediaType } from '../../utils/mediaUtils';

const ViewerOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const ViewerContent = styled.div`
  position: relative;
  width: 100%;
  max-width: 1600px;
  height: 85vh;
  display: flex;
  flex-direction: column;
`;

const ImageContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;

  img {
    max-width: 90%;
    max-height: 80%;
    object-fit: contain;
    transition: transform 0.3s;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: -40px;
  right: 15px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 10;

  &:hover {
    background: rgba(255, 255, 255, 0.4);
    transform: scale(1.1);
  }
`;

const NavButton = styled.button<{ left?: boolean; right?: boolean }>`
  position: absolute;
  top: 50%;
  ${props => props.left && 'left: 20px'};
  ${props => props.right && 'right: 20px'};
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  font-size: 22px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 10;

  &:hover {
    background: rgba(255, 255, 255, 0.4);
    transform: translateY(-50%) scale(1.1);
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
`;

const DeleteButton = styled.button`
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(255, 71, 87, 0.8);
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 30px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  z-index: 10;

  &:hover {
    background: rgba(255, 71, 87, 1);
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 14px;
  }
`;

const PhotoCounter = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  color: white;
  font-size: 16px;
  background: rgba(0, 0, 0, 0.5);
  padding: 5px 15px;
  border-radius: 20px;
  z-index: 10;
`;

const PhotoActions = styled.div`
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 15px;
  z-index: 20;
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const CloseIcon = styled.i`
  position: absolute;
  top: 56%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 15px;
`;

const RightIcon = styled.i`
  position: absolute;
  top: 53%;
  left: 53%;
  transform: translate(-50%, -50%);
  font-size: 20px;
`;

const LeftIcon = styled.i`
  position: absolute;
  top: 53%;
  left: 47%;
  transform: translate(-50%, -50%);
  font-size: 20px;
`;

const MediaContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;

  img, video {
    max-width: 90%;
    max-height: 80%;
    object-fit: contain;
    transition: transform 0.3s;
  }

  video {
    background: black;
  }
`;

interface MediaViewerProps {
  media: Array<{
    id: string;
    url: string;
    type?: 'image' | 'video' | 'gif';
  }>;
  initialIndex: number;
  onClose: () => void;
  onDelete?: (id: string) => void;
  canDelete?: boolean;
  onSetCover?: (url: string) => void;
  canSetCover?: boolean;
}

const PhotoViewer: React.FC<MediaViewerProps> = ({
  media,
  initialIndex,
  onClose,
  onDelete,
  canDelete,
  onSetCover,
  canSetCover
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const currentMedia = media[currentIndex];
  const mediaType = getMediaType(currentMedia.url);
  const [zoom, setZoom] = useState(1);
  const { showAlert } = useAlert();

  const handlePrev = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : media.length - 1));
    setZoom(1);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev < media.length - 1 ? prev + 1 : 0));
    setZoom(1);
  };

  const handleDelete = async () => {
    const confirmed = await showAlert({
      title: 'Eliminar media',
      message: '¿Estás seguro de que quieres eliminar este elemento del álbum?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    });
  
    if (!confirmed) return;
  
    if (onDelete) {
      try {
        onDelete(media[currentIndex].id);
        if (media.length === 1) {
          onClose();
        } else if (currentIndex === media.length - 1) {
          setCurrentIndex(currentIndex - 1);
        }
      } catch (error) {
        showAlert({ 
          title: 'Error', 
          message: 'Ocurrió un error al eliminar el elemento'
        });
      }
    }
  };

  const handleSetCover = () => {
    if (onSetCover && currentMedia.type === 'image') {
      onSetCover(currentMedia.url);
      showAlert({ 
        title: 'Éxito', 
        message: 'Portada del álbum actualizada',
      });
    }
  };

  const handleZoom = (e: React.WheelEvent) => {
    if (currentMedia.type === 'image') {
      e.stopPropagation();
      setZoom(prev => {
        const newZoom = e.deltaY < 0 ? prev * 1.1 : prev / 1.1;
        return Math.min(Math.max(newZoom, 0.5), 3);
      });
    }
  };

  if (media.length === 0) return null;

  return (
    <ViewerOverlay onClick={onClose}>
      <ViewerContent onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <CloseIcon className="fi fi-rr-cross"></CloseIcon>
        </CloseButton>
        
        <PhotoActions>
          {canSetCover && currentMedia.type === 'image' && (
            <ActionButton onClick={handleSetCover}>
              <i className="fi fi-rr-picture"></i> Establecer como portada
            </ActionButton>
          )}
          {canDelete && (
            <ActionButton 
              onClick={handleDelete}
              style={{ background: 'rgba(255, 71, 87, 0.7)' }}
            >
              <i className="fi fi-rr-trash"></i> Eliminar
            </ActionButton>
          )}
        </PhotoActions>
        
        <NavButton left onClick={handlePrev}>
          <LeftIcon className="fi fi-rr-angle-left"></LeftIcon>
        </NavButton>
        
        <MediaContainer onWheel={mediaType === 'image' ? handleZoom : undefined}>
          {mediaType === 'image' || mediaType === 'gif' ? (
            <img 
              src={currentMedia.url} 
              alt="" 
              style={{ transform: `scale(${zoom})` }}
            />
          ) : (
            <video 
              src={currentMedia.url} 
              controls
              autoPlay
              style={{ width: '100%', height: '100%' }}
            />
          )}
        </MediaContainer>
        
        <NavButton right onClick={handleNext}>
          <RightIcon className="fi fi-rr-angle-right"></RightIcon>
        </NavButton>
      </ViewerContent>
    </ViewerOverlay>
  );
};
export default PhotoViewer;