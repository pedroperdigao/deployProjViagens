<template>
  <div class="bg-white">
    <!-- Custom Navbar with Background Image -->
    <div class="custom-navbar">
      <div class="mx-20 px-6">
        <header class="flex justify-between items-center py-6">
          <!-- Increased py to increase height -->
          <a href="/" class="text-3xl font-bold text-white mx-2" style="text-decoration: none">iTravel</a>
          <nav class="flex-grow">
            <ul class="flex justify-end space-x-6 text-white">
              <li :class="{ 'font-bold': isCurrentRoute('/') }">
                <router-link to="/" class="nav-link">Home</router-link>
              </li>
              <li v-if="isLoggedIn" :class="{ 'font-bold': isCurrentRoute('/trips') }">
                <router-link to="/trips" class="nav-link">Trips</router-link>
              </li>
              <li v-if="isLoggedIn" :class="{ 'font-bold': isCurrentRoute('/invites') }">
                <router-link to="/invites" class="nav-link">Invites</router-link>
              </li>
              <li v-if="isLoggedIn" :class="{ 'font-bold': isCurrentRoute('/categories') }">
                <router-link to="/categories" class="nav-link">Categories</router-link>
              </li>
              <li v-if="isLoggedIn" :class="{ 'font-bold': isCurrentRoute('/profile') }">
                <router-link to="/profile" class="nav-link">Profile</router-link>
              </li>
              <li v-if="!isLoggedIn" :class="{ 'font-bold': isCurrentRoute('/login') }">
                <router-link to="/login" class="nav-link">Login</router-link>
              </li>
              <li v-if="!isLoggedIn" :class="{ 'font-bold': isCurrentRoute('/signup') }">
                <router-link to="/signup" class="nav-link">Register</router-link>
              </li>
              <li v-if="isLoggedIn">
                <button @click="handleLogout" class="nav-link mr-2">Logout</button>
              </li>
            </ul>
          </nav>
        </header>
        <!-- Home Page -->
        <div v-if="isHomePage">
          <h1 class="text-5xl font-bold text-white text-center">Plan Your Perfect Trip</h1>
          <p class="mt-4 text-lg text-white text-center">Discover new destinations, create detailed itineraries, and
            have the
            adventure of a lifetime</p>
        </div>

        <!-- Trips Page -->
        <div v-if="isTripsPage">
          <h1 class="text-5xl font-bold text-white text-center">Your Trips</h1>
          <div class="d-flex items-center justify-center">
            <p class="mt-4 text-lg text-white text-center mr-4">Embark on unforgettable journeys and create lasting
              memories</p>
            <button
              class="px-4 py-2 text-blue-500 font-semibold bg-white rounded hover:bg-blue-100 focus:outline-none mt-2"
              type="button" @click="addTrip">Create a New Trip</button>
          </div>
        </div>

        <!-- Invites Page -->
        <div v-if="isInvitesPage">
          <h1 class="text-5xl font-bold text-white text-center">You have {{ numPendingInvites }} Pending Invites!</h1>
          <p class="mt-4 text-lg text-white text-center">Embark on a voyage of discovery with companions who make every
            moment memorable</p>
        </div>

        <!-- Profile Page -->
        <div v-if="isProfilePage">
          <h1 class="text-5xl font-bold text-white text-center">Your Profile</h1>
          <p class="mt-4 text-lg text-white text-center">Discover more about yourself and share your adventures with the
            world</p>
        </div>

        <!-- Edit Profile Page -->
        <div v-if="isEditProfilePage">
          <h1 class="text-5xl font-bold text-white text-center">Edit Your Profile</h1>
          <p class="mt-4 text-lg text-white text-center">Polish your profile, amplify your adventures</p>
        </div>

        <!-- Login Page -->
        <div v-if="isLoginPage">
          <h1 class="text-5xl font-bold text-white text-center">Welcome Back!</h1>
          <p class="mt-4 text-lg text-white text-center">Sign in and embark on your next adventure</p>
        </div>

        <!-- Sign Up Page -->
        <div v-if="isSignUpPage">
          <h1 class="text-5xl font-bold text-white text-center">Create an Account</h1>
          <p class="mt-4 text-lg text-white text-center">Create your account and start the adventure of your life</p>
        </div>

        <!-- Categories Page -->
        <div v-if="isCategoriesPage">
          <h1 class="text-5xl font-bold text-white text-center">Categories</h1>
          <div class="d-flex items-center justify-center">
            <p class="mt-4 text-lg text-white text-center mr-4">Discover new destinations, create detailed itineraries,
              and
              have the adventure of a lifetime</p>
            <button
              class="px-4 py-2 text-blue-500 font-semibold bg-white rounded hover:bg-blue-100 focus:outline-none mt-2"
              type="button" @click="addCategory">Create a Category</button>
          </div>
        </div>

        <!-- Trip Page -->
        <div v-if="isTripPage && tripLoaded || isTripMediaPage && tripLoaded">
          <h1 class="text-5xl font-bold text-white text-center">Trip to {{ trip.destination }}</h1>
          <h2 class="mt-4 text-lg text-white text-center">{{ trip.description }}</h2>
          <h3 class="mt-2 text-sm text-white text-center">{{ trip.start_date + " > " + trip.end_date }}</h3>
        </div>

        <!-- New Trip Page -->
        <div v-if="isNewTripPage">
          <h1 class="text-5xl font-bold text-white text-center">Plan Your Next Adventure</h1>
          <p class="mt-4 text-lg text-white text-center">Start a new journey and explore uncharted territories</p>
        </div>

        <!-- Trip Details Page -->
        <div v-if="isTripDetailsPage">
          <h1 class="text-5xl font-bold text-white text-center">Explore the Details</h1>
          <p class="mt-4 text-lg text-white text-center">Uncover hidden gems and delve deeper into the heart of your
            journey</p>
        </div>

      </div>
    </div>
    <!-- End of Custom Navbar -->

    <!-- Main Content -->
    <div class="main_content mx-20 px-6">
      <div v-if="isCategoriesPage">
        <router-view :newCategory="newCategory" @category="newCategory = false" />
        <!-- para mandar props para o categories-->
      </div>
      <div v-else-if="isTripPage">
        <router-view @trip="updateTrip" />
      </div>
      <div v-else>
        <router-view />
      </div>
    </div>
    <!-- End of Main Content -->
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from "vue";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "vue-router";
import { doc, getFirestore, query, collection, getDoc, onSnapshot, where } from "firebase/firestore";
import { useToast } from "vue-toastification";

