import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bookmark, Globe, MoreVertical, Pencil } from "lucide-react";
import { useState, useEffect } from "react";

interface PasswordEntry {
  id: string;
  type: "website" | "identity" | "card" | "note";
  title: string;
  username?: string;
  cardNumber?: string;
  isBookmarked?: boolean;
  notes?: string;
}

interface PasswordEditorProps {
  password?: PasswordEntry;
  isOpen?: boolean;
  onClose?: () => void;
  onSave?: (data: Partial<PasswordEntry>) => void;
  onToggleBookmark?: (id: string) => void;
}

export function PasswordEditor({ 
  password, 
  isOpen = false, 
  onClose, 
  onSave,
  onToggleBookmark 
}: PasswordEditorProps) {
  const initialData = password ? {
    name: password.title,
    username: password.username || '',
    password: '••••••••••••••••', // You might want to handle actual password differently
    notes: password.notes || ''
  } : {
    name: '',
    username: '',
    password: '',
    notes: ''
  };

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(initialData);

  // Reset form data when password changes
  useEffect(() => {
    setFormData(initialData);
    setIsEditing(false);
  }, [password]);

  const handleSave = () => {
    if (onSave) {
      onSave({
        ...password,
        title: formData.name,
        username: formData.username,
        notes: formData.notes
      });
    }
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDiscard = () => {
    setFormData(initialData);
    setIsEditing(false);
  };

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleBookmarkToggle = () => {
    if (password && onToggleBookmark) {
      onToggleBookmark(password.id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="h-full bg-background">
      <div className="flex h-[60px] items-center justify-between border-b border-border px-6">
        <h1 className="text-lg font-normal">{isEditing ? 'Editing' : 'Viewing'}</h1>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-secondary hover:bg-secondary/80"
                onClick={handleSave}
              >
                Save
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleDiscard}
              >
                Discard
              </Button>
            </>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-secondary hover:bg-secondary/80"
              onClick={handleEdit}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={handleBookmarkToggle}
          >
            <Bookmark className={`h-4 w-4 ${password?.isBookmarked ? 'text-primary' : ''}`} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Item name</label>
            <div className="flex gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-secondary">
                <Globe className="h-5 w-5" />
              </div>
              <Input 
                placeholder="darkweb.onion" 
                className={`${!isEditing ? 'bg-background' : 'bg-secondary'} border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background`}
                value={formData.name}
                onChange={handleChange('name')}
                readOnly={!isEditing}
              />
            </div>
          </div>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Username</label>
              <Input 
                placeholder="example@gmail.com" 
                className={`${!isEditing ? 'bg-background' : 'bg-secondary'} border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background`}
                value={formData.username}
                onChange={handleChange('username')}
                readOnly={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Password</label>
              <Input 
                type="password" 
                className={`${!isEditing ? 'bg-background' : 'bg-secondary'} border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background font-mono`}
                value={formData.password}
                onChange={handleChange('password')}
                readOnly={!isEditing}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Notes</label>
            <Textarea 
              placeholder="Add notes..." 
              className={`${!isEditing ? 'bg-background' : 'bg-secondary'} border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background min-h-[100px]`}
              value={formData.notes}
              onChange={handleChange('notes')}
              readOnly={!isEditing}
            />
          </div>
          <div className="pt-4 text-xs text-muted-foreground space-y-1">
            <div className="text-center">Modified: 13/09/2024, 7:52:30</div>
            <div className="text-center">Created: 11/09/2024, 19:14:00</div>
          </div>
        </div>
      </div>
    </div>
  );
}