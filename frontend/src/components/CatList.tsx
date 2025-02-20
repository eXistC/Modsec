import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { PasswordEntry, Category } from "@/types/password";

interface CatListProps {
  passwords: PasswordEntry[];
  categories: Category[];
  onCategorySelect?: (category: string | null) => void;
  onCategoryAdd?: (category: Category) => void;
  onCategoryDelete?: (categoryId: string) => void;
}

export function CatList({ 
  passwords, 
  categories,
  onCategorySelect,
  onCategoryAdd,
  onCategoryDelete 
}: CatListProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Calculate counts for each category
  const categoriesWithCount = categories.map(cat => ({
    ...cat,
    count: passwords.filter(p => p.category === cat.name).length
  }));

  const handleCategoryClick = (name: string) => {
    const newCategory = activeCategory === name ? null : name;
    setActiveCategory(newCategory);
    onCategorySelect?.(newCategory);
  };

  return (
    <div className="px-3 py-2">
      <h2 className="mb-2 px-4 text-[11px] font-medium tracking-wide uppercase text-muted-foreground/70">
        Categories
      </h2>
      <ScrollArea className="px-1">
        <div className="space-y-0.5">
          {categoriesWithCount.map(({ name, count }) => (
            <Button
              key={name}
              variant={activeCategory === name ? "secondary" : "ghost"}
              className={`group w-full justify-start text-[13px] h-8 font-medium
                relative overflow-hidden transition-all duration-200
                ${activeCategory === name 
                  ? 'bg-secondary/50 text-primary before:absolute before:left-0 before:top-[15%] before:h-[70%] before:w-[2px] before:bg-primary' 
                  : 'text-muted-foreground hover:text-primary hover:bg-secondary/30'}`}
              onClick={() => handleCategoryClick(name)}
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