import React, { useState, useEffect } from 'react';
import { useAlert } from '../../context/AlertContext';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import CommentsSection from './CommentSection';
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

const LikeButton = styled(ActionButton)`
  color: #666;
  display: flex;
  align-items: center;
  gap: 6px;

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
  transition: opacity 0.2s ease;
  opacity: 0;

  &:hover {
    color: #ff4757;
    
    .fi {
      transform: scale(1.1);
    }
  }
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

  &:hover ${DeleteButton} {
    opacity: 1;
  }
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

interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
}

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
  rawDate: string;
  likes: number;
  comments: number;
  location?: string;
  tags?: TaggedUser[];
  userId: string;
}

interface PostsProps {
  userId: string;
  familyId: string | { id: string };
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  currentUserName: string;
  currentUserRole: string;
}


const Posts: React.FC<PostsProps> = ({ 
  userId, 
  familyId,
  posts,
  setPosts,
  currentUserName,
  currentUserRole
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const { showAlert } = useAlert();
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const [userLikeMap, setUserLikeMap] = useState<Record<string, string | null>>({});
  

  useEffect(() => {
    const fetchLikesData = async () => {
      const updatedLikes: Record<string, number> = {};
      const updatedUserLikes: Record<string, string | null> = {};
  
      for (const post of posts) {
        try {
          const countRes = await fetch(`http://localhost:8070/likes/post/${post.id}/count`);
          const count = await countRes.json();
          updatedLikes[post.id] = count;
  
          const likeRes = await fetch(`http://localhost:8070/likes/by-user?userId=${userId}&postId=${post.id}`);
          const likeData = await likeRes.json();
          updatedUserLikes[post.id] = likeData?.id || null;
        } catch (err) {
          console.error("Error fetching like data", err);
        }
      }
  
      setLikesMap(updatedLikes);
      setUserLikeMap(updatedUserLikes);
      setIsLoading(false);
    };
  
    if (posts.length > 0) fetchLikesData();
  }, [posts, userId]);
  
  const handleLike = async (postId: string) => {
    try {
      const res = await fetch("http://localhost:8070/likes/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, postId }),
      });
  
      const data = await res.json();
      setUserLikeMap(prev => ({ ...prev, [postId]: data.id }));
      setLikesMap(prev => ({ ...prev, [postId]: prev[postId] + 1 }));
    } catch (err) {
      showAlert({
        title: 'Error',
        message: 'Error al darle like a la publicación',
        showCancel: false
      });
    }
  };
  
  const handleUnlike = async (postId: string) => {
    const likeId = userLikeMap[postId];
    if (!likeId) return;
  
    try {
      await fetch(`http://localhost:8070/likes/unlike/${likeId}`, { method: "DELETE" });
      setUserLikeMap(prev => ({ ...prev, [postId]: null }));
      setLikesMap(prev => ({ ...prev, [postId]: prev[postId] - 1 }));
    } catch (err) {
      showAlert({
        title: 'Error',
        message: 'Error al quitarle el like a la publicación',
        showCancel: false
      });
    }
  };
  

  const fetchCommentsCount = async (postId: string) => {
    try {
      const response = await axios.get(`http://localhost:8070/comments/count/${postId}`);
      return response.data; // Esto debería ser el número total de comentarios
    } catch (error) {
      console.error('Error fetching comments count:', error);
      return 0; // Devuelve 0 si ocurre un error
    }
  };

  // Normalizar los posts para asegurarse de que todos los datos son consistentes
  const normalizePost = (post: any): Post => ({
    id: post.id,
    authorName: post.authorName,
    content: post.content,
    filesURL: post.filesURL,
    date: post.date,
    rawDate: post.rawDate || post.creationDate || new Date().toISOString(),
    likes: post.likes || 0,
    comments: post.comments || 0,
    location: post.location,
    tags: post.tags || [],
    userId: post.userId || post.user?.id || ''
  });

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      
      const [userPosts, familyPosts] = await Promise.all([
        axios.get(`http://localhost:8070/publications/user/${userId}`),
        axios.get(`http://localhost:8070/publications/family/${familyId}`)
      ]);

      // Combina los posts de ambas fuentes (usuario y familia)
      const combinedPosts = [
        ...userPosts.data.map(normalizePost),
        ...familyPosts.data.map(normalizePost)
      ];

      // Elimina posts duplicados
      const uniquePosts = combinedPosts.filter(
        (post, index, self) => index === self.findIndex(p => p.id === post.id)
      );

      // Ordena los posts por fecha (más recientes primero)
      const sortedPosts = uniquePosts.sort((a, b) => {
        const dateA = a.rawDate ? new Date(a.rawDate) : parseDate(a.date);
        const dateB = b.rawDate ? new Date(b.rawDate) : parseDate(b.date);
        return dateB.getTime() - dateA.getTime(); // Más reciente primero
      });

      // Obtener la cantidad de comentarios para cada post
      const postsWithCommentCount = await Promise.all(
        sortedPosts.map(async (post: Post) => {
          const commentsCount = await fetchCommentsCount(post.id);
          return { ...post, comments: commentsCount }; // Agregar el número de comentarios
        })
      );

      setPosts(postsWithCommentCount); // Actualiza el estado de los posts con la cantidad de comentarios
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
    if (familyId) {
      const fetchFamilyMembers = async () => {
        try {
          const response = await axios.get(`http://localhost:8070/family/${familyId}/members`);
          setFamilyMembers(response.data);
        } catch (error) {
          console.error('Error fetching family members:', error);
        }
      };
      fetchFamilyMembers();
    }
  }, [familyId]);

  useEffect(() => {
    const socket = new SockJS('http://localhost:8070/ws');
    const stompClient = Stomp.over(socket);
  
    stompClient.connect({}, () => {
      stompClient.subscribe('/topic/posts', (message) => {
        const newPost = JSON.parse(message.body);
        setPosts(prev => {
          // Si el post ya existe, mantenemos el orden actual
          if (prev.some(post => post.id === newPost.id)) return prev;
          
          // Normaliza el nuevo post para asegurar consistencia
          const normalizedPost = normalizePost(newPost);
          // Si el post tiene un ID que ya existe, lo reemplazamos
          
          // Inserta en la posición correcta manteniendo el orden
          return [...prev, normalizedPost]
            .sort((a, b) => {
              const dateA = a.rawDate ? new Date(a.rawDate) : parseDate(a.date);
              const dateB = b.rawDate ? new Date(b.rawDate) : parseDate(b.date);
              return dateB.getTime() - dateA.getTime();
            });
        });
      });
      
      // Suscripción para posts eliminados
      stompClient.subscribe('/topic/postDeleted', (message) => {
        const deletedPostId = message.body;
        setPosts(prev => prev.filter(post => post.id !== deletedPostId));
      });
      
      // Suscripción para actualización de contadores
      stompClient.subscribe('/topic/commentsCount', (message) => {
        const { postId, count } = JSON.parse(message.body);
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId ? { ...post, comments: count } : post
          )
        );
      });
    });
  
    return () => {
      if (stompClient.connected) {
        stompClient.disconnect();
      }
    };
  }, []);

  const parseDate = (dateString: string): Date => {
    // Intenta parsear como ISO primero
    const isoDate = new Date(dateString);
    if (!isNaN(isoDate.getTime())) return isoDate;
    
    // Si falla, usa el formato legible como respaldo
    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('/');
    const [time, modifier] = timePart.includes('a. m.') || timePart.includes('p. m.') 
      ? timePart.split(' ') 
      : [timePart, ''];
    
    let [hours, minutes] = time.split(':');
    
    if (modifier.includes('p. m.') && hours !== '12') {
      hours = String(Number(hours) + 12);
    } else if (modifier.includes('a. m.') && hours === '12') {
      hours = '00';
    }
    
    return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours.padStart(2, '0')}:${minutes}:00`);
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
    const confirmed = await showAlert({
      title: 'Eliminar publicación',
      message: '¿Estás seguro de que quieres eliminar esta publicación?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    });
    
    if (!confirmed || !postId) return;
    
    try {
      await axios.delete(`http://localhost:8070/publications/delete/${postId}`);
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      
      const socket = new SockJS('http://localhost:8070/ws');
      const stompClient = Stomp.over(socket);
      stompClient.connect({}, () => {
        stompClient.send("/app/deletePost", {}, JSON.stringify({ id: postId }));
      });
      
    } catch (err) {
      console.error('Error deleting post:', err);
      showAlert({
        title: 'Error',
        message: 'Error al eliminar la publicación',
        showCancel: false
      });
    }
  };

  if (isLoading) return (
    <>
    <Header>Publicaciones</Header>
      <LoadingContainer>
        <LoadingSpinner />
      </LoadingContainer>
    </>
  );

  if (error) return <div>{error}</div>;

  const handleCommentClick = (postId: string) => {
    setSelectedPostId(postId);
    setShowComments(true);
  };
  
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
              <LikeButton onClick={() =>
                userLikeMap[post.id] ? handleUnlike(post.id) : handleLike(post.id)
                }>
                <i className="fi fi-rr-heart"></i>
                <span>{likesMap[post.id] ?? post.likes ?? 0}</span>
              </LikeButton>

                <CommentButton onClick={() => handleCommentClick(post.id)}>
                  <i className="fi fi-rr-comment"></i>
                  <span>{post.comments || 0}</span>
                </CommentButton>
                
                {(post.userId && userId && (post.userId.toString() === userId.toString() || currentUserRole === 'Madre' || currentUserRole === 'Padre')) && (
                  <DeleteButton onClick={() => handleDeletePost(post.id)}>
                    <i className="fi fi-rr-trash"></i>
                  </DeleteButton>
                )}
              </PostActions>
            </PostCard>
          ))
        ) : (
          <div style={{ color: '#666', gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
            No hay publicaciones todavía
          </div>
        )}
      </PostsContainer>
      {showComments && selectedPostId && (
        <CommentsSection
          isOpen={showComments}
          onClose={() => setShowComments(false)}
          postId={selectedPostId}
          setPosts={setPosts}
          currentUser={{
            id: userId,
            firstName: currentUserName.split(' ')[0],
            lastName: currentUserName.split(' ')[1] || '',
            role: currentUserRole
          }}
          familyMembers={familyMembers}
        />
      )}
    </>
  );
};

export default Posts;