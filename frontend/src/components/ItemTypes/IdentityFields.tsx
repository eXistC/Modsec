import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IdentityEntry } from "@/types/password";
import { Check, Copy } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface IdentityFieldsProps {
  formData: IdentityEntry;
  isEditing: boolean;
  handleChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  copyToClipboard: (field: string, value: string) => void;
  copiedField: string | null;
}

export function IdentityFields({
  formData,
  isEditing,
  handleChange,
  copyToClipboard,
  copiedField
}: IdentityFieldsProps) {
  
  // Helper component for copyable inputs
  const CopyableInput = ({ 
    label, 
    value, 
    fieldName,
    placeholder = "",
    className = "",
    type = "text" 
  }: { 
    label: string;
    value: string | undefined;
    fieldName: string;
    placeholder?: string;
    className?: string;
    type?: string;
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <div className="relative">
        <Input
          type={type}
          placeholder={placeholder}
          className={`${!isEditing ? 'bg-background' : 'bg-secondary'} border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background pr-10 ${className}`}
          value={value || ''}
          onChange={handleChange(fieldName)}
          readOnly={!isEditing}
        />
        {!isEditing && value && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                type="button"
                onClick={() => copyToClipboard(fieldName, value)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {copiedField === fieldName ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{copiedField === fieldName ? "Copied!" : "Copy to clipboard"}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <CopyableInput
          label="Initial"
          value={formData.initial}
          fieldName="initial"
          placeholder="Mr/Mrs/Ms"
        />
        <div className="col-span-2">
          <CopyableInput
            label="First Name"
            value={formData.firstName}
            fieldName="firstName"
            placeholder="Enter first name"
          />
        </div>
      </div>

      <CopyableInput
        label="Last Name"
        value={formData.lastName}
        fieldName="lastName"
        placeholder="Enter last name"
      />

      <CopyableInput
        label="Nickname"
        value={formData.nickname}
        fieldName="nickname"
        placeholder="Enter nickname"
      />

      <div className="grid grid-cols-2 gap-4">
        <CopyableInput
          label="Phone Number"
          value={formData.phoneNumber}
          fieldName="phoneNumber"
          placeholder="Enter phone number"
        />
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Gender</label>
          <div className="relative">
            <Select 
              disabled={!isEditing}
              value={formData.gender}
              onValueChange={(value) => handleChange('gender')({ target: { value } } as any)}
            >
              <SelectTrigger className={`${!isEditing ? 'bg-background' : 'bg-secondary'} pr-10`}>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {!isEditing && formData.gender && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    type="button"
                    onClick={() => copyToClipboard('gender', formData.gender)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {copiedField === 'gender' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{copiedField === 'gender' ? "Copied!" : "Copy to clipboard"}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <CopyableInput
          label="Birth Day"
          value={formData.birthDay}
          fieldName="birthDay"
          type="date"
        />
        <CopyableInput
          label="Occupation"
          value={formData.occupation}
          fieldName="occupation"
          placeholder="Enter occupation"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Address</label>
        <div className="relative">
          <Textarea
            placeholder="Enter address"
            className={`${!isEditing ? 'bg-background' : 'bg-secondary'} border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background min-h-[80px] pr-10`}
            value={formData.address || ''}
            onChange={handleChange('address')}
            readOnly={!isEditing}
          />
          {!isEditing && formData.address && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  type="button"
                  onClick={() => copyToClipboard('address', formData.address)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {copiedField === 'address' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{copiedField === 'address' ? "Copied!" : "Copy to clipboard"}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
}