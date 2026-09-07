import { ScrollView, TouchableOpacity, Text, StyleSheet } from "react-native";
import type { CatalogType } from "@ksgpl/shared";
import { colors } from "../theme";

export function CatalogTabs({
  catalogTypes,
  activeId,
  onChange,
}: {
  catalogTypes: CatalogType[];
  activeId: string | null;
  onChange: (id: string) => void;
}) {
  if (catalogTypes.length === 0) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
      {catalogTypes.map((ct) => {
        const active = ct.id === activeId;
        return (
          <TouchableOpacity
            key={ct.id}
            onPress={() => onChange(ct.id)}
            style={[styles.tab, active && styles.tabActive]}
          >
            <Text style={[styles.tabText, active && styles.tabTextActive]}>{ct.name}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexGrow: 0, marginBottom: 8 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  tabText: { fontSize: 13, fontWeight: "500", color: colors.muted },
  tabTextActive: { color: "#fff" },
});
