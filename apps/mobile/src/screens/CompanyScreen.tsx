import { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator, FlatList } from "react-native";
import { getCompanyInfo, type CompanyInfo } from "@ksgpl/shared";
import { getSupabase } from "../lib/supabase";
import { colors } from "../theme";

function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export function CompanyScreen() {
  const [info, setInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = getSupabase();
    getCompanyInfo(db)
      .then(setInfo)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 24 }} color={colors.brand} />;
  if (error) return <Text style={[styles.error, { margin: 16 }]}>{error}</Text>;
  if (!info)
    return (
      <Text style={{ margin: 16, color: colors.muted }}>
        No company info yet. An admin can add it from the Admin tab.
      </Text>
    );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <View style={styles.header}>
        {info.logo_url && <Image source={{ uri: info.logo_url }} style={styles.logo} />}
        <View>
          <Text style={styles.name}>{info.name}</Text>
          {info.brand_name && <Text style={styles.brand}>{info.brand_name}</Text>}
        </View>
      </View>
      {info.tagline && <Text style={styles.tagline}>{info.tagline}</Text>}
      {info.description && <Text style={styles.description}>{info.description}</Text>}

      <View style={styles.details}>
        <Row label="Established" value={info.established_year} />
        <Row label="Address" value={info.address} />
        <Row label="Phone" value={info.phone} />
        <Row label="Email" value={info.email} />
        <Row label="Website" value={info.website} />
      </View>

      {info.gallery_urls?.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Manufacturing Unit</Text>
          <FlatList
            data={info.gallery_urls}
            keyExtractor={(u) => u}
            numColumns={2}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.galleryImage} resizeMode="cover" />
            )}
            scrollEnabled={false}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  error: { color: colors.danger, fontSize: 13 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  logo: { width: 56, height: 56, resizeMode: "contain" },
  name: { fontSize: 20, fontWeight: "700", color: colors.text },
  brand: { color: colors.brandDark, fontWeight: "600" },
  tagline: { fontStyle: "italic", fontSize: 15, color: colors.text },
  description: { color: colors.text, lineHeight: 20 },
  details: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10, gap: 8 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  rowLabel: { color: colors.muted, fontSize: 13 },
  rowValue: { color: colors.text, fontSize: 13, fontWeight: "600" },
  sectionTitle: { fontWeight: "600", marginBottom: 6 },
  galleryImage: { flex: 1, aspectRatio: 16 / 9, margin: 3, borderRadius: 8, backgroundColor: "#eee" },
});
