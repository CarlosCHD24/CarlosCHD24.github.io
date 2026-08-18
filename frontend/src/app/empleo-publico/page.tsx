import type { Metadata } from "next";
import { createSocialMetadata } from "@/lib/socialMetadata";
import OpportunityExplorer from "./OpportunityExplorer";

const pageTitle = "Empleo público en Sevilla | Visor de oportunidades";
const pageDescription =
  "Consulta y filtra convocatorias, bolsas y procesos de provisión de empleo público en Sevilla y su provincia.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: "/empleo-publico",
  },
  ...createSocialMetadata({
    title: pageTitle,
    description: pageDescription,
    url: "/empleo-publico",
  }),
};

export default function EmploymentPage() {
  return <OpportunityExplorer />;
}
