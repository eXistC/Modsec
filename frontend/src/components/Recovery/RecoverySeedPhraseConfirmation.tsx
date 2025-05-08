import React, { useState } from 'react';
import { SeedPhraseConfirmationPage } from '@/components/Pages/SeedPhraseConfirmationPage';
import { createContext, useContext } from 'react';

// Create a context for recovery-specific seed phrase
interface RecoverySeedPhraseContextType {
  seedPhrase: string;
  confirmSeedPhrase: () => void;
}

const RecoverySeedPhraseContext = createContext<RecoverySeedPhraseContextType>({
  seedPhrase: '',
  confirmSeedPhrase: () => {},
});

interface RecoverySeedPhraseProviderProps {
  children: React.ReactNode;
  seedPhrase: string;
  onConfirmed: () => void;
}

// This provider will wrap the SeedPhraseConfirmationPage with recovery-specific data
export function RecoverySeedPhraseProvider({
  children,
  seedPhrase,
  onConfirmed,
}: RecoverySeedPhraseProviderProps) {
  return (
    <RecoverySeedPhraseContext.Provider
      value={{
        seedPhrase,
        confirmSeedPhrase: onConfirmed,
      }}
    >
      {children}
    </RecoverySeedPhraseContext.Provider>
  );
}

// Custom hook to use the recovery seed phrase context
export function useRecoverySeedPhrase() {
  return useContext(RecoverySeedPhraseContext);
}

// Wrapper component to use SeedPhraseConfirmationPage for recovery
interface RecoverySeedPhraseConfirmationProps {
  seedPhrase: string;
  onConfirmed: () => void;
}

export function RecoverySeedPhraseConfirmation({
  seedPhrase,
  onConfirmed,
}: RecoverySeedPhraseConfirmationProps) {
  return (
    <RecoverySeedPhraseProvider seedPhrase={seedPhrase} onConfirmed={onConfirmed}>
      <RecoverySeedPhraseConfirmationContent />
    </RecoverySeedPhraseProvider>
  );
}

function RecoverySeedPhraseConfirmationContent() {
  // Here we just render the original SeedPhraseConfirmationPage
  // The AuthContext will be overridden by our RecoverySeedPhraseContext
  return <SeedPhraseConfirmationPage isRecovery={true} />;
}