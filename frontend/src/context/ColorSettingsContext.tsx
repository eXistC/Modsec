import React, { createContext, useContext, useState, useEffect } from 'react';

interface ColorSettings {
  website: string;
  identity: string;
  card: string;
  crypto: string;
  memo: string;
}

const defaultColors: ColorSettings = {
  website: "#3b82f6", // blue-500
  identity: "#22c55e", // green-500
  card: "#a855f7",    // purple-500
  crypto: "#f59e0b",  // amber-500
  memo: "#64748b",    // slate-500
};

interface ColorSettingsContextType {
  colors: ColorSettings;
  updateColor: (type: keyof ColorSettings, color: string) => void;
  resetColors: () => void;
  getIconBackgroundClass: (type: string) => string;
}

const ColorSettingsContext = createContext<ColorSettingsContextType | undefined>(undefined);

export const ColorSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved colors from localStorage or use defaults
  const loadSavedColors = (): ColorSettings => {
    try {
      const saved = localStorage.getItem('iconColors');
      return saved ? JSON.parse(saved) : defaultColors;
    } catch (error) {
      console.error('Error loading saved colors:', error);
      return defaultColors;
    }
  };
  
  const [colors, setColors] = useState<ColorSettings>(loadSavedColors);

  // Save colors to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('iconColors', JSON.stringify(colors));
    } catch (error) {
      console.error('Error saving colors to localStorage:', error);
    }
  }, [colors]);

  const updateColor = (type: keyof ColorSettings, color: string) => {
    setColors(prev => ({
      ...prev,
      [type]: color,
    }));
  };

  const resetColors = () => {
    setColors(defaultColors);
  };

  // Helper function to get dynamic background class based on type
  const getIconBackgroundClass = (type: string): string => {
    let color = '';
    
    switch (type) {
      case "website":
        color = colors.website;
        break;
      case "identity":
        color = colors.identity;
        break;
      case "card":
        color = colors.card;
        break;
      case "crypto":
        color = colors.crypto;
        break;
      case "memo":
        color = colors.memo;
        break;
      default:
        return "bg-secondary/60";
    }
    
    // Using inline style via data attribute - will be applied in components
    return `data-color="${color}"`;
  };

  return (
    <ColorSettingsContext.Provider value={{ colors, updateColor, resetColors, getIconBackgroundClass }}>
      {children}
    </ColorSettingsContext.Provider>
  );
};

export const useColorSettings = () => {
  const context = useContext(ColorSettingsContext);
  if (context === undefined) {
    throw new Error('useColorSettings must be used within a ColorSettingsProvider');
  }
  return context;
};