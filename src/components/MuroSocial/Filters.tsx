import React from 'react';
import styled from 'styled-components';

const FiltersContainer = styled.div`
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 320px;
  position: sticky;
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

interface FiltersProps {
  onFilterChange: (filters: any) => void;
}

const Filters: React.FC<FiltersProps> = ({ onFilterChange }) => {
  return (
    <FiltersContainer className="internal-scroll">
      <FiltersHeader>Filtros</FiltersHeader>
      
      <FilterSection>
        <FilterTitle>Publicado por</FilterTitle>
        <FilterOption>
          <RadioButton type="radio" name="author" id="mama" />
          <Label htmlFor="mama">Mamá</Label>
        </FilterOption>
        <FilterOption>
          <RadioButton type="radio" name="author" id="papa" />
          <Label htmlFor="papa">Papá</Label>
        </FilterOption>
        <FilterOption>
          <RadioButton type="radio" name="author" id="hermano" />
          <Label htmlFor="hermano">Hermano</Label>
        </FilterOption>
        <FilterOption>
          <RadioButton type="radio" name="author" id="yo" />
          <Label htmlFor="yo">Yo</Label>
        </FilterOption>
      </FilterSection>

      <FilterSection>
        <FilterTitle>Fecha publicación</FilterTitle>
        <DateLabel>Desde:</DateLabel>
        <DateInput type="date" />
        <DateLabel>Hasta:</DateLabel>
        <DateInput type="date" />
      </FilterSection>

      <FilterSection>
        <FilterTitle>Tipo de multimedia</FilterTitle>
        <FilterOption>
          <RadioButton type="radio" name="media" id="foto" />
          <Label htmlFor="foto">Foto</Label>
        </FilterOption>
        <FilterOption>
          <RadioButton type="radio" name="media" id="video" />
          <Label htmlFor="video">Video</Label>
        </FilterOption>
        <FilterOption>
          <RadioButton type="radio" name="media" id="gif" />
          <Label htmlFor="gif">Gif</Label>
        </FilterOption>
      </FilterSection>

      <ClearButton>Limpiar</ClearButton>
    </FiltersContainer>
  );
};

export default Filters; 