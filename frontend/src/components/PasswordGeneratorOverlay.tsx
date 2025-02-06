import { Button } from "@/components/ui/button";
import { KeyRound, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { PasswordGenerator } from "./PasswordGenerator";

export default function PasswordGeneratorOverlay() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <KeyRound className="h-4 w-4" />
          Generate Password
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[425px]">
        <div className="flex justify-between items-start">
          <AlertDialogHeader>
            <AlertDialogTitle>Password Generator</AlertDialogTitle>
            <AlertDialogDescription>
              Generate a secure password with custom requirements.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel className="absolute right-4 top-4 hover:opacity-70">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </AlertDialogCancel>
        </div>
        <PasswordGenerator />
      </AlertDialogContent>
    </AlertDialog>
  );
}