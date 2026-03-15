import PageHeader from "@/components/PageHeader";
import AdminClient from "./AdminClient";
import { supabase, Template } from "@/lib/supabase";

async function getTemplates(): Promise<Template[]> {
  try {
    const { data } = await supabase.from("templates").select("*").order("created_at");
    return (data as Template[]) ?? [];
  } catch {
    return [];
  }
}

export default async function AdminPage() {
  const templates = await getTemplates();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <PageHeader title="어드민" />
      <main style={{ flex: 1, maxWidth: 860, margin: "0 auto", padding: "48px 24px", width: "100%" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: '"GMarketSans", sans-serif', fontSize: 24, fontWeight: 700, color: "#1E1E1C", marginBottom: 6 }}>
            템플릿 관리
          </h1>
          <p style={{ fontFamily: '"Suit", sans-serif', fontSize: 14, color: "#7A7A72" }}>
            배경 템플릿 업로드 및 활성/비활성 관리
          </p>
        </div>
        <AdminClient initialTemplates={templates} />
      </main>
    </div>
  );
}
