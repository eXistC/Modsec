import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useEffect } from "react";

interface UsernameGeneratorModuleProps {
  onGenerate: (username: string) => void;
}

export function UsernameGeneratorModule({ onGenerate }: UsernameGeneratorModuleProps) {
  const [usernameType, setUsernameType] = useState<"random" | "gmail">("random");
  const [emailProvider, setEmailProvider] = useState("@gmail.com");

  const generateUsername = () => {
    const adjectives = usernameType === "random" 
      ? ["Happy", "Clever", "Brave", "Swift", "Wise", "Cool", "Smart", "Bold"]
      : ["happy", "clever", "brave", "swift", "wise", "cool", "smart", "bold"];
    const nouns = usernameType === "random"
      ? ["Fox", "Eagle", "Wolf", "Lion", "Tiger", "Bear", "Hawk", "Deer"]
      : ["fox", "eagle", "wolf", "lion", "tiger", "bear", "hawk", "deer"];
    const numbers = Array.from({ length: 999 }, (_, i) => i + 1);

    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = numbers[Math.floor(Math.random() * numbers.length)];

    const username = usernameType === "gmail"
      ? `${randomAdjective}${randomNoun}${randomNumber}${emailProvider}`
      : `${randomAdjective}${randomNoun}${randomNumber}`;

    onGenerate(username);
  };

  useEffect(() => {
    generateUsername();
  }, [usernameType, emailProvider]);

  return (
    <div className="space-y-4 bg-background/50 p-4 rounded-lg border" data-generator="username">
      <Tabs 
        value={usernameType} 
        onValueChange={(value) => setUsernameType(value as "random" | "gmail")}
        className="w-full"
      >
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid w-[200px] grid-cols-2 bg-accent">
            <TabsTrigger 
              value="random"
              className="data-[state=active]:bg-secondary"
            >
              Random
            </TabsTrigger>
            <TabsTrigger 
              value="gmail"
              className="data-[state=active]:bg-secondary"
            >
              Email
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="gmail" className="space-y-4 mt-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="emailProvider">Email Provider</Label>
            <Input
              id="emailProvider"
              value={emailProvider}
              onChange={(e) => setEmailProvider(e.target.value)}
              placeholder="@example.com"
              className="font-mono"
            />
            <p className="text-sm text-muted-foreground">
              Enter your email provider (e.g. @gmail.com, @outlook.com)
            </p>
          </div>
        </TabsContent>
      </Tabs>
      <Button 
        data-action="generate"
        onClick={generateUsername}
        className="hidden"
      >
        Generate
      </Button>
    </div>
  );
}