import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Globe, Plus, Search, User, CreditCard, Wallet, File, AlertCircle, Loader2, Bookmark } from "lucide-react";
import { useState, useEffect } from "react";
import { IdentityEntry, PasswordEntry, PasswordType } from "@/types/password";
import { NewItemTypeOverlay } from "./Overlays/NewItemTypeOverlay";
import { NewItemCreateOverlay } from "./Overlays/NewItemCreateOverlay";
import { useColorSettings } from "@/context/ColorSettingsContext";
import { GetPasswordList, ToggleBookmark } from "@/wailsjs/go/main/App";
import { useToast } from "./ui/use-toast";

// Export the interface separately
export interface PasswordListProps {
  currentView: string;
  onSelectPassword: (password: PasswordEntry) => void;
  onToggleBookmark: (id: number) => void;
}

// Add this helper function at the top of the file, after imports
const maskCardNumber = (cardNumber: string) => {
  return `•••• •••• •••• ${cardNumber.slice(-4)}`;
};

// Add after the maskCardNumber function
const formatFullName = (entry: IdentityEntry) => {
  return `${entry.firstName} ${entry.lastName}`.trim();
};

// Convert backend data to frontend format
const convertToPasswordEntry = (item: any): PasswordEntry => {
  // Extract the basic fields that are common to all types
  const baseEntry = {
    id: item.ItemID.toString(),
    title: item.Title,
    type: item.TypeName.toLowerCase(),
    isBookmarked: item.IsBookmark,
    dateCreated: new Date(item.DateCreate),
    dateModified: new Date(item.DateModify),
  };

  // Add type-specific fields based on the item type
  if (item.TypeName.toLowerCase() === 'website') {
    return {
      ...baseEntry,
      username: item.Data?.username || '',
      password: item.Data?.password || '',
      url: item.Data?.url || '',
      notes: item.Data?.notes || ''
    };
  } else if (item.TypeName.toLowerCase() === 'card') {
    return {
      ...baseEntry,
      cardholderName: item.Data?.cardholder || '',
      cardNumber: item.Data?.cardNumber || '',
      expirationMonth: item.Data?.expMonth || '',
      expirationYear: item.Data?.expYear || '',
      cvv: item.Data?.cvv || '',
      notes: item.Data?.notes || ''
    };
  } else if (item.TypeName.toLowerCase() === 'identity') {
    return {
      ...baseEntry,
      firstName: item.Data?.firstName || '',
      lastName: item.Data?.lastName || '',
      email: item.Data?.email || '',
      phone: item.Data?.phone || '',
      address: item.Data?.address || '',
      notes: item.Data?.notes || ''
    };
  } else if (item.TypeName.toLowerCase() === 'crypto') {
    return {
      ...baseEntry,
      walletName: item.Data?.walletName || '',
      address: item.Data?.address || '',
      privateKey: item.Data?.privateKey || '',
      notes: item.Data?.notes || ''
    };
  } else {
    // Default to memo type for unrecognized types
    return {
      ...baseEntry,
      content: item.Data?.content || '',
      notes: item.Data?.notes || ''
    };
  }
};

