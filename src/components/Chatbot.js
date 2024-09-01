import React from 'react';
import { Rnd } from 'react-rnd';
import { X } from 'lucide-react';

const Chatbot = ({ position, size, onResize, onClose }) => {
  const isMobile = window.innerWidth <= 768;

  return (
    <Rnd
      default={{
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height,
      }}
      minWidth={300}
      minHeight={400}
      bounds="window"
      onDragStop={(e, d) => onResize(null, null, null, null, { x: d.x, y: d.y })}
      onResize={(e, direction, ref, delta, position) =>
        onResize(e, direction, ref, delta, position)
      }
      disableDragging={isMobile}
      enableResizing={!isMobile}
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'white',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
      className={isMobile ? 'fixed inset-0 z-50' : ''}
    >
      <div className="bg-purple-700 text-white p-2 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Assistant</h3>
        <button onClick={onClose} className="text-white">
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Chatbot content will go here */}
        
      </div>
    </Rnd>
  );
};

export default Chatbot;