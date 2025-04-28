import React from 'react';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';

// Estilos principales
const MarkdownContainer = styled.div`
  font-size: 15px;
  color: #333;
  line-height: 1.8;

  h1, h2, h3, h4, h5, h6 {
    color: #4a90e2;
    margin-top: 1.2rem;
    margin-bottom: 0.7rem;
    font-weight: bold;
    font-size: 1.7em;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  ul, ol {
    padding-left: 24px;
    margin: 0.8rem 0;
  }

  li {
    margin: 5px 0;
    padding-left: 28px;
    position: relative;
    list-style: none;
  }

  li::before {
    content: "✅"; /* ícono para items principales */
    position: absolute;
    left: 0;
    top: 2px;
  }

  li li::before {
    content: "🔹"; /* ícono para sublistas */
  }

  ul ul, ol ol {
    padding-left: 24px;
    margin-top: 5px;
  }

  blockquote {
    margin: 10px 0;
    padding: 15px;
    background-color: #f3e5f5;
    border-left: 5px solid #7b1fa2;
    border-radius: 8px;
    color: #555;
    font-style: italic;
    position: relative;
  }

  blockquote::before {
    content: "💬";
    position: absolute;
    left: -30px;
    top: 5px;
    font-size: 20px;
  }

  strong {
    background: #f0f0f0;
    padding: 2px 6px;
    border-radius: 4px;
    color: #000;
  }
`;

// Función para asignar iconos a títulos
const getIconForHeading = (text: string) => {
  const lower = text.toLowerCase();
  if (/(actividad|actividades|juegos)/.test(lower)) return '🎯';
  if (/(familia|familiares|hogar|padres|hijos)/.test(lower)) return '👨‍👩‍👧‍👦';
  if (/(naturaleza|bosque|árbol|parque|senderismo)/.test(lower)) return '🌳';
  if (/(creativas|arte|manualidades|dibujar|pintar)/.test(lower)) return '🎨';
  if (/(tranquilas|descanso|relajación|calma)/.test(lower)) return '🛌';
  if (/(activas|deporte|jugar|moverse)/.test(lower)) return '🏃‍♂️';
  if (/(cocinar|comida|postres|cena)/.test(lower)) return '🍔';
  if (/(aprender|educación|idiomas|estudio)/.test(lower)) return '📚';
  if (/(viajar|explorar|cultura|nuevos lugares)/.test(lower)) return '✈️';
  return '✨';
};

interface MarkdownMessageProps {
  content: string;
}

const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content }) => {
  return (
    <MarkdownContainer>
      <ReactMarkdown
        components={{
          h1({ children }) {
            return <h1>{getIconForHeading(children?.toString() || '')} {children}</h1>;
          },
          h2({ children }) {
            return <h2>{getIconForHeading(children?.toString() || '')} {children}</h2>;
          },
          h3({ children }) {
            return <h3>{getIconForHeading(children?.toString() || '')} {children}</h3>;
          },
          h4({ children }) {
            return <h4>{getIconForHeading(children?.toString() || '')} {children}</h4>;
          },
          h5({ children }) {
            return <h5>{getIconForHeading(children?.toString() || '')} {children}</h5>;
          },
          h6({ children }) {
            return <h6>{getIconForHeading(children?.toString() || '')} {children}</h6>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </MarkdownContainer>
  );
};

export default MarkdownMessage;