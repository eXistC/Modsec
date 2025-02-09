import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PasswordGeneratorModule } from "./PasswordGeneratorModule";
import { UsernameGeneratorModule } from "./UsernameGeneratorModule";

interface PasswordGeneratorProps {
  onPasswordGenerated?: (password: string) => void;
}

export function PasswordGenerator({ onPasswordGenerated }: PasswordGeneratorProps = {}) {
  const [generatorType, setGeneratorType] = useState<"password" | "username">("password");
  const [generated, setGenerated] = useState("");

  // Clear generated value when switching tabs
  const handleTypeChange = (value: "password" | "username") => {
    setGeneratorType(value);
    setGenerated(""); // Clear the previous value
  };

  const handleGenerate = (value: string) => {
    setGenerated(value);
    onPasswordGenerated?.(value);
  };

  const copyToClipboard = () => {
    if (generated) {
      navigator.clipboard.writeText(generated);
      toast.success(`${generatorType === "password" ? "Password" : "Username"} copied to clipboard`);
    }
  };

  const handleRandomize = () => {
    if (generatorType === "password") {
      const passwordModule = document.querySelector('div[data-generator="password"]');
      if (passwordModule) {
        const generateButton = passwordModule.querySelector('button[data-action="generate"]') as HTMLButtonElement;
        if (generateButton) {
          generateButton.click();
        }
      }
    } else {
      const usernameModule = document.querySelector('div[data-generator="username"]');
      if (usernameModule) {
        const generateButton = usernameModule.querySelector('button[data-action="generate"]') as HTMLButtonElement;
        if (generateButton) {
          generateButton.click();
        }
      }
    }
  };

  return (
    <div className="space-y-6 flex flex-col p-6">
      <Tabs 
        value={generatorType} 
        onValueChange={(value) => handleTypeChange(value as "password" | "username")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 bg-accent">
          <TabsTrigger 
            value="password"
            className="data-[state=active]:bg-secondary"
          >
            Password
          </TabsTrigger>
          <TabsTrigger 
            value="username"
            className="data-[state=active]:bg-secondary"
          >
            Username
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-2">
        <Label>{generatorType === "password" ? "Password" : "Username"} Generator</Label>
        <div className="flex gap-2">
          <Input
            value={generated}
            readOnly
            className="font-mono"
            placeholder={`Generated ${generatorType} here`}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={copyToClipboard}
            disabled={!generated}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRandomize}
            disabled={!generated}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {generatorType === "password" 
        ? <PasswordGeneratorModule onGenerate={handleGenerate} />
        : <UsernameGeneratorModule onGenerate={handleGenerate} />
      }
    </div>
  );
}