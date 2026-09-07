import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "../lib/useAuth";
import { AdminCatalogTypesScreen } from "./AdminCatalogTypesScreen";
import { AdminProductsScreen } from "./AdminProductsScreen";
import { AdminCompanyScreen } from "./AdminCompanyScreen";
import { AdminLoginScreen } from "./AdminLoginScreen";
import { colors } from "../theme";

type SubTab = "catalog-types" | "products" | "company";

function SubTabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.subTab, active && styles.subTabActive]}>
      <Text style={[styles.subTabText, active && styles.subTabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function AdminHomeScreen() {
  const { profile, isAdmin, loading, signOut } = useAuth();
  const [subTab, setSubTab] = useState<SubTab>("catalog-types");

  if (loading) return <View style={styles.container} />;
  if (!profile || !isAdmin) return <AdminLoginScreen />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>Signed in as {profile.email}</Text>
        </View>
        <TouchableOpacity onPress={() => signOut()}>
          <Text style={{ color: colors.brandDark }}>Sign out</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.subTabs}>
        <SubTabButton
          label="Catalog Types"
          active={subTab === "catalog-types"}
          onPress={() => setSubTab("catalog-types")}
        />
        <SubTabButton
          label="Products"
          active={subTab === "products"}
          onPress={() => setSubTab("products")}
        />
        <SubTabButton
          label="Company"
          active={subTab === "company"}
          onPress={() => setSubTab("company")}
        />
      </View>
      <View style={{ flex: 1 }}>
        {subTab === "catalog-types" && <AdminCatalogTypesScreen />}
        {subTab === "products" && <AdminProductsScreen />}
        {subTab === "company" && <AdminCompanyScreen />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  title: { fontSize: 18, fontWeight: "700" },
  subtitle: { fontSize: 12, color: colors.muted },
  subTabs: { flexDirection: "row", gap: 8, padding: 12, paddingBottom: 0 },
  subTab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  subTabActive: { backgroundColor: "#171717", borderColor: "#171717" },
  subTabText: { fontSize: 12, color: colors.muted },
  subTabTextActive: { color: "#fff" },
});
