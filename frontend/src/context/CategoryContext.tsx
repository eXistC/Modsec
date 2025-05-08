import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { GetCategoryList } from '@/wailsjs/go/main/App';
import { useToast } from '@/components/ui/use-toast';

// Define the category interface
export interface Category {
  id: number;
  name: string;
  count: number;
}

interface CategoryContextType {
  categories: Category[];
  isLoading: boolean;
  refreshCategories: () => Promise<void>;
  activeCategory: Category | null;
  setActiveCategory: (category: Category | null) => void;
  getCategoryNameById: (id: number | null) => string | null;
  getCategoryIdByName: (name: string | null) => number | null;
  clearActiveCategory: () => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const categoryData = await GetCategoryList();
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

  // Load categories on initial mount
  useEffect(() => {
    loadCategories();
  }, []);

  const refreshCategories = async () => {
    await loadCategories();
  };

  // Utility functions to help with category lookup
  const getCategoryNameById = (id: number | null): string | null => {
    if (id === null) return null;
    const category = categories.find(cat => cat.id === id);
    return category?.name || null;
  };

  const getCategoryIdByName = (name: string | null): number | null => {
    if (!name) return null;
    const category = categories.find(cat => cat.name === name);
    return category?.id || null;
  };

  const clearActiveCategory = () => {
    setActiveCategory(null);
  };

  return (
    <CategoryContext.Provider value={{
      categories,
      isLoading,
      refreshCategories,
      activeCategory,
      setActiveCategory,
      getCategoryNameById,
      getCategoryIdByName,
      clearActiveCategory
    }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
}