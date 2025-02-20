export interface Category {
  id: string;
  name: string;
  color?: string; // Optional: for category customization
}

export type PasswordType = "website" | "card" | "crypto" | "identity" | "memo";

export interface BaseEntry {
  id: string;
  type: PasswordType;
  title: string;
  isBookmarked?: boolean;
  notes?: string;
}

export interface WebsiteEntry extends BaseEntry {
  type: "website";
  website?: string;
  username?: string;
  email?: string;
  password?: string;
}

export interface CardEntry extends BaseEntry {
  type: "card";
  cardHolderName: string;
  cardNumber: string;
  validFrom?: string;
  expirationDate: string;
  cvv: string;
}

export interface CryptoEntry extends BaseEntry {
  type: "crypto";
  walletAddress: string;
  password?: string;
  recoveryPhrase: string;
}

export interface IdentityEntry extends BaseEntry {
  type: "identity";
  initial: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  phoneNumber: string;
  gender: string;
  birthDay: string;
  occupation: string;
  address: string;
}

export interface MemoEntry extends BaseEntry {
  type: "memo";
  notes: string;
}

export type PasswordEntry = (
  | WebsiteEntry 
  | CardEntry 
  | CryptoEntry 
  | IdentityEntry 
  | MemoEntry
) & {
  category?: string;
};