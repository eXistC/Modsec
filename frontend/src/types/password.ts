export type PasswordType = "website" | "identity" | "card" | "crypto" | "memo";

export interface BaseEntry {
  id: string;
  title: string;
  type: PasswordType;
  isBookmarked: boolean;
  dateCreated: Date;
  dateModified: Date;
  notes?: string;
  category?: string | null;
}

export interface WebsiteEntry extends BaseEntry {
  type: "website";
  username: string;
  password: string;
  url?: string;
}

export interface IdentityEntry extends BaseEntry {
  type: "identity";
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface CardEntry extends BaseEntry {
  type: "card";
  cardholderName: string;
  cardNumber: string;
  expirationMonth: string;
  expirationYear: string;
  cvv: string;
}

export interface CryptoEntry extends BaseEntry {
  type: "crypto";
  walletName: string;
  address: string;
  privateKey: string;
}

export interface MemoEntry extends BaseEntry {
  type: "memo";
  content: string;
}

export type PasswordEntry = WebsiteEntry | IdentityEntry | CardEntry | CryptoEntry | MemoEntry;

