import React from 'react';
import styled from 'styled-components';

const Card = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  height: 360px;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
  }
`;

const CoverImage = styled.div<{ imageUrl: string }>`
  height: 270px;
  background-image: url(${props => props.imageUrl || '/default-album.jpg'});
  background-size: cover;
  background-position: center;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40px;
    background: linear-gradient(to top, rgba(0,0,0,0.5), transparent);
  }
`;

const Info = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Title = styled.h3`
  margin: 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Meta = styled.div`
  display: flex;
  justify-content: space-between;
  color: #777;
  font-size: 13px;
  font-weight: 400;
`;

const Badge = styled.span<{ type: string }>`
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
  background: ${props =>
    props.type === 'VACACIONES' ? '#ff7675' :
    props.type === 'CELEBRACIONES' ? '#74b9ff' :
    props.type === 'FAMILIA' ? '#55efc4' :
    props.type === 'MASCOTAS' ? '#a29bfe' :
    props.type === 'EVENTOS' ? '#ffeaa7' :
    props.type === 'NATURALEZA' ? '#00b894' :
    props.type === 'GASTRONOMIA' ? '#e17055' :
    props.type === 'DEPORTES' ? '#0984e3' :
    props.type === 'ARTE' ? '#6c5ce7' :
    props.type === 'ESCUELA' ? '#fd79a8' :
    props.type === 'TRADICIONES' ? '#fdcb6e' :
    props.type === 'HOBBIES' ? '#636e72' :
    props.type === 'DECORACION' ? '#a5cbda' :
    props.type === 'PROYECTOS' ? '#5e4ae3' :
    '#dfe6e9'};
  color: white;
  text-transform: capitalize;
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.8);
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;
  color: #ff4757;
  z-index: 2;

  &:hover {
    color: white;
    background: rgba(255, 71, 87, 0.6);
  }

  ${Card}:hover & {
    opacity: 1;
  }
`;

interface Album {
  id: string;
  title: string;
  description: string;
  coverImageUrl: string;
  postCount: number;
  type: string;
  creationDate: string;
}

interface AlbumCardProps {
  album: Album;
  onClick: () => void;
  onDelete?: () => void;
  showDelete?: boolean;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ album, onClick, onDelete, showDelete }) => {

  const translateAlbumType = (type: string) => {
    const types: Record<string, string> = {
      FAMILIA: 'Familia',
      VACACIONES: 'Vacaciones',
      CELEBRACIONES: 'Celebraciones',
      EVENTOS: 'Eventos',
      MASCOTAS: 'Mascotas',
      NATURALEZA: 'Naturaleza',
      GASTRONOMIA: 'Gastronomía',
      DEPORTES: 'Deportes',
      ARTE: 'Arte',
      ESCUELA: 'Escuela',
      TRADICIONES: 'Tradiciones',
      HOBBIES: 'Hobbies',
      DECORACION: 'Decoración',
      PROYECTOS: 'Proyectos'
    };
    return types[type] || type;
  };

  return (
    <Card onClick={onClick}>
      {showDelete && onDelete && (
        <DeleteButton onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}>
          <i className="fi fi-rr-trash"></i>
        </DeleteButton>
      )}
      <CoverImage imageUrl={album.coverImageUrl} />
      <Info>
        <Title title={album.title}>{album.title}</Title>
        <Meta>
          <span>{album.postCount} fotos</span>
          <Badge type={album.type}>
            {translateAlbumType(album.type)}
          </Badge>
        </Meta>
      </Info>
    </Card>
  );
};

export default AlbumCard;