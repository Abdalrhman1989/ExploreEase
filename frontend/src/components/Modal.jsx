// src/components/Modal.jsx

import React from 'react';
import { FaTimes } from 'react-icons/fa';
import '../styles/Modal.css';

const Modal = ({ children, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose} aria-modal="true" role="dialog">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose} aria-label="Close Modal">
          <FaTimes />
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
