import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { LockKeyhole, ArrowRightCircle } from "lucide-react";

interface LoginPageProps {
  onLogin: (masterPassword: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(password);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#1E1E1E]">
      <Card className="w-[400px]">
        <CardHeader className="text-center">
          <div className="w-full flex justify-center mb-4">
            <LockKeyhole className="h-12 w-12 text-primary" />
          </div>
          <CardTitle>Welcome to Modsec</CardTitle>
          <CardDescription>Enter your master password to unlock</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="masterPassword">Master Password</Label>
                <div className="relative">
                  <Input
                    id="masterPassword"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your master password"
                    autoFocus
                    className="pr-10"
                  />
                  <Button 
                    type="submit" 
                    size="icon"
                    variant="ghost"
                    className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                  >
                    <ArrowRightCircle className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}