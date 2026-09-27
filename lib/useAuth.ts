"use client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type Profile = { id: string; nickname: string };

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sb = supabase();
    const load = async (u: User | null) => {
      setUser(u);
      if (u) {
        const { data } = await sb.from("profiles").select("id,nickname").eq("id", u.id).maybeSingle();
        setProfile(data ?? { id: u.id, nickname: (u.user_metadata?.nickname as string) || u.email?.split("@")[0] || "cliente" });
      } else setProfile(null);
      setReady(true);
    };
    sb.auth.getSession().then(({ data }) => load(data.session?.user ?? null));
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => load(s?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  return { user, profile, ready, signOut: () => supabase().auth.signOut() };
}
