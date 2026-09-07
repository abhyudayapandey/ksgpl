import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { getCompanyInfo, updateCompanyInfo, type CompanyInfo } from "@ksgpl/shared";
import { getSupabase } from "../lib/supabase";
import { ImagePickerField } from "../components/ImagePickerField";
import { colors } from "../theme";

type FormState = Omit<CompanyInfo, "id" | "updated_at" | "gallery_urls" | "established_year"> & {
  gallery_urls: string;
  established_year: string;
};

function toForm(info: CompanyInfo): FormState {
  return {
    name: info.name,
    brand_name: info.brand_name ?? "",
    tagline: info.tagline ?? "",
    description: info.description ?? "",
    established_year: info.established_year ? String(info.established_year) : "",
    address: info.address ?? "",
    phone: info.phone ?? "",
    email: info.email ?? "",
    website: info.website ?? "",
    logo_url: info.logo_url,
    gallery_urls: info.gallery_urls.join(", "),
  };
}

function Field({
  label,
  value,
  onChangeText,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  multiline?: boolean;
}) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} style={styles.input} multiline={multiline} />
    </View>
  );
}

export function AdminCompanyScreen() {
  const [info, setInfo] = useState<CompanyInfo | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const db = getSupabase();
    getCompanyInfo(db)
      .then((i) => {
        setInfo(i);
        if (i) setForm(toForm(i));
      })
      .catch((e) => setError(e.message));
  }, []);

  async function handleSubmit() {
    if (!form || !info) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    const db = getSupabase();
    try {
      const updated = await updateCompanyInfo(db, info.id, {
        name: form.name.trim(),
        brand_name: form.brand_name?.trim() || null,
        tagline: form.tagline?.trim() || null,
        description: form.description?.trim() || null,
        established_year: form.established_year ? Number(form.established_year) : null,
        address: form.address?.trim() || null,
        phone: form.phone?.trim() || null,
        email: form.email?.trim() || null,
        website: form.website?.trim() || null,
        logo_url: form.logo_url,
        gallery_urls: form.gallery_urls.split(",").map((u) => u.trim()).filter(Boolean),
      });
      setInfo(updated);
      setForm(toForm(updated));
      setSaved(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (error && !form) return <Text style={{ margin: 16, color: colors.danger }}>{error}</Text>;
  if (!info || !form)
    return (
      <Text style={{ margin: 16, color: colors.muted }}>
        No company info row exists yet. Run the seed SQL (see README) to create the initial row.
      </Text>
    );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 12, gap: 10 }}>
      {error && <Text style={styles.error}>{error}</Text>}
      {saved && <Text style={styles.saved}>Saved.</Text>}
      <Field label="Company name" value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} />
      <Field label="Brand name" value={form.brand_name ?? ""} onChangeText={(t) => setForm({ ...form, brand_name: t })} />
      <Field label="Tagline" value={form.tagline ?? ""} onChangeText={(t) => setForm({ ...form, tagline: t })} />
      <Field label="Description" value={form.description ?? ""} onChangeText={(t) => setForm({ ...form, description: t })} multiline />
      <Field label="Established year" value={form.established_year} onChangeText={(t) => setForm({ ...form, established_year: t })} />
      <Field label="Address" value={form.address ?? ""} onChangeText={(t) => setForm({ ...form, address: t })} />
      <Field label="Phone" value={form.phone ?? ""} onChangeText={(t) => setForm({ ...form, phone: t })} />
      <Field label="Email" value={form.email ?? ""} onChangeText={(t) => setForm({ ...form, email: t })} />
      <Field label="Website" value={form.website ?? ""} onChangeText={(t) => setForm({ ...form, website: t })} />
      <ImagePickerField
        bucket="company-images"
        pathPrefix="logo"
        value={form.logo_url}
        onChange={(url) => setForm({ ...form, logo_url: url })}
      />
      <Field
        label="Gallery image URLs (comma separated)"
        value={form.gallery_urls}
        onChangeText={(t) => setForm({ ...form, gallery_urls: t })}
        multiline
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleSubmit} disabled={saving}>
        <Text style={styles.saveButtonText}>{saving ? "Saving…" : "Save"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "600", color: colors.text },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    backgroundColor: colors.card,
  },
  error: { color: colors.danger, fontSize: 13 },
  saved: { color: "#15803d", fontSize: 13 },
  saveButton: { backgroundColor: colors.brand, borderRadius: 6, paddingVertical: 10, alignItems: "center", alignSelf: "flex-start", paddingHorizontal: 20 },
  saveButtonText: { color: "#fff", fontWeight: "600", fontSize: 13 },
});
