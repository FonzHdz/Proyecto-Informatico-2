import React, { useState, useEffect, useRef } from 'react';
import { useAlert } from '../../context/AlertContext';
import { Stomp } from '@stomp/stompjs';
import { getBackendUrl } from '../../utils/api';
import SockJS from 'sockjs-client';
import styled from 'styled-components';
import axios from 'axios';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

const CommentsOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const CommentsContainer = styled.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  height: 70vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const CommentsHeader = styled.div`
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h3 {
    margin: 0;
    font-size: 18px;
    color: #333;
  }

  button {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #666;
    
    &:hover {
      color: #333;
    }
  }
`;

const CommentsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 15px;
`;

const CommentItem = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
`;

const CommentAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #4a90e2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  flex-shrink: 0;
`;

const CommentContent = styled.div`
  flex: 1;
  word-wrap: break-word;
  overflow: hidden;
`;

const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const CommentAuthor = styled.span`
  font-weight: 600;
  font-size: 14px;
  color: #333;
`;

const CommentTime = styled.span`
  font-size: 12px;
  color: #999;
`;

const CommentText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #333;
  line-height: 1.4;
`;

const CommentForm = styled.form`
  padding: 15px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
  position: relative; /* Para posicionar el picker de emojis de forma absoluta */
`;

const CommentInput = styled.input`
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
  font-size: 14px;

  &:focus {
    border-color: #4a90e2;
  }
`;

const CommentSubmit = styled.button`
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 0 15px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
  font-size: 14px;

  &:hover {
    background: #357abd;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(50vh);
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

const EmojiPickerWrapper = styled.div`
  position: absolute;
  bottom: 60px;
  left: 15px;
  z-index: 10;
`;

const EmojiButton = styled.button`
  display: flex;
  gap: 12px;
  margin-right: 0px;
  font-size: 20px;
  color: #666;
  align-items: center;
  background: none;
  border: none;
  i {
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: #4a90e2;
    }
  }
`;

const CommentDeleteButton = styled.button`
  position: absolute;
  top: 10px;
  right: 0;
  color: #666;
  border: none;
  border-radius: 50%;
  background: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;
  padding: 0;

  i {
    font-size: 12px;

    &:hover {
      color: #ff4757;
    }
  }
`;

const CommentItemContainer = styled.div`
  position: relative;
  width: 100%;

  &:hover ${CommentDeleteButton} {
    opacity: 1;
  }
