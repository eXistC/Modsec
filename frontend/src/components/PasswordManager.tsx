import { useState } from 'react';
import { PasswordList } from './PasswordList';
import { PasswordEditor } from './PasswordEditor';
import { PasswordEntry } from '@/types/password';
import { useToast } from './ui/use-toast';

interface PasswordManagerProps {
  currentView: string;
  onSelectPassword: (password: PasswordEntry) => void;
}

export function PasswordManager({ 
  currentView, 
  onSelectPassword
}: PasswordManagerProps) {
  const { toast } = useToast();
  const [selectedPassword, setSelectedPassword] = useState<PasswordEntry | null>(null);
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);

  const handleToggleBookmark = (id: number) => {
    console.log(`Bookmark toggled for item ${id}`);
    
    toast({
      title: "Bookmark Updated",
      description: "Your changes have been saved.",
      duration: 2000,
    });
  };

  const handleItemDeleted = (deletedItemId: number) => {
    setPasswords(prevPasswords => 
      prevPasswords.filter(password => 
        (typeof password.id === 'string' 
          ? parseInt(password.id) !== deletedItemId 
          : password.id !== deletedItemId)
      )
    );
    
    if (selectedPassword && 
        (typeof selectedPassword.id === 'string' 
          ? parseInt(selectedPassword.id) === deletedItemId 
          : selectedPassword.id === deletedItemId)) {
      setSelectedPassword(null);
    }
  };

  return (
    <div className="flex h-full">
      <PasswordList 
        currentView={currentView}
        onSelectPassword={onSelectPassword}
        onToggleBookmark={handleToggleBookmark}
      />
      <div className="flex-1 bg-background overflow-hidden">
        {selectedPassword ? (
          <PasswordEditor 
            password={selectedPassword} 
            isOpen={!!selectedPassword}
            onDelete={handleItemDeleted}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Select an item to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}