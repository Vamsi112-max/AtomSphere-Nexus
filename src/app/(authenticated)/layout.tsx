import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { NotificationProvider } from "@/context/NotificationContext";
import { PageTransition } from "@/components/layout/PageTransition";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <NotificationProvider>
        <AppLayout>
          <PageTransition>
            {children}
          </PageTransition>
        </AppLayout>
      </NotificationProvider>
    </ProtectedRoute>
  );
}
