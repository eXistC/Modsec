export interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }
  
  export interface InputFieldProps {
    label: string;
    type: string;
    id: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }