import { useState } from 'react';
import { PasswordList } from './PasswordList';
import { PasswordEditor } from './PasswordEditor';
import { PasswordEntry } from '@/types/password';

const mockPasswords: PasswordEntry[] = [
  {
    id: "1",
    type: "website",
    title: "GitHub",
    username: "user@example.com",
    isBookmarked: false,
    notes: "GitHub account"
  },
  {
    id: "2",
    type: "identity",
    title: "Personal ID",
    username: "John Doe",
    isBookmarked: true,
    notes: "Personal identification"
  },
  {
    id: "3",
    type: "card",
    title: "Main Credit Card",
    cardNumber: "**** **** **** 1234",
    isBookmarked: false,
    notes: "Main credit card"
  }
];

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