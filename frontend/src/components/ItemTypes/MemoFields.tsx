import { Textarea } from "@/components/ui/textarea";
import { MemoEntry } from "@/types/password";

interface MemoFieldsProps {
  formData: MemoEntry;
  isEditing: boolean;
  handleChange: (field: keyof MemoEntry) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function MemoFields({
  formData,
  isEditing,
  handleChange
}: MemoFieldsProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">Notes</label>
      <Textarea
        placeholder="Enter secure notes"
        className={`${!isEditing ? 'bg-background' : 'bg-secondary'} border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background min-h-[200px]`}
        value={formData.notes}
        onChange={handleChange('notes')}
        readOnly={!isEditing}
      />
    </div>
  );
}