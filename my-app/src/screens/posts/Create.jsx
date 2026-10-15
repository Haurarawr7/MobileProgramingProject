import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Api from '../../services/api';

const showMessage = (title, message) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.LONG);
  } else {
    Alert.alert(title, message);
  }
};

const getValidationErrors = data => {
  const fieldErrors = {};

  if (Array.isArray(data?.errors)) {
    data.errors.forEach(error => {
      if (error?.path && error?.msg) {
        fieldErrors[error.path] = error.msg;
      }
    });
  } else if (data?.errors && typeof data.errors === 'object') {
    Object.entries(data.errors).forEach(([field, message]) => {
      fieldErrors[field] = Array.isArray(message) ? message[0] : message;
    });
  }

  return fieldErrors;
};

export default function PostCreate({navigation}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChoosePhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets?.[0]) {
        setImage(result.assets[0]);
        setErrors(current => ({...current, image: undefined}));
      }
    } catch (error) {
      console.error('Failed to open image picker:', error);
      showMessage('Gagal memilih gambar', 'Tidak dapat membuka galeri gambar.');
    }
  };

  const storePost = async () => {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setErrors({});

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('content', content.trim());

    if (image?.uri) {
      const uriName = image.uri.split('/').pop()?.split('?')[0];
      formData.append('image', {
        uri: image.uri,
        name: image.fileName || uriName || `post-${Date.now()}.jpg`,
        type: image.mimeType || 'image/jpeg',
      });
    }

    try {
      await Api.post('/api/posts', formData, {
        headers: {'Content-Type': 'multipart/form-data'},
      });

      showMessage('Berhasil', 'Post berhasil dibuat.');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to create post:', error);
      const responseData = error?.response?.data;
      const fieldErrors = getValidationErrors(responseData);

      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      } else {
        showMessage(
          'Gagal membuat post',
          responseData?.message || 'Post gagal disimpan. Silakan coba lagi.',
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>Buat Post</Text>

      <TouchableOpacity
        accessibilityRole="button"
        onPress={handleChoosePhoto}
        style={styles.imagePickerButton}
        disabled={submitting}
      >
        <Text style={styles.imagePickerButtonText}>Pilih Gambar</Text>
      </TouchableOpacity>

      {image?.uri ? (
        <Image source={{uri: image.uri}} style={styles.preview} />
      ) : null}
      {errors.image ? <Text style={styles.error}>{errors.image}</Text> : null}

      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Judul"
        style={styles.input}
        maxLength={200}
        editable={!submitting}
        accessibilityLabel="Judul post"
      />
      {errors.title ? <Text style={styles.error}>{errors.title}</Text> : null}

      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder="Konten"
        style={styles.textarea}
        multiline
        textAlignVertical="top"
        editable={!submitting}
        accessibilityLabel="Konten post"
      />
      {errors.content ? (
        <Text style={styles.error}>{errors.content}</Text>
      ) : null}

      <TouchableOpacity
        accessibilityRole="button"
        disabled={submitting}
        onPress={storePost}
        style={[styles.saveButton, submitting && styles.disabledButton]}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Simpan</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  heading: {
    marginBottom: 12,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  imagePickerButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#777',
  },
  imagePickerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  preview: {
    alignSelf: 'center',
    width: 180,
    height: 180,
    marginTop: 16,
    borderRadius: 8,
  },
  input: {
    height: 50,
    marginTop: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 12,
  },
  textarea: {
    minHeight: 150,
    marginTop: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 12,
  },
  error: {
    marginTop: 6,
    marginHorizontal: 8,
    color: 'red',
  },
  saveButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginTop: 20,
    borderRadius: 12,
    backgroundColor: '#e91e63',
  },
  disabledButton: {
    opacity: 0.65,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
