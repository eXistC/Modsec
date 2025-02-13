import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { CardEntry } from "@/types/password";

interface CardFieldsProps {
  formData: CardEntry;
  isEditing: boolean;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  handleChange: (field: keyof CardEntry) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function CardFields({ 
  formData, 
  isEditing, 
  showPassword, 
  setShowPassword, 
  handleChange 
}: CardFieldsProps) {

  const handleFieldFocus = () => {
    // Match WebsiteFields behavior - only show in editing mode
    if (isEditing) {
      setShowPassword(true);
    }
  };

  const handlePasswordChange = (field: keyof CardEntry) => (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(field)(e);
  };

  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Card Holder Name</label>
        <Input
          placeholder="Enter card holder name"
          className={`${!isEditing ? 'bg-background' : 'bg-secondary'} border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background`}
          value={formData.cardHolderName}
          onChange={handleChange('cardHolderName')}
          readOnly={!isEditing}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Card Number</label>
        <PasswordInput 
          placeholder="Enter card number"
          value={formData.cardNumber}
          onChange={handlePasswordChange('cardNumber')}
          isEditing={isEditing}
          showPassword={showPassword}
          onPasswordVisibilityChange={setShowPassword}
          onPasswordFocus={handleFieldFocus}
          className="font-mono"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Valid From</label>
          <Input
            placeholder="MM/YY"
            className={`${!isEditing ? 'bg-background' : 'bg-secondary'} border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background`}
            value={formData.validFrom}
            onChange={handleChange('validFrom')}
            readOnly={!isEditing}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Expiration Date</label>
          <Input
            placeholder="MM/YY"
            className={`${!isEditing ? 'bg-background' : 'bg-secondary'} border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background`}
            value={formData.expirationDate}
            onChange={handleChange('expirationDate')}
            readOnly={!isEditing}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">CVV</label>
        <PasswordInput 
          placeholder="Enter CVV"
          value={formData.cvv}
          onChange={handlePasswordChange('cvv')}
          isEditing={isEditing}
          showPassword={showPassword}
          onPasswordVisibilityChange={setShowPassword}
          onPasswordFocus={handleFieldFocus}
          className="font-mono"
        />
      </div>
    </>
  );
}