`;

interface TaggedUser {
  id: string;
  name: string;
}

export interface Post {
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

interface Comment {
  id: string;
  content: string;
  creationDate: string;
  userId: string;
  postId: string;
}

interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
}

interface CommentsSectionProps {
    isOpen: boolean;
    onClose: () => void;
    postId: string;
    currentUser: {
      id: string;
      firstName: string;
      lastName: string;
      role: string;
    };
    familyMembers: UserInfo[];
    setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  }

const CommentsSection: React.FC<CommentsSectionProps> = ({ 
  isOpen, 
  onClose, 
  postId,
  setPosts,
  currentUser,
  familyMembers
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { showAlert } = useAlert();
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showEmojiPicker &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  useEffect(() => {
    if (!isOpen || !postId) return;

    const socket = new SockJS(`${getBackendUrl()}/ws`);
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
      const subscription = stompClient.subscribe(`/topic/comments/${postId}`, (message) => {
        const newCommentFromSocket = JSON.parse(message.body);
        setComments(prevComments => {
          // Evita duplicados
          if (prevComments.some(c => c.id === newCommentFromSocket.id)) {
            return prevComments;
          }
          return [newCommentFromSocket, ...prevComments];
        });
      });
  
      return () => {
        subscription.unsubscribe();
        stompClient.disconnect();
      };
    });
  
    return () => {
      if (stompClient.connected) {
        stompClient.disconnect();
      }
    };
  }, [isOpen, postId]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${getBackendUrl()}/comments/post/${postId}`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      showAlert({
        title: 'Error',
        message: 'No se pudieron cargar los comentarios',
        showCancel: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !postId) return;
    fetchComments();
  }, [isOpen, postId]);
  
  useEffect(() => {
    const socket = new SockJS(`${getBackendUrl()}/ws`);
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
      stompClient.subscribe('/topic/posts', (message) => {
        const newPost = JSON.parse(message.body);
        setPosts(prev => {
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

  useEffect(() => {
    if (!isOpen || !postId) return;
  
    const socket = new SockJS('https://backend-hc.up.railway.app/ws');
    const stompClient = Stomp.over(socket);
  
    stompClient.connect({}, () => {
      const countSubscription = stompClient.subscribe(`/topic/commentsCount/${postId}`, (message) => {
        const { count } = JSON.parse(message.body);
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId ? { ...post, comments: count } : post
          )
        );
      });
  
      return () => {
        countSubscription.unsubscribe();
        stompClient.disconnect();
      };
    });
  
    return () => {
      if (stompClient.connected) {
        stompClient.disconnect();
      }
    };
  }, [isOpen, postId, setPosts]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      await axios.post(`${getBackendUrl()}/comments/send`, {
        content: newComment,
        postId,
        userId: currentUser.id
      });

      setNewComment('');
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Error posting comment:', error);
      showAlert({
        title: 'Error',
        message: 'No se pudo publicar el comentario',
        showCancel: false
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const confirmed = await showAlert({
      title: 'Eliminar comentario',
      message: '¿Estás seguro de que quieres eliminar este comentario?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    });
    
    if (!confirmed) return;
    
    try {
      await axios.delete(`${getBackendUrl()}/comments/delete/${commentId}`);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId ? { 
            ...post, 
            comments: Math.max(0, post.comments - 1)
          } : post
        )
      );
    } catch (error) {
      console.error('Error deleting comment:', error);
      showAlert({
        title: 'Error',
        message: 'No se pudo eliminar el comentario',
        showCancel: false
      });
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    setNewComment(prev => prev + emoji.native);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds} seg`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} h`;
    return `hace ${Math.floor(seconds / 86400)} d`;
  };

  const getUserInfo = (userId: string) => {
    const user = familyMembers.find(member => member.id === userId) || currentUser;
    return {
      firstName: user?.firstName || 'Usuario',
      lastName: user?.lastName || ''
    };
  };

  if (!isOpen) return null;

  return (
    <CommentsOverlay onClick={onClose}>
      <CommentsContainer onClick={e => e.stopPropagation()}>
        <CommentsHeader>
          <h3>Comentarios</h3>
          <button onClick={onClose}>&times;</button>
        </CommentsHeader>
        
        <CommentsList>
        {isLoading ? (
            <LoadingContainer>
            <LoadingSpinner />
            </LoadingContainer>
        ) : comments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            No hay comentarios aún
            </div>
        ) : (
            comments.map(comment => {
            const userInfo = getUserInfo(comment.userId);
            return (
                <CommentItemContainer key={comment.id}>
                {(currentUser.id === comment.userId || 
                    currentUser.role === 'Madre' || 
                    currentUser.role === 'Padre') && (
                    <CommentDeleteButton 
                    onClick={() => handleDeleteComment(comment.id)}
                    title="Eliminar comentario"
                    >
                    <i className="fi fi-rr-trash" />
                    </CommentDeleteButton>
                )}
                <CommentItem>
                    <CommentAvatar>
                    {userInfo.firstName[0]}
                    </CommentAvatar>
                    <CommentContent>
                    <CommentHeader>
                        <CommentAuthor>
                        {userInfo.firstName} {userInfo.lastName}
                        </CommentAuthor>
                        <CommentTime>
                        {formatTimeAgo(comment.creationDate)}
                        </CommentTime>
                    </CommentHeader>
                    <CommentText>{comment.content}</CommentText>
                    </CommentContent>
                </CommentItem>
                </CommentItemContainer>
            );
            })
        )}
        </CommentsList>
        
        <CommentForm onSubmit={handleSubmitComment}>
          <EmojiButton 
            type="button" 
            ref={emojiButtonRef}
            onClick={(e) => {
              e.stopPropagation();
              setShowEmojiPicker(prev => !prev);
            }}
            title="Emoji"
          >
            <i className="fi fi-rr-smile" />
          </EmojiButton>
          {showEmojiPicker && (
            <EmojiPickerWrapper ref={emojiPickerRef} className="emoji-picker">
              <Picker 
                data={data}
                theme="light"
                onEmojiSelect={handleEmojiSelect}
                locale="es"
                onClickOutside={() => setShowEmojiPicker(false)}
              />
            </EmojiPickerWrapper>
          )}
          <CommentInput
            ref={inputRef}
            type="text"
            placeholder="Añade un comentario..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <CommentSubmit 
            type="submit" 
            disabled={!newComment.trim() || isSubmitting}
          >
            Publicar
          </CommentSubmit>
        </CommentForm>
      </CommentsContainer>
    </CommentsOverlay>
  );
};

export default CommentsSection;