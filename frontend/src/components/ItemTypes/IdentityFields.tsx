import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IdentityEntry } from "@/types/password";

interface IdentityFieldsProps {
  formData: IdentityEntry;
  isEditing: boolean;
  handleChange: (field: keyof IdentityEntry) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function IdentityFields({
  formData,
  isEditing,
  handleChange
}: IdentityFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Initial</label>
          <Input
            placeholder="Mr/Mrs/Ms"
            className={`${!isEditing ? 'bg-background' : 'bg-secondary'} border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background`}
            value={formData.initial}
            onChange={handleChange('initial')}
            readOnly={!isEditing}
          />
        </div>
        <div className="space-y-2 col-span-2">
          <label className="text-sm font-medium text-muted-foreground">First Name</label>
          <Input
            placeholder="Enter first name"
            className={`${!isEditing ? 'bg-background' : 'bg-secondary'} border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background`}
            value={formData.firstName}
            onChange={handleChange('firstName')}
            readOnly={!isEditing}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Last Name</label>
        <Input
          placeholder="Enter last name"
          className={`${!isEditing ? 'bg-background' : 'bg-secondary'} border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background`}
          value={formData.lastName}
          onChange={handleChange('lastName')}
          readOnly={!isEditing}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
          <Input
            placeholder="Enter phone number"
            className={`${!isEditing ? 'bg-background' : 'bg-secondary'} border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background`}
            value={formData.phoneNumber}
            onChange={handleChange('phoneNumber')}
            readOnly={!isEditing}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Gender</label>
          <Select 
            disabled={!isEditing}
            value={formData.gender}
            onValueChange={(value) => handleChange('gender')({ target: { value } } as any)}
          >
            <SelectTrigger className={`${!isEditing ? 'bg-background' : 'bg-secondary'}`}>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Birth Day</label>
          <Input
            type="date"
            className={`${!isEditing ? 'bg-background' : 'bg-secondary'} border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background`}
            value={formData.birthDay}
            onChange={handleChange('birthDay')}
            readOnly={!isEditing}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Occupation</label>
          <Input
            placeholder="Enter occupation"
            className={`${!isEditing ? 'bg-background' : 'bg-secondary'} border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background`}
            value={formData.occupation}
            onChange={handleChange('occupation')}
            readOnly={!isEditing}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Address</label>
        <Textarea
          placeholder="Enter address"
          className={`${!isEditing ? 'bg-background' : 'bg-secondary'} border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background min-h-[80px]`}
          value={formData.address}
          onChange={handleChange('address')}
          readOnly={!isEditing}
        />
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
    </div>
  );
}