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
    // Match WebsiteFields behavior - only show in editing mode
    if (isEditing) {
      setShowPassword(true);
    }
  };

  const handlePasswordChange = (field: keyof CardEntry) => (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(field as string)(e);
  };

  // Helper component for copyable inputs
  const CopyableInput = ({ 
    label, 
    value, 
    fieldName,
    placeholder = "",
    className = ""
  }: { 
    label: string;
    value: string | undefined;
    fieldName: string;
    placeholder?: string;
    className?: string;
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <div className="relative group">
        <Input
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

  return (
    <>
      <CopyableInput
        label="Card Holder Name"
        value={formData.cardHolderName}
        fieldName="cardHolderName"
        placeholder="Enter card holder name"
      />

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Card Number</label>
        <div className="relative group">
          <PasswordInput 
            placeholder="Enter card number"
            value={formData.cardNumber || ''}
            onChange={handlePasswordChange('cardNumber')}
            isEditing={isEditing}
            showPassword={showPassword}
            onPasswordVisibilityChange={setShowPassword}
            onPasswordFocus={handleFieldFocus}
            className={`font-mono ${!isEditing && formData.cardNumber ? 'cursor-pointer hover:border-primary/50 transition-colors' : ''}`}
            onClick={() => !isEditing && formData.cardNumber && copyToClipboard('cardNumber', formData.cardNumber)}
          />
          {!isEditing && formData.cardNumber && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className={`
                    absolute right-10 top-1/2 transform -translate-y-1/2 
                    text-muted-foreground hover:text-primary transition-all duration-200
                    ${copiedField === 'cardNumber' ? 'opacity-100' : 'opacity-0 group-hover:opacity-80'} 
                    cursor-pointer
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard('cardNumber', formData.cardNumber);
                  }}
                >
                  {copiedField === 'cardNumber' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-primary text-primary-foreground">
                <p>{copiedField === 'cardNumber' ? "Copied!" : "Click to copy"}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <CopyableInput
          label="Valid From"
          value={formData.validFrom}
          fieldName="validFrom"
          placeholder="MM/YY"
        />
        <CopyableInput
          label="Expiration Date"
          value={formData.expirationDate}
          fieldName="expirationDate"
          placeholder="MM/YY"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">CVV</label>
        <div className="relative group">
          <PasswordInput 
            placeholder="Enter CVV"
            value={formData.cvv || ''}
            onChange={handlePasswordChange('cvv')}
            isEditing={isEditing}
            showPassword={showPassword}
            onPasswordVisibilityChange={setShowPassword}
            onPasswordFocus={handleFieldFocus}
            className={`font-mono ${!isEditing && formData.cvv ? 'cursor-pointer hover:border-primary/50 transition-colors' : ''}`}
            onClick={() => !isEditing && formData.cvv && copyToClipboard('cvv', formData.cvv)}
          />
          {!isEditing && formData.cvv && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="absolute right-10 top-1/2 transform -translate-y-1/2 
                    text-muted-foreground hover:text-primary transition-colors
                    opacity-70 group-hover:opacity-100 cursor-pointer"
                  onClick={() => copyToClipboard('cvv', formData.cvv)}
                >
                  {copiedField === 'cvv' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-primary text-primary-foreground">
                <p>{copiedField === 'cvv' ? "Copied!" : "Click to copy"}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </>
  );
}