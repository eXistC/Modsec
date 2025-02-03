import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bookmark, Globe, MoreVertical } from "lucide-react";

export function PasswordEditor() {
  return (
    <div className="h-full bg-background">
      <div className="flex h-[60px] items-center justify-between border-b border-border px-6">
        <h1 className="text-lg font-normal">Editing</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="bg-secondary hover:bg-secondary/80">
            Save
          </Button>
          <Button variant="ghost" size="sm">
            Discard
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Bookmark className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Item name</label>
            <div className="flex gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-secondary">
                <Globe className="h-5 w-5" />
              </div>
              <Input 
                placeholder="darkweb.onion" 
                className="bg-secondary border-0"
                value="Darkweb.onion"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Username</label>
            <Input 
              placeholder="example@gmail.com" 
              className="bg-secondary border-0"
              value="Example@gmail.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Password</label>
            <Input 
              type="password" 
              className="bg-secondary border-0 font-mono"
              value="••••••••••••••••"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Notes</label>
            <Textarea 
              placeholder="Add notes..." 
              className="bg-secondary border-0 min-h-[100px]"
              value="This is totally a legit site"
            />
          </div>
          <div className="pt-4 text-xs text-muted-foreground space-y-1">
            <div>Modified: 13/09/2024, 7:52:30</div>
            <div>Created: 11/09/2024, 19:14:00</div>
          </div>
        </div>
      </div>
    </div>
  );
}