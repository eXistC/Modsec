import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Plus, Loader2, Edit, Trash2, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { 
  CreateCategoryClient, 
  DeleteCategoryClient, 
  UpdateCategoryClient 
} from "@/wailsjs/go/main/App";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { useCategories, Category } from "@/context/CategoryContext";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Badge } from "@/components/ui/badge";

export function CatList() {
  const [newCategory, setNewCategory] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  
  const { 
    categories, 
    isLoading, 
    refreshCategories,
    activeCategory,
    setActiveCategory,
    clearActiveCategory
  } = useCategories();

  useEffect(() => {
    if (editingCategory && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingCategory]);

  const isDuplicateCategoryName = (name: string, excludeId?: number): boolean => {
    return categories.some(category => 
      category.name.toLowerCase() === name.toLowerCase() &&
      (excludeId === undefined || category.id !== excludeId)
    );
  };

  const handleAddCategory = async () => {
    const trimmedName = newCategory.trim();
    if (!trimmedName) return;
    
    if (isDuplicateCategoryName(trimmedName)) {
      toast({
        title: "Category already exists",
        description: "Please use a unique category name.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await CreateCategoryClient(trimmedName);
      if (response) {
        toast({
          title: "Category created",
          description: "Your new category has been created successfully.",
        });
        
        await refreshCategories();
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
    }
  };

  const handleRenameCategory = async () => {
    if (!editingCategory) return;
    
    const trimmedName = editName.trim();
    if (!trimmedName) {
      toast({
        title: "Invalid name",
        description: "Category name cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    
    if (isDuplicateCategoryName(trimmedName, editingCategory.id)) {
      toast({
        title: "Category already exists",
        description: "Please use a unique category name.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await UpdateCategoryClient(editingCategory.id, trimmedName);
      if (response) {
        toast({
          title: "Category renamed",
          description: "Your category has been updated successfully.",
        });
        
        if (activeCategory && activeCategory.id === editingCategory.id) {
          setActiveCategory({
            ...activeCategory,
            name: trimmedName
          });
        }
        
        await refreshCategories();
      }
    } catch (error) {
      console.error("Failed to rename category:", error);
      toast({
        title: "Error renaming category",
        description: "Could not update the category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEditingCategory(null);
      setEditName("");
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    try {
      const response = await DeleteCategoryClient(categoryToDelete.id);
      if (response) {
        toast({
          title: "Category deleted",
          description: "The category has been removed successfully.",
        });
        
        if (activeCategory && activeCategory.id === categoryToDelete.id) {
          clearActiveCategory();
        }
        
        await refreshCategories();
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
      toast({
        title: "Error deleting category",
        description: "Could not delete the category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCategoryToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const confirmDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const startEditCategory = (category: Category) => {
    setEditingCategory(category);
    setEditName(category.name);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setEditName("");
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleRenameCategory();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  const handleCategoryClick = (category: Category) => {
    if (activeCategory && activeCategory.id === category.id) {
      clearActiveCategory();
    } else {
      setActiveCategory(category);
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
            {categories.map((category) => (
              <div key={category.id}>
                {editingCategory?.id === category.id ? (
                  <div className="px-1 mb-1 flex gap-1">
                    <Input
                      ref={editInputRef}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8 text-xs"
                      disabled={isLoading}
                      onKeyDown={handleEditKeyDown}
                    />
                    <Button 
                      size="sm" 
                      className="h-8 px-2"
                      onClick={handleRenameCategory}
                      disabled={isLoading || !editName.trim()}
                    >
                      {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="h-8 px-2"
                      onClick={cancelEdit}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <ContextMenu>
                    <ContextMenuTrigger asChild>
                      <Button
                        variant={activeCategory?.id === category.id ? "secondary" : "ghost"}
                        className={`group w-full justify-start text-[13px] h-8 font-medium
                          relative overflow-hidden transition-all duration-200
                          ${activeCategory?.id === category.id 
                            ? 'bg-secondary/50 text-primary before:absolute before:left-0 before:top-[15%] before:h-[70%] before:w-[2px] before:bg-primary' 
                            : 'text-muted-foreground hover:text-primary hover:bg-secondary/30'}`}
                        onClick={() => handleCategoryClick(category)}
                      >
                        <div className="flex items-center w-full">
                          <span>{category.name}</span>
                          <span className={`ml-auto text-[11px] px-1.5 py-0.5 rounded-full transition-colors duration-200
                            ${activeCategory?.id === category.id
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted text-muted-foreground'}`}>
                            {category.count}
                          </span>
                        </div>
                      </Button>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-48">
                      <ContextMenuItem 
                        onClick={() => startEditCategory(category)}
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Rename</span>
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem 
                        onClick={() => confirmDeleteCategory(category)}
                        className="flex items-center gap-2 text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteCategory}
        itemType="category"
        itemName={categoryToDelete?.name}
      />
    </div>
  );
}