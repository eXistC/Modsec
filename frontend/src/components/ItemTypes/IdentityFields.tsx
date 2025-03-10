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
      <div className="relative group">
        <Input
          type={type}
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
          <div className="relative group">
            <Select 
              disabled={!isEditing}
              value={formData.gender}
              onValueChange={(value) => handleChange('gender')({ target: { value } } as any)}
            >
              <SelectTrigger className={`${!isEditing ? 'bg-background' : 'bg-secondary'} 
                ${!isEditing && formData.gender ? 'cursor-pointer hover:border-primary/50 transition-colors' : ''}
                pr-10`}
                onClick={() => !isEditing && formData.gender && copyToClipboard('gender', formData.gender)}
              >
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
                  <div 
                    className={`
                      absolute right-3 top-1/2 transform -translate-y-1/2 
                      text-muted-foreground hover:text-primary transition-all duration-200
                      ${copiedField === 'gender' ? 'opacity-100' : 'opacity-0 group-hover:opacity-80'} 
                      cursor-pointer
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard('gender', formData.gender);
                    }}
                  >
                    {copiedField === 'gender' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left" className="bg-primary text-primary-foreground">
                  <p>{copiedField === 'gender' ? "Copied!" : "Click to copy"}</p>
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
        <div className="relative group">
          <Textarea
            placeholder="Enter address"
            className={`
              ${!isEditing ? 'bg-background' : 'bg-secondary'} 
              ${!isEditing && formData.address ? 'cursor-pointer hover:border-primary/50 transition-colors duration-200' : ''}
              border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background min-h-[80px] pr-10
            `}
            value={formData.address || ''}
            onChange={handleChange('address')}
            readOnly={!isEditing}
            onClick={() => !isEditing && formData.address && copyToClipboard('address', formData.address)}
          />
          {!isEditing && formData.address && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className={`
                    absolute right-3 top-3 
                    text-muted-foreground hover:text-primary transition-all duration-200
                    ${copiedField === 'address' ? 'opacity-100' : 'opacity-0 group-hover:opacity-80'} 
                    cursor-pointer
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard('address', formData.address);
                  }}
                >
                  {copiedField === 'address' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-primary text-primary-foreground">
                <p>{copiedField === 'address' ? "Copied!" : "Click to copy"}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
}