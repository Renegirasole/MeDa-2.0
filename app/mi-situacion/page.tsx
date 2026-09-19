import type { Metadata } from "next";
import { PageHeader } from "@/components/pages/PageHeader";
import { Container } from "@/components/ui/Section";
import { ProfileEditor } from "@/components/tools/ProfileEditor";

export const metadata: Metadata = {
  title: "Mis números",
  description: "Tus ingresos, gastos y ahorros, guardados solo en tu dispositivo. Se rellenan una vez y valen para todas las calculadoras de MeDa.",
  alternates: { canonical: "/mi-situacion" },
  robots: { index: false, follow: true },
};

export default function ProfilePage() {
  return (
    <>
      <PageHeader
        eyebrow="Tus cosas"
        title="Mis números"
        intro="Rellénalos una vez y valen para todas las herramientas. Solo tres datos son imprescindibles."
      />
      <Container className="pb-24">
        <ProfileEditor />
      </Container>
    </>
  );
}
