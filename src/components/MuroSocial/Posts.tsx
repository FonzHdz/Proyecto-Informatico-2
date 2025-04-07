import React, { useState, useEffect } from 'react';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import styled from 'styled-components';
import axios from 'axios';

interface TaggedUser {
  id: string;
  name: string;
}

interface Post {
  id: string;
  authorName: string;
  content: string;
  filesURL: string;
  date: string;
  likes: number;
  comments: number;
  location?: string;
  tags?: TaggedUser[];
  userId: string;
}

interface PostsProps {
  userId: string;
  familyId: string;
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  currentUserName: string;
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
    margin-bottom: 2px;
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

const LikeButton = styled(ActionButton)<{ liked?: boolean }>`
  color: ${props => props.liked ? '#ff4757' : '#666'};

  &:hover {
    color: #ff4757;
    
    .fi {
      transform: scale(1.1);
    }
  }
`;

const CommentButton = styled(ActionButton)`
  &:hover {
    color: #4a90e2;
    
    .fi {
      transform: scale(1.1);
    }
  }
`;

const DeleteButton = styled(ActionButton)`
  margin-left: auto;

  &:hover {
    color: #ff4757;
    
    .fi {
      transform: scale(1.1);
    }
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  height: calc(100vh - 80px); /* Resta la altura del header */
  margin-top: -15px; /* Compensa el padding del header */
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

const LocationTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #f0f7ff;
  color: #1a73e8;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 12px;
  margin-top: 8px;

  i {
    font-size: 12px;
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
`;

const UserTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #e8f0fe;
  color: #1a73e8;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 12px;

  i {
    font-size: 12px;
  }
`;

const Posts: React.FC<PostsProps> = ({ 
  userId, 
  familyId,
  posts,
  setPosts,
  currentUserName
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      
      const [userPosts, familyPosts] = await Promise.all([
        axios.get(`http://localhost:8070/publications/user/${userId}`),
        axios.get(`http://localhost:8070/publications/family/${familyId}`)
      ]);
  
      // Normalizar los datos para asegurar que todos los posts tengan userId
      const normalizePost = (post: any): Post => ({
        id: post.id,
        authorName: post.authorName,
        content: post.content,
        filesURL: post.filesURL,
        date: post.date,
        likes: post.likes || 0,
        comments: post.comments || 0,
        location: post.location,
        tags: post.tags || [],
        userId: post.userId || post.user?.id || '' // Asegurar que siempre haya userId
      });
  
      const combinedPosts = [
        ...userPosts.data.map(normalizePost),
        ...familyPosts.data.map(normalizePost)
      ];
      
      // Eliminar duplicados
      const uniquePosts = combinedPosts.filter(
        (post, index, self) => index === self.findIndex(p => p.id === post.id)
      );
  
      // Ordenar por fecha
      const sortedPosts = uniquePosts.sort((a, b) => {
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        return dateB.getTime() - dateA.getTime();
      });
  
      setPosts(sortedPosts);
      setError(null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Error al cargar las publicaciones');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId && familyId) {
      fetchPosts();
    }
  }, [userId, familyId]);

  useEffect(() => {
    const socket = new SockJS('http://localhost:8070/ws');
    const stompClient = Stomp.over(socket);
  
    stompClient.connect({}, () => {
      stompClient.subscribe('/topic/posts', (message) => {
        const newPost = JSON.parse(message.body);
        setPosts(prev => {
          // Verificar si el post ya existe para evitar duplicados
          const postExists = prev.some(post => post.id === newPost.id);
          return postExists ? prev : [newPost, ...prev];
        });
      });
      
      stompClient.subscribe('/topic/postDeleted', (message) => {
        const deletedPostId = message.body;
        setPosts(prev => prev.filter(post => post.id !== deletedPostId));
      });
    });
  
    return () => stompClient.disconnect();
  }, []);

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

  const isEmptyFile = (file: any): boolean => {
    return (
      !file ||
      file === null ||
      file === '[null]' ||
      (Array.isArray(file) && file[0] === null)
    );
  };

  const handleDeletePost = async (postId: string) => {
    if (!postId || !window.confirm('¿Eliminar esta publicación?')) return;
    
    try {
      // Asegúrate de que la URL coincida exactamente con el endpoint del backend
      await axios.delete(`http://localhost:8070/publications/delete/${postId}`);
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      
      // Opcional: Notificar a través de WebSocket
      const socket = new SockJS('http://localhost:8070/ws');
      const stompClient = Stomp.over(socket);
      stompClient.connect({}, () => {
        stompClient.send("/app/deletePost", {}, JSON.stringify({ id: postId }));
      });
      
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Error al eliminar la publicación');
    }
  };

  if (isLoading) return (
    <LoadingContainer>
      <LoadingSpinner />
    </LoadingContainer>
  );

  if (error) return <div>{error}</div>;

  return (
    <>
      <Header>Publicaciones</Header>
      <PostsContainer>
        {posts.length > 0 ? (
          posts.map(post => (
            <PostCard key={post.id}>
              <PostHeader>
                <Avatar>
                  {post.authorName ? post.authorName[0] : 'U'}
                </Avatar>
                <PostInfo>
                  <h4>
                    {post.authorName === currentUserName ? 'Yo' : post.authorName || 'Usuario desconocido'}
                  </h4>
                  <small>
                    {post.date}
                  </small>
                </PostInfo>
              </PostHeader>
              
              {post.content && <PostContent>{post.content}</PostContent>}
              
              {post.tags && post.tags.length > 0 && (
                <TagsContainer>
                  {post.tags.map(tag => (
                    <UserTag key={tag.id}>
                      <i className="fi fi-rr-user"></i>
                      {tag.name}
                    </UserTag>
                  ))}
                </TagsContainer>
              )}
              
              {post.location && (
                <LocationTag>
                  <i className="fi fi-rr-marker"></i>
                  {post.location}
                </LocationTag>
              )}

              {post.filesURL && !isEmptyFile(post.filesURL) && (() => {
                const url = post.filesURL;
                const extension = url.split('.').pop()?.toLowerCase().split('?')[0];

                if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
                  return (
                    <PostImage 
                      src={url}
                      alt={`Publicación de ${post.authorName || 'usuario'}`}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  );
                }

                if (['mp4', 'webm', 'mov'].includes(extension || '')) {
                  return (
                    <video controls style={{ width: '100%', borderRadius: '8px', marginTop: '10px' }}>
                      <source src={url} type={`video/${extension}`} />
                      Tu navegador no soporta el elemento de video.
                    </video>
                  );
                }

                return null;
              })()}

              <PostActions>
                <LikeButton>
                  <i className="fi fi-rr-heart"></i>
                  <span>{post.likes || 0}</span>
                </LikeButton>
                
                <CommentButton>
                  <i className="fi fi-rr-comment"></i>
                  <span>{post.comments || 0}</span>
                </CommentButton>
                
                {post.userId && userId && post.userId.toString() === userId.toString() && (
                <DeleteButton onClick={() => handleDeletePost(post.id)}>
                  <i className="fi fi-rr-trash"></i>
                </DeleteButton>
              )}
              </PostActions>
            </PostCard>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            No hay publicaciones aún
          </div>
        )}
      </PostsContainer>
    </>
  );
};

export default Posts;