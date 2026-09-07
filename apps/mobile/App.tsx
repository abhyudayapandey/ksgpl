import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "./src/lib/useAuth";
import { VisitorProvider, useVisitor } from "./src/lib/useVisitor";
import { CatalogScreen } from "./src/screens/CatalogScreen";
import { CompanyScreen } from "./src/screens/CompanyScreen";
import { AdminHomeScreen } from "./src/screens/AdminHomeScreen";
import { VisitorGateScreen } from "./src/screens/VisitorGateScreen";
import { colors } from "./src/theme";

type MainTab = "catalog" | "company" | "admin";

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.tabButton} onPress={onPress}>
      <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function RootTabs() {
  const [tab, setTab] = useState<MainTab>("catalog");
  const { isAdmin } = useAuth();
  const { visitor, loading } = useVisitor();

  if (loading) {
    return <SafeAreaView style={styles.root} edges={["top", "bottom"]} />;
  }

  if (!visitor) {
    return (
      <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
        <StatusBar style="dark" />
        <VisitorGateScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <View style={{ flex: 1 }}>
        {tab === "catalog" && <CatalogScreen />}
        {tab === "company" && <CompanyScreen />}
        {tab === "admin" && <AdminHomeScreen />}
      </View>
      <View style={styles.tabBar}>
        <TabButton label="Catalog" active={tab === "catalog"} onPress={() => setTab("catalog")} />
        <TabButton label="Company" active={tab === "company"} onPress={() => setTab("company")} />
        {visitor.isAdminEmail && (
          <TabButton
            label={isAdmin ? "Admin" : "Admin login"}
            active={tab === "admin"}
            onPress={() => setTab("admin")}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <VisitorProvider>
        <AuthProvider>
          <RootTabs />
        </AuthProvider>
      </VisitorProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabButtonText: { fontSize: 13, color: colors.muted, fontWeight: "500" },
  tabButtonTextActive: { color: colors.brandDark, fontWeight: "700" },
});
