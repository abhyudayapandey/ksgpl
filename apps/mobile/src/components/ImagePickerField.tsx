import { useState } from "react";
import { View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadImage } from "@ksgpl/shared";
import { getSupabase } from "../lib/supabase";
import { colors } from "../theme";

export function ImagePickerField({
  bucket,
  pathPrefix,
  value,
  onChange,
}: {
  bucket: "product-images" | "company-images";
  pathPrefix: string;
  value: string | null;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePick() {
    setError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Photo library permission is required to upload an image.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled || result.assets.length === 0) return;

    const asset = result.assets[0];
    setUploading(true);
    try {
      const db = getSupabase();
      const response = await fetch(asset.uri);
      const arrayBuffer = await response.arrayBuffer();
      const ext = asset.uri.split(".").pop()?.split("?")[0] ?? "jpg";
      const mimeType = asset.mimeType ?? `image/${ext}`;
      const path = `${pathPrefix}/${Date.now()}.${ext}`;
      const url = await uploadImage(db, bucket, path, arrayBuffer, mimeType);
      onChange(url);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>Image</Text>
      {value && <Image source={{ uri: value }} style={styles.preview} />}
      <TouchableOpacity style={styles.button} onPress={handlePick} disabled={uploading}>
        {uploading ? (
          <ActivityIndicator color={colors.brandDark} />
        ) : (
          <Text style={styles.buttonText}>{value ? "Change image" : "Pick image"}</Text>
        )}
      </TouchableOpacity>
      {error && <Text style={{ color: colors.danger, fontSize: 12 }}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "600", color: colors.text },
  preview: { width: 80, height: 80, borderRadius: 8, backgroundColor: "#eee" },
  button: {
    alignSelf: "flex-start",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonText: { fontSize: 13, color: colors.text },
});
