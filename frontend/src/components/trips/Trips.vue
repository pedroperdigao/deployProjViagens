<template>
  <div class="container-full">
    <!-- Filters -->
    <form class="d-flex mx-5 py-4 mb-4 needs-validation" @submit.prevent="filterTrips" novalidate>
      <div class="col-md-2 mr-5">
        <label for="inputLocation">Destination</label>
        <input v-model="inputDestination" type="text" class="form-control rounded" placeholder="Ex. Portugal">
      </div>
      <div class="col-md-2 mr-5">
        <label for="inputUsername">Member Username</label>
        <input v-model="inputUsername" type="text" class="form-control rounded" placeholder="Ex. admin123">
      </div>
      <div class="col-md-2 mr-5">
        <label for="inputCheckIn">Check-in</label>
        <input v-model="inputCheckIn" type="date" class="form-control rounded" placeholder="Check-In Date">
      </div>
      <div class="col-md-2 mr-5">
        <label for="inputCheckOut">Check-out</label>
        <input v-model="inputCheckOut" type="date" class="form-control rounded" placeholder="Check-Out Date">
      </div>
      <div class="col-md-2 mr-10">
        <label for="trips">Sort By:</label>
        <select class="form-select" v-model="sortedTrips">
          <option value="filterRecent">Most Recent</option>
          <option value="filterOldest">Oldest</option>
          <option value="sortByDestination">Destination</option>
          <option value="sortByDuration">Duration</option>
          <option value="sortByOrganizer">Organzier</option>
          <option value="sortByMembers">Members</option>
        </select>
      </div>
      <button class="btn btn-primary mt-4 shadow rounded" type="submit"
        style="width: 200px; font-weight: bold;">FILTER</button>
      <button class="btn btn-secondary mt-4 shadow rounded mx-1" type="button" @click="clearFilters"><i
          class="bi bi-arrow-counterclockwise"></i></button>
    </form>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
      <!-- Trip Cards -->
      <template v-if="loading">
        <div class="clearfix mt-2">
          <div class="spinner-border float-right text-primary" role="status">
            <span class="sr-only">Loading...</span>
          </div>
        </div>
      </template>
      <template v-else>
        <div v-for="trip in trips" :key="trip.id" class="flex flex-col mb-4 mx-5">
          <div class="d-flex cursor-pointer" @click="viewTrip(trip.id)">
            <div id="card" class="bg-gray-100 shadow-md rounded-lg overflow-hidden flex flex-col">
              <!-- Image -->
              <img class="w-full h-60 object-cover object-center" :src="trip.imageUrl"
                :alt="trip.title + ' Trip Image Placeholder'" />
              <div class="pt-4 px-4 pr-4">
                <!-- Title -->
                <h3 class="text-xl font-semibold text-gray-700 mb-2">{{ trip.title }}</h3>
                <p class="font-semibold text-gray-700 mb-2">{{ trip.destination }}</p>
                <!-- Dates -->
                <div class="d-flex text-sm text-gray-700">
                  <p>{{ formatDate(trip.start_date) }}</p>
                  <p class="mx-2 mr-2 font-bold">TO</p>
                  <p>{{ formatDate(trip.end_date) }}</p>
                  <p class="mx-2">({{ getTripDuration(trip.start_date, trip.end_date) }})</p>
                </div>
                <!-- Members Photos -->
                <div class="flex space-x-2">
                  <div v-for="memberData in trip.membersData" :key="memberData.id">
                    <img v-if="members[memberData.id]" class="w-8 h-8 rounded-full" :src="memberData.photoURL"
                      :alt="memberData.displayName" />
                  </div>
                </div>
                <!-- Organizer --><!-- Organizer -->
                <div class="d-flex mt-3">
                  <p class="text-gray-700 font-bold">Organizer:</p>
                  <p class="text-gray-700 mx-1">{{ members[trip.organizer] ? members[trip.organizer].username :
                    'Unknown' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="error" class="text-red-500 text-center col-span-full">{{ error }}</div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, query, getDocs, doc, getDoc } from "firebase/firestore";
import { getStorage, ref as storageRef, getDownloadURL } from "firebase/storage";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";

const router = useRouter();
const toast = useToast();
const firestore = getFirestore();
const auth = getAuth();
const storage = getStorage();
const currentUser = auth.currentUser ? ref(auth.currentUser) : ref(null);
const trips = ref([]);
const originalTrips = ref([]);
const loading = ref(false);
const error = ref(null);
const members = ref({}); // Store members' data
const inputDestination = ref("");
const inputCheckIn = ref("");
const inputCheckOut = ref("");
const inputUsername = ref("");
const sortedTrips = ref('filterRecent');

let storageReference; // Declared storageReference

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);
      try {
        const userDocSnapshot = await getDoc(userDocRef);
        if (userDocSnapshot.exists()) {
          // Set the currentUser value with the data from Firestore
          currentUser.value = { uid: user.uid, ...userDocSnapshot.data() };
        } else {
          console.error("User document does not exist");
        }
      } catch (error) {
        console.error("Error retrieving user document:", error);
      }
    }
  });

  storageReference = storageRef(storage, ""); // Initialize storageReference after storage is available

  fetchTrips(); // Fetch trips when component is mounted
});

