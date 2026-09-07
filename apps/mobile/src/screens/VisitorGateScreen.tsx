import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { isValidCountryCode, isValidEmail, isValidPhoneNumber } from "@ksgpl/shared";
import { useVisitor, type VisitorFormInput } from "../lib/useVisitor";
import { colors } from "../theme";

export function VisitorGateScreen() {
  const { submit } = useVisitor();
  const [form, setForm] = useState<VisitorFormInput>({
    name: "",
    companyName: "",
    phoneCountryCode: "+91",
    phoneNumber: "",
    email: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof VisitorFormInput, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function validate(): boolean {
    const next: Partial<Record<keyof VisitorFormInput, string>> = {};
    if (!form.name.trim()) next.name = "Required";
    if (!form.companyName.trim()) next.companyName = "Required";
    if (!isValidCountryCode(form.phoneCountryCode)) next.phoneCountryCode = "e.g. +91";
    if (!isValidPhoneNumber(form.phoneNumber)) next.phoneNumber = "Enter a valid phone number";
    if (!isValidEmail(form.email)) next.email = "Enter a valid email";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submit(form);
    } catch (err: any) {
      setSubmitError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, gap: 12 }}>
      <Text style={styles.title}>KSGPL Catalog</Text>
      <Text style={styles.subtitle}>Tell us a bit about yourself to view the product catalog.</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        value={form.name}
        onChangeText={(t) => setForm({ ...form, name: t })}
        style={styles.input}
      />
      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

      <Text style={styles.label}>Company name</Text>
      <TextInput
        value={form.companyName}
        onChangeText={(t) => setForm({ ...form, companyName: t })}
        style={styles.input}
      />
      {errors.companyName && <Text style={styles.errorText}>{errors.companyName}</Text>}

      <Text style={styles.label}>Phone number</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <TextInput
          value={form.phoneCountryCode}
          onChangeText={(t) => setForm({ ...form, phoneCountryCode: t })}
          placeholder="+91"
          style={[styles.input, { width: 70 }]}
        />
        <TextInput
          value={form.phoneNumber}
          onChangeText={(t) => setForm({ ...form, phoneNumber: t.replace(/[^\d]/g, "") })}
          keyboardType="number-pad"
          placeholder="9876543210"
          style={[styles.input, { flex: 1 }]}
        />
      </View>
      {(errors.phoneCountryCode || errors.phoneNumber) && (
        <Text style={styles.errorText}>{errors.phoneCountryCode ?? errors.phoneNumber}</Text>
      )}

      <Text style={styles.label}>Email</Text>
      <TextInput
        value={form.email}
        onChangeText={(t) => setForm({ ...form, email: t })}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      {submitError && <Text style={styles.errorText}>{submitError}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.buttonText}>{submitting ? "Please wait…" : "View Catalog"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: { fontSize: 20, fontWeight: "700", color: colors.brandDark },
  subtitle: { fontSize: 13, color: colors.muted, marginBottom: 8 },
  label: { fontSize: 13, fontWeight: "600", color: colors.text },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.card,
  },
  errorText: { color: colors.danger, fontSize: 12 },
  button: {
    backgroundColor: colors.brand,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});
