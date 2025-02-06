import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

export function BookmarkList() {
  return (
    <div className="h-full bg-[#1E1E1E]">
      <div className="flex h-[60px] items-center justify-between border-b border-border px-6">
        <h2 className="text-sm font-normal">Bookmarks</h2>
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
            placeholder="Search bookmarks..." 
          />
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-140px)]">
        <div className="space-y-1 p-2">
          {/* Bookmarked items will be mapped here */}
        </div>
      </ScrollArea>
    </div>
  );
}