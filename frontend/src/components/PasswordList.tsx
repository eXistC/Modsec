import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Globe, Plus, Search, User, CreditCard, Wallet, File, AlertCircle, Loader2, Bookmark, ChevronDown, SortAsc, SortDesc, ArrowDownAZ, ArrowUpZA, CalendarClock, X } from "lucide-react";
import { useState, useEffect } from "react";
import { IdentityEntry, PasswordEntry, PasswordType } from "@/types/password";
import { NewItemTypeOverlay } from "./Overlays/NewItemTypeOverlay";
import { NewItemCreateOverlay } from "./Overlays/NewItemCreateOverlay";
import { useColorSettings } from "@/context/ColorSettingsContext";
import { GetPasswordList, ToggleBookmark } from "@/wailsjs/go/main/App";
import { useToast } from "./ui/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCategories } from "@/context/CategoryContext";
import { Badge } from "@/components/ui/badge";

// Update the PasswordListProps interface
export interface PasswordListProps {
  currentView: string;
  onSelectPassword: (password: PasswordEntry) => void;
  onToggleBookmark: (id: number) => void;
  // Add this new prop
  refreshTrigger?: number; // A counter that triggers refresh when it changes
}

// Helper function for credit card formatting
const maskCardNumber = (cardNumber: string) => {
  return `•••• •••• •••• ${cardNumber.slice(-4)}`;
};

// Helper for name formatting
const formatFullName = (entry: IdentityEntry) => {
  return `${entry.firstName} ${entry.lastName}`.trim();
};

// Map backend types to frontend types
const mapTypeToFrontend = (backendType: string): PasswordType => {
  // First normalize the type to lowercase for case-insensitive comparison
  const type = backendType?.toLowerCase() || '';
  
  switch (type) {
    case 'login':
      return 'website';
    case 'note':
      return 'memo';
    case 'cryptowallet':
      return 'crypto';
    case 'identity':
      return 'identity';
    case 'card':
      return 'card';
    case 'credit':  
      return 'card';
    // Other mappings
    case 'website':
      return 'website';
    case 'crypto':
      return 'crypto';
    case 'memo':
      return 'memo';
    default:
      console.warn(`Unknown type: "${backendType}", defaulting to memo`);
      return 'memo';
  }
};

// Convert backend data to frontend format
const convertToPasswordEntry = (item: any): PasswordEntry => {
  try {
    if (!item) {
      console.error("Null or undefined item received");
      throw new Error("Invalid item");
    }

    // Log the item to help with debugging
    console.log("Converting item:", item.ItemID, item.Title, item.TypeName);
    
    // Get the frontend type based on backend type
    const frontendType = mapTypeToFrontend(item.TypeName || "memo");
    console.log(`Mapped type ${item.TypeName} -> ${frontendType}`);
    
    // Base properties common to all entry types
    const baseProps = {
      id: String(item.ItemID || 0),
      title: item.Title || "[Untitled]",
      isBookmarked: Boolean(item.IsBookmark),
      dateCreated: new Date(item.DateCreate || Date.now()),
      dateModified: new Date(item.DateModify || Date.now()),
      notes: "",
      categoryId: item.CategoryID || null
    };

    // Make sure Data is an object
    const data = typeof item.Data === 'object' && item.Data !== null ? item.Data : {};
    
    // Create the appropriate type of entry based on the frontend type
    switch (frontendType) {
      case 'website':
        return {
          ...baseProps,
          type: 'website' as const,
          username: data.username || '',
          password: data.password || '',
          url: data.url || '',
          notes: data.notes || ''
        };
      
      case 'card':
        return {
          ...baseProps,
          type: 'card' as const,
          cardholderName: data.cardholder || data.cardholderName || '',
          cardNumber: data.cardNumber || data.number || '',
          expirationMonth: data.expMonth || data.expirationMonth || '',
          expirationYear: data.expYear || data.expirationYear || '',
          cvv: data.cvv || '',
          notes: data.notes || ''
        };
      
      case 'identity':
        return {
          ...baseProps,
          type: 'identity' as const,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          notes: data.notes || ''
        };
      
      case 'crypto':
        return {
          ...baseProps,
          type: 'crypto' as const,
          walletName: data.walletName || '',
          address: data.address || '',
          privateKey: data.privateKey || '',
          notes: data.notes || ''
        };
      
      default:
        return {
          ...baseProps,
          type: 'memo' as const,
          content: data.content || '',
          notes: data.notes || ''
        };
    }
  } catch (error) {
    console.error("Error converting item:", error);
    return {
      id: "error-" + Date.now(),
      title: "[Error Loading Item]",
      type: 'memo' as const,
      isBookmarked: false,
      dateCreated: new Date(),
      dateModified: new Date(),
      content: ""
    };
  }
};

