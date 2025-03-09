import { Textarea } from "@/components/ui/textarea";
import { MemoEntry } from "@/types/password";
import { Check, Copy } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface MemoFieldsProps {
  formData: MemoEntry;
  isEditing: boolean;
  handleChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  copyToClipboard: (field: string, value: string) => void;
  copiedField: string | null;
}

export function MemoFields({
  formData,
  isEditing,
  handleChange,
  copyToClipboard,
  copiedField
}: MemoFieldsProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">Notes</label>
      <div className="relative">
        <Textarea
          placeholder="Enter secure notes"
          className={`${!isEditing ? 'bg-background' : 'bg-secondary'} border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background min-h-[200px] pr-10`}
          value={formData.notes || ''}
          onChange={handleChange('notes')}
          readOnly={!isEditing}
        />
        {!isEditing && formData.notes && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                type="button"
                onClick={() => copyToClipboard('notes', formData.notes)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                {copiedField === 'notes' ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{copiedField === 'notes' ? "Copied!" : "Copy to clipboard"}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}