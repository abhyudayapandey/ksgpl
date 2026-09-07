import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "../lib/useAuth";
import { useVisitor } from "../lib/useVisitor";
import { colors } from "../theme";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: 2 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

export function ProfileScreen() {
  const { profile, signOut: authSignOut } = useAuth();
  const { visitor, signOut: visitorSignOut } = useVisitor();

  async function handleSignOut() {
    if (profile) {
      await authSignOut();
    }
    visitorSignOut();
  }

  if (!visitor) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your details</Text>

      <Field label="Name" value={visitor.name} />
      <Field label="Company name" value={visitor.companyName} />
      <Field label="Phone number" value={`${visitor.phoneCountryCode} ${visitor.phoneNumber}`} />
      <Field label="Email" value={visitor.email} />

      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 14, backgroundColor: colors.bg },
  title: { fontSize: 22, fontWeight: "700", color: colors.text },
  fieldLabel: { fontSize: 12, color: colors.muted },
  fieldValue: { fontSize: 15, color: colors.text },
  button: {
    alignSelf: "flex-start",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 8,
  },
  buttonText: { color: colors.text, fontWeight: "600", fontSize: 13 },
});
