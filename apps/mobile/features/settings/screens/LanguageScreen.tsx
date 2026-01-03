import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SUPPORTED_LANGUAGES, setAppLanguage } from "@/services/i18n";
import Colors from "@/ui/theme/colors";

const LanguageScreen = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const handleSelect = (code: string) => {
    void setAppLanguage(code);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>{t("language.choose")}</Text>
      <View style={styles.list}>
        {SUPPORTED_LANGUAGES.map((language) => {
          const isActive = currentLanguage === language.code;
          return (
            <TouchableOpacity
              key={language.code}
              style={[styles.row, isActive && styles.rowActive]}
              onPress={() => handleSelect(language.code)}
            >
              <Text style={styles.rowText}>{language.label}</Text>
              {isActive && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
    padding: 24,
  },
  subtitle: {
    fontSize: 14,
    textTransform: "uppercase",
    color: Colors.grey,
    letterSpacing: 1,
    marginBottom: 16,
  },
  list: {
    gap: 12,
  },
  row: {
    backgroundColor: Colors.input,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowActive: {
    borderColor: Colors.primary,
    borderWidth: 1,
  },
  rowText: {
    fontSize: 16,
    color: Colors.dark,
  },
});

export default LanguageScreen;
