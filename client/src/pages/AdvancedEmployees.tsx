import { useAuth } from "@/hooks/useAuth";
import AdvancedEmployeeManagement from "@/components/AdvancedEmployeeManagement";
import AppLayout from "@/components/AppLayout";

export default function AdvancedEmployees() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <AppLayout user={user}>
      <AdvancedEmployeeManagement user={user} />
    </AppLayout>
  );
}