const fetchMembersData = async (trip) => {
  const members = trip.members || []; // Default to an empty array if members is undefined

  // Create an array of promises for fetching user data
  const memberDataPromises = members.map(async (memberId) => {
    try {
      const userDocRef = doc(firestore, "users", memberId);
      const userDocSnapshot = await getDoc(userDocRef);
      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();

        // Make a display name with firstName and lastName
        userData.displayName = userData.firstName + " " + userData.lastName;

        return {
          id: memberId,
          displayName: userData.displayName || "Unknown", // Provide a default value if displayName is missing
          photoURL: userData.photoURL || "default_photo_url", // Provide a default value if photoUrl is missing
          username: userData.username || "Unknown", // Provide a default value if username is missing
        };
      } else {
        console.error("User document does not exist for memberId:", memberId);
        return null; // Return null if the document does not exist
      }
    } catch (error) {
      console.error("Error retrieving user document for memberId:", memberId, error);
      return null; // Return null if there was an error
    }
  });

  // Wait for all promises to resolve
  const memberData = await Promise.all(memberDataPromises);

  // Filter out any null values that might have been returned due to errors or missing documents
  return memberData.filter(member => member !== null);
};


const getTripDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = (end - start) / (1000 * 3600 * 24); // Convert milliseconds to days
    return duration === 1 ? `${duration} day` : `${duration} days`;
};

const fetchTrips = async () => {
  loading.value = true;
  try {
    const q = query(collection(firestore, "trips"));
    const querySnapshot = await getDocs(q);

    // Fetch all trips and their members data concurrently
    const tripsDataPromises = querySnapshot.docs.map(async (doc) => {
      const tripData = { id: doc.id, ...doc.data() };
      tripData.membersData = await fetchMembersData(tripData);

      // Populate members object with user data
      tripData.membersData.forEach((member) => {
        if (!members.value[member.id]) {
          members.value[member.id] = member;
        }
      });

      return tripData;
    });

    const tripsData = await Promise.all(tripsDataPromises);

    // Filter trips where the current user is a member
    const filteredTrips = tripsData.filter((trip) =>
      trip.membersData.some((member) => member.id === currentUser.value.uid)
    );

    // Sort trips by start date in descending order
    filteredTrips.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));

    // Update the reactive variables
    trips.value = filteredTrips;
    originalTrips.value = [...filteredTrips];
  } catch (err) {
    console.error("Error fetching trips:", err);
    error.value = "Error fetching trips";
  } finally {
    loading.value = false;
  }
};


const viewTrip = (tripId) => {
  router.push(`/trips/${tripId}`);
};

const formatDate = (dateString) => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const days = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];

  // Create a Date object from the dateString
  const date = new Date(dateString);

  // Extract the day, month, and year components from the Date object
  const dayOfWeek = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  // Format the date as "Day, D Month YYYY"
  const formattedDate = `${dayOfWeek}, ${month} ${day}, ${year}`;

  return formattedDate;
};

