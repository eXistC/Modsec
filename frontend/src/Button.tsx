import React from 'react';
import { ButtonProps } from './types';
import styles from './Auth.module.css';

export const Button: React.FC<ButtonProps> = ({ children, onClick, className }) => {
  return (
    <button 
      className={`${styles.button} ${className}`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
};