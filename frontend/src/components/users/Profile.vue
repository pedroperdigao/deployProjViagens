<template>
  <div class="container-full shadow-lg">
    <div class="d-flex" style="width: 100%; justify-content: space-between">
      <!-- Botões do perfil -->
      <button class="profile-btns" style="
          border-bottom: 2px solid #3b82f6;
          margin-top: 20px;
          padding-bottom: 20px;
          color: #3b82f6;
        ">
        <i class="bi bi-person-fill mx-2"></i>Profile
      </button>
      <button class="profile-btns" style="
          border-bottom: 1px solid #c9c9c9;
          margin-top: 20px;
          padding-bottom: 20px;
        " @click="editProfile">
        <i class="bi bi-person-fill-gear mx-2"></i>Edit Profile
      </button>
      <button class="profile-btns" style="
          border-bottom: 1px solid #c9c9c9;
          margin-top: 20px;
          padding-bottom: 20px;
        " @click="resetPassword">
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
      <div v-else>
        <!-- Card de perfil -->
        <div class="mx-4 my-4 p-4" style="width: 90%">
          <img class="w-44 h-44 rounded-full mx-auto mt-4" :src="currentUser
              ? currentUser.photoURL
              : 'https://placehold.co/128x128'
            " alt="Profile Picture" />
          <div class="text-center">
            <h4 class="font-semibold text-gray-800">
              {{
                currentUser
                  ? currentUser.firstName + " " + currentUser.lastName
                  : "First Last"
              }}
            </h4>
            <p class="font-semibold text-gray-600 mb-3">
              @{{ currentUser ? currentUser.username : "username" }}
            </p>
          </div>

          <!-- Informações do perfil -->
          <div class="mx-4 d-flex flex-column mb-3">
            <div class="mb-2">
              <span class="font-semibold">First Name:</span>
              {{ currentUser ? currentUser.firstName : "-" }}
            </div>
            <div class="mb-2">
              <span class="font-semibold">Last Name:</span>
              {{
                currentUser && currentUser.lastName ? currentUser.lastName : "-"
              }}
            </div>
            <div class="mb-2">
              <span class="font-semibold">Username:</span>
              {{ currentUser ? currentUser.username : "-" }}
            </div>
            <div class="mb-2">
              <span class="font-semibold">Email:</span>
              {{ currentUser ? currentUser.email : "-" }}
            </div>
            <div class="mb-2">
              <span class="font-semibold">Contact:</span>
              {{
                currentUser && currentUser.phoneNumber
                  ? currentUser.phoneNumber
                  : "-"
              }}
            </div>
            <div class="mb-2">
              <span class="font-semibold">Country:</span>
              {{
                currentUser && currentUser.country ? currentUser.country : "-"
              }}
            </div>
            <div>
              <span class="font-semibold">Status:</span>
              <span class="text-green-400">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Template para outras telas -->
    <div class="desktop-template">
      <div class="d-flex justify-content-center mt-2" style="width: 100%">
        <!-- Card de perfil -->
        <div v-if="loading">
          <div class="d-flex justify-content-center align-items-center mt-4">
            <div class="spinner-border text-primary" role="status">
              <span class="sr-only">Loading...</span>
            </div>
          </div>
        </div>
        <div v-else class="flex">
          <div class="card shadow m-5 w-25" style="min-width: 30vh">
            <img class="min-w-44 h-44 rounded-full mx-auto mt-16 mb-3" :src="currentUser
                ? currentUser.photoURL
                : 'https://placehold.co/128x128'
              " alt="Profile Picture" />
            <div class="text-center">
              <h4 class="font-semibold text-gray-800">
                {{
                  currentUser
                    ? currentUser.firstName + " " + currentUser.lastName
                    : "First Last"
                }}
              </h4>
              <p class="font-semibold text-gray-600 mb-8 px-5">
                @{{ currentUser ? currentUser.username : "username" }}
              </p>
            </div>
          </div>

          <!-- Informações do perfil -->
          <div class="m-5" style="width: 90vh; color: #4b4b4b">
            <div class="d-flex bg-blue-50 rounded-t-lg">
              <div class="p-3" style="width: 40vh">First Name</div>
              <div class="p-3">:</div>
              <div class="p-3 w-full font-bold mx-10" style="color: #465666">
                {{ currentUser ? currentUser.firstName : "" }}
              </div>
            </div>
            <div class="d-flex">
              <div class="p-3" style="width: 40vh">Last Name</div>
              <div class="p-3">:</div>
              <div class="p-3 w-full font-bold mx-10" style="color: #465666">
                {{
                  currentUser && currentUser.lastName
                    ? currentUser.lastName
                    : "-"
                }}
              </div>
            </div>
            <div class="d-flex bg-blue-50">
              <div class="p-3" style="width: 40vh">Username</div>
              <div class="p-3">:</div>
              <div class="p-3 w-full font-bold mx-10" style="color: #465666">
                {{ currentUser ? currentUser.username : "" }}
              </div>
            </div>
            <div class="d-flex">
              <div class="p-3" style="width: 40vh">Email</div>
              <div class="p-3">:</div>
              <div class="p-3 w-full font-bold mx-10" style="color: #465666">
                {{ currentUser ? currentUser.email : "" }}
              </div>
            </div>
            <div class="d-flex bg-blue-50">
              <div class="p-3" style="width: 40vh">Contact</div>
              <div class="p-3">:</div>
              <div class="p-3 w-full font-bold mx-10" style="color: #465666">
                {{
                  currentUser && currentUser.phoneNumber
                    ? currentUser.phoneNumber
                    : "-"
                }}
              </div>
            </div>
            <div class="d-flex">
              <div class="p-3" style="width: 40vh">Country</div>
              <div class="p-3">:</div>
              <div class="p-3 w-full font-bold mx-10">
                {{
                  currentUser && currentUser.country ? currentUser.country : "-"
                }}
              </div>
            </div>
            <div class="d-flex bg-blue-50 rounded-b-lg">
              <div class="p-3" style="width: 40vh">Status</div>
              <div class="p-3">:</div>
              <div class="p-3 w-full font-bold mx-10 text-green-400">
                Active
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
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
const loading = ref(false);
let storageReference; // Declared storageReference
const isMobileView = ref(window.innerWidth <= 768);

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
          console.log("User document retrieved:", currentUser.value);

          if (currentUser.value.photoURL) {
            const fileRef = storageRef(
              storage,
              `users/${user.uid}/profilePicture/user_photo.jpeg`
            );
            const photoURL = await getDownloadURL(fileRef);
            currentUser.value.photoURL = photoURL;
            loading.value = false;
          }
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

const editProfile = () => {
  router.push("/profile/edit");
};

const resetPassword = () => {
  router.push("/profile/reset-password");
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
