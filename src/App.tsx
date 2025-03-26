import React, { useState } from 'react';
import styled from 'styled-components';
import Posts from './components/MuroSocial/Posts';
import CreatePost from './components/MuroSocial/CreatePost';
import Filters from './components/MuroSocial/Filters';
import EmotionDiary from './components/DiarioEmociones/EmotionDiary';

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
  width: 45px;
  height: 45px;
  border-radius: 50%;
  margin-bottom: 80px;
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
  overflow-y: scroll;
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

function App() {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('diary');

  const handleCreatePost = (post: any) => {
    console.log('New post:', post);
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'diary':
        return <EmotionDiary />;
      case 'posts':
        return (
          <>
            <ContentArea>
              <Posts />
            </ContentArea>
            <FiltersArea>
              <Filters onFilterChange={(filters) => console.log('Filters:', filters)} />
            </FiltersArea>
          </>
        );
      default:
        return <div>Sección en construcción</div>;
    }
  };

  return (
    <AppContainer>
      <Sidebar>
        <Logo src="/Logo.png" alt="Logo" />
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
        </ProfileIconContainer>
      </Sidebar>

      <Header>
        {activeSection === 'diary' ? 'Diario de emociones' : activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
      </Header>
      
      <MainContent>
        {renderContent()}
      </MainContent>

      {activeSection === 'posts' && (
        <CreateButton onClick={() => setIsCreatePostOpen(true)}>
          <i className="fi fi-rr-plus"></i>
        </CreateButton>
      )}

      <CreatePost
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onSubmit={handleCreatePost}
      />
    </AppContainer>
  );
}

export default App;