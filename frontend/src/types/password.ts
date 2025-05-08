export type PasswordType = "website" | "identity" | "card" | "crypto" | "memo";

export interface PasswordEntryBase {
  id: string;
  title: string;
  isBookmarked: boolean;
  dateCreated: Date;
  dateModified: Date;
  notes?: string;
  categoryId?: number | null;
}

export interface WebsiteEntry extends PasswordEntryBase {
  type: "website";
  username: string;
  password: string;
  url?: string;
}

export interface IdentityEntry extends PasswordEntryBase {
  type: "identity";
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface CardEntry extends PasswordEntryBase {
  type: "card";
  cardholderName: string;
  cardNumber: string;
  expirationMonth: string;
  expirationYear: string;
  cvv: string;
}

export interface CryptoEntry extends PasswordEntryBase {
  type: "crypto";
  walletName: string;
  address: string;
  privateKey: string;
}

export interface MemoEntry extends PasswordEntryBase {
  type: "memo";
  content: string;
}

export type PasswordEntry = WebsiteEntry | IdentityEntry | CardEntry | CryptoEntry | MemoEntry;

