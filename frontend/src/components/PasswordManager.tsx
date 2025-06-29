import { useState, useEffect } from 'react';
import { PasswordList } from './PasswordList';
import { PasswordEntry } from '@/types/password';
import { useToast } from './ui/use-toast';
import { ToggleBookmark } from '@/wailsjs/go/main/App'; 

// Update the interface to include refreshTrigger
interface PasswordManagerProps {
  currentView: string;
  onSelectPassword: (password: PasswordEntry) => void;
  selectedPassword?: PasswordEntry; 
  refreshTrigger?: number; // Add refreshTrigger prop
}

export function PasswordManager({ 
  currentView, 
  onSelectPassword,
  selectedPassword,
  refreshTrigger = 0 // Default to 0
}: PasswordManagerProps) {
  const { toast } = useToast();
  // Initialize with the selectedPassword from props, or null if not provided
  const [localSelectedPassword, setLocalSelectedPassword] = useState<PasswordEntry | null>(selectedPassword || null);
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);

  // Use useEffect to update localSelectedPassword when prop changes
  useEffect(() => {
    if (selectedPassword) {
      setLocalSelectedPassword(selectedPassword);
    }
  }, [selectedPassword]);

  // Add this effect to synchronize detailPanelOpen with localSelectedPassword
  useEffect(() => {
    setDetailPanelOpen(!!localSelectedPassword);
  }, [localSelectedPassword]);

  const handleToggleBookmark = async (id: number) => {
    try {
      // Get the current bookmark status
      const currentPassword = passwords.find(p => 
        (typeof p.id === 'string' ? parseInt(p.id) === id : p.id === id)
      );
      
      if (!currentPassword) return;
      
      const currentBookmarkStatus = currentPassword.isBookmarked || false;
      
      // Toggle the bookmark status using the Go backend
      const response = await ToggleBookmark(id, !currentBookmarkStatus);
      
      if (response && response.status) {
        // Update the local state
        setPasswords(prevPasswords => 
          prevPasswords.map(password => {
            if ((typeof password.id === 'string' ? parseInt(password.id) === id : password.id === id)) {
              return { ...password, isBookmarked: !currentBookmarkStatus };
            }
            return password;
          })
        );
        
        // Update local selected password if it's the one being modified
        if (localSelectedPassword && 
            (typeof localSelectedPassword.id === 'string' 
              ? parseInt(localSelectedPassword.id) === id 
              : localSelectedPassword.id === id)) {
          setLocalSelectedPassword({
            ...localSelectedPassword,
            isBookmarked: !currentBookmarkStatus
          });
        }
        
        toast({
          title: "Bookmark Updated",
          description: "Your changes have been saved.",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
      toast({
        variant: "destructive",
        title: "Failed to update bookmark",
        description: "There was a problem updating your bookmark.",
      });
    }
  };

  const handleItemDeleted = (deletedItemId: number) => {
    // Update your passwords state
    setPasswords(prevPasswords => 
      prevPasswords.filter(password => 
        (typeof password.id === 'string' 
          ? parseInt(password.id) !== deletedItemId 
          : password.id !== deletedItemId)
      )
    );
    
    // Also notify parent by setting selectedPassword to null when deleted
    if (localSelectedPassword && 
        (typeof localSelectedPassword.id === 'string' 
          ? parseInt(localSelectedPassword.id) === deletedItemId 
          : localSelectedPassword.id === deletedItemId)) {
      setLocalSelectedPassword(null);
      onSelectPassword(null as unknown as PasswordEntry); // Inform parent component
    }
  };

  const handleUpdatePassword = (updatedPassword: PasswordEntry) => {
    // Update the passwords state with the new password data
    setPasswords(prevPasswords => 
      prevPasswords.map(pw => 
        pw.id === updatedPassword.id ? updatedPassword : pw
      )
    );
    
    // Also update the selected password if it's the one being edited
    if (localSelectedPassword && localSelectedPassword.id === updatedPassword.id) {
      setLocalSelectedPassword(updatedPassword);
    }
  };

  const handleDeletePassword = (deletedItemId: number) => {
    // Remove the deleted item from local state
    setPasswords(prevPasswords => 
      prevPasswords.filter(password => parseInt(password.id) !== deletedItemId)
    );
    
    // Clear selected password if it's the one that was deleted
    if (selectedPassword && parseInt(selectedPassword.id) === deletedItemId) {
      setLocalSelectedPassword(null);
    }
    
    // Close the detail panel if needed
    setDetailPanelOpen(false);
  };

  // Handle local selection while also notifying parent
  const handleSelectPassword = (password: PasswordEntry) => {
    setLocalSelectedPassword(password);
    setDetailPanelOpen(true);  // Open panel when a password is selected
    onSelectPassword(password);
  };

  return (
    <div>
      <PasswordList 
        currentView={currentView}
        onSelectPassword={handleSelectPassword}
        onToggleBookmark={handleToggleBookmark}
        refreshTrigger={refreshTrigger} // Pass the refreshTrigger prop
      />
    </div>
  );
}