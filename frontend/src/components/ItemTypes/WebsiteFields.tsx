import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WebsiteEntry } from "@/types/password";
import { InlinePasswordGenerator } from "../Generators/PasswordGeneratorInline";
import { useState } from "react";
import { PasswordInput } from "@/components/ui/password-input";

interface WebsiteFieldsProps {
  formData: WebsiteEntry;
  isEditing: boolean;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  handleChange: (field: keyof WebsiteEntry) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function WebsiteFields({
  formData,
  isEditing,
  showPassword,
  setShowPassword,
  handleChange
}: WebsiteFieldsProps) {
  const [showGenerator, setShowGenerator] = useState(false);

  const handlePasswordFocus = () => {
    if (isEditing) {
      setShowPassword(true);
      if (!formData.password) {
        setShowGenerator(true);
      }
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange('password')(e);
    if (e.target.value) {
      setShowGenerator(false);
    }
  };

  const handleGeneratePassword = (generatedPassword: string) => {
    handleChange('password')({ 
      target: { value: generatedPassword } 
    } as React.ChangeEvent<HTMLInputElement>);
    setShowGenerator(false);
  };

  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Username</label>
        <Input 
          placeholder="Enter username" 
          className={`${!isEditing ? 'bg-background' : 'bg-secondary'} border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background`}
          value={formData.username || ''}
          onChange={handleChange('username')}
          readOnly={!isEditing}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Email</label>
        <Input 
          type="email"
          placeholder="Enter email" 
          className={`${!isEditing ? 'bg-background' : 'bg-secondary'} border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background`}
          value={formData.email || ''}
          onChange={handleChange('email')}
          readOnly={!isEditing}
        />
      </div>

      <div className="space-y-2 relative">
        <label className="text-sm font-medium text-muted-foreground">Password</label>
        <div className="relative">
          <PasswordInput 
            placeholder="Enter password"
            value={formData.password || ''}
            onChange={handlePasswordChange}
            onFocus={handlePasswordFocus}
            isEditing={isEditing}
            showPassword={showPassword}
            onPasswordVisibilityChange={setShowPassword}
          />
          {showGenerator && isEditing && (
            <InlinePasswordGenerator 
              onGenerate={handleGeneratePassword}
              onClose={() => setShowGenerator(false)}
            />
          )}
        </div>
      </div>
    </>
  );
}