export function PasswordList({ 
  currentView, 
  onSelectPassword,
  onToggleBookmark 
}: PasswordListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showTypeOverlay, setShowTypeOverlay] = useState(false);
  const [selectedType, setSelectedType] = useState<PasswordType | null>(null);
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { colors } = useColorSettings();
  const { toast } = useToast();

  useEffect(() => {
    loadPasswords();
  }, []);

  const loadPasswords = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await GetPasswordList();
      if (data) {
        const convertedPasswords = data.map(convertToPasswordEntry);
        setPasswords(convertedPasswords);
      } else {
        setPasswords([]);
      }
    } catch (err) {
      console.error("Failed to load passwords:", err);
      setError("Failed to load passwords. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load passwords. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBookmark = (id: string) => async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Get the current entry
    const entry = passwords.find(pw => pw.id === id);
    if (!entry) return;
    
    // Get the new bookmark status (toggled)
    const newBookmarkStatus = !entry.isBookmarked;
    
    try {
      // Call the Go backend to update the bookmark
      await ToggleBookmark(Number(id), newBookmarkStatus);
      
      // Optimistically update the UI
      setPasswords(prevPasswords => 
        prevPasswords.map(pw => 
          pw.id === id 
            ? { ...pw, isBookmarked: newBookmarkStatus } 
            : pw
        )
      );
      
      // Notify the parent component
      onToggleBookmark?.(Number(id));
      
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);
      toast({
        title: "Error",
        description: "Failed to update bookmark status.",
        variant: "destructive",
      });
      
      // Refresh the password list to ensure UI is in sync with backend
      loadPasswords();
    }
  };

  const filteredPasswords = passwords
    .filter(entry => 
      // First apply bookmark filter if we're in bookmarks view
      (currentView === "bookmarks" ? entry.isBookmarked : true) &&
      // Then apply search filter
      (entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       (entry.type === "website" && entry.username?.toLowerCase().includes(searchQuery.toLowerCase())) ||
       (entry.type === "card" && entry.cardNumber?.toLowerCase().includes(searchQuery.toLowerCase())) ||
       (entry.type === "identity" && (
         entry.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         entry.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
       )))
    );

  const handleNewItem = () => {
    setShowTypeOverlay(true);
  };

  const handleTypeSelect = (type: PasswordType) => {
    setShowTypeOverlay(false);
    setSelectedType(type);
  };

  const handleCreateNewItem = (entry: PasswordEntry) => {
    // Here you would call your backend to save the item
    console.log("New item created:", entry);
    setSelectedType(null);
    
    // Reload the password list to get the new item
    loadPasswords();
  };

  const getIconStyle = (type: string): React.CSSProperties => {
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
        return { color: 'var(--muted-foreground)' };
    }
  };

  return (
    <div className="h-full bg-[#1E1E1E]">
      <div className="flex h-[60px] items-center justify-between border-b border-border px-4">
        <h2 className="text-sm font-normal">
          {currentView === "bookmarks" ? "Bookmarks" : "All Passwords"}
        </h2>
        <Button 
          size="sm" 
          variant="outline" 
          className="bg-secondary hover:bg-secondary/80"
          onClick={handleNewItem}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Item
        </Button>
      </div>
      <div className="px-3 pt-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            className="pl-8 bg-secondary border-0" 
            placeholder="Search..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="h-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-destructive">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p className="text-sm">{error}</p>
            <Button 
              variant="outline" 
              size="sm"
              className="mt-4"
              onClick={loadPasswords}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredPasswords.map((entry) => (
              <Button
                key={entry.id}
                variant="ghost"
                className="w-full justify-start px-3 py-2 h-auto relative group 
                  hover:bg-secondary/40 transition-colors duration-200"
                onClick={() => onSelectPassword?.(entry)}
              >
                <div className="flex items-center gap-3 w-full min-h-[36px]">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg"
                       style={getIconStyle(entry.type)}>
                    {entry.type === "website" && <Globe className="h-[18px] w-[18px]" />}
                    {entry.type === "identity" && <User className="h-[18px] w-[18px]" />}
                    {entry.type === "card" && <CreditCard className="h-[18px] w-[18px]" />}
                    {entry.type === "crypto" && <Wallet className="h-[18px] w-[18px]" />}
                    {entry.type === "memo" && <File className="h-[18px] w-[18px]" />}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-medium text-sm truncate pr-8">{entry.title}</div>
                    {entry.type === "website" && entry.username && (
                      <div className="text-sm text-muted-foreground/70 truncate pr-8">
                        {entry.username}
                      </div>
                    )}
                    {entry.type === "card" && entry.cardNumber && (
                      <div className="text-sm text-muted-foreground/70 font-mono truncate pr-8">
                        {maskCardNumber(entry.cardNumber)}
                      </div>
                    )}
                    {entry.type === "identity" && (
                      <div className="text-sm text-muted-foreground/70 truncate pr-8">
                        {formatFullName(entry as IdentityEntry)}
                      </div>
                    )}
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    className={`h-7 w-7 absolute right-2.5 top-1/2 -translate-y-1/2
                      transition-opacity duration-200 rounded-md flex items-center justify-center
                      ${entry.isBookmarked 
                        ? 'hover:bg-primary/10' 
                        : 'opacity-0 group-hover:opacity-100 hover:bg-secondary'}`}
                    onClick={toggleBookmark(entry.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleBookmark(entry.id)(e as unknown as React.MouseEvent);
                      }
                    }}
                  >
                    <Bookmark 
                      className={`h-4 w-4 transition-colors duration-200
                        ${entry.isBookmarked 
                          ? 'text-primary fill-primary hover:text-primary/90 hover:fill-primary/90' 
                          : 'text-muted-foreground/50 hover:text-primary/60'}`}
                    />
                  </div>
                </div>
              </Button>
            ))}
            {filteredPasswords.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mb-2" />
                <p className="text-sm">No items found</p>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
      {showTypeOverlay && (
        <NewItemTypeOverlay
          onSelect={handleTypeSelect}
          onClose={() => setShowTypeOverlay(false)}
        />
      )}
      
      {selectedType && (
        <NewItemCreateOverlay
          type={selectedType}
          onSave={handleCreateNewItem}
          onClose={() => setSelectedType(null)}
        />
      )}
    </div>
  );
}