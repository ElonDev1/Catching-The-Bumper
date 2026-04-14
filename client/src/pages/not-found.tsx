import Layout from "@/components/Layout";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <Layout>
      <div className="px-6 py-6 max-w-2xl">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle size={16} className="text-muted-foreground" />
          <h1 className="text-lg font-semibold text-foreground">404 — Page Not Found</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
    </Layout>
  );
}
