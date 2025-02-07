import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Globe, Plus, Search, User, CreditCard, Pen, Bookmark, BookmarkCheck, Wallet, File, AlertCircle } from "lucide-react";
import { useState } from "react";
import { PasswordEntry } from "@/types/password";

// Export the interface separately
export interface PasswordListProps {
  currentView: string;
  onSelectPassword: (password: PasswordEntry) => void;
  passwords: PasswordEntry[];
  onToggleBookmark: (id: string) => void;
}

export function PasswordList({ 
  currentView, 
  onSelectPassword,
  passwords,
  onToggleBookmark 
}: PasswordListProps) {
  const [searchQuery, setSearchQuery] = useState("");

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
       entry.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       entry.cardNumber?.toLowerCase().includes(searchQuery.toLowerCase()))
    );



  return (
    <div className="h-full bg-[#1E1E1E]">
      <div className="flex h-[60px] items-center justify-between border-b border-border px-6">
        <h2 className="text-sm font-normal">
          {currentView === "bookmarks" ? "Bookmarks" : "All Passwords"}
        </h2>
        <Button size="sm" variant="outline" className="bg-secondary hover:bg-secondary/80">
          <Plus className="mr-2 h-4 w-4" />
          New Item
        </Button>
      </div>
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            className="pl-9 bg-secondary border-0" 
            placeholder="Search..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            //onClick={SimplePOC()}
          />
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-140px)]">
        <div className="space-y-1 p-2">
          {filteredPasswords.map((entry) => (
            <Button
              key={entry.id}
              variant="ghost"
              className="w-full justify-start p-3 h-auto relative group 
                hover:bg-secondary/40 transition-colors duration-200"
              onClick={() => onSelectPassword?.(entry)}
            >
              <div className="flex items-center gap-3 w-full min-h-[40px]">
                <div className="flex-shrink-0">
                  {entry.type === "website" && (
                    <Globe className="h-5 w-5" />
                  )}
                  {entry.type === "identity" && (
                    <User className="h-5 w-5" />
                  )}
                  {entry.type === "card" && (
                    <CreditCard className="h-5 w-5" />
                  )}
                  {entry.type === "crypto" && (
                    <Wallet className="h-5 w-5" />
                  )}
                  {entry.type === "memo" && (
                    <File className="h-5 w-5" />
                  )}
                  {entry.type === "note" && (
                    <Pen className="h-5 w-5" />
                  )}
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium text-sm">{entry.title}</div>
                  {entry.username && (
                    <div className="text-sm text-muted-foreground">
                      {entry.username}
                    </div>
                  )}
                  {entry.cardNumber && (
                    <div className="text-sm text-muted-foreground">
                      {entry.cardNumber}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 absolute right-3 top-1/2 -translate-y-1/2
                    transition-opacity duration-200
                    ${entry.isBookmarked 
                      ? 'opacity-100' 
                      : 'opacity-0 group-hover:opacity-100'}`}
                  onClick={toggleBookmark(entry.id)}
                >
                  {entry.isBookmarked ? (
                    <BookmarkCheck 
                      className="h-4 w-4 text-primary transition-colors duration-200
                        hover:text-primary/80" 
                    />
                  ) : (
                    <Bookmark 
                      className="h-4 w-4 transition-colors duration-200
                        hover:text-primary/60" 
                    />
                  )}
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
    </div>
  );
}