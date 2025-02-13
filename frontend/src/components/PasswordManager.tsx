import { useState } from 'react';
import { PasswordList } from './PasswordList';
import { PasswordEditor } from './PasswordEditor';
import { PasswordEntry } from '@/types/password';

const mockPasswords: PasswordEntry[] = [
  {
    id: "1",
    type: "website",
    title: "GitHub",
    website: "github.com",
    username: "user@example.com",
    email: "user@example.com",
    password: "myGithubPassword123",
    isBookmarked: false,
    notes: "GitHub account for work"
  },
  {
    id: "2",
    type: "card",
    title: "Main Credit Card",
    cardHolderName: "John Doe",
    cardNumber: "4532 1234 5678 9012",
    validFrom: "01/23",
    expirationDate: "01/25",
    cvv: "123",
    isBookmarked: true,
    notes: "Personal credit card"
  },
  {
    id: "3",
    type: "crypto",
    title: "Bitcoin Wallet",
    walletAddress: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    password: "strongPassword123",
    recoveryPhrase: "witch collapse practice feed shame open despair creek road again ice least",
    isBookmarked: false,
    notes: "Main BTC wallet"
  },
  {
    id: "4",
    type: "identity",
    title: "Personal ID",
    initial: "Mr",
    firstName: "John",
    lastName: "Doe",
    nickname: "Johnny",
    phoneNumber: "+1234567890",
    gender: "male",
    birthDay: "1990-01-01",
    occupation: "Software Engineer",
    address: "123 Main St, City, Country",
    isBookmarked: false,
    notes: "Personal identification details"
  },
  {
    id: "5",
    type: "memo",
    title: "Server Credentials",
    notes: "SSH: user@server.com\nPort: 22\nKey location: ~/.ssh/id_rsa",
    isBookmarked: true
  },
  {
    id: "6",
    type: "website",
    title: "testing",
    website: "github.com",
    username: "username",
    email: "user@example.com",
    password: "",
    isBookmarked: false,
    notes: "GitHub account for work"
  }
];

interface PasswordManagerProps {
  currentView: string;
  onSelectPassword: (password: PasswordEntry) => void;
  selectedPassword?: PasswordEntry;
}

export function PasswordManager({ 
  currentView, 
  onSelectPassword,
  selectedPassword 
}: PasswordManagerProps) {
  const [passwords, setPasswords] = useState<PasswordEntry[]>(mockPasswords);

  const handleToggleBookmark = (id: string) => {
    setPasswords(prev =>
      prev.map(entry =>
        entry.id === id
          ? { ...entry, isBookmarked: !entry.isBookmarked }
          : entry
      )
    );
  };

  return (
    <div>
      <PasswordList 
        currentView={currentView}
        onSelectPassword={onSelectPassword}
        passwords={passwords}
        onToggleBookmark={handleToggleBookmark}
      />
    </div>
  );
}