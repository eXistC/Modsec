import { PasswordEntry } from "@/types/password";

export const mockPasswords: PasswordEntry[] = [
  {
    id: "1",
    type: "website",
    title: "GitHub",
    website: "github.com",
    username: "user@example.com",
    email: "user@example.com",
    password: "myGithubPassword123",
    isBookmarked: true,
    notes: "GitHub account for work",
    category: "Development"
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
    category: "Financial"
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
    category: "Financial"
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
    category: "Personal"
  },
  {
    id: "5",
    type: "memo",
    title: "Server Credentials",
    notes: "SSH: user@server.com\nPort: 22\nKey location: ~/.ssh/id_rsa",
    isBookmarked: true,
    category: "Development"
  },
  {
    id: "6",
    type: "website",
    title: "Gmail Account",
    website: "gmail.com",
    username: "user@gmail.com",
    email: "user@gmail.com",
    password: "gmailPassword123",
    isBookmarked: false,
    notes: "Personal email account",
    category: "Personal"
  },
  {
    id: "7",
    type: "website",
    title: "AWS Console",
    website: "aws.amazon.com",
    username: "admin@company.com",
    email: "admin@company.com",
    password: "awsPassword123!",
    isBookmarked: true,
    notes: "AWS root account",
    category: "Development"
  }
];