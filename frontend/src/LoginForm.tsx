import React, { useState } from 'react';
import { Button } from './Button';
import { InputField } from './InputField';
import styles from './Auth.module.css';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (

      <div className={styles.loginContent}>
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <h1 className={styles.welcomeText}>Welcome back!</h1>
          
          <InputField
            label="Email"
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <InputField
            label="Password"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button className={styles.signInButton}>
            Sign in
          </Button>
        </form>
      </div>
  );
};