// Add these types near your other types
type SortField = 'title' | 'dateCreated' | 'dateModified' | 'type';
type SortDirection = 'asc' | 'desc';

export function PasswordList({ 
  currentView, 
  onSelectPassword,
  onToggleBookmark,
  refreshTrigger = 0 // Default to 0
}: PasswordListProps) {
  // Get the active category from context
  const { activeCategory, clearActiveCategory } = useCategories();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showTypeOverlay, setShowTypeOverlay] = useState(false);
  const [selectedType, setSelectedType] = useState<PasswordType | null>(null);
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { colors } = useColorSettings();
  const { toast } = useToast();
  const [sortField, setSortField] = useState<SortField>('dateModified');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Load passwords on component mount
  useEffect(() => {
    loadPasswords();
  }, []);

  // Add dependency to the useEffect to reload when refreshTrigger or activeCategory changes
  useEffect(() => {
    loadPasswords();
  }, [refreshTrigger, activeCategory]);

  const loadPasswords = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Calling GetPasswordList...");
      
      // Call the API to get password list
      const items = await GetPasswordList();
      console.log("Raw GetPasswordList response:", items);
      
      // Check if we got items back
      if (items && Array.isArray(items) && items.length > 0) {
        console.log(`Found ${items.length} items to process`);
        
        // Process each item
        const convertedPasswords = [];
        for (const item of items) {
          try {
            const converted = convertToPasswordEntry(item);
            convertedPasswords.push(converted);
          } catch (itemError) {
            console.error("Failed to convert item:", itemError);
          }
        }
        
        console.log(`Successfully processed ${convertedPasswords.length} items`);
        setPasswords(convertedPasswords);
      } else {
        // Set empty array if no items found
        console.log("No items found in response");
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
      // Set empty array on error
      setPasswords([]);
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

  const getSortedPasswords = (passwords: PasswordEntry[]) => {
    return [...passwords].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'dateCreated':
          comparison = new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime();
          break;
        case 'dateModified':
          comparison = new Date(a.dateModified).getTime() - new Date(b.dateModified).getTime();
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const filterPasswords = (passwords: PasswordEntry[]) => {
    return passwords.filter(password => {
      // Apply bookmarks filter for bookmark view
      if (currentView === "bookmarks" && !password.isBookmarked) {
        return false;
      }

      // Apply category filter if an active category is set
      if (activeCategory) {
        // Simply use the categoryId property that exists on PasswordEntry
        if (password.categoryId !== activeCategory.id) {
          return false;
        }
      }

      // Apply search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const titleMatch = password.title.toLowerCase().includes(searchLower);
        const contentMatch = password.type === 'website' && password.username?.toLowerCase().includes(searchLower);
        const cardMatch = password.type === 'card' && password.cardNumber?.toLowerCase().includes(searchLower);
        const nameMatch = password.type === 'identity' && (
          password.firstName?.toLowerCase().includes(searchLower) ||
          password.lastName?.toLowerCase().includes(searchLower)
        );
        
        return titleMatch || contentMatch || cardMatch || nameMatch;
      }
      
      return true;
    });
  };

  const filteredPasswords = getSortedPasswords(filterPasswords(passwords));

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <SortAsc className="h-3 w-3 ml-1" /> : 
      <SortDesc className="h-3 w-3 ml-1" />;
  };

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
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-normal">
            {currentView === "bookmarks" ? "Bookmarks" : "All Passwords"}
          </h2>
        </div>
        
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
        {/* Enhanced sorting UI */}
        <div className="flex items-center justify-between mt-2 px-1">
          <div className="text-xs font-medium text-muted-foreground">
            {filteredPasswords.length} {filteredPasswords.length === 1 ? 'item' : 'items'}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 gap-1.5 text-xs px-2 hover:bg-secondary/80"
              >
                <span className="text-muted-foreground">Sort:</span>
                <span className="font-medium">
                  {sortField === 'title' && 'Title'}
                  {sortField === 'dateCreated' && 'Created'}
                  {sortField === 'dateModified' && 'Modified'}
                  {sortField === 'type' && 'Type'}
                </span>
                {sortField === 'title' && (sortDirection === 'asc' ? 
                  <ArrowDownAZ className="h-3.5 w-3.5 text-primary" /> : 
                  <ArrowUpZA className="h-3.5 w-3.5 text-primary" />
                )}
                {(sortField === 'dateCreated' || sortField === 'dateModified') && (
                  <CalendarClock className={`h-3.5 w-3.5 text-primary ${sortDirection === 'desc' ? 'rotate-0' : 'rotate-180'}`} />
                )}
                {sortField === 'type' && (sortDirection === 'asc' ? 
                  <SortAsc className="h-3.5 w-3.5 text-primary" /> : 
                  <SortDesc className="h-3.5 w-3.5 text-primary" />
                )}
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-[180px]">
              <DropdownMenuItem 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => {
                  if (sortField === 'title') {
                    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortField('title');
                    setSortDirection('asc');
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <ArrowDownAZ className={`h-3.5 w-3.5 ${sortField === 'title' ? 'text-primary' : 'text-muted-foreground opacity-70'}`} />
                  <span>Title</span>
                </div>
                {sortField === 'title' && (
                  <span className="text-xs font-medium text-primary">
                    {sortDirection === 'asc' ? 'A → Z' : 'Z → A'}
                  </span>
                )}
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => {
                  if (sortField === 'dateModified') {
                    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortField('dateModified');
                    setSortDirection('desc'); // Default to newest first
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <CalendarClock className={`h-3.5 w-3.5 ${sortField === 'dateModified' ? 'text-primary' : 'text-muted-foreground opacity-70'}`} />
                  <span>Last modified</span>
                </div>
                {sortField === 'dateModified' && (
                  <span className="text-xs font-medium text-primary">
                    {sortDirection === 'desc' ? 'Newest' : 'Oldest'}
                  </span>
                )}
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => {
                  if (sortField === 'dateCreated') {
                    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortField('dateCreated');
                    setSortDirection('desc'); // Default to newest first
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <CalendarClock className={`h-3.5 w-3.5 ${sortField === 'dateCreated' ? 'text-primary' : 'text-muted-foreground opacity-70'}`} />
                  <span>Date created</span>
                </div>
                {sortField === 'dateCreated' && (
                  <span className="text-xs font-medium text-primary">
                    {sortDirection === 'desc' ? 'Newest' : 'Oldest'}
                  </span>
                )}
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => {
                  if (sortField === 'type') {
                    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortField('type');
                    setSortDirection('asc');
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <File className={`h-3.5 w-3.5 ${sortField === 'type' ? 'text-primary' : 'text-muted-foreground opacity-70'}`} />
                  <span>Type</span>
                </div>
                {sortField === 'type' && (
                  <span className="text-xs font-medium text-primary">
                    {sortDirection === 'asc' ? 'A → Z' : 'Z → A'}
                  </span>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-150px)]">
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
            {filteredPasswords.length > 0 ? (
              filteredPasswords.map((entry) => (
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
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the parent button click
                        toggleBookmark(entry.id)(e);
                      }}
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
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mb-2" />
                <p className="text-sm">
                  {activeCategory ? (
                    <>No items in {activeCategory.name}</>
                  ) : currentView === "bookmarks" ? (
                    <>No bookmarked items</>
                  ) : (
                    <>No items found</>
                  )}
                </p>
                
                {/* Show clear filters button if we have an active filter */}
                {(activeCategory || searchQuery) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery("");
                      clearActiveCategory();
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
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