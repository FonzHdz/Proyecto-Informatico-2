import React, { useState, useEffect } from 'react';
import { useAlert } from '../../context/AlertContext';
import { getBackendUrl } from '../../utils/api';
import styled from 'styled-components';
import axios from 'axios';

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

const ProfileLayout = styled.div`
  display: flex;
  gap: 40px;
  max-width: 1200px;
  height: 100vh;
  margin: 0 auto;
  padding: 0 40px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

const MainContent = styled.div`
  flex: 1;
  max-width: 800px;
  width: 400px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: -40px;
`;

const ProfileCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
  width: 100%;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #4a90e2 0%, #7b1fa2 100%);
  }
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
  padding-top: 8px;
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #4a90e2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 32px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.2);
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h1`
  color: #2c3e50;
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
`;

const UserRole = styled.p`
  color: #7f8c8d;
  margin: 0;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '•';
    color: #4a90e2;
  }
`;

const SectionTitle = styled.h2`
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    width: 3px;
    height: 16px;
    background: #4a90e2;
    border-radius: 2px;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InfoLabel = styled.label`
  color: #7f8c8d;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoInput = styled.input`
  padding: 12px;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  font-size: 14px;
  color: #2c3e50;
  width: 100%;
  transition: all 0.2s ease;
  background: #f8f9fa;

  &:focus {
    outline: none;
    border-color: #4a90e2;
    background: white;
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
  }

  &:invalid {
    border-color: #e74c3c;
    box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
  }
`;

const InfoValue = styled.div`
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 14px;
  color: #2c3e50;
`;

const EditButton = styled.button`
  background: #4a90e2;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;

  &:hover {
    background: #357abd;
    transform: translateY(-1px);
  }
`;

const FamilySection = styled.div`
  width: 300px;
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.06);
  margin-top: -40px;
  align-self: center;
`;

const FamilyMembersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 4px;
`;

const FamilyMemberCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 12px;
  transition: all 0.2s ease;

  &:hover {
    background: #f8f9fa;
  }
`;

const MemberAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #4a90e2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  font-weight: 500;
`;

const MemberInfo = styled.div`
  flex: 1;
`;

const MemberName = styled.h3`
  color: #2c3e50;
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 500;
`;

const MemberRole = styled.p`
  color: #7f8c8d;
  margin: 0;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;

  &::before {
    content: '•';
    color: #4a90e2;
  }
`;

const ErrorMessage = styled.span`
  color: #e74c3c;
  font-size: 12px;
  margin-top: 4px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  height: calc(100vh - 80px);
  margin-top: -15px;
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

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  familyId: string | { id: string };
  phoneNumber: string;
}

interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

const Profile: React.FC<{ user: User; setUser: (user: User) => void }> = ({ user, setUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [phoneError, setPhoneError] = useState('');
  const { showAlert } = useAlert();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchFamilyMembers = async () => {
      try {
        const familyId = typeof user.familyId === 'string' ? user.familyId : user.familyId.id;
        const response = await axios.get(`${getBackendUrl()}/family/${familyId}/members`);
        setFamilyMembers(response.data);
      } catch (error) {
        console.error('Error fetching family members:', error);
        showAlert({
          title: 'Error',
          message: 'No se pudieron cargar los miembros de la familia.',
          showCancel: false,
        });
      }
    };

    fetchFamilyMembers();
  }, [user.familyId]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permite solo números y algunos caracteres especiales comunes en números de teléfono
    if (/^[0-9+\-\s]*$/.test(value)) {
      setEditedUser({ ...editedUser, phoneNumber: value });
      setPhoneError('');
    } else {
      setPhoneError('Solo se permiten números y los caracteres + - ');
    }
  };

  const validatePhone = (phone: string) => {
    // Validación básica: al menos 7 dígitos, máximo 15
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 7) {
      return 'El número debe tener al menos 7 dígitos';
    }
    if (digitsOnly.length > 15) {
      return 'El número no debe exceder 15 dígitos';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const response = await axios.put(`${getBackendUrl()}/user/${user.id}`, {
        email: editedUser.email,
        phoneNumber: editedUser.phoneNumber
      });

      setUser(response.data.user);
      setEditedUser(response.data.user);
      setIsEditing(false);
      setError('');
      showAlert({
        title: 'Perfil actualizado',
        message: 'Tu información fue guardada correctamente',
        showCancel: false
      });
    } catch (error) {
      console.error('Error updating user:', error);
      showAlert({
        title: 'Error',
        message: 'Error al actualizar los datos. Por favor, inténtalo de nuevo.',
        showCancel: false,
      });
      console.error('Error updating profile:', error);
      setError('Error al actualizar el perfil');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
    setPhoneError('');
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const validateForm = () => {
    const phoneValidationError = validatePhone(editedUser.phoneNumber || '');
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      return false;
    }
    return true;
  };

  return (
    <Header>Perfil
      <ProfileLayout>
        <MainContent>
          <ProfileCard>
            <ProfileHeader>
              <Avatar>{user.firstName[0]}</Avatar>
              <UserInfo>
                <UserName>{`${user.firstName} ${user.lastName}`}</UserName>
                <UserRole>{user.role}</UserRole>
              </UserInfo>
            </ProfileHeader>

            <SectionTitle>Información Personal</SectionTitle>
            <InfoGrid>
              <InfoItem>
                <InfoLabel>Correo electrónico</InfoLabel>
                {isEditing ? (
                  <div style={{ overflow: 'visible' }}>
                  <InfoInput
                    type="email"
                    value={editedUser.email}
                    onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                  />
                  </div>
                ) : (
                  <InfoValue>{user.email}</InfoValue>
                )}
              </InfoItem>
              <InfoItem>
                <InfoLabel>Teléfono</InfoLabel>
                {isEditing ? (
                  <>
                    <InfoInput
                      type="tel"
                      value={editedUser.phoneNumber || ''}
                      onChange={handlePhoneChange}
                      placeholder="Ej: 300 1234567"
                    />
                    {phoneError && <ErrorMessage>{phoneError}</ErrorMessage>}
                  </>
                ) : (
                  <InfoValue>{user.phoneNumber || 'No especificado'}</InfoValue>
                )}
              </InfoItem>
            </InfoGrid>
            {isEditing ? (
              <div style={{ display: 'flex', gap: '20px' }}>
                <EditButton onClick={handleSubmit}>Guardar cambios</EditButton>
                <EditButton 
                  onClick={handleCancel}
                  style={{ background: '#95a5a6' }}
                >
                  Cancelar
                </EditButton>
              </div>
            ) : (
              <EditButton onClick={handleEdit}>
                Editar información
              </EditButton>
            )}
          </ProfileCard>
        </MainContent>

        <FamilySection>
          <SectionTitle>Miembros de la Familia</SectionTitle>
          <FamilyMembersList>
          {familyMembers
            .filter(member => member.id !== user.id) // Filtra para excluir al usuario actual
            .map((member) => (
              <FamilyMemberCard key={member.id}>
                <MemberAvatar>{member.firstName[0]}</MemberAvatar>
                <MemberInfo>
                  <MemberName>{`${member.firstName} ${member.lastName}`}</MemberName>
                  <MemberRole>{member.role}</MemberRole>
                </MemberInfo>
              </FamilyMemberCard>
            ))}
        </FamilyMembersList>
        </FamilySection>
      </ProfileLayout>
    </Header>
  );
};

export default Profile;