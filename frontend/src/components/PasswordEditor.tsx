import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bookmark, Globe, MoreVertical, Pencil } from "lucide-react";
import { useState } from "react";

export function PasswordEditor() {
  const initialData = {
    name: "Darkweb.onion",
    username: "Example@gmail.com",
    password: "••••••••••••••••",
    notes: "This is totally a legit site"
  };

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(initialData);

  const handleSave = () => {
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
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Bookmark className="h-4 w-4" />
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
            <div>Modified: 13/09/2024, 7:52:30</div>
            <div>Created: 11/09/2024, 19:14:00</div>
          </div>
        </div>
      </div>
    </div>
  );
}