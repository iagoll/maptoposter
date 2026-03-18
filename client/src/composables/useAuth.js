import { ref, onMounted, onUnmounted } from 'vue';
import { auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from '../firebase';

const currentUser = ref(null);
const authLoading = ref(true);

// Shared listener so multiple components share the same auth state
let unsubscribe = null;

function initAuth() {
  if (!auth) {
    authLoading.value = false;
    return;
  }
  if (unsubscribe) return;
  unsubscribe = onAuthStateChanged(auth, (user) => {
    currentUser.value = user;
    authLoading.value = false;
  });
}

export function useAuth() {
  onMounted(() => initAuth());

  const signInWithGoogle = async () => {
    if (!auth) throw new Error('Firebase auth is not configured.');
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  const getIdToken = async () => {
    if (!currentUser.value) return null;
    return currentUser.value.getIdToken();
  };

  const isConfigured = !!auth;

  return {
    currentUser,
    authLoading,
    isConfigured,
    signInWithGoogle,
    logout,
    getIdToken,
  };
}
