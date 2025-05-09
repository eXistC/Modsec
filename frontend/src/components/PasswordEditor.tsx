import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bookmark, Globe, MoreVertical, Pencil, User, CreditCard, Pen, Eye, EyeOff, Wallet, Tag, Copy, Check, File, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { CardEntry, CryptoEntry, IdentityEntry, MemoEntry, PasswordEntry, WebsiteEntry } from "@/types/password";
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
import { GetPasswordList, UpdateItemClient, DeleteItemClient } from "@/wailsjs/go/main/App";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { useCategories } from "@/context/CategoryContext";

interface PasswordEditorProps {
  password: PasswordEntry | null;
  isOpen: boolean;
  onDelete: (deletedItemId: number) => void;
  onUpdate?: (updatedPassword: PasswordEntry) => void;
}

// Define a constant for the "no category" value to use consistently throughout
const NO_CATEGORY = "uncategorized";

// Format dates using the user's local timezone
import { formatBangkokDate, getUserTimezoneName } from "@/lib/utils";

const formatDateTime = (dateString: Date | string | undefined): string => {
  return formatBangkokDate(dateString);
};

// Update the PasswordEditor component structure
export function PasswordEditor({ password, isOpen, onDelete, onUpdate }: PasswordEditorProps) {
  const { toast } = useToast();
  const { getIconBackgroundClass } = useColorSettings();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<PasswordEntry & { category?: string | null, categoryId?: number | null }>(
    password || {
      id: "",
      title: "",
      type: "memo",
      isBookmarked: false,
      dateCreated: new Date(),
      dateModified: new Date(),
      content: "",
      notes: ""
    }
  );
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isLoadingItemCategory, setIsLoadingItemCategory] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Use the shared categories context instead of managing categories locally
  const { categories, isLoading: isLoadingCategories } = useCategories();

  // New effect to fetch the current item's category information from GetPasswordList
  useEffect(() => {
    const fetchItemCategoryInfo = async () => {
      // Only proceed if we have a valid password with ID
      if (!password || !password.id) return;
      
      try {
        setIsLoadingItemCategory(true);
        
        // Get the complete list of items with their category information
        const items = await GetPasswordList();
        
        if (!items || !Array.isArray(items)) return;
        
        // Find the current item in the items list by ID
        const currentItem = items.find(item => 
          parseInt(String(item.ItemID)) === parseInt(String(password.id))
        );
        
        if (currentItem) {
          console.log("Found item with category data:", {
            id: currentItem.ItemID,
            title: currentItem.Title,
            categoryId: currentItem.CategoryID,
            categoryName: currentItem.CategoryName
          });
          
          // Update formData with the accurate category info from the backend
          setFormData(prev => ({
            ...prev,
            category: currentItem.CategoryName || null,
            categoryId: currentItem.CategoryID || null
          }));
        }
      } catch (error) {
        console.error("Failed to fetch item's category details:", error);
      } finally {
        setIsLoadingItemCategory(false);
      }
    };
    
    fetchItemCategoryInfo();
  }, [password?.id]); // Re-run when the password ID changes

  // Make sure password changes are properly reflected in the component
  useEffect(() => {
    // Only update if we have a valid password object
    if (password) {
      // Set basic password data, but DON'T overwrite category info that was loaded from the API
      setFormData(prev => ({
        ...password,
        // Preserve any category info that was loaded from the API
        category: prev.category !== undefined ? prev.category : (password as any).category,
        categoryId: prev.categoryId !== undefined ? prev.categoryId : (password as any).categoryId,
      }));
      
      setIsEditing(false);
      setShowPassword(false);
    }
  }, [password]);

  // Add an effect to maintain focus after re-render
  useEffect(() => {
    // If we have a focused field, find it and refocus
    if (focusedField) {
      // Use a small timeout to ensure the DOM is updated
      const timer = setTimeout(() => {
        const element = document.querySelector(`[name="${focusedField}"]`) as HTMLElement;
        if (element) {
          element.focus();
          // For input elements, try to preserve cursor position
          if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
            const length = element.value.length;
            element.setSelectionRange(length, length);
          }
        }
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [formData, focusedField]);

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
      
      // Convert category information to the format expected by the backend
      const categoryId = formData.categoryId !== undefined 
        ? (formData.categoryId === null ? null : Number(formData.categoryId)) 
        : null;
      
      console.log(`Saving item with category ID: ${categoryId}, title: ${formData.title}`);
      
      // Call the UpdateItemClient function with the proper parameters
      const response = await UpdateItemClient(
        parseInt(formData.id),
        categoryId,
        formData.title,
        itemData
      );
      
      console.log("Item updated successfully:", response);
      
      // Show success toast
      toast({
        title: "Changes saved",
        description: "Your item has been updated successfully.",
      });
      
      // Call onUpdate callback if provided
      if (onUpdate) {
        const updatedPassword: PasswordEntry = {
          ...formData,
          dateModified: new Date()
        };
        onUpdate(updatedPassword);
      }
      
      // Exit editing mode
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating item:", error);
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
    // Only update formData if password is not null
    if (password) {
      setFormData(password);
    }
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
    // Track which field is being edited
    setFocusedField(field);
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleCategoryChange = (value: string) => {
    console.log(`Selected category: ${value}`);
    
    if (value === NO_CATEGORY) {
      // If "None" was selected, set category to null and categoryId to null
      setFormData(prev => ({
        ...prev,
        category: null,
        categoryId: null
      }));
    } else {
      // Find the category object with this name to get its ID
      const selectedCategory = categories.find(cat => cat.name === value);
      if (selectedCategory) {
        setFormData(prev => ({
          ...prev,
          category: value,
          categoryId: selectedCategory.id
        }));
        console.log(`Set category: ${value}, id: ${selectedCategory.id}`);
      }
    }
  };

  const handleDelete = async () => {
    // Check if we have a valid ID before proceeding
    if (!formData || !formData.id) {
      console.error("Cannot delete: Invalid item ID");
      toast({
        title: "Delete failed",
        description: "Cannot delete this item because it has no ID.",
        variant: "destructive",
      });
      return;
    }
    
    // Open the confirmation dialog instead of using window.confirm
    setIsDeleteDialogOpen(true);
  };

  // Add a new function to handle the actual deletion after confirmation
  const handleConfirmDelete = async () => {
    try {
      console.log(`Deleting item with ID: ${formData.id}...`);
      
      // Call the DeleteItemClient function with the item ID
      const response = await DeleteItemClient(parseInt(formData.id));
      
      console.log("Item deleted successfully:", response);
      
      // Show success toast
      toast({
        title: "Item deleted",
        description: "Your item has been removed successfully.",
        variant: "destructive",
      });
      
      // Call the onDelete callback to update the parent component
      if (onDelete) {
        onDelete(parseInt(formData.id));
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      
      // Show error toast
      toast({
        title: "Delete failed",
        description: "Failed to delete item. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Close the dialog
      setIsDeleteDialogOpen(false);
    }
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
    // Check if password is null before accessing its properties
    if (!password) {
      return <File className="h-5 w-5" />;
    }
    
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
      default:
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

  // Check for missing data or when panel is closed
  if (!isOpen || !password) {
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
    <div className="h-full flex flex-col bg-background">
      {/* Fixed header */}
      <div className="flex-shrink-0 h-[60px] items-center justify-between border-b border-border px-6 flex">
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
          <SettingsDropdown 
            variant="more"
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-grow overflow-auto custom-scrollbar px-6 py-4">
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

          {/* Category selector - with improved loading state */}
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
                    <SelectValue placeholder={isLoadingItemCategory ? "Loading..." : "Select a category"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_CATEGORY}>None</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center h-10">
                  {isLoadingItemCategory ? (
                    <span className="text-sm text-muted-foreground">Loading category...</span>
                  ) : (
                    <span className="text-sm">
                      {formData.category ? (
                        <span className="px-2 py-1 bg-secondary/50 rounded-md">{formData.category}</span>
                      ) : (
                        <span className="text-muted-foreground">Uncategorized</span>
                      )}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>          {/* Subtle timestamps section with stacked layout */}
          <div className="space-y-2 mt-4 pt-3 border-t border-border/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                <label className="text-xs font-medium text-muted-foreground/70">Timestamps</label>
              </div>
              <div className="text-[10px] text-muted-foreground/50 italic">
                {getUserTimezoneName()}
              </div>
            </div>
            
            <div className="space-y-2 pl-1">
              {/* Created timestamp */}
              <div className="flex items-baseline gap-2">
                <div className="w-16 flex-shrink-0">
                  <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wide">Created</span>
                </div>
                <div className="font-mono text-xs text-muted-foreground/80">
                  {formatDateTime(formData.dateCreated)}
                </div>
              </div>
              
              {/* Modified timestamp */}
              <div className="flex items-baseline gap-2">
                <div className="w-16 flex-shrink-0">
                  <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wide">Modified</span>
                </div>
                <div className="font-mono text-xs text-muted-foreground/80">
                  {formatDateTime(formData.dateModified)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        itemType={formData.type === 'memo' ? 'note' : formData.type}
        itemName={formData.title}
      />
    </div>
  );
}