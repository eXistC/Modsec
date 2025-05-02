import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { CardEntry } from "@/types/password";
import { Copy, Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface CardFieldsProps {
  formData: CardEntry;
  isEditing: boolean;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  handleChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  copyToClipboard: (field: string, value: string) => void;
  copiedField: string | null;
}

export function CardFields({ 
  formData, 
  isEditing, 
  showPassword, 
  setShowPassword, 
  handleChange,
  copyToClipboard,
  copiedField 
}: CardFieldsProps) {

  const handleFieldFocus = () => {
    // Show password only in editing mode
    if (isEditing) {
      setShowPassword(true);
    }
  };

  // Handle password field changes
  const handlePasswordChange = (field: keyof CardEntry) => (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(field as string)(e);
  };

  // Helper component for copyable inputs
  const CopyableInput = ({ 
    label, 
    value, 
    fieldName,
    placeholder = "",
    className = "",
    isPassword = false
  }: { 
    label: string;
    value: string | undefined;
    fieldName: string;
    placeholder?: string;
    className?: string;
    isPassword?: boolean;
  }) => {
    if (isPassword) {
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">{label}</label>
          <div className="relative group">
            <PasswordInput 
              name={fieldName}
              placeholder={placeholder}
              value={value || ''}
              onChange={handlePasswordChange(fieldName as keyof CardEntry)}
              isEditing={isEditing}
              showPassword={showPassword}
              onPasswordVisibilityChange={setShowPassword}
              onPasswordFocus={handleFieldFocus}
              className={`font-mono ${!isEditing && value ? 'cursor-pointer hover:border-primary/50 transition-colors' : ''} ${className}`}
              onClick={() => !isEditing && value && copyToClipboard(fieldName, value)}
            />
            {!isEditing && value && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className={`
                      absolute right-10 top-1/2 transform -translate-y-1/2 
                      text-muted-foreground hover:text-primary transition-all duration-200
                      ${copiedField === fieldName ? 'opacity-100' : 'opacity-0 group-hover:opacity-80'} 
                      cursor-pointer
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(fieldName, value);
                    }}
                  >
                    {copiedField === fieldName ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left" className="bg-primary text-primary-foreground">
                  <p>{copiedField === fieldName ? "Copied!" : "Click to copy"}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <div className="relative group">
          <Input
            name={fieldName}
            placeholder={placeholder}
            className={`
              ${!isEditing ? 'bg-background' : 'bg-secondary'} 
              ${!isEditing && value ? 'cursor-pointer hover:border-primary/50 transition-colors duration-200' : ''}
              border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background pr-10 ${className}
            `}
            value={value || ''}
            onChange={handleChange(fieldName)}
            readOnly={!isEditing}
            onClick={() => !isEditing && value && copyToClipboard(fieldName, value)}
          />
          {!isEditing && value && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className={`
                    absolute right-3 top-1/2 transform -translate-y-1/2 
                    text-muted-foreground hover:text-primary transition-all duration-200
                    ${copiedField === fieldName ? 'opacity-100' : 'opacity-0 group-hover:opacity-80'} 
                    cursor-pointer
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(fieldName, value);
                  }}
                >
                  {copiedField === fieldName ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-primary text-primary-foreground">
                <p>{copiedField === fieldName ? "Copied!" : "Click to copy"}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <CopyableInput
        label="Card Holder Name"
        value={formData.cardholderName} // Fixed property name to match backend
        fieldName="cardholderName"
        placeholder="Enter card holder name"
      />

      <CopyableInput
        label="Card Number"
        value={formData.cardNumber}
        fieldName="cardNumber"
        placeholder="Enter card number"
        isPassword={true}
        className="font-mono"
      />

      <div className="grid grid-cols-2 gap-4">
        <CopyableInput
          label="Exp Month"
          value={formData.expirationMonth} // Fixed property name to match backend
          fieldName="expirationMonth"
          placeholder="MM"
        />
        <CopyableInput
          label="Exp Year"
          value={formData.expirationYear} // Fixed property name to match backend
          fieldName="expirationYear"
          placeholder="YYYY"
        />
      </div>

      <CopyableInput
        label="CVV"
        value={formData.cvv}
        fieldName="cvv"
        placeholder="Enter CVV"
        isPassword={true}
        className="font-mono"
      />
    </>
  );
}