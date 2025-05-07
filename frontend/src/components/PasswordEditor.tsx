import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bookmark, Globe, MoreVertical, Pencil, User, CreditCard, Pen, Eye, EyeOff, Wallet, Tag, Copy, Check, File } from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { useColorSettings } from "@/context/ColorSettingsContext";
import { GetCategoryList, UpdateItemClient } from "@/wailsjs/go/main/App";

interface PasswordEditorProps {
  password: PasswordEntry;
  isOpen: boolean;
  onDelete: (deletedItemId: number) => void;
}

// Define a constant for the "no category" value to use consistently throughout
const NO_CATEGORY = "uncategorized";

export function PasswordEditor({ password, isOpen }: PasswordEditorProps) {
  const { toast } = useToast();
  const { getIconBackgroundClass } = useColorSettings();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<PasswordEntry & { category?: string | null }>(password);
  const [showPassword, setShowPassword] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Load categories from the backend using the app.go binding
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const categoryData = await GetCategoryList();
        if (categoryData) {
          // Extract category names from the response
          const categoryNames = categoryData.map(cat => cat.CategoryName as string);
          setCategories(categoryNames);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
        // Fallback to some defaults in case of error
        setCategories(["Personal", "Work", "Finance", "Uncategorized"]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

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

  const handleSave = async () => {
    try {
      // Extract the data appropriate for this item type
      const itemData: Record<string, any> = {};
      
      // Common fields first
      if (formData.notes) {
        itemData.notes = formData.notes;
      }
      
      // Type-specific data fields
      switch (formData.type) {
        case "website":
          const websiteData = formData as WebsiteEntry;
          if (websiteData.username) itemData.username = websiteData.username;
          if (websiteData.password) itemData.password = websiteData.password;
          if (websiteData.url) itemData.url = websiteData.url;
          break;
          
        case "card":
          const cardData = formData as CardEntry;
          if (cardData.cardholderName) itemData.cardholderName = cardData.cardholderName;
          if (cardData.cardNumber) itemData.cardNumber = cardData.cardNumber;
          if (cardData.expirationMonth) itemData.expirationMonth = cardData.expirationMonth;
          if (cardData.expirationYear) itemData.expirationYear = cardData.expirationYear;
          if (cardData.cvv) itemData.cvv = cardData.cvv;
          break;
          
        case "crypto":
          const cryptoData = formData as CryptoEntry;
          if (cryptoData.walletName) itemData.walletName = cryptoData.walletName;
          if (cryptoData.address) itemData.address = cryptoData.address;
          if (cryptoData.privateKey) itemData.privateKey = cryptoData.privateKey;
          break;
          
        case "identity":
          const identityData = formData as IdentityEntry;
          if (identityData.firstName) itemData.firstName = identityData.firstName;
          if (identityData.lastName) itemData.lastName = identityData.lastName;
          if (identityData.email) itemData.email = identityData.email;
          if (identityData.phone) itemData.phone = identityData.phone;
          if (identityData.address) itemData.address = identityData.address;
          break;
          
        case "memo":
          const memoData = formData as MemoEntry;
          if (memoData.content) itemData.content = memoData.content;
          break;
      }
      
      // Add category if it exists
      let categoryId: number | null = null;
      if (formData.category && formData.category !== NO_CATEGORY) {
        itemData.category = formData.category;
      }
      
      // Call the UpdateItemClient function from your Go backend with all required arguments
      const response = await UpdateItemClient(
        parseInt(formData.id), // arg1: item_id (number)
        null, // arg2: category_id (any - can be null if no category)
        formData.title, // arg3: title (string)
        itemData  // arg4: ItemData (object)
      );
      
      console.log("Item updated successfully:", response);
      
      // Show success toast
      toast({
        title: "Changes saved",
        description: "Your item has been updated successfully.",
      });
      
      // Exit editing mode
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating item:", error);
      
      // Show error toast
      toast({
        title: "Update failed",
        description: "Failed to save your changes. Please try again.",
        variant: "destructive",
      });
    }
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
    
    toast({
      title: "Item deleted",
      description: "Your item has been removed successfully.",
      variant: "destructive",
    });
  };

  // Enhanced function to copy field content to clipboard with toast notification
  const copyToClipboard = (field: string, value: string) => {
    if (!value) {
      toast({
        title: "Nothing to copy",
        description: "This field is empty.",
        variant: "destructive"
      });
      return;
    }
    
    navigator.clipboard.writeText(value).then(() => {
      // Set visual indicator
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
      
      // Show toast notification
      const fieldLabel = getFieldLabel(field);
      toast({
        title: `Copied ${fieldLabel.toLowerCase()}`,
        description: null, // Remove description for a cleaner notification
        variant: "default",
        duration: 2000, // Shortened duration for less intrusion
      });
    }).catch(err => {
      console.error('Copy failed:', err);
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard.",
        variant: "destructive"
      });
    });
  };

  // Helper function to get a readable field label for toast notifications
  const getFieldLabel = (field: string): string => {
    // Map common field names to readable labels
    const fieldLabels: Record<string, string> = {
      'title': 'Item name',
      'username': 'Username',
      'password': 'Password',
      'url': 'Website URL',
      'email': 'Email address',
      'cardNumber': 'Card number',
      'cardholderName': 'Cardholder name',
      'expirationMonth': 'Expiration month',
      'expirationYear': 'Expiration year',
      'cvv': 'CVV',
      'notes': 'Notes',
      'content': 'Content',
      'walletName': 'Wallet name',
      'address': 'Address',
      'privateKey': 'Private key'
    };

    return fieldLabels[field] || field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');
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
        return <File className="h-5 w-5" />;
    }
  };

  // Helper function to determine icon background color based on entry type
  const getIconBackgroundStyle = (type: string): React.CSSProperties => {
    const { colors } = useColorSettings();
    switch (type) {
      case "website":
        return { 
          backgroundColor: `${colors.website}20`, // 20 is hex for 12% opacity
          color: colors.website 
        };
      case "identity":
        return { 
          backgroundColor: `${colors.identity}20`,
          color: colors.identity
        };
      case "card":
        return { 
          backgroundColor: `${colors.card}20`,
          color: colors.card
        };
      case "crypto":
        return { 
          backgroundColor: `${colors.crypto}20`,
          color: colors.crypto
        };
      case "memo":
        return { 
          backgroundColor: `${colors.memo}20`,
          color: colors.memo
        };
      default:
        return { 
          backgroundColor: 'var(--secondary)', 
          opacity: 0.6 
        };
    }
  };

  // Get styled icon with appropriate sizing
  const getStyledIcon = () => {
    switch (formData.type) {
      case "website":
        return <Globe className="h-6 w-6" />;
      case "identity":
        return <User className="h-6 w-6" />;
      case "card":
        return <CreditCard className="h-6 w-6" />;
      case "crypto":
        return <Wallet className="h-6 w-6" />;
      case "memo":
        return <File className="h-6 w-6" />;
      default:
        return <Globe className="h-6 w-6" />;
    }
  };

  // Check for missing data
  if (!isOpen) {
    return null;
  }

  // Reusable component for copyable input fields with enhanced design
  const CopyableField = ({ 
    label, 
    value, 
    fieldName, 
    isPassword = false,
    isConcealed = false,
    placeholder = ""
  }: { 
    label: string, 
    value: string | undefined, 
    fieldName: string,
    isPassword?: boolean,
    isConcealed?: boolean,
    placeholder?: string
  }) => {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <div className="relative group">
          <Input 
            type={isPassword && !showPassword ? "password" : "text"}
            placeholder={placeholder}
            value={value || ""}
            onChange={handleChange(fieldName)}
            readOnly={!isEditing}
            className={`
              ${isEditing ? 'bg-secondary' : 'bg-background'} 
              ${isConcealed ? 'font-mono' : ''} 
              ${!isEditing && value ? 'cursor-pointer hover:border-primary/50 transition-colors duration-200' : ''}
              pr-10 border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background
            `}
            onClick={() => !isEditing && value && copyToClipboard(fieldName, value)}
          />
          {!isEditing && value && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className={`
                    absolute right-3 top-1/2 transform -translate-y-1/2 
                    text-muted-foreground hover:text-primary transition-all duration-200
                    ${copiedField === fieldName ? 'opacity-100' : 'opacity-0 group-hover:opacity-80'} 
                    cursor-pointer
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(fieldName, value);
                  }}
                >
                  {copiedField === fieldName ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-primary text-primary-foreground">
                <p>{copiedField === fieldName ? "Copied!" : "Click to copy"}</p>
              </TooltipContent>
            </Tooltip>
          )}
          {isPassword && isEditing && (
            <button
              type="button"
              onClick={handlePasswordClick}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
    );
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
          {/* Item name - enhanced with stylish icon and typography */}
          <div className="space-y-3">
            <div className="flex gap-4 items-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl shadow-sm"
                   style={getIconBackgroundStyle(formData.type)}>
                {getStyledIcon()}
              </div>
              <div className="relative w-full">
                {isEditing ? (
                  <Input 
                    placeholder="Enter item name" 
                    className="
                      bg-secondary 
                      text-lg font-medium h-12 px-4
                      border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background
                    "
                    value={formData.title}
                    onChange={handleChange('title')}
                  />
                ) : (
                  <h2 className="text-xl font-medium text-foreground line-clamp-2">
                    {formData.title || "Untitled"}
                  </h2>
                )}
              </div>
            </div>
          </div>

          {/* Type-specific fields */}
          {formData.type === "website" && (
            <WebsiteFields
              formData={formData as WebsiteEntry}
              isEditing={isEditing}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              handleChange={handleChange}
              copyToClipboard={copyToClipboard}
              copiedField={copiedField}
            />
          )}
          {formData.type === "card" && (
            <CardFields
              formData={formData as CardEntry}
              isEditing={isEditing}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              handleChange={handleChange}
              copyToClipboard={copyToClipboard}
              copiedField={copiedField}
            />
          )}
          {formData.type === "crypto" && (
            <CryptoFields
              formData={formData as CryptoEntry}
              isEditing={isEditing}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              handleChange={handleChange}
              copyToClipboard={copyToClipboard}
              copiedField={copiedField}
            />
          )}
          {formData.type === "identity" && (
            <IdentityFields
              formData={formData as IdentityEntry}
              isEditing={isEditing}
              handleChange={handleChange}
              copyToClipboard={copyToClipboard}
              copiedField={copiedField}
            />
          )}
          {formData.type === "memo" && (
            <MemoFields
              formData={formData as MemoEntry}
              isEditing={isEditing}
              handleChange={handleChange}
              copyToClipboard={copyToClipboard}
              copiedField={copiedField}
            />
          )}

          {/* Notes field - only show for non-memo types and when not included in the component */}
          {formData.notes !== undefined && 
           formData.type !== "memo" && // MemoFields already shows notes
           formData.type !== "identity" && // IdentityFields already shows notes
           formData.type !== "website" && // WebsiteFields already shows notes
           (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Notes</label>
              <div className="relative group">
                <Textarea
                  placeholder="Add notes..."
                  value={formData.notes || ""}
                  onChange={handleChange('notes')}
                  readOnly={!isEditing}
                  className={`
                    ${isEditing ? 'bg-secondary' : 'bg-background'} 
                    ${!isEditing && formData.notes ? 'cursor-pointer hover:border-primary/50 transition-colors duration-200' : ''}
                    min-h-[100px] border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background pr-10
                  `}
                  onClick={() => !isEditing && formData.notes && copyToClipboard('notes', formData.notes)}
                />
                {!isEditing && formData.notes && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`
                          absolute right-3 top-3 
                          text-muted-foreground hover:text-primary transition-all duration-200
                          ${copiedField === 'notes' ? 'opacity-100' : 'opacity-0 group-hover:opacity-80'} 
                          cursor-pointer
                        `}
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard('notes', formData.notes || "");
                        }}
                      >
                        {copiedField === 'notes' ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="bg-primary text-primary-foreground">
                      <p>{copiedField === 'notes' ? "Copied!" : "Click to copy"}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          )}

          {/* Category selector - moved to bottom */}
          <div className="space-y-2 mt-8 border-t border-border pt-6">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium text-muted-foreground">Category</label>
            </div>
            <div className="pl-6">
              {isEditing ? (
                <Select
                  value={formData.category || NO_CATEGORY}
                  onValueChange={handleCategoryChange}
                  disabled={isLoadingCategories}
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
                <div className="flex items-center h-10">
                  <span className="text-sm">
                    {formData.category ? (
                      <span className="px-2 py-1 bg-secondary/50 rounded-md">{formData.category}</span>
                    ) : (
                      <span className="text-muted-foreground">Uncategorized</span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}