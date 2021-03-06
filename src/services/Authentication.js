import firebase from 'react-native-firebase';

const auth = firebase.auth();
const store = firebase.firestore();

const signup = async (payload) => {
  try {
    let ref = store.collection('users').doc(payload.uid);
    await store.runTransaction(async (transaction) => {
      const doc = await transaction.get(ref);
      if (!doc.exists) {
        transaction.set(ref, {
          id: payload.uid,
          nickName: payload.nickName,
          displayName: payload.displayName,
          email: payload.email,
          phoneNumber: payload.phoneNumber,
          photoURL: payload.photoURL,
          providerId: payload.providerId,
          interests: payload.selectedItems,
          role: 0,
          isLive: false
        });
      }
    });
    return true;
  } catch (error) {
    throw error;
  }
};

const checkUser = async (uid) => {
  try {
    let usersRef = store.collection('users').doc(uid);
    let userExist = false;

    const docSnapshot = await usersRef.get();
    if (docSnapshot.exists) {
      userExist = true;
    }
    return docSnapshot;
  } catch (error) {
    throw error;
  }
};

const sendEmailVerification = async () => {
  try {
    auth.currentUser.sendEmailVerification({
      ios: {
        bundleId: 'com.chipstacks.chipstacks'
      },
      android: {
        packageName: 'com.chipstacks.chipstacks'
      }
    });
  } catch (error) {
    throw error;
  }
};

const login = async (payload) => {
  try {
    let { email, password } = payload;
    let user = await auth.signInWithEmailAndPassword(email, password);
    return user;
  } catch (error) {
    throw error;
  }
};

const logout = async () => {
  try {
    await auth.signOut();
  } catch (error) {
    throw error;
  }
};

const updateUser = async ({ displayName, password }) => {
  try {
    await auth.currentUser.updateProfile({
      displayName: displayName
    });
    if (password) {
      await auth.currentUser.updatePassword(password);
    }

    let ref = store.collection('users').doc(auth.currentUser.uid);
    await ref.update({
      name: displayName
    });
  } catch (error) {
    throw error;
  }
};

const forgotPassword = async (email) => {
  try {
    await auth.sendPasswordResetEmail(email);
  } catch (error) {
    throw error;
  }
};

export default {
  signup,
  login,
  logout,
  updateUser,
  sendEmailVerification,
  forgotPassword,
  checkUser
};
