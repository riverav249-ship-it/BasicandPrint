"use client";
import { useCallback, useEffect, useState } from "react";
import { Plus, Save, Trash2, Upload, AlertCircle, Check, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";

export type Field = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "bool" | "date" | "color";
  width?: string;
};
type Row = Record<string, unknown> & { id?: string };

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "item";

export function Notice({ kind, children }: { kind: "ok" | "err"; children: React.ReactNode }) {
  return (
    <p className={kind === "ok" ? "adm-ok" : "form-error"} role={kind === "err" ? "alert" : "status"}>
      {kind === "ok" ? <Check aria-hidden="true" /> : <AlertCircle aria-hidden="true" />} {children}
    </p>
  );
}

function FieldInput({ f, value, onChange }: { f: Field; value: unknown; onChange: (v: unknown) => void }) {
  const id = `f-${f.key}-${Math.random().toString(36).slice(2, 7)}`;
  if (f.type === "bool")
    return (
      <label className="adm-check">
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} /> {f.label}
      </label>
    );
  return (
    <label htmlFor={id} style={f.width ? { gridColumn: `span ${f.width}` } : undefined}>
      {f.label}
      {f.type === "textarea" ? (
        <textarea id={id} rows={2} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
      ) : f.type === "color" ? (
        <span className="adm-color">
          <input type="color" value={(value as string) || "#ffffff"} onChange={(e) => onChange(e.target.value.toUpperCase())} />
          <input id={id} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} maxLength={7} />
        </span>
      ) : (
        <input
          id={id}
          type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
          value={(value as string | number | null) ?? ""}
          onChange={(e) => onChange(f.type === "number" ? (e.target.value === "" ? null : Number(e.target.value)) : e.target.value)}
        />
      )}
    </label>
  );
}

/** Tabla editable genérica: cada fila se guarda por separado. */
export function CrudTable({
  table,
  fields,
  orderBy = "sort",
  newRow,
  keyField = "id",
  title,
  help,
  preview,
  beforeInsert,
  extra,
}: {
  table: string;
  fields: Field[];
  orderBy?: string;
  newRow: Row;
  keyField?: string;
  title: string;
  help?: string;
  preview?: (r: Row) => React.ReactNode;
  beforeInsert?: (r: Row) => Row;
  extra?: (r: Row, patch: (p: Row) => void) => React.ReactNode;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase().from(table).select("*").order(orderBy);
    if (error) setMsg({ kind: "err", text: "No se pudo cargar. " + error.message });
    setRows((data as Row[]) ?? []);
    setDirty({});
    setLoading(false);
  }, [table, orderBy]);

  useEffect(() => {
    load();
  }, [load]);

  const keyOf = (r: Row, i: number) => (r[keyField] as string) ?? `new-${i}`;

  const save = async (r: Row, i: number) => {
    setMsg(null);
    const sb = supabase();
    const isNew = !r.__saved;
    const payload = { ...r };
    delete payload.__saved;
    const { error } = isNew
      ? await sb.from(table).insert(beforeInsert ? beforeInsert(payload) : payload)
      : await sb.from(table).update(payload).eq(keyField, r[keyField] as string);
    if (error) return setMsg({ kind: "err", text: "No se guardó: " + error.message });
    setMsg({ kind: "ok", text: "Guardado." });
    setDirty((d) => ({ ...d, [keyOf(r, i)]: false }));
    load();
  };

  const del = async (r: Row, i: number) => {
    if (!r.__saved) return setRows((x) => x.filter((_, j) => j !== i));
    if (!window.confirm("¿Eliminar este elemento? No se puede deshacer.")) return;
    const { error } = await supabase().from(table).delete().eq(keyField, r[keyField] as string);
    if (error) return setMsg({ kind: "err", text: "No se eliminó: " + error.message });
    setMsg({ kind: "ok", text: "Eliminado." });
    load();
  };

  const withSaved = rows.map((r) => ("__saved" in r ? r : { ...r, __saved: true }));

  return (
    <section className="adm-section">
      <div className="adm-head">
        <div>
          <h2>{title}</h2>
          {help && <p className="adm-help">{help}</p>}
        </div>
        <div className="adm-actions">
          <button className="adm-btn ghost" onClick={load} aria-label="Recargar">
            <RefreshCw aria-hidden="true" />
          </button>
          <button
            className="adm-btn"
            onClick={() => setRows((x) => [{ ...newRow, __saved: false } as Row, ...x.map((r) => ({ ...r, __saved: r.__saved ?? true }))])}
          >
            <Plus aria-hidden="true" /> Agregar
          </button>
        </div>
      </div>
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      {loading && <p className="empty">Cargando…</p>}
      <ul className="adm-rows">
        {withSaved.map((r, i) => (
          <li key={keyOf(r, i)} className={`${dirty[keyOf(r, i)] ? "is-dirty" : ""} ${!r.__saved ? "is-new" : ""}`}>
            {preview && <div className="adm-preview">{preview(r)}</div>}
            <div className="adm-fields">
              {fields.map((f) => (
                <FieldInput
                  key={f.key}
                  f={f}
                  value={r[f.key]}
                  onChange={(v) => {
                    setRows((x) => x.map((y, j) => (j === i ? { ...withSaved[j], [f.key]: v } : { ...withSaved[j] })));
                    setDirty((d) => ({ ...d, [keyOf(r, i)]: true }));
                  }}
                />
              ))}
              {extra &&
                extra(r, (p) => {
                  setRows((x) => x.map((y, j) => (j === i ? { ...withSaved[j], ...p } : { ...withSaved[j] })));
                  setDirty((d) => ({ ...d, [keyOf(r, i)]: true }));
                })}
            </div>
            <div className="adm-row-actions">
              <button className="adm-btn" onClick={() => save(r, i)}>
                <Save aria-hidden="true" /> {r.__saved ? "Guardar" : "Crear"}
              </button>
              <button className="adm-btn ghost danger" onClick={() => del(r, i)} aria-label="Eliminar">
                <Trash2 aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Subida de imagen a un bucket público; devuelve la URL. */
export function ImageUpload({
  bucket,
  onUploaded,
  label = "Subir imagen",
}: {
  bucket: string;
  onUploaded: (url: string) => void;
  label?: string;
}) {
  const [state, setState] = useState<"idle" | "up" | "err">("idle");
  return (
    <label className="adm-upload">
      <input
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp"
        className="sr-only"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          setState("up");
          const ext = f.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
          const path = `${Date.now()}-${slugify(f.name.replace(/\.[^.]+$/, ""))}.${ext}`;
          const sb = supabase();
          const { error } = await sb.storage.from(bucket).upload(path, f, { contentType: f.type });
          if (error) return setState("err");
          onUploaded(sb.storage.from(bucket).getPublicUrl(path).data.publicUrl);
          setState("idle");
        }}
      />
      <Upload aria-hidden="true" /> {state === "up" ? "Subiendo…" : state === "err" ? "Error, reintenta" : label}
    </label>
  );
}
