import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
          name={fieldName}
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

  // Helper component for copyable textarea
  const CopyableTextarea = ({ 
    label, 
    value, 
    fieldName,
    placeholder = ""
  }: { 
    label: string;
    value: string | undefined;
    fieldName: string;
    placeholder?: string;
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <div className="relative group">
        <Textarea
          name={fieldName}
          placeholder={placeholder}
          className={`
            ${!isEditing ? 'bg-background' : 'bg-secondary'} 
            ${!isEditing && value ? 'cursor-pointer hover:border-primary/50 transition-colors duration-200' : ''}
            border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background min-h-[80px] pr-10
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
                  absolute right-3 top-3 
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
      <CopyableInput
        label="First Name"
        value={formData.firstName}
        fieldName="firstName"
        placeholder="Enter first name"
      />

      <CopyableInput
        label="Last Name"
        value={formData.lastName}
        fieldName="lastName"
        placeholder="Enter last name"
      />

      <CopyableInput
        label="Email"
        value={formData.email}
        fieldName="email"
        placeholder="Enter email address"
        type="email"
      />

      <CopyableInput
        label="Phone Number"
        value={formData.phone}
        fieldName="phone"
        placeholder="Enter phone number"
      />

      <CopyableTextarea
        label="Address"
        value={formData.address}
        fieldName="address"
        placeholder="Enter address"
      />

      <CopyableTextarea
        label="Notes"
        value={formData.notes}
        fieldName="notes"
        placeholder="Enter additional notes"
      />
    </div>
  );
}