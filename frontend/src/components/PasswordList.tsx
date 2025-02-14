import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Globe, Plus, Search, User, CreditCard, Pen, Bookmark, BookmarkCheck, Wallet, File, AlertCircle } from "lucide-react";
import { useState } from "react";
import { IdentityEntry, PasswordEntry, PasswordType } from "@/types/password";
import { NewItemTypeOverlay } from "./Overlays/NewItemTypeOverlay";
import { NewItemCreateOverlay } from "./Overlays/NewItemCreateOverlay";

// Export the interface separately
export interface PasswordListProps {
  currentView: string;
  onSelectPassword: (password: PasswordEntry) => void;
  passwords: PasswordEntry[];
  onToggleBookmark: (id: string) => void;
}

// Add this helper function at the top of the file, after imports
const maskCardNumber = (cardNumber: string) => {
  return `•••• •••• •••• ${cardNumber.slice(-4)}`;
};

// Add after the maskCardNumber function
const formatFullName = (entry: IdentityEntry) => {
  return `${entry.firstName} ${entry.lastName}`.trim();
};

export function PasswordList({ 
  currentView, 
  onSelectPassword,
  passwords,
  onToggleBookmark 
}: PasswordListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showTypeOverlay, setShowTypeOverlay] = useState(false);
  const [selectedType, setSelectedType] = useState<PasswordType | null>(null);

  const toggleBookmark = (id: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleBookmark?.(id);
  };

  const filteredPasswords = passwords
    .filter(entry => 
      // First apply bookmark filter if we're in bookmarks view
      (currentView === "bookmarks" ? entry.isBookmarked : true) &&
      // Then apply search filter
      (entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       (entry.type === "website" && entry.username?.toLowerCase().includes(searchQuery.toLowerCase())) ||
       (entry.type === "card" && entry.cardNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
       (entry.type === "identity" && (
         entry.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
         entry.lastName.toLowerCase().includes(searchQuery.toLowerCase())
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
    // Handle saving the new item
    console.log("New item created:", entry);
    setSelectedType(null);
    // You might want to add the new item to the passwords list here
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
                <div className="flex-shrink-0">
                  {entry.type === "website" && (
                    <Globe className="h-[18px] w-[18px] text-muted-foreground" />
                  )}
                  {entry.type === "identity" && (
                    <User className="h-[18px] w-[18px] text-muted-foreground" />
                  )}
                  {entry.type === "card" && (
                    <CreditCard className="h-[18px] w-[18px] text-muted-foreground" />
                  )}
                  {entry.type === "crypto" && (
                    <Wallet className="h-[18px] w-[18px] text-muted-foreground" />
                  )}
                  {entry.type === "memo" && (
                    <File className="h-[18px] w-[18px] text-muted-foreground" />
                  )}
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
                      {formatFullName(entry)}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 absolute right-2.5 top-1/2 -translate-y-1/2
                    transition-opacity duration-200 
                    ${entry.isBookmarked 
                      ? 'hover:bg-primary/10' 
                      : 'opacity-0 group-hover:opacity-100 hover:bg-secondary'}`}
                  onClick={toggleBookmark(entry.id)}
                >
                  <Bookmark 
                    className={`h-4 w-4 transition-colors duration-200
                      ${entry.isBookmarked 
                        ? 'text-primary fill-primary hover:text-primary/90 hover:fill-primary/90' 
                        : 'text-muted-foreground/50 hover:text-primary/60'}`}
                  />
                </Button>
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