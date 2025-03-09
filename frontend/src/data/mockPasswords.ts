import { PasswordEntry } from '@/types/password';

// Define category type
export interface Category {
  name: string;
  count: number;
}

// Mock categories data
export const mockCategories: Category[] = [
  { name: "SCHOOL", count: 3 },
  { name: "WORK", count: 2 },
  { name: "PERSONAL", count: 2 }
];

// Mock passwords data
export const mockPasswords: PasswordEntry[] = [
  {
    id: "1",
    type: "website",
    title: "GitHub",
    website: "github.com",
    username: "user@example.com",
    email: "user@example.com",
    password: "myGithubPassword123",
    isBookmarked: false,
    notes: "GitHub account for work",
    category: "WORK"
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
    notes: "Personal credit card",
    category: "PERSONAL"
  },
  {
    id: "3",
    type: "crypto",
    title: "Bitcoin Wallet",
    walletAddress: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    password: "strongPassword123",
    recoveryPhrase: "witch collapse practice feed shame open despair creek road again ice least",
    isBookmarked: false,
    notes: "Main BTC wallet",
    category: "PERSONAL"
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
    notes: "Personal identification details",
    category: null
  },
  {
    id: "5",
    type: "memo",
    title: "Server Credentials",
    notes: "SSH: user@server.com\nPort: 22\nKey location: ~/.ssh/id_rsa",
    isBookmarked: true,
    category: "WORK"
  },
  {
    id: "6",
    type: "website",
    title: "School Portal",
    website: "school.edu",
    username: "student123",
    email: "student@school.edu",
    password: "schoolPassword456",
    isBookmarked: false,
    notes: "School portal login",
    category: "SCHOOL"
  },
  {
    id: "7",
    type: "website",
    title: "School Library",
    website: "library.school.edu",
    username: "student123",
    email: "student@school.edu",
    password: "libraryAccess789",
    isBookmarked: false,
    notes: "School library access",
    category: "SCHOOL"
  },
  {
    id: "8",
    type: "website",
    title: "Course Management",
    website: "courses.school.edu",
    username: "student123",
    email: "student@school.edu",
    password: "courseLogin101",
    isBookmarked: false,
    notes: "School course management system",
    category: "SCHOOL"
  }
];

// Helper function to calculate category counts based on password entries
export function calculateCategoryCounts(): Category[] {
  const categoryCounts: Record<string, number> = {};
  
  // Count passwords in each category
  mockPasswords.forEach(password => {
    if (password.category) {
      categoryCounts[password.category] = (categoryCounts[password.category] || 0) + 1;
    }
  });
  
  // Convert to Category array
  return Object.entries(categoryCounts).map(([name, count]) => ({
    name,
    count
  }));
}