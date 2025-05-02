import { Textarea } from "@/components/ui/textarea";
import { MemoEntry } from "@/types/password";
import { Check, Copy } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import React from "react";

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
      <div className="relative group">
        <Textarea
          name="notes" // Added name attribute to maintain focus
          placeholder="Enter secure notes"
          className={`
            ${!isEditing ? 'bg-background' : 'bg-secondary'}
            ${!isEditing && formData.notes ? 'cursor-pointer hover:border-primary/50 transition-colors duration-200' : ''}
            border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background min-h-[200px] pr-10
          `}
          value={formData.notes || ''}
          onChange={handleChange('notes')}
          readOnly={!isEditing}
          onClick={() => !isEditing && formData.notes && copyToClipboard('notes', formData.notes)}
        />
        {!isEditing && formData.notes && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`
                  absolute right-3 top-3 
                  text-muted-foreground hover:text-primary transition-all duration-200
                  ${copiedField === 'notes' ? 'opacity-100' : 'opacity-0 group-hover:opacity-80'} 
                  cursor-pointer
                `}
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard('notes', formData.notes || "");
                }}
              >
                {copiedField === 'notes' ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-primary text-primary-foreground">
              <p>{copiedField === 'notes' ? "Copied!" : "Click to copy"}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}