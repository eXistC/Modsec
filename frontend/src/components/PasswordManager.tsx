import { useState } from 'react';
import { PasswordList } from './PasswordList';
import { PasswordEditor } from './PasswordEditor';
import { PasswordEntry } from '@/types/password';
import { useToast } from './ui/use-toast';

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
  const { toast } = useToast();

  const handleToggleBookmark = (id: number) => {
    console.log(`Bookmark toggled for item ${id}`);
    
    toast({
      title: "Bookmark Updated",
      description: "Your changes have been saved.",
      duration: 2000,
    });
  };

  return (
    <div>
      <PasswordList 
        currentView={currentView}
        onSelectPassword={onSelectPassword}
        onToggleBookmark={handleToggleBookmark}
      />
    </div>
  );
}