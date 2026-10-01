"use client";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import SocialLinks, { WhatsAppFloat } from "./SocialLinks";
import { WHATSAPP } from "@/lib/supabase";

export default function SiteFooter() {
  const path = usePathname();
  if (path.startsWith("/admin")) return null;
  const wa = WHATSAPP.replace(/^503(\d{4})(\d{4})$/, "+503 $1 $2");
  return (
    <>
      <footer className="site-footer">
        <Logo small />
        <p className="footer-tag">
          Tu idea <span aria-hidden="true">•</span> Nuestra impresión
        </p>
        <div className="footer-contact">
          <SocialLinks className="footer-social" />
          {WHATSAPP && <span className="footer-wa">WhatsApp {wa}</span>}
        </div>
        <p className="footer-fine">Serigrafía en camisetas · El Salvador. Los diseños marcados como “ejemplo” son muestras.</p>
      </footer>
      <WhatsAppFloat />
    </>
  );
}
