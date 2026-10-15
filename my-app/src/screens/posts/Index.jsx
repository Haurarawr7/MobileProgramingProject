import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Api, {BACKEND_API_URL} from '../../services/api';

const getPosts = async () => {
  const response = await Api.get('/api/posts');
  const data = response?.data?.data;

  if (!Array.isArray(data)) {
    throw new Error('Invalid posts response format.');
  }

  return data;
};

const showLoadError = error => {
  console.error('Failed to fetch posts:', error);

  const message = 'Gagal memuat posts. Periksa koneksi lalu coba lagi.';
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.LONG);
  } else {
    Alert.alert('Gagal memuat posts', message);
  }
};

export default function PostIndex({navigation}) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState(null);

  const handleLoadError = useCallback(error => {
    setPosts([]);
    setLoadError(true);
    showLoadError(error);
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setLoadError(false);

    getPosts()
      .then(setPosts)
      .catch(handleLoadError)
      .finally(() => setLoading(false));
  };

  const deletePost = async id => {
    if (deletingPostId !== null) {
      return;
    }

    setDeletingPostId(id);

    try {
      await Api.delete(`/api/posts/${encodeURIComponent(String(id))}`);
      setPosts(currentPosts =>
        currentPosts.filter(post => String(post.id) !== String(id)),
      );

      const message = 'Post berhasil dihapus.';
      if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.LONG);
      } else {
        Alert.alert('Berhasil', message);
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      const message =
        error?.response?.data?.message ||
        'Post gagal dihapus. Silakan coba lagi.';

      if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.LONG);
      } else {
        Alert.alert('Gagal menghapus post', message);
      }
    } finally {
      setDeletingPostId(null);
    }
  };

  const confirmDeletePost = id => {
    Alert.alert(
      'Hapus post?',
      'Post yang dihapus tidak dapat dikembalikan.',
      [
        {text: 'Batal', style: 'cancel'},
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => deletePost(id),
        },
      ],
    );
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      setLoading(true);
      setLoadError(false);

      getPosts()
        .then(data => {
          if (isActive) {
            setPosts(data);
          }
        })
        .catch(error => {
          if (isActive) {
            handleLoadError(error);
          }
        })
        .finally(() => {
          if (isActive) {
            setLoading(false);
          }
        });

      return () => {
        isActive = false;
      };
    }, [handleLoadError]),
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.heading}>Tutorial Express + React Native</Text>
        <View style={styles.line} />

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#e91e63"
            style={styles.loading}
          />
        ) : loadError ? (
          <View style={styles.messageContainer}>
            <Text style={styles.message}>Posts gagal dimuat.</Text>
            <TouchableOpacity
              onPress={handleRetry}
              style={styles.retryButton}
            >
              <Text style={styles.buttonText}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        ) : posts.length === 0 ? (
          <Text style={styles.message}>Belum ada posts.</Text>
        ) : (
          posts.map((post, index) => (
            <View key={post.id ?? index} style={styles.postContainer}>
              {post.image ? (
                <Image
                  source={{
                    uri: `${BACKEND_API_URL}/uploads/${encodeURIComponent(
                      String(post.image),
                    )}`,
                  }}
                  style={styles.avatar}
                />
              ) : null}
              <View style={styles.postContent}>
                <Text style={styles.title}>{post.title}</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.push('PostEdit', {id: post.id})}
                style={styles.editButton}
                disabled={deletingPostId !== null}
              >
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Hapus post ${post.title}`}
                onPress={() => confirmDeletePost(post.id)}
                style={[
                  styles.deleteButton,
                  deletingPostId === post.id && styles.disabledButton,
                ]}
                disabled={deletingPostId !== null}
              >
                {deletingPostId === post.id ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Hapus</Text>
                )}
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        accessibilityLabel="Buat post"
        onPress={() => navigation.push('PostCreate')}
        style={styles.floatingButton}
      >
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: 30,
    paddingBottom: 100,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
  },
  line: {
    marginTop: 15,
    width: '100%',
    backgroundColor: '#ddd',
    height: 2,
  },
  loading: {
    marginTop: 20,
  },
  messageContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  message: {
    marginTop: 20,
    textAlign: 'center',
    color: '#555',
  },
  retryButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: '#e91e63',
  },
  postContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  postContent: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    marginLeft: 10,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: '#e91e63',
  },
  deleteButton: {
    marginLeft: 8,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 5,
    backgroundColor: '#b00020',
  },
  disabledButton: {
    opacity: 0.65,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e91e63',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  floatingButtonText: {
    fontSize: 30,
    color: '#fff',
    fontWeight: 'bold',
  },
});
