import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CryptoEntry } from "@/types/password";

interface CryptoFieldsProps {
  formData: CryptoEntry;
  isEditing: boolean;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  handleChange: (field: keyof CryptoEntry) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function CryptoFields({
  formData,
  isEditing,
  showPassword,
  setShowPassword,
  handleChange
}: CryptoFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Wallet Address</label>
        <Input
          placeholder="Enter wallet address"
          className={`${!isEditing ? 'bg-background' : 'bg-secondary'} border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background font-mono`}
          value={formData.walletAddress}
          onChange={handleChange('walletAddress')}
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
        <label className="text-sm font-medium text-muted-foreground">Recovery Phrase</label>
        <div className="relative">
          <Textarea
            placeholder="Enter recovery phrase"
            className={`${!isEditing ? 'bg-background' : 'bg-secondary'} border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background font-mono ${isEditing ? '' : 'pr-10'} min-h-[80px]`}
            value={formData.recoveryPhrase}
            onChange={handleChange('recoveryPhrase')}
            style={{ 
              WebkitTextSecurity: (!isEditing || !showPassword) ? 'disc' : 'none'
            } as React.CSSProperties}
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
              className="absolute right-0 top-0 h-[40px] px-3 py-2 hover:bg-transparent"
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
    </>
  );
}