"use client";
import { socialUrl, useSettings } from "@/lib/settings";
import { WHATSAPP, whatsappLink } from "@/lib/supabase";

const P = { width: 20, height: 20, viewBox: "0 0 24 24", "aria-hidden": true } as const;

export const FacebookIcon = () => (
  <svg {...P} fill="currentColor">
    <path d="M13.5 21v-7.2h2.4l.4-2.8h-2.8V9.2c0-.8.2-1.4 1.4-1.4h1.5V5.3c-.3 0-1.1-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8V11H8v2.8h2.5V21h3z" />
  </svg>
);
export const InstagramIcon = () => (
  <svg {...P} fill="none" stroke="currentColor" strokeWidth="1.9">
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);
export const TikTokIcon = () => (
  <svg {...P} fill="currentColor">
    <path d="M16.6 3c.4 2.2 1.8 3.6 4 3.8v3.1c-1.5 0-2.8-.4-4-1.2v5.9c0 3.4-2.6 5.9-5.8 5.9A5.8 5.8 0 0 1 5 14.7c0-3.4 2.9-6.1 6.4-5.7v3.2c-1.6-.4-3.2.8-3.2 2.5 0 1.4 1.1 2.6 2.6 2.6 1.6 0 2.7-1.2 2.7-2.9V3h3.1z" />
  </svg>
);
export const WhatsAppIcon = () => (
  <svg {...P} fill="currentColor">
    <path d="M12 3a9 9 0 0 0-7.8 13.4L3 21l4.7-1.2A9 9 0 1 0 12 3zm0 16.3c-1.4 0-2.8-.4-4-1.1l-.3-.2-2.8.7.8-2.7-.2-.3A7.3 7.3 0 1 1 12 19.3zm4-5.5c-.2-.1-1.3-.7-1.5-.7-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1-.2-.1-.9-.3-1.8-1.1-.7-.6-1.1-1.3-1.2-1.5-.1-.2 0-.3.1-.4l.4-.4.2-.4v-.4l-.7-1.6c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.3c.1.2 1.6 2.5 3.9 3.5 1.9.8 2.3.6 2.7.6.4-.1 1.3-.5 1.5-1.1.2-.5.2-1 .1-1.1l-.5-.3z" />
  </svg>
);

/** Íconos de redes: cada red aparece cuando su enlace existe en el panel de administración. */
export default function SocialLinks({ className = "" }: { className?: string }) {
  const s = useSettings();
  const items = [
    { k: "facebook" as const, label: "Facebook", Icon: FacebookIcon },
    { k: "instagram" as const, label: "Instagram", Icon: InstagramIcon },
    { k: "tiktok" as const, label: "TikTok", Icon: TikTokIcon },
  ]
    .map((i) => ({ ...i, href: socialUrl(i.k, s[i.k]) }))
    .filter((i) => i.href);
  return (
    <ul className={`social ${className}`}>
      {items.map(({ k, label, Icon, href }) => (
        <li key={k}>
          <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`Basic&Print en ${label}`}>
            <Icon />
          </a>
        </li>
      ))}
      {WHATSAPP && (
        <li>
          <a href={whatsappLink("Hola Basic&Print")} target="_blank" rel="noopener noreferrer" aria-label="Escríbenos por WhatsApp">
            <WhatsAppIcon />
          </a>
        </li>
      )}
    </ul>
  );
}

export function WhatsAppFloat() {
  return (
    <a
      className="wa-float"
      href={whatsappLink("Hola Basic&Print, quiero información.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
    >
      <WhatsAppIcon />
    </a>
  );
}
