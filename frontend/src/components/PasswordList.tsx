import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Globe, Plus, Search, User, CreditCard, Pen, Bookmark } from "lucide-react";

interface PasswordEntry {
  id: string;
  type: "website" | "identity" | "card" | "note";
  title: string;
  username?: string;
  cardNumber?: string;
  isBookmarked?: boolean;
}

const mockPasswords: PasswordEntry[] = [
  {
    id: "1",
    type: "website",
    title: "Darkweb.onion",
    username: "example@gmail.com",
    isBookmarked: true,
  },
  {
    id: "2",
    type: "note",
    title: "Note of something",
  },
  {
    id: "3",
    type: "identity",
    title: "English Name",
    username: "Mr. Sum Think Wong",
  },
  {
    id: "4",
    type: "card",
    title: "Not mine",
    cardNumber: "1234 12XX XXXX 1234",
  },
  // Repeat entries to match the mockup
  {
    id: "5",
    type: "note",
    title: "Note of something",
  },
  {
    id: "6",
    type: "identity",
    title: "English Name",
    username: "Mr. Sum Think Wong",
  },
  {
    id: "7",
    type: "card",
    title: "Not mine",
    cardNumber: "1234 12XX XXXX 1234",
  },
];

export function PasswordList() {
  return (
    <div className="h-full bg-[#1E1E1E]">
      <div className="flex h-[60px] items-center justify-between border-b border-border px-6">
        <h2 className="text-sm font-normal">All Vaults</h2>
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
          />
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-140px)]">
        <div className="space-y-1 p-2">
          {mockPasswords.map((entry) => (
            <Button
              key={entry.id}
              variant="ghost"
              className="w-full justify-start p-3 h-auto relative group"
            >
              <div className="flex items-start gap-3 w-full">
                {entry.type === "website" && <Globe className="h-5 w-5 mt-0.5" />}
                {entry.type === "identity" && <User className="h-5 w-5 mt-0.5" />}
                {entry.type === "card" && <CreditCard className="h-5 w-5 mt-0.5" />}
                {entry.type === "note" && <Pen className="h-5 w-5 mt-0.5" />}
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
                {entry.isBookmarked && (
                  <Bookmark className="h-4 w-4 text-muted-foreground absolute right-3" />
                )}
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}