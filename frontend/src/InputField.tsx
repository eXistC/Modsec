import React from 'react';
import { InputFieldProps } from './types';
import styles from './Auth.module.css';

export const InputField: React.FC<InputFieldProps> = ({
  label,
  type,
  id,
  value,
  onChange
}) => {
  return (
    <div className={styles.inputContainer}>
      <label htmlFor={id} className={styles.inputLabel}>
        {label}
      </label>
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        className={styles.inputField}
        aria-label={label}
      />
    </div>
  );
};