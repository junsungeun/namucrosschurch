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
    <div className="page-shell">
      <PageHeader title="어드민" />
      <main className="page-main">
        <div style={{ marginBottom: 32 }}>
          <h1 className="heading-lg">템플릿 관리</h1>
          <p className="sub-text">배경 템플릿 업로드 및 활성/비활성 관리</p>
        </div>
        <AdminClient initialTemplates={templates} />
      </main>
    </div>
  );
}
