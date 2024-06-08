<template>
  <div class="container-full">
    <div class="d-flex" style="width: 100%; justify-content: space-between">
      <button class="profile-btns"
        style="border-bottom: 2px solid #3b82f6; margin-top: 20px;padding-bottom: 20px; color:#3b82f6"><i
          class="bi bi-person-fill mx-2"></i>Profile</button>
      <button class="profile-btns" style="border-bottom: 1px solid #c9c9c9; margin-top: 20px;padding-bottom: 20px;"
        @click="editProfile"><i class="bi bi-person-fill-gear mx-2"></i>Edit Profile</button>
      <button class="profile-btns" style="border-bottom: 1px solid #c9c9c9; margin-top: 20px;padding-bottom: 20px;"
        @click="phoneVerification"><i class="bi bi-eye mx-2"></i>Phone Verification</button>
      <button class="profile-btns" style="border-bottom: 1px solid #c9c9c9; margin-top: 20px;padding-bottom: 20px;"
        @click="resetPassword"><i class="bi bi-key-fill mx-2"></i>Reset Password</button>
      <button class="profile-btns" style="border-bottom: 1px solid #c9c9c9; margin-top: 20px;padding-bottom: 20px;"
        @click="activityLog"><i class="bi bi-eye mx-2"></i>Activity Log</button>
    </div>
    <div class="d-flex justify-content-center mt-2" style="width: 100%">
      <!-- Left side - Profile Card -->
      <div v-if="loading">
        <!-- div to fix profilePicture loading -->
      </div>
      <div v-else class="card shadow m-5 w-25">
        <img v-if="countryFlag !== ''" class="country-img" :style="{ 'background-image': 'url(' + countryFlag + ')' }">
        <div v-eslse class="mt-4"></div>
        <img class="w-44 h-44 rounded-full mx-auto mt-4 mb-3"
          :src="currentUser ? currentUser.photoURL : 'https://placehold.co/128x128'" alt="Profile Picture">
        <div class="text-center">
          <h4 class="font-semibold text-gray-800">{{ currentUser ? currentUser.firstName + ' ' + currentUser.lastName :
            'First Last' }}</h4>
          <p class="font-semibold text-gray-600 mb-8 px-5">@{{ currentUser ? currentUser.username : 'username' }}</p>
        </div>
      </div>
      <!-- Profile information -->
      <div class="m-5" style="width: 70vh; color: #4b4b4b;">
        <div class="d-flex bg-blue-50 rounded-t-lg">
          <div class="p-3" style="width: 40vh">First Name</div>
          <div class="p-3">:</div>
          <div class="p-3 w-full font-bold mx-10" style="color:#465666">{{ currentUser ? currentUser.firstName : '' }}
          </div>
        </div>
        <div class="d-flex">
          <div class="p-3" style="width: 40vh">Last Name</div>
          <div class="p-3">:</div>
          <div class="p-3 w-full font-bold mx-10" style="color:#465666">{{ currentUser && currentUser.lastName ?
            currentUser.lastName : '-' }}
          </div>
        </div>
        <div class="d-flex bg-blue-50">
          <div class="p-3" style="width: 40vh">Username</div>
          <div class="p-3">:</div>
          <div class="p-3 w-full font-bold mx-10" style="color:#465666">{{ currentUser ? currentUser.username : '' }}
          </div>
        </div>
        <div class="d-flex">
          <div class="p-3" style="width: 40vh">Email</div>
          <div class="p-3">:</div>
          <div class="p-3 w-full font-bold mx-10" style="color:#465666">{{ currentUser ? currentUser.email : '' }}</div>
        </div>
        <div class="d-flex bg-blue-50">
          <div class="p-3" style="width: 40vh">Contact</div>
          <div class="p-3">:</div>
          <div class="p-3 w-full font-bold mx-10" style="color:#465666">{{ currentUser && currentUser.phoneNumber ?
            currentUser.phoneNumber : '-' }}
          </div>
        </div>
        <div class="d-flex">
          <div class="p-3" style="width: 40vh">Country</div>
          <div class="p-3">:</div>
          <div class="p-3 w-full font-bold mx-10">{{ currentUser && currentUser.country ?
            currentUser.country : '-' }}
          </div>
        </div>
        <div class="d-flex bg-blue-50 rounded-b-lg">
          <div class="p-3" style="width: 40vh">Status</div>
          <div class="p-3">:</div>
          <div class="p-3 w-full font-bold mx-10 text-green-400">Active</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from "vue-router";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from "vue-toastification";

const router = useRouter();
const toast = useToast();
const firestore = getFirestore();
const auth = getAuth();
const storage = getStorage();
const currentUser = auth.currentUser ? ref(auth.currentUser) : ref(null);
const loading = ref(false);
const countries = ref([]);
const countryFlag = ref('');
let storageReference; // Declared storageReference

onMounted(async () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      loading.value = true;
      const userDocRef = doc(firestore, 'users', user.uid);
      try {
        const userDocSnapshot = await getDoc(userDocRef);
        if (userDocSnapshot.exists()) {
          // Set the currentUser value with the data from Firestore
          currentUser.value = { uid: user.uid, ...userDocSnapshot.data() };

          getAllCountries();

          loading.value = false;
        } else {
          console.error('User document does not exist');
          loading.value = false;
        }
      } catch (error) {
        console.error('Error retrieving user document:', error);
        loading.value = false;
      }
    } else {
      //console.error('User is not logged in');
    }
  });

  storageReference = storageRef(storage, ''); // Initialize storageReference after storage is available
});

const getAllCountries = async () => {
  try {
    const response = await fetch('https://restcountries.com/v3.1/all');
    const countriesData = await response.json();

    // Map countries data to extract name and flag URL
    countries.value = countriesData.map((country) => {
      const { name, flags } = country;
      return {
        name: name.common,
        flag: flags.png,
      };
    });

    // Convert user's country name to lowercase
    const userCountryNameLowerCase = currentUser.value.country.toLowerCase();

    // Find the country object that matches the current user's country (case-insensitive)
    const userCountry = countries.value.find(country => country.name.toLowerCase() === userCountryNameLowerCase);

    // If user's country is found, set the countryFlag variable to the flag image URL
    if (userCountry) {
      // Update the countryFlag ref with the flag image URL
      countryFlag.value = userCountry.flag;
    } else {
      console.error('User country not found');
    }
  } catch (error) {
    console.error('Error fetching countries:', error);
  }
};


const editProfile = () => {
  router.push("/profile/edit");
};

const phoneVerification = () => {
  toast.warning("Feature under development");
};

const resetPassword = () => {
  toast.warning("Feature under development");
};


const activityLog = () => {
  toast.warning("Feature under development");
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

.country-img {
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  border-radius: 0 0 0 50px;
  width: 15vh;
  height: 5vh;
  margin-left: auto;
}
</style>
