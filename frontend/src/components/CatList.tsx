import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { CreateCategoryClient, DeleteCategoryClient, GetCategoryList } from "@/wailsjs/go/main/App";

export interface Category {
  id: number;
  name: string;
  count: number;
}

export function CatList() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Add the missing loadCategories function
  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const categoryData = await GetCategoryList();
      // Transform the data to match our Category interface
      const transformedData: Category[] = categoryData.map(category => ({
        id: category.CategoryID,
        name: category.CategoryName,
        count: category.ItemCount
      }));
      setCategories(transformedData);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast({
        variant: "destructive",
        title: "Failed to load categories",
        description: "There was a problem loading your categories."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add this function to check for duplicate category names
  const isDuplicateCategoryName = (name: string): boolean => {
    return categories.some(category => 
      category.name.toLowerCase() === name.toLowerCase()
    );
  };

  // Fetch categories when component mounts
  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddCategory = async () => {
    const trimmedName = newCategory.trim();
    if (!trimmedName) return;
    
    // Check for duplicate category name
    if (isDuplicateCategoryName(trimmedName)) {
      toast({
        title: "Category already exists",
        description: "Please use a unique category name.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Call the Go function to create a new category
      const response = await CreateCategoryClient(trimmedName);
      if (response) {
        toast({
          title: "Category created",
          description: "Your new category has been created successfully.",
        });
        
        // Refresh the category list
        await loadCategories();
      }
    } catch (error) {
      console.error("Failed to create category:", error);
      toast({
        title: "Error creating category",
        description: "Could not create the category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setNewCategory("");
      setIsAdding(false);
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    
    setIsLoading(true);
    try {
      // Call the Go function to delete the category
      const response = await DeleteCategoryClient(categoryId);
      if (response) {
        toast({
          title: "Category deleted",
          description: "The category has been removed successfully.",
        });
        
        // If the deleted category was active, clear the active selection
        if (activeCategory === categories.find(c => c.id === categoryId)?.name) {
          setActiveCategory(null);
        }
        
        // Refresh the category list
        await loadCategories();
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
      toast({
        title: "Error deleting category",
        description: "Could not delete the category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      {isAdding && (
        <div className="px-1 mb-2 flex gap-1">
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category"
            className="h-8 text-xs"
            disabled={isLoading}
            onKeyDown={(e) => e.key === "Enter" && !isLoading && handleAddCategory()}
          />
          <Button 
            size="sm" 
            className="h-8" 
            onClick={handleAddCategory}
            disabled={isLoading || !newCategory.trim()}
          >
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Add"}
          </Button>
        </div>
      )}

      <ScrollArea className="px-1 max-h-[200px]">
        {isLoading && categories.length === 0 ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-4 text-sm text-muted-foreground">
            No categories found
          </div>
        ) : (
          <div className="space-y-0.5">
            {categories.map(({ id, name, count }) => (
              <Button
                key={id}
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
                {/* Delete button that appears on hover */}
                <button
                  className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded-full transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCategory(id);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </Button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}