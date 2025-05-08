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
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
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

  return (
    <CategoryContext.Provider value={{ categories, isLoading, refreshCategories }}>
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