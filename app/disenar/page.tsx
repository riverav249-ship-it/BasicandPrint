import type { Metadata } from "next";
import Builder from "@/components/Builder";

export const metadata: Metadata = {
  title: "Diseña tu camisa",
  description: "Elige color, diseño, ubicación y tallas de tu camiseta con serigrafía, y pídela por WhatsApp.",
};

export default function DisenarPage() {
  return <Builder />;
}
