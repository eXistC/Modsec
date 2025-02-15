import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { useState } from "react";
import { CardEntry, CryptoEntry, IdentityEntry, MemoEntry, PasswordEntry, PasswordType, WebsiteEntry } from "@/types/password";
import { WebsiteFields } from "../ItemTypes/WebsiteFields";
import { IdentityFields } from "../ItemTypes/IdentityFields";
import { CardFields } from "../ItemTypes/CardFields";
import { CryptoFields } from "../ItemTypes/CryptoFields";
import { MemoFields } from "../ItemTypes/MemoFields";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NewItemCreateOverlayProps {
  type: PasswordType;
  onSave: (entry: PasswordEntry) => void;
  onClose: () => void;
}

export function NewItemCreateOverlay({ type, onSave, onClose }: NewItemCreateOverlayProps) {
  const [formData, setFormData] = useState<Partial<PasswordEntry>>({ type });
  const [showPassword, setShowPassword] = useState(false);
  const isEditing = true;
    
  

  const handleChange = (field: keyof PasswordEntry) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title) {
      onSave(formData as PasswordEntry);
    }
  };

  // const handleContainerClick = (e: React.MouseEvent) => {
  //   // Only close if clicking the backdrop directly
  //   if (e.target === e.currentTarget) {
  //     onClose();
  //   }
  // };

  const renderFields = () => {
    switch (formData.type) {
      case "website":
        return (
          <WebsiteFields
            formData={formData as WebsiteEntry}
            isEditing={isEditing}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            handleChange={handleChange as (field: keyof WebsiteEntry) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void}
          />
        );
      case "identity":
        return (
          <IdentityFields
            formData={formData as IdentityEntry}
            isEditing={isEditing}
            handleChange={handleChange as (field: keyof IdentityEntry) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void}
          />
        );
      case "card":
        return (
          <CardFields
            formData={formData as CardEntry}
            isEditing={isEditing}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            handleChange={handleChange as (field: keyof CardEntry) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void}
          />
        );
      case "crypto":
        return (
          <CryptoFields
            formData={formData as CryptoEntry}
            isEditing={isEditing}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            handleChange={handleChange as (field: keyof CryptoEntry) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void}
          />
        );
      case "memo":
        return (
          <MemoFields
            formData={formData as MemoEntry}
            isEditing={isEditing}
            handleChange={handleChange}
          />
        );
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 animate-in fade-in duration-200"
    >
      <div 
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] animate-in zoom-in duration-300"
      >
        <form onSubmit={handleSubmit} className="h-full">
          <div className="rounded-xl border bg-card text-card-foreground shadow-lg flex flex-col h-full max-h-[calc(90vh-2rem)]">
            <div className="flex h-[52px] items-center justify-between border-b px-6 flex-shrink-0">
              <h2 className="text-lg font-semibold">Create New Item</h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-secondary/80"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1 overflow-y-auto">
              <div className="space-y-4 p-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Title</label>
                  <Input
                    required
                    placeholder="Enter title"
                    className="bg-secondary"
                    value={formData.title || ''}
                    onChange={handleChange('title')}
                  />
                </div>
                {renderFields()}
              </div>
            </ScrollArea>
            <div className="flex items-center justify-end gap-2 border-t p-4 flex-shrink-0">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
              >
                Create
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}