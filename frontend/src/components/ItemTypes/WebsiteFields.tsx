import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WebsiteEntry } from "@/types/password";

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

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Password</label>
        <div className="relative">
          <Input 
            type={showPassword ? "text" : "password"}
            placeholder="Enter password" 
            className={`${!isEditing ? 'bg-background' : 'bg-secondary'} border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background font-mono ${isEditing ? '' : 'pr-10'}`}
            value={formData.password || ''}
            onChange={handleChange('password')}
            onFocus={() => {
              if (isEditing) {
                setShowPassword(true);
              }
            }}
            onBlur={() => {
              if (isEditing) {
                setShowPassword(false);
              }
            }}
            readOnly={!isEditing}
          />
          {!isEditing && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground/70" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground/70" />
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Notes</label>
        <Textarea 
          placeholder="Add notes..." 
          className={`${!isEditing ? 'bg-background' : 'bg-secondary'} border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background min-h-[100px]`}
          value={formData.notes}
          onChange={handleChange('notes')}
          readOnly={!isEditing}
        />
      </div>
    </>
  );
}