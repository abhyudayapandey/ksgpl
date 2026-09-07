import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { listCatalogTypes, listProducts, type CatalogType, type Product } from "@ksgpl/shared";
import { getSupabase } from "../lib/supabase";
import { CatalogTabs } from "../components/CatalogTabs";
import { SearchBar } from "../components/SearchBar";
import { ProductCard } from "../components/ProductCard";
import { colors } from "../theme";

export function CatalogScreen() {
  const [catalogTypes, setCatalogTypes] = useState<CatalogType[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = getSupabase();
    listCatalogTypes(db)
      .then((types) => {
        setCatalogTypes(types);
        if (types.length > 0) setActiveId(types[0].id);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!activeId) {
      setProducts([]);
      setLoading(false);
      return;
    }
    const db = getSupabase();
    setLoading(true);
    const handle = setTimeout(() => {
      listProducts(db, { catalogTypeId: activeId, search, activeOnly: true })
        .then(setProducts)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [activeId, search]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Product Catalog</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <CatalogTabs catalogTypes={catalogTypes} activeId={activeId} onChange={setActiveId} />
      <SearchBar value={search} onChange={setSearch} />
      {loading && <ActivityIndicator style={{ marginTop: 16 }} color={colors.brand} />}
      {!loading && catalogTypes.length === 0 && !error && (
        <Text style={styles.empty}>No catalogs yet. An admin can add one from the Admin tab.</Text>
      )}
      {!loading && activeId && products.length === 0 && (
        <Text style={styles.empty}>No products match your search.</Text>
      )}
      <FlatList
        style={{ flex: 1 }}
        data={products}
        keyExtractor={(p) => p.id}
        numColumns={2}
        renderItem={({ item }) => <ProductCard product={item} />}
        contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, gap: 8, backgroundColor: colors.bg },
  title: { fontSize: 22, fontWeight: "700", color: colors.text },
  error: { color: colors.danger, fontSize: 13 },
  empty: { color: colors.muted, fontSize: 13, marginTop: 8 },
});
