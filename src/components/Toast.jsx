import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import './Toast.css';

const Toast = ({ message, type, onClose }) => {
  const icons = {
    success: <CheckCircle size={18} className="toast-icon success" />,
    error: <AlertCircle size={18} className="toast-icon error" />,
    info: <Info size={18} className="toast-icon info" />,
  };

  return (
    <div className={`toast-message toast-${type} animate-slide-up`}>
      {icons[type] || icons.info}
      <span className="toast-text">{message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Close">
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
