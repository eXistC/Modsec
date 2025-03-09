import { useState } from 'react';
import { PasswordList } from './PasswordList';
import { PasswordEditor } from './PasswordEditor';
import { PasswordEntry } from '@/types/password';
import { mockPasswords } from '@/data/mockPasswords';

interface PasswordManagerProps {
  currentView: string;
  onSelectPassword: (password: PasswordEntry) => void;
  selectedPassword?: PasswordEntry;
}

export function PasswordManager({ 
  currentView, 
  onSelectPassword,
  selectedPassword 
}: PasswordManagerProps) {
  const [passwords, setPasswords] = useState<PasswordEntry[]>(mockPasswords);

  const handleToggleBookmark = (id: string) => {
    setPasswords(prev =>
      prev.map(entry =>
        entry.id === id
          ? { ...entry, isBookmarked: !entry.isBookmarked }
          : entry
      )
    );
  };

  return (
    <div>
      <PasswordList 
        currentView={currentView}
        onSelectPassword={onSelectPassword}
        passwords={passwords}
        onToggleBookmark={handleToggleBookmark}
      />
    </div>
  );
}