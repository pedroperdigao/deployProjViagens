<template>
    <div class="container-full shadow-lg">
      <div class="d-flex" style="width: 100%; justify-content: space-between">
        <!-- Botões do perfil -->
        <button class="profile-btns" style="border-bottom: 1px solid #c9c9c9; margin-top: 20px; padding-bottom: 20px;" @click="profile">
          <i class="bi bi-person-fill mx-2"></i>Profile
        </button>
        <button class="profile-btns" style="border-bottom: 1px solid #c9c9c9; margin-top: 20px; padding-bottom: 20px;" @click="editProfile">
          <i class="bi bi-person-fill-gear mx-2"></i>Edit Profile
        </button>
        <button class="profile-btns" style="border-bottom: 2px solid #3b82f6; margin-top: 20px; padding-bottom: 20px; color: #3b82f6;">
          <i class="bi bi-key-fill mx-2"></i>Reset Password
        </button>
      </div>
  
      <div class="mobile-template">
        <div v-if="loading">
          <div class="d-flex justify-content-center align-items-center mt-4">
            <div class="spinner-border text-primary" role="status">
              <span class="sr-only">Loading...</span>
            </div>
          </div>
        </div>
        <div v-else-if="providerId === 'password'" class="mx-4 my-4 p-4" style="width: 90%">
          <h4 class="text-center font-semibold text-gray-800 mb-4">Change Password</h4>
          <div class="mb-3">
            <label for="currentPasswordMobile" class="form-label">Current Password</label>
            <input type="password" class="form-control" id="currentPasswordMobile" v-model="currentPassword" />
          </div>
          <div class="mb-3">
            <label for="newPasswordMobile" class="form-label">New Password</label>
            <input type="password" class="form-control" id="newPasswordMobile" v-model="newPassword" />
          </div>
          <div class="mb-3">
            <label for="confirmPasswordMobile" class="form-label">Confirm New Password</label>
            <input type="password" class="form-control" id="confirmPasswordMobile" v-model="confirmPassword" />
          </div>
          <button class="btn btn-primary w-100" @click="changePassword">Change Password</button>
        </div>
        <div v-else class="text-center mx-4 my-4 p-4" style="width: 90%">
          <h4 class="text-center font-semibold text-gray-800">Password Reset Not Available</h4>
          <p>You are signed in with Google. Please use your Google account to change the password.</p>
        </div>
      </div>
  
      <div class="desktop-template">
        <div class="d-flex justify-content-center mt-2" style="width: 100%">
          <div v-if="loading">
            <div class="d-flex justify-content-center align-items-center mt-4">
              <div class="spinner-border text-primary" role="status">
                <span class="sr-only">Loading...</span>
              </div>
            </div>
          </div>
          <div v-else-if="providerId === 'password'" class="w-50">
            <h4 class="text-center font-semibold text-gray-800 mt-4">Change Password</h4>
            <div class="mb-3">
              <label for="currentPasswordDesktop" class="form-label">Current Password</label>
              <input type="password" class="form-control" id="currentPasswordDesktop" v-model="currentPassword" />
            </div>
            <div class="mb-3">
              <label for="newPasswordDesktop" class="form-label">New Password</label>
              <input type="password" class="form-control" id="newPasswordDesktop" v-model="newPassword" />
            </div>
            <div class="mb-3">
              <label for="confirmPasswordDesktop" class="form-label">Confirm New Password</label>
              <input type="password" class="form-control" id="confirmPasswordDesktop" v-model="confirmPassword" />
            </div>
            <button class="btn btn-primary w-100" @click="changePassword">Change Password</button>
          </div>
          <div v-else class="text-center w-50 mt-4">
            <h4 class="text-center font-semibold text-gray-800">Password Reset Not Available</h4>
            <p>You are signed in with Google. Please use your Google account to change the password.</p>
          </div>
        </div>
      </div>
    </div>
  </template>
  


<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { getAuth, onAuthStateChanged, reauthenticateWithCredential, updatePassword, EmailAuthProvider, GoogleAuthProvider, reauthenticateWithPopup  } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import {
    getStorage,
    ref as storageRef,
    uploadBytes,
    getDownloadURL,
} from "firebase/storage";
import { useToast } from "vue-toastification";

const router = useRouter();
const toast = useToast();
const firestore = getFirestore();
const auth = getAuth();
const storage = getStorage();
const currentUser = auth.currentUser ? ref(auth.currentUser) : ref(null);

let storageReference; // Declared storageReference
const loading = ref(false);
const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const providerId = ref("");

onMounted(async () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            loading.value = true;
            const userDocRef = doc(firestore, "users", user.uid);
            
            try {
                const userDocSnapshot = await getDoc(userDocRef);
                if (userDocSnapshot.exists()) {
                    // Set the currentUser value with the data from Firestore
                    currentUser.value = { uid: user.uid, ...userDocSnapshot.data() };
                    providerId.value = auth.currentUser.providerData[0].providerId;
                    console.log("providerId:", providerId.value);
                    loading.value = false;
                } else {
                    console.error("User document does not exist");
                    loading.value = false;
                }
            } catch (error) {
                console.error("Error retrieving user document:", error);
                loading.value = false;
            }
        } else {
            //console.error('User is not logged in');
        }
    });

    storageReference = storageRef(storage, ""); // Initialize storageReference after storage is available
});

const changePassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    toast.error("New passwords do not match");
    return;
  }else if (newPassword.value.length < 6) {
       toast.error('Password must be at least 6 characters long.');
       return;
    } else if (newPassword.value.length > 16) {
        errorMessage.password = 'Password must be at most 16 characters long.';
        toast.error('Password must be at most 16 characters long.');
       return;
    } 
  const user = auth.currentUser;

  try {
    
    if (providerId.value === 'password') {
      // Reauthenticate with Email and Password
      const credential = EmailAuthProvider.credential(user.email, currentPassword.value);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword.value);
    } else if (providerId.value === 'google.com') {
      // Reauthenticate with Google
      const provider = new GoogleAuthProvider();
      await reauthenticateWithPopup(user, provider);
    }

    
    toast.success("Password updated successfully");
    router.push("/profile");
  } catch (error) {
    if (providerId.value === 'google.com'){
        toast.error("You are signed in with Google. Please use the Google account to change the password.");
    }
    else if (error.code === 'auth/invalid-credential') {
        toast.error("The current password is incorrect");
    } else if (error.code === 'auth/weak-password') {
        toast.error("The new password is too weak");
    } else {
        toast.error("Error : " + error.message);
    }

    loading.value = false;
  }
};

const editProfile = () => {
    router.push("/profile/edit");
};

const profile = () => {
    router.push("/profile");
};
</script>

<style scoped>
.container-full {
    background-color: white;
    background-size: cover;
    background-position: center;
    border-radius: 20px;
    min-height: 70vh;
    margin-top: 10px;
}

.mobile-template {
    display: block;
    /* Exibe para dispositivos móveis */
}

.desktop-template {
    display: none;
    /* Oculta para dispositivos móveis */
}

@media (min-width: 769px) {
    .mobile-template {
        display: none;
        /* Oculta para telas maiores que 768px */
    }

    .desktop-template {
        display: block;
        /* Exibe para telas maiores que 768px */
    }
}

.profile-btns {
    color: #465666;
    font-size: 16px;
    flex: 1;
    /* No margin */
    display: flex;
    justify-content: center;
    align-items: center;
    /* Optionally, add other styling for button appearance */
}
</style>