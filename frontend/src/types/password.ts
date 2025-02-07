export interface PasswordEntry {
  id: string;
  type: "website" | "identity" | "card" | "note";
  title: string;
  username?: string;
  password?: string;
  cardNumber?: string;
  isBookmarked?: boolean;
  notes?: string;

}