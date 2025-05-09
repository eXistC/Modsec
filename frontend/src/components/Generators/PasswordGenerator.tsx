import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, RefreshCw, Check } from "lucide-react";
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
  const [copied, setCopied] = useState(false);

  // Clear generated value when switching tabs
  const handleTypeChange = (value: "password" | "username") => {
    setGeneratorType(value);
    setGenerated(""); // Clear the previous value
    setCopied(false);
  };

  const handleGenerate = (value: string) => {
    setGenerated(value);
    onPasswordGenerated?.(value);
    setCopied(false);
  };

  const copyToClipboard = () => {
    if (generated) {
      navigator.clipboard.writeText(generated);
      setCopied(true);
      toast.success(`${generatorType === "password" ? "Password" : "Username"} copied to clipboard`);
      
      // Reset copied status after 1.5 seconds
      setTimeout(() => {
        setCopied(false);
      }, 1500);
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
    <div className="h-full flex flex-col">
      <div className="border-b border-border p-4">
        <h2 className="text-lg font-medium">Generator</h2>
        <p className="text-xs text-muted-foreground">Create secure passwords and usernames</p>
      </div>
      
      <div className="flex-1 overflow-auto p-4 space-y-5">
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
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground">Generated {generatorType}</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRandomize}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-primary"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Regenerate
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              value={generated}
              readOnly
              className="font-mono bg-secondary/30 border-secondary/50 focus-visible:ring-1 focus-visible:ring-primary/30"
              placeholder={`Generated ${generatorType} will appear here`}
            />
            <Button
              variant={copied ? "default" : "secondary"}
              size="icon"
              onClick={copyToClipboard}
              disabled={!generated}
              className="transition-colors duration-300"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="bg-secondary/10 rounded-md p-4 border border-secondary/20">
          {generatorType === "password" 
            ? <PasswordGeneratorModule onGenerate={handleGenerate} />
            : <UsernameGeneratorModule onGenerate={handleGenerate} />
          }
        </div>
      </div>
    </div>
  );
}