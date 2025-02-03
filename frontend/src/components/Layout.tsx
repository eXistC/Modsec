import { Sidebar } from "./Sidebar";
import { PasswordList } from "./PasswordList";
import { PasswordEditor } from "./PasswordEditor";

export function Layout() {
  return (
    <div className="h-screen bg-[#1E1E1E]">
      <div className="grid h-full lg:grid-cols-[280px_400px_1fr]">
        <Sidebar />
        <div className="border-r border-border">
          <PasswordList />
        </div>
        <div>
          <PasswordEditor />
        </div>
      </div>
    </div>
  );
}