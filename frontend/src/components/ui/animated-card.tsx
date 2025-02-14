import { Card } from "./card";

interface AnimatedCardProps {
  children: React.ReactNode;
  isSuccess: boolean;
}

export function AnimatedCard({ children, isSuccess }: AnimatedCardProps) {
  return (
    <Card 
      className={`
        w-[400px] 
        shadow-lg 
        backdrop-blur-[2px]
        ${isSuccess 
          ? 'animate-[success-exit_700ms_ease-in-out_forwards]' 
          : 'animate-[float-in_700ms_cubic-bezier(0.22, 1, 0.36, 1)_forwards]'
        }
      `}
    >
      {children}
    </Card>
  );
}