import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Switch,
  Alert,
  ScrollView,
  StyleSheet,
} from "react-native";
import {
  createProduct,
  deleteProduct,
  listCatalogTypes,
  listProducts,
  updateProduct,
  type CatalogType,
  type Product,
  type ProductSpecs,
} from "@ksgpl/shared";
import { getSupabase } from "../lib/supabase";
import { CatalogTabs } from "../components/CatalogTabs";
import { SearchBar } from "../components/SearchBar";
import { SpecsEditor } from "../components/SpecsEditor";
import { ImagePickerField } from "../components/ImagePickerField";
import { colors } from "../theme";

interface FormState {
  id: string | null;
  catalog_type_id: string;
  name: string;
  category: string;
  description: string;
  image_url: string | null;
  specs: ProductSpecs;
  tags: string;
  is_active: boolean;
}

function emptyForm(catalogTypeId: string): FormState {
  return {
    id: null,
    catalog_type_id: catalogTypeId,
    name: "",
    category: "",
    description: "",
    image_url: null,
    specs: {},
    tags: "",
    is_active: true,
  };
}

export function AdminProductsScreen() {
  const [catalogTypes, setCatalogTypes] = useState<CatalogType[]>([]);
  const [activeCatalogTypeId, setActiveCatalogTypeId] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const db = getSupabase();
    listCatalogTypes(db)
      .then((types) => {
        setCatalogTypes(types);
        if (types.length > 0) setActiveCatalogTypeId(types[0].id);
      })
      .catch((e) => setError(e.message));
  }, []);

  async function refreshProducts() {
    if (!activeCatalogTypeId) {
      setProducts([]);
      return;
    }
    const db = getSupabase();
    try {
      setProducts(await listProducts(db, { catalogTypeId: activeCatalogTypeId, search }));
    } catch (e: any) {
      setError(e.message);
    }
  }

  useEffect(() => {
    const handle = setTimeout(refreshProducts, 250);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCatalogTypeId, search]);

  function startEdit(p: Product) {
    setForm({
      id: p.id,
      catalog_type_id: p.catalog_type_id,
      name: p.name,
      category: p.category ?? "",
      description: p.description ?? "",
      image_url: p.image_url,
      specs: p.specs,
      tags: p.tags.join(", "),
      is_active: p.is_active,
    });
  }

  async function handleSubmit() {
    if (!form) return;
    setSaving(true);
    setError(null);
    const db = getSupabase();
    const payload = {
      catalog_type_id: form.catalog_type_id,
      name: form.name.trim(),
      category: form.category.trim() || null,
      description: form.description.trim() || null,
      image_url: form.image_url,
      specs: form.specs,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      is_active: form.is_active,
    };
    try {
      if (form.id) {
        await updateProduct(db, form.id, payload);
      } else {
        await createProduct(db, payload);
      }
      setForm(null);
      await refreshProducts();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(id: string) {
    Alert.alert("Delete product?", undefined, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const db = getSupabase();
          try {
            await deleteProduct(db, id);
            await refreshProducts();
          } catch (e: any) {
            setError(e.message);
          }
        },
      },
    ]);
  }

  async function toggleActive(p: Product) {
    const db = getSupabase();
    try {
      await updateProduct(db, p.id, { is_active: !p.is_active });
      await refreshProducts();
    } catch (e: any) {
      setError(e.message);
    }
  }

  if (form) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={{ padding: 12, gap: 8 }}>
        <Text style={styles.formTitle}>{form.id ? "Edit product" : "New product"}</Text>
        <CatalogTabs
          catalogTypes={catalogTypes}
          activeId={form.catalog_type_id}
          onChange={(id) => setForm({ ...form, catalog_type_id: id })}
        />
        <TextInput
          value={form.name}
          onChangeText={(t) => setForm({ ...form, name: t })}
          placeholder="Name"
          style={styles.input}
        />
        <TextInput
          value={form.category}
          onChangeText={(t) => setForm({ ...form, category: t })}
          placeholder="Category (e.g. COB Lights)"
          style={styles.input}
        />
        <TextInput
          value={form.description}
          onChangeText={(t) => setForm({ ...form, description: t })}
          placeholder="Description (optional)"
          style={styles.input}
          multiline
        />
        <TextInput
          value={form.tags}
          onChangeText={(t) => setForm({ ...form, tags: t })}
          placeholder="Tags, comma separated"
          style={styles.input}
        />
        <ImagePickerField
          bucket="product-images"
          pathPrefix={form.catalog_type_id}
          value={form.image_url}
          onChange={(url) => setForm({ ...form, image_url: url })}
        />
        <SpecsEditor specs={form.specs} onChange={(specs) => setForm({ ...form, specs })} />
        <View style={styles.switchRow}>
          <Text style={{ fontSize: 13 }}>Visible to end users</Text>
          <Switch
            value={form.is_active}
            onValueChange={(v) => setForm({ ...form, is_active: v })}
          />
        </View>
        {error && <Text style={styles.error}>{error}</Text>}
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSubmit} disabled={saving}>
            <Text style={styles.saveButtonText}>{saving ? "Saving…" : "Save"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setForm(null)}>
            <Text>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ padding: 12, gap: 8 }}>
        <CatalogTabs
          catalogTypes={catalogTypes}
          activeId={activeCatalogTypeId}
          onChange={setActiveCatalogTypeId}
        />
        <SearchBar value={search} onChange={setSearch} placeholder="Search this catalog…" />
        {error && <Text style={styles.error}>{error}</Text>}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => setForm(emptyForm(activeCatalogTypeId))}
          disabled={!activeCatalogTypeId}
        >
          <Text style={styles.saveButtonText}>+ Add product</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={products}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: 12, paddingTop: 0, gap: 8 }}
        renderItem={({ item }) => (
          <View style={styles.productRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              {item.category && <Text style={styles.itemDesc}>{item.category}</Text>}
              {!item.is_active && <Text style={{ color: colors.danger, fontSize: 11 }}>Hidden</Text>}
            </View>
            <TouchableOpacity onPress={() => startEdit(item)}>
              <Text style={{ color: colors.brandDark, marginRight: 12 }}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => toggleActive(item)}>
              <Text style={{ color: colors.muted, marginRight: 12 }}>
                {item.is_active ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Text style={{ color: colors.danger }}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.hint}>No products in this catalog yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  formTitle: { fontSize: 16, fontWeight: "700" },
  hint: { fontSize: 12, color: colors.muted },
  error: { color: colors.danger, fontSize: 13 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    backgroundColor: colors.card,
  },
  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  saveButton: { backgroundColor: colors.brand, borderRadius: 6, paddingVertical: 10, alignItems: "center", flex: 1 },
  saveButtonText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  cancelButton: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 6, paddingVertical: 10, paddingHorizontal: 16, alignItems: "center" },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
  },
  itemName: { fontWeight: "600", fontSize: 14 },
  itemDesc: { fontSize: 12, color: colors.muted },
});
