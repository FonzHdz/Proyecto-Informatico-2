import React, { useState, useEffect  } from 'react';
import styled from 'styled-components';
import axios from 'axios';
 
 import { wait } from '@testing-library/user-event/dist/utils';

interface Post {
  id: string;
  author: string;
  content: string;
  imageUrl: string;
  date: string;
  likes?: number;
  comments?: number;
  location?: string;
  tags?: string[];
}

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
`;

const PostsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
  padding: 0;
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  background: white;
`;

const PostCard = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

const PostHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #4a90e2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
`;

const PostInfo = styled.div`
  flex: 1;

  h4 {
    color: #333;
    margin-bottom: 4px;
  }

  small {
    color: #666;
    font-size: 12px;
  }
`;

const PostContent = styled.p`
  color: #333;
  line-height: 1.5;
  margin-bottom: 15px;
`;

const PostImage = styled.img`
  width: 100%;
  border-radius: 8px;
  margin: 10px 0;
`;

const PostActions = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 14px;
  padding: 5px;

  &:hover {
    color: #4a90e2;
  }
`;

const Posts: React.FC = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [posts,setPosts] = useState<Post[]>([]);
  // Cargar datos desde la API
 useEffect(() => {
  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:8070/publications/all');
      
      // Transformamos los datos a la estructura esperada
      const formattedEmotions = response.data.map((item: any) => ({
        id: item.id,
        author: item.author, // Ajustar clave si es diferente
        content: item.content,
        imageUrl: item.fileUrl, // Ajustar clave si es diferente
        date: item.date,
        location: item.location
      }));

      setPosts(formattedEmotions);
    } catch (error) {
      console.error('Error al obtener las emociones:', error);
    }
  };
 
  fetchPosts();
}, []);

  return (
    <>
      <Header>Publicaciones</Header>
      <PostsContainer>
        {posts.map((post) => (
          <PostCard key={post.id}>
            <PostHeader>
              <Avatar>{post.author[0]}</Avatar>
              <PostInfo>
                <h4>{post.author}</h4>
                <small>{post.date}</small>
              </PostInfo>
            </PostHeader>
            <PostContent>{post.content}</PostContent>
            <PostImage src={post.imageUrl} alt="Post content" />
            <PostActions>
              <ActionButton>
                ❤️ {post.likes}
              </ActionButton>
              <ActionButton>
                💬 {post.comments}
              </ActionButton>
            </PostActions>
          </PostCard>
        ))}
      </PostsContainer>
    </>
  );
};

export default Posts; 