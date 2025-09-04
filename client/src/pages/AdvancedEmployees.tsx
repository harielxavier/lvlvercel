import { useAuth } from "@/hooks/useAuth";
import AdvancedEmployeeManagement from "@/components/AdvancedEmployeeManagement";

export default function AdvancedEmployees() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return <AdvancedEmployeeManagement user={user} />;
}