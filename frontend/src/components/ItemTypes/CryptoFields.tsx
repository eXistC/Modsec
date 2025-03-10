import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CryptoEntry } from "@/types/password";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface CryptoFieldsProps {
  formData: CryptoEntry;
  isEditing: boolean;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  handleChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  copyToClipboard: (field: string, value: string) => void;
  copiedField: string | null;
}

export function CryptoFields({
  formData,
  isEditing,
  showPassword,
  setShowPassword,
  handleChange,
  copyToClipboard,
  copiedField
}: CryptoFieldsProps) {
  const handleFieldFocus = () => {
    if (isEditing) {
      setShowPassword(true);
    }
  };

  const handlePasswordChange = (field: keyof CryptoEntry) => (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(field as string)(e);
  };

  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Wallet Address</label>
        <div className="relative group">
          <Input
            placeholder="Enter wallet address"
            className={`${!isEditing ? 'bg-background' : 'bg-secondary'} 
              ${!isEditing && formData.walletAddress ? 'cursor-pointer hover:border-primary/50 transition-colors' : ''}
              border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background font-mono pr-10`}
            value={formData.walletAddress}
            onChange={handleChange('walletAddress')}
            readOnly={!isEditing}
            onClick={() => !isEditing && formData.walletAddress && copyToClipboard('walletAddress', formData.walletAddress)}
          />
          {!isEditing && formData.walletAddress && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className={`
                    absolute right-3 top-1/2 transform -translate-y-1/2 
                    text-muted-foreground hover:text-primary transition-all duration-200
                    ${copiedField === 'walletAddress' ? 'opacity-100' : 'opacity-0 group-hover:opacity-80'} 
                    cursor-pointer
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard('walletAddress', formData.walletAddress);
                  }}
                >
                  {copiedField === 'walletAddress' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-primary text-primary-foreground">
                <p>{copiedField === 'walletAddress' ? "Copied!" : "Click to copy"}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Password</label>
        <div className="relative group">
          <PasswordInput 
            placeholder="Enter password"
            value={formData.password || ''}
            onChange={handlePasswordChange('password')}
            isEditing={isEditing}
            showPassword={showPassword}
            onPasswordVisibilityChange={setShowPassword}
            onPasswordFocus={handleFieldFocus}
            className={`font-mono ${!isEditing && formData.password ? 'cursor-pointer hover:border-primary/50 transition-colors' : ''}`}
            onClick={() => !isEditing && formData.password && copyToClipboard('password', formData.password)}
          />
          {!isEditing && formData.password && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className={`
                    absolute right-10 top-1/2 transform -translate-y-1/2 
                    text-muted-foreground hover:text-primary transition-all duration-200
                    ${copiedField === 'password' ? 'opacity-100' : 'opacity-0 group-hover:opacity-80'} 
                    cursor-pointer
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard('password', formData.password || "");
                  }}
                >
                  {copiedField === 'password' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-primary text-primary-foreground">
                <p>{copiedField === 'password' ? "Copied!" : "Click to copy"}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Recovery Phrase</label>
        <div className="relative group">
          <Textarea
            placeholder="Enter recovery phrase"
            className={`${!isEditing ? 'bg-background' : 'bg-secondary'} 
              ${!isEditing && formData.recoveryPhrase ? 'cursor-pointer hover:border-primary/50 transition-colors' : ''}
              border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background font-mono pr-10 min-h-[80px]`}
            value={formData.recoveryPhrase || ''}
            onChange={handleChange('recoveryPhrase')}
            style={{ 
              WebkitTextSecurity: (!isEditing || !showPassword) ? 'disc' : 'none'
            } as React.CSSProperties}
            onFocus={handleFieldFocus}
            onBlur={() => {
              if (isEditing) {
                setShowPassword(false);
              }
            }}
            readOnly={!isEditing}
            onClick={() => !isEditing && formData.recoveryPhrase && copyToClipboard('recoveryPhrase', formData.recoveryPhrase)}
          />
          {!isEditing && formData.recoveryPhrase && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="absolute right-10 top-3 
                    text-muted-foreground hover:text-primary transition-colors
                    opacity-70 group-hover:opacity-100 cursor-pointer"
                  onClick={() => copyToClipboard('recoveryPhrase', formData.recoveryPhrase)}
                >
                  {copiedField === 'recoveryPhrase' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-primary text-primary-foreground">
                <p>{copiedField === 'recoveryPhrase' ? "Copied!" : "Click to copy"}</p>
              </TooltipContent>
            </Tooltip>
          )}
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