const router = useRouter();
const toast = useToast();
const firestore = getFirestore();
const currentUser = ref(null);
const isLoggedIn = ref(false);
const newCategory = ref(false);
const tripEmited = ref(null);
const tripLoaded = ref(false);
const trip = ref(null);
const currentTripUid = ref(null);
const db = getFirestore();
const numPendingInvites = ref(0);

let auth;
onMounted(() => {
  auth = getAuth();
  // Check if user is authenticated
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Fetch user data
      isLoggedIn.value = !!user;
      const userDocRef = doc(firestore, "users", user.uid);
      try {
        const userDocSnapshot = await getDoc(userDocRef);
        if (userDocSnapshot.exists()) {
          // Set the currentUser value with the data from Firestore
          currentUser.value = { uid: user.uid, ...userDocSnapshot.data() };
          // Fetch trips data
          countTrips();
        } else {
          console.error("User document does not exist");
        }
      } catch (error) {
        console.error("Error retrieving user document:", error);
      }
    }
  });
});

const handleLogout = () => {
  const isConfirmed = window.confirm('Are you sure you want to logout?');

  if (!isConfirmed) {
    return; // If the user cancels, do nothing
  }

  signOut(auth)
    .then(() => {
      isLoggedIn.value = false;
      console.log("User signed out");
      router.push("/");
      toast.success("You have been successfully logged out");
    })
    .catch((error) => {
      console.error("Logout error:", error);
      toast.error("An error occurred while logging out");
    });
};

const addTrip = () => {
  router.push("/trips/new");
};

const addCategory = () => {
  newCategory.value = true;
};

const updateTrip = (trip) => {
  tripEmited.value = trip;
  tripLoaded.value = true;
};

// Computed property to determine if the current route is the home page
const isHomePage = computed(() => router.currentRoute.value.path === '/');
const isLoginPage = computed(() => router.currentRoute.value.path === '/login');
const isSignUpPage = computed(() => router.currentRoute.value.path === '/signup');
const isInvitesPage = computed(() => router.currentRoute.value.path === '/invites');
const isProfilePage = computed(() => router.currentRoute.value.path === '/profile');
const isEditProfilePage = computed(() => router.currentRoute.value.path === '/profile/edit');
const isCategoriesPage = computed(() => router.currentRoute.value.path === '/categories');
const isTripsPage = computed(() => router.currentRoute.value.path === '/trips');
const isNewTripPage = computed(() => router.currentRoute.value.path === '/trips/new');
const isTripPage = computed(() => {
  const currentPath = router.currentRoute.value.path;
  return currentPath.startsWith('/trips/') && !currentPath.endsWith('/new');
});
const isTripMediaPage = computed(() => {
  const currentPath = router.currentRoute.value.path;
  return currentPath.startsWith('/trips/') && currentPath.endsWith('/media');
});

// Function to check if the current route matches the given route
const isCurrentRoute = (route) => router.currentRoute.value.path === route;

watch(router.currentRoute, async (to, from) => {

  if (to.path.startsWith('/trips/')) {
    if (currentTripUid.value === to.params.tripId) {
      console.log("Same trip");
    } else {
      currentTripUid.value = to.params.tripId;
      getTrip();
    }

  }
});

async function getTrip() {
  trip.value = (await getDoc(doc(db, "trips", currentTripUid.value))).data();

  console.log("Trip:", trip.value);
  tripLoaded.value = true;
}

const countTrips = async () => {
    try {
        // Query to fetch trips where the current user is in the invites array
        const q = query(collection(firestore, "trips"), where("invites", "array-contains", currentUser.value.uid));

        // Listen for real-time updates to the query
        const unsubscribe = onSnapshot(q, (snapshot) => {
            // Get the count of trips
            const tripsCount = snapshot.size;
            // Update the reactive variable
            numPendingInvites.value = tripsCount;
            console.log("Trips count:", numPendingInvites.value);
        });

        // Call unsubscribe to stop listening when component is unmounted or no longer needs updates
        return unsubscribe;

    } catch (err) {
        console.error("Error counting trips:", err);
        error.value = "Error counting trips";
    }
};
</script>

<style scoped>
button {
  cursor: pointer;
  position: relative;
  /* Ensure z-index works */
  z-index: 1;
}

.custom-navbar {
  background-image: url("@/assets/maldivas.jpg");
  /* Adjust path as per your project structure */
  background-size: auto;
  background-position: top;
  background-repeat: no-repeat;
  padding-top: 2rem;
  height: 400px;
  /* Increased padding-top for extra height */
}

/* Remove underline and set link color */
.nav-link {
  text-decoration: none;
  color: white;
}

/* Remove button border */
.nav-link button {
  border: none;
  background: none;
  color: white;
}

/* Remove button focus outline */
.nav-link button:focus {
  outline: none;
}

.main_content {
  margin-top: -10rem;
  /* Adjust margin-top to align content below navbar */
  border-radius: 20px;
}
</style>
