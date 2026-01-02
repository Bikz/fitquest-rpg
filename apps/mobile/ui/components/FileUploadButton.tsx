import type { FilePresignResponse } from "@loveleaf/types";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useApiRequest } from "@/services/api/client";
import { presignUpload, uploadToPresignedUrl } from "@/services/api/files";
import Colors from "@/ui/theme/colors";
import { defaultStyles } from "@/ui/theme/styles";

export type FileUploadButtonProps = {
  label?: string;
  disabled?: boolean;
  onUploaded?: (result: FilePresignResponse) => void;
  onError?: (error: Error) => void;
};

const getFileName = (uri: string, fallback: string) => {
  const parts = uri.split("/");
  return parts[parts.length - 1] || fallback;
};

const FileUploadButton = ({
  label = "Upload Photo",
  disabled,
  onUploaded,
  onError,
}: FileUploadButtonProps) => {
  const { request } = useApiRequest();
  const [loading, setLoading] = useState(false);

  const handlePick = async () => {
    if (disabled || loading) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow photo access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });

    if (result.canceled || result.assets.length === 0) {
      return;
    }

    const asset = result.assets[0];
    const fileName = asset.fileName || getFileName(asset.uri, "upload.jpg");

    setLoading(true);
    try {
      const presign = await presignUpload(request, {
        fileName,
        contentType: asset.mimeType ?? "image/jpeg",
        size: asset.fileSize ?? null,
      });

      const fileResponse = await fetch(asset.uri);
      const blob = await fileResponse.blob();

      await uploadToPresignedUrl(
        presign.uploadUrl,
        blob,
        asset.mimeType ?? "application/octet-stream",
      );

      onUploaded?.(presign);
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Upload failed.");
      onError?.(err);
      Alert.alert("Upload failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[defaultStyles.btn, styles.button, disabled && styles.disabled]}
      onPress={handlePick}
      disabled={disabled || loading}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.text}>{label}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
  },
  text: {
    color: "#fff",
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.6,
  },
});

export default FileUploadButton;
