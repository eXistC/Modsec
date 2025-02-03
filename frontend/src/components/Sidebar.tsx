import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Bookmark, FileText, Infinity, Settings, Trash2 } from "lucide-react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn("border-r bg-[#1E1E1E]", className)}>
      <div className="flex h-[60px] items-center px-6 border-b border-border">
        <span className="text-sm">example@gmail.com</span>
        <Button variant="ghost" size="icon" className="ml-auto h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <Button variant="secondary" className="w-full justify-start text-sm h-9">
              <FileText className="mr-2 h-4 w-4" />
              All Passwords
            </Button>
            <Button variant="ghost" className="w-full justify-start text-sm h-9">
              <Bookmark className="mr-2 h-4 w-4" />
              Bookmark
            </Button>
            <Button variant="ghost" className="w-full justify-start text-sm h-9">
              <Infinity className="mr-2 h-4 w-4" />
              Generator
            </Button>
            <Button variant="ghost" className="w-full justify-start text-sm h-9">
              <Trash2 className="mr-2 h-4 w-4" />
              Trash
            </Button>
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xs font-semibold text-muted-foreground">
            VAULTS
          </h2>
          <ScrollArea className="h-[300px] px-1">
            <div className="space-y-1">
              <h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground">SCHOOL</h3>
              {['KMUTT', 'MIT', 'CU'].map((vault) => (
                <Button
                  key={vault}
                  variant="ghost"
                  className="w-full justify-start pl-8 text-sm h-9 font-normal"
                >
                  {vault}
                </Button>
              ))}
              <h3 className="mt-4 mb-2 px-4 text-xs font-semibold text-muted-foreground">SCHOOL</h3>
              {['KMUTT', 'MIT', 'CU'].map((vault) => (
                <Button
                  key={vault + '2'}
                  variant="ghost"
                  className="w-full justify-start pl-8 text-sm h-9 font-normal"
                >
                  {vault}
                </Button>
              ))}
              <h3 className="mt-4 mb-2 px-4 text-xs font-semibold text-muted-foreground">SCHOOL</h3>
              {['KMUTT', 'MIT', 'CU'].map((vault) => (
                <Button
                  key={vault + '3'}
                  variant="ghost"
                  className="w-full justify-start pl-8 text-sm h-9 font-normal"
                >
                  {vault}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}