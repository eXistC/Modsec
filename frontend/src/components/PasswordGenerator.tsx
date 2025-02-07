import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Copy, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function PasswordGenerator() {
  const [generatorType, setGeneratorType] = useState<"password" | "username">("password");
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    numbers: true,
    symbols: true,
  });
  const [generated, setGenerated] = useState("");
  const [usernameType, setUsernameType] = useState<"random" | "gmail">("random");
  const [emailProvider, setEmailProvider] = useState("@gmail.com");

  useEffect(() => {
    generateValue();
  }, [length, options, generatorType, usernameType, emailProvider]);

  const generateUsername = () => {
    const adjectives = ["Happy", "Clever", "Brave", "Swift", "Wise", "Cool", "Smart", "Bold"];
    const nouns = ["Fox", "Eagle", "Wolf", "Lion", "Tiger", "Bear", "Hawk", "Deer"];
    const numbers = Array.from({ length: 999 }, (_, i) => i + 1);

    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = numbers[Math.floor(Math.random() * numbers.length)];

    return `${randomAdjective}${randomNoun}${randomNumber}`;
  };

  const generateGmailUsername = () => {
    const adjectives = ["happy", "clever", "brave", "swift", "wise", "cool", "smart", "bold"];
    const nouns = ["fox", "eagle", "wolf", "lion", "tiger", "bear", "hawk", "deer"];
    const numbers = Array.from({ length: 999 }, (_, i) => i + 1);

    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = numbers[Math.floor(Math.random() * numbers.length)];

    return `${randomAdjective}${randomNoun}${randomNumber}${emailProvider}`;
  };

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

    return generatedPassword;
  };

  const generateValue = () => {
    if (generatorType === "password") {
      setGenerated(generatePassword());
    } else {
      setGenerated(usernameType === "random" ? generateUsername() : generateGmailUsername());
    }
  };

  const copyToClipboard = () => {
    if (generated) {
      navigator.clipboard.writeText(generated);
      toast.success(`${generatorType === "password" ? "Password" : "Username"} copied to clipboard`);
    }
  };

  return (
    <div className="space-y-6 flex flex-col p-6">
      <Tabs 
        value={generatorType} 
        onValueChange={(value) => setGeneratorType(value as "password" | "username")}
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
          <Button size="icon" onClick={generateValue}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {generatorType === "username" && (
        <div className="space-y-4 bg-background/50 p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <Label htmlFor="usernameType">Username Style</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="random"
                  value="random"
                  checked={usernameType === "random"}
                  onChange={(e) => setUsernameType(e.target.value as "random" | "gmail")}
                  className="accent-primary"
                />
                <Label htmlFor="random">Random</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="gmail"
                  value="gmail"
                  className="data-[state=active]:bg-secondary"
                >
                  Email
                </TabsTrigger>
              </TabsList>
            </div>

          {usernameType === "gmail" && (
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="emailProvider">Email Provider</Label>
                <Input
                  id="emailProvider"
                  value={emailProvider}
                  onChange={(e) => setEmailProvider(e.target.value)}
                  placeholder="@example.com"
                  className="font-mono"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {generatorType === "password" && (
        <>
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
              <Label htmlFor="uppercase">Include Uppercase (ABCDEFG)</Label>
              <Switch
                id="uppercase"
                checked={options.uppercase}
                onCheckedChange={(checked) =>
                  setOptions((prev) => ({ ...prev, uppercase: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="numbers">Include Numbers (0123456789)</Label>
              <Switch
                id="numbers"
                checked={options.numbers}
                onCheckedChange={(checked) =>
                  setOptions((prev) => ({ ...prev, numbers: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="symbols">Include Symbols (!@#$%^&*_+-|.)</Label>
              <Switch
                id="symbols"
                checked={options.symbols}
                onCheckedChange={(checked) =>
                  setOptions((prev) => ({ ...prev, symbols: checked }))
                }
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}