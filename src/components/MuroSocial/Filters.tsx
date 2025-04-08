import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const FiltersContainer = styled.div`
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 320px;
  position: fixed;
  top: 80px;
  height: fit-content;
  z-index: 99;
  
  &.internal-scroll {
  }
`;

const FiltersHeader = styled.div`
  color: #333;
  font-size: 20px;
  font-weight: 500;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
  margin-bottom: 25px;
`;

const FilterSection = styled.div`
  margin-bottom: 20px;

  &:last-of-type {
    margin-bottom: 25px;
  }
`;

const FilterTitle = styled.h3`
  color: #666;
  font-size: 16px;
  margin-bottom: 12px;
  font-weight: 500;
`;

const FilterOption = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  cursor: pointer;

  &:last-child {
    margin-bottom: 0;
  }
`;

const RadioButton = styled.input`
  margin-right: 12px;
  cursor: pointer;
  width: 18px;
  height: 18px;
  accent-color: #4a90e2;
`;

const Label = styled.label`
  color: #333;
  cursor: pointer;
  font-size: 14px;
`;

const DateInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-bottom: 10px;
  font-size: 14px;
  color: #333;

  &:focus {
    outline: none;
    border-color: #4a90e2;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const DateLabel = styled.div`
  color: #666;
  font-size: 14px;
  margin-bottom: 6px;
`;

const ClearButton = styled.button`
  width: 100%;
  padding: 12px;
  background: linear-gradient(90deg, #4a90e2 0%, #7b1fa2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    opacity: 0.95;
    transform: scale(1.02);
  }
`;

interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
}

interface FiltersProps {
  onFilterChange: (filters: any) => void;
  familyMembers: FamilyMember[];
  currentUserId: string;
}

const Filters: React.FC<FiltersProps> = ({ 
  onFilterChange, 
  familyMembers,
  currentUserId
}) => {
  const [filters, setFilters] = useState({
    author: '',
    dateFrom: '',
    dateTo: '',
    mediaType: ''
  });

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleAuthorChange = (authorId: string) => {
    setFilters(prev => ({
      ...prev,
      author: authorId
    }));
  };

  const handleDateChange = (type: 'from' | 'to', value: string) => {
    setFilters(prev => ({
      ...prev,
      [`date${type.charAt(0).toUpperCase() + type.slice(1)}`]: value
    }));
  };

  const handleMediaTypeChange = (type: string) => {
    setFilters(prev => ({
      ...prev,
      mediaType: type
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      author: '',
      dateFrom: '',
      dateTo: '',
      mediaType: ''
    });
  };

  return (
    <FiltersContainer className="internal-scroll">
      <FiltersHeader>Filtros</FiltersHeader>
      
      <FilterSection>
        <FilterTitle>Publicado por</FilterTitle>
        {familyMembers.map(member => (
          member.id !== currentUserId && (
            <FilterOption key={member.id}>
              <RadioButton 
                type="radio" 
                name="author" 
                id={`member-${member.id}`}
                checked={filters.author === member.id}
                onChange={() => handleAuthorChange(member.id)}
              />
              <Label htmlFor={`member-${member.id}`}>
                {member.firstName} {member.lastName}
              </Label>
            </FilterOption>
          )
        ))}
        <FilterOption>
          <RadioButton 
            type="radio" 
            name="author" 
            id="yo" 
            checked={filters.author === 'yo'}
            onChange={() => handleAuthorChange('yo')}
          />
          <Label htmlFor="yo">Yo</Label>
        </FilterOption>
      </FilterSection>

      <FilterSection>
        <FilterTitle>Fecha publicación</FilterTitle>
        <DateLabel>Desde:</DateLabel>
        <DateInput 
          type="date" 
          value={filters.dateFrom}
          onChange={(e) => handleDateChange('from', e.target.value)}
        />
        <DateLabel>Hasta:</DateLabel>
        <DateInput 
          type="date" 
          value={filters.dateTo}
          onChange={(e) => handleDateChange('to', e.target.value)}
        />
      </FilterSection>

      <FilterSection>
        <FilterTitle>Tipo de multimedia</FilterTitle>
        <FilterOption>
          <RadioButton 
            type="radio" 
            name="media" 
            id="foto" 
            checked={filters.mediaType === 'foto'}
            onChange={() => handleMediaTypeChange('foto')}
          />
          <Label htmlFor="foto">Foto</Label>
        </FilterOption>
        <FilterOption>
          <RadioButton 
            type="radio" 
            name="media" 
            id="video" 
            checked={filters.mediaType === 'video'}
            onChange={() => handleMediaTypeChange('video')}
          />
          <Label htmlFor="video">Video</Label>
        </FilterOption>
        <FilterOption>
          <RadioButton 
            type="radio" 
            name="media" 
            id="gif" 
            checked={filters.mediaType === 'gif'}
            onChange={() => handleMediaTypeChange('gif')}
          />
          <Label htmlFor="gif">Gif</Label>
        </FilterOption>
        <FilterOption>
          <RadioButton 
            type="radio" 
            name="media" 
            id="none" 
            checked={filters.mediaType === 'none'}
            onChange={() => handleMediaTypeChange('none')}
          />
          <Label htmlFor="none">Sin multimedia</Label>
        </FilterOption>
      </FilterSection>

      <ClearButton onClick={handleClearFilters}>Limpiar</ClearButton>
    </FiltersContainer>
  );
};

export default Filters;