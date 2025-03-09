import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bookmark, Globe, MoreVertical, Pencil, User, CreditCard, Pen, Eye, EyeOff, Wallet, Tag } from "lucide-react";
import { useState, useEffect } from "react";
import { CardEntry, CryptoEntry, IdentityEntry, MemoEntry, PasswordEntry, WebsiteEntry } from "@/types/password";
import { Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardFields } from './ItemTypes/CardFields';
import { CryptoFields } from './ItemTypes/CryptoFields';
import { IdentityFields } from './ItemTypes/IdentityFields';
import { WebsiteFields } from './ItemTypes/WebsiteFields';
import { MemoFields } from './ItemTypes/MemoFields';
import { SettingsDropdown } from "./ui/SettingsDropdown";
import { calculateCategoryCounts } from "@/data/mockPasswords";


interface PasswordEditorProps {
  password: PasswordEntry;
  isOpen: boolean;
}

// Define a constant for the "no category" value to use consistently throughout
const NO_CATEGORY = "uncategorized";

export function PasswordEditor({ password, isOpen }: PasswordEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<PasswordEntry & { category?: string | null }>(password);
  const [showPassword, setShowPassword] = useState(false);
  const [categories, setCategories] = useState(calculateCategoryCounts().map(cat => cat.name));

  // Make sure password changes are properly reflected in the component
  useEffect(() => {
    if (password) {
      setFormData(prev => ({
        ...password,
        category: password.category || prev.category
      }));
      setIsEditing(false);
      setShowPassword(false);
    }
  }, [password]);

  const handleSave = () => {
    setIsEditing(false);
    // Add code to save the changes to your data store
    console.log("Saving updated entry:", formData);
  };

  const handleEdit = () => {
    // Make a deep copy of the current formData to ensure we're not working with stale state
    setFormData(current => ({...current}));
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

  // Use the string type for field parameter to accommodate all possible fields
  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    console.log(`Updating field: ${field} with value: ${e.target.value}`);
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleCategoryChange = (value: string) => {
    console.log(`Updating category with: ${value}`);
    setFormData(prev => ({
      ...prev,
      category: value === NO_CATEGORY ? null : value
    }));
  };

  const handleDelete = () => {
    // Add delete logic here
    console.log("Deleting item...");
  };

  const getIcon = () => {
    switch (password.type) {
      case "website":
        return <Globe className="h-5 w-5" />;
      case "identity":
        return <User className="h-5 w-5" />;
      case "card":
        return <CreditCard className="h-5 w-5" />;
      case "crypto":
        return <Wallet className="h-5 w-5" />;
      case "memo":
        return <Pen className="h-5 w-5" />;
    }
  };

  // Check for missing data
  if (!isOpen) {
    return null;
  }

  console.log("PasswordEditor render state:", { 
    isEditing, 
    passwordType: formData.type,
    category: formData.category
  });

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
          <SettingsDropdown 
            variant="more"
            onDelete={handleDelete}
          />
        </div>
      </div>
      <div className="px-6 py-4">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Item name</label>
            <div className="flex gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-secondary">
                {getIcon()}
              </div>
              <Input 
                placeholder="Enter item name" 
                className={`${isEditing ? 'bg-secondary' : 'bg-background'} border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background`}
                value={formData.title}
                onChange={handleChange('title')}
                readOnly={!isEditing}
              />
            </div>
          </div>

          {/* Category selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Category</label>
            <div className="flex gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-secondary">
                <Tag className="h-5 w-5" />
              </div>
              {isEditing ? (
                <Select
                  value={formData.category || NO_CATEGORY}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger className="w-full bg-secondary border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_CATEGORY}>None</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input 
                  className="bg-background border-[1px] border-input"
                  value={formData.category || "Uncategorized"}
                  readOnly
                />
              )}
            </div>
          </div>

          {formData.type === "website" && (
            <WebsiteFields
              formData={formData as WebsiteEntry}
              isEditing={isEditing}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              handleChange={handleChange}
            />
          )}
          {formData.type === "card" && (
            <CardFields
              formData={formData as CardEntry}
              isEditing={isEditing}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              handleChange={handleChange}
            />
          )}
          {formData.type === "crypto" && (
            <CryptoFields
              formData={formData as CryptoEntry}
              isEditing={isEditing}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              handleChange={handleChange}
            />
          )}
          {formData.type === "identity" && (
            <IdentityFields
              formData={formData as IdentityEntry}
              isEditing={isEditing}
              handleChange={handleChange}
            />
          )}
          {formData.type === "memo" && (
            <MemoFields
              formData={formData as MemoEntry}
              isEditing={isEditing}
              handleChange={handleChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}