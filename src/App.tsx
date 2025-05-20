import React, { useState, useEffect } from 'react';
import { AlertProvider } from './context/AlertContext';
import styled from 'styled-components';
import Posts from './components/MuroSocial/Posts';
import CreatePost from './components/MuroSocial/CreatePost';
import Filters from './components/MuroSocial/Filters';
import EmotionDiary from './components/DiarioEmociones/EmotionDiary';
import Profile from './components/Perfil/Profile';
import Chat from './components/Chat/Chat';
import ChatBot from './components/ChatBot/ChatBot';
import AlbumGallery from './components/Album/AlbumGallery';
import AlbumDetail from './components/Album/AlbumDetail';
import axios from 'axios';

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  background: white;
`;

const Sidebar = styled.div`
  width: 80px;
  background: linear-gradient(180deg, #4a90e2 0%, #7b1fa2 100%);
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 200;
`;

const Logo = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-bottom: 80px;
  background: white;
  padding: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5)
`;

const MainIconsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: auto;
  width: 100%;
  margin-top: 20px;
`;

const ProfileIconContainer = styled.div`
  margin-bottom: 30px;
  width: 100%;
`;

const SidebarIcon = styled.div<{ active?: boolean }>`
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  opacity: ${props => props.active ? 1 : 0.6};

  i {
    font-size: 28px;
    color: white;
    position: relative;
    z-index: 2;
  }

  &::before {
    content: '';
    position: absolute;
    inset: 8px 0;
    background: ${props => props.active ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
    box-shadow: ${props => props.active ? '0 2px 4px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.1)' : 'none'};
    transition: all 0.3s ease;
  }

  &:hover {
    opacity: 1;
    &::before {
      background: rgba(255, 255, 255, 0.1);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.1);
    }
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-left: 80px;
  padding: 20px 40px;
  margin: 60px auto 0;
  width: calc(100% - 80px);
  height: calc(100vh - 80px);
  overflow-y: auto;
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

const ContentArea = styled.div`
  width: 100%;
  max-width: 700px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FiltersArea = styled.div`
  width: 320px;
  flex-shrink: 0;
`;

const CreateButton = styled.button`
  position: fixed;
  bottom: 30px;
  right: 30px;
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
  z-index: 150;

  &:hover {
    transform: scale(1.05);
    opacity: 0.95;
  }

  i {
    font-size: 24px;
    color: white;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
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

interface TaggedUser {
  id: string;
  name: string;
}

interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
}

interface Post {
  id: string;
  authorName: string;
  content: string;
  filesURL: string;
  date: string;
  rawDate: string;
  likes: number;
  comments: number;
  location?: string;
  tags?: TaggedUser[];
  userId: string;
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

function App() {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('chat');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<any | null>(null);
  const [filters, setFilters] = useState({
    author: '',
    dateFrom: '',
    dateTo: '',
    mediaType: ''
  });

  useEffect(() => {
    const checkAuth = () => {
      // Verificar parámetros URL
      const params = new URLSearchParams(window.location.search);
      const urlUser = getValidUser(params.get('user'));
      
      if (urlUser) {
        setCurrentUser(urlUser);
        localStorage.setItem('harmonichat_user', JSON.stringify(urlUser));
        window.history.replaceState({}, document.title, window.location.pathname);
        setIsCheckingAuth(false);
        return;
      }
      
      // Verificar localStorage
      const storedUser = getValidUser(localStorage.getItem('harmonichat_user'));
      if (storedUser) {
        setCurrentUser(storedUser);
        setIsCheckingAuth(false);
        return;
      }
      
      // Redirigir si no autenticado
      window.location.href = 'https://https://backend-hc.up.railway.app/';
    };
  
    checkAuth();
  }, []);

  const fetchFamilyMembers = async (familyId: string) => {
    try {
      setIsLoadingMembers(true);
      setMembersError(null);
      const response = await axios.get(`https://backend-hc.up.railway.app/family/${familyId}/members`);
      setFamilyMembers(response.data);
    } catch (error) {
      console.error('Error fetching family members:', error);
      setMembersError('No se pudieron cargar los miembros de la familia');
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const parseDate = (dateString: string) => {
    if (!dateString) return new Date();
    
    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('/');
    const [time, modifier] = timePart.split(' ');
    let [hours, minutes] = time.split(':');
    
    if (modifier === 'p. m.' && hours !== '12') {
      hours = String(Number(hours) + 12);
    }
    if (modifier === 'a. m.' && hours === '12') {
      hours = '00';
    }
  
    return new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`);
  };

  const applyFilters = (posts: Post[], filters: any, currentUserId: string, familyMembers: FamilyMember[]): Post[] => {
    let filteredPosts = [...posts];
  
    // Filtro por autor
    if (filters.author) {
      if (filters.author === 'yo') {
        filteredPosts = filteredPosts.filter(post => post.userId === currentUserId);
        console.log('currentUser en App.tsx:', currentUser);
      } else {
        filteredPosts = filteredPosts.filter(post => {
          const member = familyMembers.find(m => m.id === filters.author);
          return member && post.userId === member.id;
        });
      }
    }
  
    // Filtro por fecha
    if (filters.dateFrom || filters.dateTo) {
      filteredPosts = filteredPosts.filter(post => {
        const postDate = parseDate(post.date);
        const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
        const toDate = filters.dateTo ? new Date(filters.dateTo + 'T23:59:59') : null;
  
        if (fromDate && postDate < fromDate) return false;
        if (toDate && postDate > toDate) return false;
        return true;
      });
    }
  
    // Filtro por tipo de multimedia
    if (filters.mediaType) {
      filteredPosts = filteredPosts.filter(post => {
        const cleanUrl = post.filesURL?.split('?')[0];
        const extension = cleanUrl?.split('.').pop()?.toLowerCase();
        
        switch (filters.mediaType) {
          case 'foto':
            return ['jpg', 'jpeg', 'png'].includes(extension || '');
          case 'video':
            return ['mp4', 'mov', 'avi'].includes(extension || '');
          case 'gif':
            return extension === 'gif';
          case 'none':
            return !post.filesURL;
          default:
            return true;
        }
      });
    }
  
    return filteredPosts;
  };

  useEffect(() => {
    if (currentUser?.familyId) {
      const familyId = typeof currentUser.familyId === 'string' ? currentUser.familyId : currentUser.familyId.id;
      fetchFamilyMembers(familyId);
    }
  }, [currentUser]);

  const getValidUser = (userString: string | null) => {
    if (!userString) return null;
    
    try {
      const user = JSON.parse(userString);
      return user?.id ? user : null;
    } catch {
      return null;
    }
  };

  const handleCreatePost = () => {

  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  const handleLogout = () => {
    localStorage.removeItem('harmonichat_user');
    localStorage.removeItem('harmoniBotChatHistory');
    localStorage.removeItem('pendingChatBotMessages');
    
    setCurrentUser(null);
    window.location.href = 'https://backend-hc.up.railway.app/';
  };

  const renderContent = () => {
    if (isCheckingAuth || !currentUser) {
      return (
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      );
    }
  
    switch (activeSection) {
      case 'chat':
        return <Chat user={currentUser} />;
      case 'diary':
        return <EmotionDiary userId={currentUser.id} />;
      case 'posts':
        const filteredPosts = applyFilters(posts, filters, currentUser.id, familyMembers);
        return (
          <>
            <ContentArea>
              <Posts 
                userId={currentUser.id} 
                familyId={currentUser.familyId}
                posts={filteredPosts}
                setPosts={setPosts}
                currentUserName={`${currentUser.firstName} ${currentUser.lastName}`}
                currentUserRole={currentUser.role}
              />
            </ContentArea>
            <FiltersArea>
              <Filters 
                onFilterChange={setFilters}
                familyMembers={familyMembers}
                currentUserId={currentUser.id}
              />
            </FiltersArea>
          </>
        );
      case 'profile':
        return <Profile user={currentUser} setUser={setCurrentUser} />;
      case 'chatbot':
        return <ChatBot userId={currentUser.id} />;
      case 'album':
        return (
          <AlbumGallery
            user={currentUser}
            setActiveSection={setActiveSection}
            setSelectedAlbum={setSelectedAlbum}
          />
        );
      case 'albumDetail':
      return selectedAlbum ? (
        <AlbumDetail
          album={selectedAlbum}
          onBack={() => setActiveSection('album')}
          userId={currentUser.id} userRole={currentUser.role} 
          familyId={typeof currentUser.familyId === 'string' ? currentUser.familyId : currentUser.familyId.id}       />
      ) : (
        <div style={{ padding: '20px' }}>No se ha seleccionado ningún álbum.</div>
      );
      default:
        return (
          <div style={{ color: '#666', gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
           Sección en construcción
          </div>
        );
    }
  };  

  return (
    <AlertProvider>
      <AppContainer>
        <Sidebar>
          <Logo src="/Logo.png" alt="Logo" />
          {currentUser && (
            <>
              <MainIconsContainer>
                <SidebarIcon 
                  active={activeSection === 'chat'} 
                  onClick={() => handleSectionChange('chat')}
                >
                  <i className="fi fi-rr-messages"></i>
                </SidebarIcon>
                <SidebarIcon 
                  active={activeSection === 'diary'} 
                  onClick={() => handleSectionChange('diary')}
                >
                  <i className="fi fi-rr-grin"></i>
                </SidebarIcon>
                <SidebarIcon 
                  active={activeSection === 'album'} 
                  onClick={() => handleSectionChange('album')}
                >
                  <i className="fi fi-rr-grid"></i>
                </SidebarIcon>
                <SidebarIcon 
                  active={activeSection === 'posts'} 
                  onClick={() => handleSectionChange('posts')}
                >
                  <i className="fi fi-rr-camera"></i>
                </SidebarIcon>
                <SidebarIcon 
                  active={activeSection === 'chatbot'} 
                  onClick={() => handleSectionChange('chatbot')}
                >
                  <i className="fi fi-rr-robot"></i>
                </SidebarIcon>
              </MainIconsContainer>
              <ProfileIconContainer>
                <SidebarIcon 
                  active={activeSection === 'profile'} 
                  onClick={() => handleSectionChange('profile')}
                >
                  <i className="fi fi-rr-user"></i>
                </SidebarIcon>
                <SidebarIcon onClick={handleLogout}>
                  <i className="fi fi-rr-exit"></i>
                </SidebarIcon>
              </ProfileIconContainer>
            </>
          )}
        </Sidebar>

        <Header>
          {currentUser ? (
            <>
              {activeSection === 'diary' ? 'Diario de emociones' : 
               activeSection === 'chatbot' ? 'HarmoniBot': 
               activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
              <span style={{ float: 'right', fontSize: '16px' }}>
              </span>
            </>
          ) : (
            'HarmoniChat'
          )}
        </Header>
        
        <MainContent>
          {renderContent()}
        </MainContent>

        {currentUser && activeSection === 'posts' && (
          <CreateButton onClick={() => setIsCreatePostOpen(true)}>
            <i className="fi fi-rr-plus"></i>
          </CreateButton>
        )}
        {currentUser && (
          <CreatePost
            isOpen={isCreatePostOpen}
            onClose={() => setIsCreatePostOpen(false)}
            onSubmit={handleCreatePost}
            userId={currentUser.id}
            familyId={currentUser.familyId}
            familyMembers={familyMembers}
          />
        )}
      </AppContainer>
    </AlertProvider>
  );
}

export default App;