import React, {useEffect, useState} from 'react';
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
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Api, {BACKEND_API_URL} from '../../services/api';

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

export default function PostEdit({route, navigation}) {
  const {id} = route.params;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [currentImage, setCurrentImage] = useState(null);
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isActive = true;

    const fetchDetailPost = async () => {
      try {
        const response = await Api.get(`/api/posts/${encodeURIComponent(id)}`);
        const post = response?.data?.data;

        if (!post || typeof post !== 'object') {
          throw new Error('Invalid post response format.');
        }

        if (isActive) {
          setTitle(post.title ?? '');
          setContent(post.content ?? '');
          setCurrentImage(post.image ?? null);
        }
      } catch (error) {
        console.error('Failed to fetch post details:', error);
        if (isActive) {
          setLoadError(true);
          showMessage(
            'Gagal memuat post',
            error?.response?.data?.message ||
              'Data post gagal dimuat. Silakan coba lagi.',
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchDetailPost();

    return () => {
      isActive = false;
    };
  }, [id]);

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

  const updatePost = async () => {
    if (submitting || loading || loadError) {
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
      await Api.put(
        `/api/posts/${encodeURIComponent(id)}`,
        formData,
        {headers: {'Content-Type': 'multipart/form-data'}},
      );

      showMessage('Berhasil', 'Post berhasil diperbarui.');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to update post:', error);
      const responseData = error?.response?.data;
      const fieldErrors = getValidationErrors(responseData);

      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      } else {
        showMessage(
          'Gagal memperbarui post',
          responseData?.message || 'Post gagal diperbarui. Silakan coba lagi.',
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e91e63" />
        <Text style={styles.statusText}>Memuat post...</Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.statusText}>Post tidak dapat dimuat.</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.saveButton}
        >
          <Text style={styles.saveButtonText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const imageUri = image?.uri
    ? image.uri
    : currentImage
      ? `${BACKEND_API_URL}/uploads/${encodeURIComponent(
          String(currentImage),
        )}`
      : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>Edit Post</Text>

      <TouchableOpacity
        accessibilityRole="button"
        onPress={handleChoosePhoto}
        style={styles.imagePickerButton}
        disabled={submitting}
      >
        <Text style={styles.imagePickerButtonText}>Pilih Gambar</Text>
      </TouchableOpacity>

      {imageUri ? <Image source={{uri: imageUri}} style={styles.preview} /> : null}
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
        onPress={updatePost}
        style={[styles.saveButton, submitting && styles.disabledButton]}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Perbarui</Text>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  statusText: {
    marginTop: 12,
    color: '#555',
    textAlign: 'center',
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
    paddingHorizontal: 16,
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
