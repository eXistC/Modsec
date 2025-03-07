import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

export function CatList() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState([
    { name: "SCHOOL", count: 3 },
    { name: "WORK", count: 2 },
    { name: "PERSONAL", count: 2 }
  ]);
  const [newCategory, setNewCategory] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      setCategories([...categories, { name: newCategory.toUpperCase(), count: 0 }]);
      setNewCategory("");
      setIsAdding(false);
    }
  };

  return (
    <div className="px-3 py-2">
      <div className="flex justify-between items-center mb-2 px-4">
        <h2 className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground/70">
          Categories
        </h2>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-5 w-5" 
          onClick={() => setIsAdding(!isAdding)}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {isAdding && (
        <div className="px-1 mb-2 flex gap-1">
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category"
            className="h-8 text-xs"
            onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
          />
          <Button 
            size="sm" 
            className="h-8" 
            onClick={handleAddCategory}
          >
            Add
          </Button>
        </div>
      )}

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