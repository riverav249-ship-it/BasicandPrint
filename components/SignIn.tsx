"use client";
import { useState } from "react";
import { Mail, AlertCircle, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

/** Acceso con enlace mágico al correo: sin contraseñas. */
export default function SignIn({ reason }: { reason: string }) {
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setState("error");
      setMsg("Revisa el correo: parece incompleto.");
      return;
    }
    if (nickname.trim().length < 2) {
      setState("error");
      setMsg("Elige un apodo de al menos 2 letras.");
      return;
    }
    setState("sending");
    const { error } = await supabase().auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + window.location.pathname,
        data: { nickname: nickname.trim().slice(0, 30) },
      },
    });
    if (error) {
      setState("error");
      setMsg(
        error.status === 429
          ? "Se enviaron muchos correos seguidos. Espera un minuto e inténtalo de nuevo."
          : "No pudimos enviar el enlace. Intenta de nuevo en un momento."
      );
    } else setState("sent");
  };

  if (state === "sent")
    return (
      <div className="signin sent" role="status">
        <Check aria-hidden="true" />
        <p>
          Te enviamos un enlace a <strong>{email}</strong>. Ábrelo desde este mismo dispositivo para entrar.
        </p>
      </div>
    );

  return (
    <form className="signin" onSubmit={send} noValidate>
      <p className="signin-why">{reason}</p>
      <label>
        Apodo en la comunidad
        <input value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={30} placeholder="Ej.: Vero_503" />
      </label>
      <label>
        Correo
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="tu@correo.com" />
      </label>
      {state === "error" && (
        <p className="form-error" role="alert">
          <AlertCircle aria-hidden="true" /> {msg}
        </p>
      )}
      <button className="squeegee" disabled={state === "sending"}>
        <span>
          <Mail aria-hidden="true" />
          {state === "sending" ? "Enviando…" : "Entrar con mi correo"}
        </span>
      </button>
    </form>
  );
}
