import { View, Text, Image, StyleSheet } from "react-native";
import type { Product } from "@ksgpl/shared";
import { colors } from "../theme";

export function ProductCard({ product }: { product: Product }) {
  const specEntries = Object.entries(product.specs ?? {});

  return (
    <View style={styles.card}>
      {product.image_url ? (
        <Image source={{ uri: product.image_url }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.noImage]}>
          <Text style={styles.noImageText}>No image</Text>
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.name}>{product.name}</Text>
        {product.category && <Text style={styles.category}>{product.category}</Text>}
        {product.tags?.length > 0 && (
          <View style={styles.tagRow}>
            {product.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
        {product.description ? <Text style={styles.description}>{product.description}</Text> : null}
        {specEntries.length > 0 && (
          <View style={styles.specs}>
            {specEntries.map(([key, value]) => (
              <Text key={key} style={styles.specLine}>
                <Text style={styles.specKey}>{key}: </Text>
                {value}
              </Text>
            ))}
          </View>
        )}
        {!product.is_active && <Text style={styles.hidden}>Hidden from end users</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    margin: 6,
  },
  image: { width: "100%", aspectRatio: 1, backgroundColor: "#f1f1f1" },
  noImage: { alignItems: "center", justifyContent: "center" },
  noImageText: { color: "#a3a3a3", fontSize: 12 },
  body: { padding: 10, gap: 4 },
  name: { fontWeight: "600", fontSize: 14, color: colors.text },
  category: { fontSize: 11, color: colors.muted },
  description: { fontSize: 12, color: colors.muted },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  tag: {
    backgroundColor: "#c9962c22",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  tagText: { fontSize: 10, color: colors.brandDark },
  specs: { marginTop: 4, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 4, gap: 1 },
  specLine: { fontSize: 11, color: colors.muted },
  specKey: { fontWeight: "600", color: "#525252" },
  hidden: { fontSize: 11, color: colors.danger, fontWeight: "600" },
});