const filterTrips = async () => {
  const destination = inputDestination.value.toLowerCase();
  const checkIn = inputCheckIn.value;
  const checkOut = inputCheckOut.value;
  const username = inputUsername.value.toLowerCase();

  loading.value = true;

  try {
    if (checkOut && checkIn && new Date(checkOut) < new Date(checkIn)) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    // Filter trips based on the input values
    const filteredTrips = originalTrips.value.filter((trip) => {
      const tripTitle = trip.title ? trip.title.toLowerCase() : '';
      const tripDestination = trip.destination ? trip.destination.toLowerCase() : '';

      const destinationMatch = destination === '' || tripDestination.includes(destination) || tripTitle.includes(destination);

      const startDate = trip.start_date ? new Date(trip.start_date) : null;
      const endDate = trip.end_date ? new Date(trip.end_date) : null;

      let dateRangeMatch = false;

      if (checkIn === '' && checkOut === '') {
        dateRangeMatch = true;
      } else if (checkIn !== '' && checkOut === '') {
        dateRangeMatch = startDate >= new Date(checkIn);
      } else if (checkIn === '' && checkOut !== '') {
        dateRangeMatch = endDate <= new Date(checkOut);
      } else {
        dateRangeMatch = startDate >= new Date(checkIn) && endDate <= new Date(checkOut);
      }

      const memberMatch = username === '' || trip.membersData.some((member) => member.username.toLowerCase().includes(username));

      if (destination === '' && checkIn === '' && checkOut === '' && username === '' && sortedTrips.value === 'filterRecent') {
        return true;
      }

      return destinationMatch && dateRangeMatch && memberMatch;
    });

    // Sort filtered trips based on selected sorting option
    if (sortedTrips.value === 'filterRecent') {
      // Sort by start date in descending order
      filteredTrips.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
    } else if (sortedTrips.value === 'filterOldest') {
      // Sort by start date in ascending order
      filteredTrips.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
    } else if (sortedTrips.value === 'sortByDestination') {
      // Sort by destination alphabetically
      filteredTrips.sort((a, b) => a.destination.localeCompare(b.destination));
    } else if (sortedTrips.value === 'sortByDuration') {
      // Sort by duration (difference between end date and start date)
      filteredTrips.sort((a, b) => {
        const durationA = new Date(a.end_date) - new Date(a.start_date);
        const durationB = new Date(b.end_date) - new Date(b.start_date);
        return durationA - durationB;
      });
    } else if (sortedTrips.value === 'sortByOrganizer') {
      // Sort by organizer username alphabetically
      filteredTrips.sort((a, b) => {
        const organizerA = members.value[a.organizer]?.username || '';
        const organizerB = members.value[b.organizer]?.username || '';
        return organizerA.localeCompare(organizerB);
      });
    } else if (sortedTrips.value === 'sortByMembers') {
      // Sort by number of members
      filteredTrips.sort((a, b) => a.membersData.length - b.membersData.length);
    }

    // Update trips with the filtered and sorted results
    trips.value = filteredTrips;
    console.log("Filtered Trips:", filteredTrips);

  } catch (error) {
    console.error("Error filtering trips:", error);
    error.value = "Error filtering trips";
  } finally {
    // Set loading to false after filtering is complete
    loading.value = false;
  }
};


const clearFilters = () => {
  inputDestination.value = "";
  inputCheckIn.value = "";
  inputCheckOut.value = "";
  inputUsername.value = "";
  sortedTrips.value = 'filterRecent';
  trips.value = originalTrips.value;
  toast.info("Filters cleared");
};
</script>

<style scoped>
.container-full {
  background-color: white;
  background-size: cover;
  background-position: center;
  border-radius: 20px;
  padding: 20px;
  min-height: 70vh;
  margin-top: 10px;
}

#card {
  width: 100%;
  border-radius: 15px;
}
</style>
