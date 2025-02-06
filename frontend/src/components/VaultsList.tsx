import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

export function VaultsList() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = [
    { name: "SCHOOL", count: 3 },
    { name: "WORK", count: 2 },
    { name: "PERSONAL", count: 2 }
  ];

  return (
    <div className="px-3 py-2">
      <h2 className="mb-2 px-4 text-[11px] font-medium tracking-wide uppercase text-muted-foreground/70">
        Categories
      </h2>
      <ScrollArea className="px-1">
        <div className="space-y-0.5">
          {categories.map(({ name, count }) => (
            <Button
              key={name}
              variant={activeCategory === name ? "secondary" : "ghost"}
              className={`group w-full justify-start text-[13px] h-8 font-medium
                relative overflow-hidden transition-all duration-200
                ${activeCategory === name 
                  ? 'bg-secondary/50 text-primary before:absolute before:left-0 before:top-[15%] before:h-[70%] before:w-[2px] before:bg-primary' 
                  : 'text-muted-foreground hover:text-primary hover:bg-secondary/30'}`}
              onClick={() => setActiveCategory(name)}
            >
              <div className="flex items-center w-full">
                <span>{name}</span>
                <span className={`ml-auto text-[11px] px-1.5 py-0.5 rounded-full transition-colors duration-200
                  ${activeCategory === name
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'}`}>
                  {count}
                </span>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}