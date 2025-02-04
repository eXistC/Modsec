import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Copy, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    numbers: true,
    symbols: true,
  });
  const [password, setPassword] = useState("");

  const generatePassword = () => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    let chars = lowercase; // Always include lowercase for better security
    if (options.uppercase) chars += uppercase;
    if (options.numbers) chars += numbers;
    if (options.symbols) chars += symbols;

    let generatedPassword = "";
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      generatedPassword += chars.charAt(array[i] % chars.length);
    }

    setPassword(generatedPassword);
  };

  const copyToClipboard = () => {
    if (password) {
      navigator.clipboard.writeText(password);
      toast.success("Password copied to clipboard");
    }
  };

  return (
    <div className="space-y-6 flex flex-col p-6">
      <div className="space-y-2">
        <Label>Generated Password</Label>
        <div className="flex gap-2">
          <Input
            value={password}
            readOnly
            className="font-mono"
            placeholder="Click generate to create password"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={copyToClipboard}
            disabled={!password}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button size="icon" onClick={generatePassword}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Password Length: {length}</Label>
        <Slider
          value={[length]}
          onValueChange={([value]) => setLength(value)}
          max={32}
          min={8}
          step={1}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="uppercase">Include Uppercase</Label>
          <Switch
            id="uppercase"
            checked={options.uppercase}
            onCheckedChange={(checked) =>
              setOptions((prev) => ({ ...prev, uppercase: checked }))
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="numbers">Include Numbers</Label>
          <Switch
            id="numbers"
            checked={options.numbers}
            onCheckedChange={(checked) =>
              setOptions((prev) => ({ ...prev, numbers: checked }))
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="symbols">Include Symbols</Label>
          <Switch
            id="symbols"
            checked={options.symbols}
            onCheckedChange={(checked) =>
              setOptions((prev) => ({ ...prev, symbols: checked }))
            }
          />
        </div>
      </div>
    </div>
  );
}