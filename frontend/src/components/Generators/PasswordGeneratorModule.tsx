import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

interface PasswordGeneratorModuleProps {
  onGenerate: (password: string) => void;
}

export function PasswordGeneratorModule({ onGenerate }: PasswordGeneratorModuleProps) {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    numbers: true,
    symbols: true,
  });

  const generatePassword = () => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*_+-|.";

    let chars = lowercase;
    if (options.uppercase) chars += uppercase;
    if (options.numbers) chars += numbers;
    if (options.symbols) chars += symbols;

    let generatedPassword = "";
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      generatedPassword += chars.charAt(array[i] % chars.length);
    }

    onGenerate(generatedPassword);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Password Length: {length}</Label>
        <Slider
          value={[length]}
          onValueChange={([value]) => {
            setLength(value);
            generatePassword();
          }}
          max={32}
          min={8}
          step={1}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="uppercase">Include Uppercase (ABCDEFG)</Label>
          <Switch
            id="uppercase"
            checked={options.uppercase}
            onCheckedChange={(checked) => {
              setOptions((prev) => ({ ...prev, uppercase: checked }));
              generatePassword();
            }}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="numbers">Include Numbers (0123456789)</Label>
          <Switch
            id="numbers"
            checked={options.numbers}
            onCheckedChange={(checked) => {
              setOptions((prev) => ({ ...prev, numbers: checked }));
              generatePassword();
            }}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="symbols">Include Symbols (!@#$%^&*_+-|.)</Label>
          <Switch
            id="symbols"
            checked={options.symbols}
            onCheckedChange={(checked) => {
              setOptions((prev) => ({ ...prev, symbols: checked }));
              generatePassword();
            }}
          />
        </div>
      </div>
    </div>
  );
}