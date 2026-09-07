import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet } from "react-native";
import {
  createCatalogType,
  deleteCatalogType,
  listCatalogTypes,
  updateCatalogType,
  type CatalogType,
} from "@ksgpl/shared";
import { getSupabase } from "../lib/supabase";
import { colors } from "../theme";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function AdminCatalogTypesScreen() {
  const [types, setTypes] = useState<CatalogType[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  async function refresh() {
    const db = getSupabase();
    try {
      setTypes(await listCatalogTypes(db));
    } catch (e: any) {
      setError(e.message);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleCreate() {
    if (!name.trim()) return;
    const db = getSupabase();
    try {
      await createCatalogType(db, {
        name: name.trim(),
        slug: slugify(name),
        description: description.trim() || null,
        display_order: types.length,
      });
      setName("");
      setDescription("");
      await refresh();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function handleDelete(id: string) {
    Alert.alert("Delete catalog type?", "This also deletes all its products.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const db = getSupabase();
          try {
            await deleteCatalogType(db, id);
            await refresh();
          } catch (e: any) {
            setError(e.message);
          }
        },
      },
    ]);
  }

  async function handleSaveEdit(id: string) {
    const db = getSupabase();
    try {
      await updateCatalogType(db, id, { name: editName.trim() });
      setEditingId(null);
      await refresh();
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>Catalog types show up as tabs for end users.</Text>
      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.form}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Raw Materials"
          style={styles.input}
        />
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Description (optional)"
          style={styles.input}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleCreate}>
          <Text style={styles.addButtonText}>Add catalog type</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        style={{ flex: 1 }}
        data={types}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            {editingId === item.id ? (
              <View style={{ flex: 1, gap: 6 }}>
                <TextInput value={editName} onChangeText={setEditName} style={styles.input} />
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TouchableOpacity onPress={() => handleSaveEdit(item.id)}>
                    <Text style={{ color: colors.brandDark, fontWeight: "600" }}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setEditingId(null)}>
                    <Text style={{ color: colors.muted }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.description && <Text style={styles.itemDesc}>{item.description}</Text>}
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setEditingId(item.id);
                    setEditName(item.name);
                  }}
                >
                  <Text style={{ color: colors.brandDark, marginRight: 12 }}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Text style={{ color: colors.danger }}>Delete</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.hint}>No catalog types yet — add one above.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, gap: 10, backgroundColor: colors.bg },
  hint: { fontSize: 12, color: colors.muted },
  error: { color: colors.danger, fontSize: 13 },
  form: { backgroundColor: colors.card, borderRadius: 8, borderWidth: 1, borderColor: colors.border, padding: 10, gap: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
  },
  addButton: { backgroundColor: colors.brand, borderRadius: 6, paddingVertical: 8, alignItems: "center" },
  addButtonText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  itemName: { fontWeight: "600", fontSize: 14 },
  itemDesc: { fontSize: 12, color: colors.muted },
});
