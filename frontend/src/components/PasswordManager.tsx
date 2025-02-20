import { useState } from 'react';
import { PasswordList } from './PasswordList';
import { PasswordEntry } from '@/types/password';



interface PasswordManagerProps {
  currentView: string;
  onSelectPassword: (password: PasswordEntry) => void;
  selectedPassword?: PasswordEntry;
  passwords: PasswordEntry[];
  setPasswords: React.Dispatch<React.SetStateAction<PasswordEntry[]>>;
  selectedCategory: string | null;
}

export function PasswordManager({ 
  currentView, 
  onSelectPassword,
  selectedPassword,
  passwords,
  setPasswords,
  selectedCategory
}: PasswordManagerProps) {
  const handleToggleBookmark = (id: string) => {
    setPasswords((prev: PasswordEntry[]) =>
      prev.map(entry =>
        entry.id === id
          ? { ...entry, isBookmarked: !entry.isBookmarked }
          : entry
      )
    );
  };

  const filteredPasswords = selectedCategory
    ? passwords.filter(p => p.category === selectedCategory)
    : passwords;
  
  return (
    <PasswordList
      currentView={currentView}
      onSelectPassword={onSelectPassword}
      passwords={filteredPasswords}
      onToggleBookmark={handleToggleBookmark}
    />
  );
}