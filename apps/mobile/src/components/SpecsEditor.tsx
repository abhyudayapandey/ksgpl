import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import type { ProductSpecs } from "@ksgpl/shared";
import { colors } from "../theme";

export function SpecsEditor({
  specs,
  onChange,
}: {
  specs: ProductSpecs;
  onChange: (specs: ProductSpecs) => void;
}) {
  const entries = Object.entries(specs);

  function updateEntry(index: number, key: string, value: string) {
    const next = [...entries];
    next[index] = [key, value];
    onChange(Object.fromEntries(next));
  }

  function removeEntry(index: number) {
    onChange(Object.fromEntries(entries.filter((_, i) => i !== index)));
  }

  function addEntry() {
    onChange({ ...specs, "": "" });
  }

  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>Specs</Text>
      {entries.map(([key, value], i) => (
        <View key={i} style={styles.row}>
          <TextInput
            value={key}
            onChangeText={(t) => updateEntry(i, t, value)}
            placeholder="Wattages"
            style={[styles.input, { flex: 1 }]}
          />
          <TextInput
            value={value}
            onChangeText={(t) => updateEntry(i, key, t)}
            placeholder="7W / 12W / 18W"
            style={[styles.input, { flex: 2 }]}
          />
          <TouchableOpacity onPress={() => removeEntry(i)} style={styles.removeBtn}>
            <Text style={{ color: colors.danger }}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity onPress={addEntry}>
        <Text style={{ color: colors.brandDark, fontSize: 13 }}>+ Add spec</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "600", color: colors.text },
  row: { flexDirection: "row", gap: 6, alignItems: "center" },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
    backgroundColor: colors.card,
  },
  removeBtn: { paddingHorizontal: 4 },
});
