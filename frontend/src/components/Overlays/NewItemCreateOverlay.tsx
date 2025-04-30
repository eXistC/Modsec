import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useState } from "react";
import { CardEntry, CryptoEntry, IdentityEntry, MemoEntry, PasswordEntry, PasswordType, WebsiteEntry } from "@/types/password";
import { WebsiteFields } from "../ItemTypes/WebsiteFields";
import { IdentityFields } from "../ItemTypes/IdentityFields";
import { CardFields } from "../ItemTypes/CardFields";
import { CryptoFields } from "../ItemTypes/CryptoFields";
import { MemoFields } from "../ItemTypes/MemoFields";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import { CreateItemClient } from '@/wailsjs/go/main/App';

interface NewItemCreateOverlayProps {
  type: PasswordType;
  onSave: (entry: PasswordEntry) => void;
  onClose: () => void;
}

export function NewItemCreateOverlay({ type, onSave, onClose }: NewItemCreateOverlayProps) {
  const [formData, setFormData] = useState<Partial<PasswordEntry>>({ type });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = true;
  
  // Dummy copy function for creation mode
  const dummyCopyToClipboard = (_field: string, _value: string) => {};
  const copiedField = null;

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  // Map frontend type name to backend type name
  const mapTypeNameToBackend = (frontendType: PasswordType): string => {
    switch (frontendType) {
      case "website": return "login";
      case "identity": return "identity";
      case "card": return "credit";
      case "crypto": return "cryptowallet";
      case "memo": return "note";
      default: return frontendType;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Extract title and type, map type to backend format
      const { title } = formData;
      const backendType = mapTypeNameToBackend(type);
      
      // Remove type and id properties from the data to send
      const { type: _, id: __, ...itemData } = formData;
      
      // Call Go CreateItemClient function through Wails
      const response = await CreateItemClient(title as string, backendType, itemData);
      
      // Create the complete item with response data
      const savedItem = {
        ...formData,
        id: String(response.item_id) // Convert the numeric ID to string
      } as PasswordEntry;
      
      // Pass the saved item to parent component
      onSave(savedItem);
      
      toast({
        title: "Success",
        description: response.message || "Item created successfully"
      });
      
      // Close the overlay
      onClose();
      
    } catch (error) {
      console.error("Failed to create item:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create item",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFields = () => {
    switch (formData.type) {
      case "website":
        return (
          <WebsiteFields
            formData={formData as WebsiteEntry}
            isEditing={isEditing}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            handleChange={handleChange}
            copyToClipboard={dummyCopyToClipboard}
            copiedField={copiedField}
          />
        );
      case "identity":
        return (
          <IdentityFields
            formData={formData as IdentityEntry}
            isEditing={isEditing}
            handleChange={handleChange}
            copyToClipboard={dummyCopyToClipboard}
            copiedField={copiedField}
          />
        );
      case "card":
        return (
          <CardFields
            formData={formData as CardEntry}
            isEditing={isEditing}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            handleChange={handleChange}
            copyToClipboard={dummyCopyToClipboard}
            copiedField={copiedField}
          />
        );
      case "crypto":
        return (
          <CryptoFields
            formData={formData as CryptoEntry}
            isEditing={isEditing}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            handleChange={handleChange}
            copyToClipboard={dummyCopyToClipboard}
            copiedField={copiedField}
          />
        );
      case "memo":
        return (
          <MemoFields
            formData={formData as MemoEntry}
            isEditing={isEditing}
            handleChange={handleChange}
            copyToClipboard={dummyCopyToClipboard}
            copiedField={copiedField}
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
        onClick={e => e.stopPropagation()}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}