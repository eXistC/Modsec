import { Category, PasswordEntry } from '@/types/password';

// Helper function to validate category name
export function isValidCategoryName(name: string): boolean {
  return name.length > 0 && name.length <= 30;
}

export function extractCategories(passwords: PasswordEntry[]): Category[] {
  const uniqueCategories = new Set(
    passwords
      .map(p => p.category)
      .filter((category): category is string => !!category)
  );

  return Array.from(uniqueCategories).map((name, index) => ({
    id: (index + 1).toString(),
    name
  }));
}

export function addCategory(
  passwords: PasswordEntry[],
  categoryName: string
): PasswordEntry[] {
  if (!isValidCategoryName(categoryName)) {
    throw new Error('Invalid category name');
  }
  
  // Add category to any uncategorized passwords
  return passwords.map(p => 
    !p.category ? { ...p, category: categoryName } : p
  );
}

export function removeCategory(
  passwords: PasswordEntry[],
  categoryName: string
): PasswordEntry[] {
  // Remove category from passwords
  return passwords.map(p => 
    p.category === categoryName ? { ...p, category: undefined } : p
  );
}



