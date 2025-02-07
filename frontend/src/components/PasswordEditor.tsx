import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bookmark, Globe, MoreVertical, Pencil, User, CreditCard, Pen, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { PasswordEntry } from "@/types/password";

interface PasswordEditorProps {
  password: PasswordEntry;
  isOpen: boolean;
}

export function PasswordEditor({ password, isOpen }: PasswordEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(password);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setFormData(password);
    setIsEditing(false);
    setShowPassword(false);
  }, [password]);

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowPassword(false);
  };

  const handleDiscard = () => {
    setFormData(password);
    setIsEditing(false);
    setShowPassword(false);
  };

  const handlePasswordClick = () => {
    if (isEditing) {
      setShowPassword(!showPassword);
    }
  };

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const getIcon = () => {
    switch (password.type) {
      case "website":
        return <Globe className="h-5 w-5" />;
      case "identity":
        return <User className="h-5 w-5" />;
      case "card":
        return <CreditCard className="h-5 w-5" />;
      case "note":
        return <Pen className="h-5 w-5" />;
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
            onClick={() => console.log("Toggle bookmark")}
          >
            {password.isBookmarked ? (
              <Bookmark className="h-4 w-4 text-primary" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
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
                {getIcon()}
              </div>
              <Input 
                placeholder="Enter item name" 
                className={`${!isEditing ? 'bg-background' : 'bg-secondary'} border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background`}
                value={formData.title}
                onChange={handleChange('title')}
                readOnly={!isEditing}
              />
            </div>
          </div>
          <div className="space-y-3">
            {formData.username && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Username</label>
                <Input 
                  placeholder="Enter username" 
                  className={`${!isEditing ? 'bg-background' : 'bg-secondary'} border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background`}
                  value={formData.username}
                  onChange={handleChange('username')}
                  readOnly={!isEditing}
                />
              </div>
            )}
            {formData.type === "website" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Password</label>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password" 
                    className={`${!isEditing ? 'bg-background' : 'bg-secondary'} border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background font-mono ${isEditing ? '' : 'pr-10'}`}
                    value={formData.password || ''}
                    onChange={handleChange('password')}
                    onFocus={() => {
                      if (isEditing) {
                        setShowPassword(true);
                      }
                    }}
                    onBlur={() => {
                      if (isEditing) {
                        setShowPassword(false);
                      }
                    }}
                    readOnly={!isEditing}
                  />
                  {!isEditing && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground/70" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground/70" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}
            {formData.cardNumber && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Card Number</label>
                <Input 
                  type={showPassword ? "text" : "password"}
                  className={`${!isEditing ? 'bg-background' : 'bg-secondary'} border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background font-mono cursor-pointer`}
                  value={formData.cardNumber}
                  onChange={handleChange('cardNumber')}
                  onClick={handlePasswordClick}
                  readOnly={!isEditing}
                />
              </div>
            )}
          </div>
          {formData.notes && (
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
          )}
        </div>
      </div>
    </div>
  );
}