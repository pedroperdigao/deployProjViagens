<template>
  <div>
    <!-- Desktop view -->
    <div v-if="!isMobileView" class="container-full shadow-lg">
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
            <option value="sortByOrganizer">Organizer</option>
            <option value="sortByMembers">Members</option>
          </select>
        </div>
        <button class="btn btn-primary mt-4 shadow rounded" type="submit" style="width: 200px; font-weight: bold;">FILTER</button>
        <button class="btn btn-secondary mt-4 shadow rounded mx-1" type="button" @click="clearFilters"><i class="bi bi-arrow-counterclockwise"></i></button>
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
          <div v-if="trips.length === 0" class="text-center col-span-full mt-2">No trips found</div>
          <div v-else v-for="trip in trips" :key="trip.id" class="flex flex-col mb-4 mx-5">
            <div class="d-flex cursor-pointer" @click="viewTrip(trip.id)">
              <div id="card" class="bg-gray-100 shadow-md rounded-lg overflow-hidden flex flex-col">
                <!-- Image -->
                <img class="w-full h-60 object-cover object-center" :src="trip.imageUrl" :alt="trip.title + ' Trip Image Placeholder'" />
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
                      <img v-if="members[memberData.id]" class="w-8 h-8 rounded-full" :src="memberData.photoURL" :alt="memberData.displayName" />
                    </div>
                  </div>
                  <!-- Organizer -->
                  <div class="d-flex mt-3">
                    <p class="text-gray-700 font-bold">Organizer:</p>
                    <p class="text-gray-700 mx-1">{{ members[trip.organizer] ? members[trip.organizer].username : 'Unknown' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="error" class="text-red-500 text-center col-span-full">{{ error }}</div>
        </template>
      </div>
    </div>

    <!-- Mobile view -->
    <div v-else class="container-full shadow-lg">
      <form class="d-flex flex-wrap py-2 mx-3 mb-2 needs-validation" @submit.prevent="filterTrips" novalidate>
      <div class="flex-1 mb-2 px-1">
        <label for="inputLocation">Destination</label>
        <input v-model="inputDestination" type="text" class="form-control rounded text-sm" placeholder="Ex. Portugal">
      </div>
      <div class="flex-1 mb-2 px-1">
        <label for="inputUsername">Member </label>
        <input v-model="inputUsername" type="text" class="form-control rounded text-sm" placeholder="Ex. admin123">
      </div>
      <div class="flex-1 mb-2 px-1">
        <label for="inputCheckIn">Check-in</label>
        <input v-model="inputCheckIn" type="date" class="form-control rounded text-sm" placeholder="Check-In Date">
      </div>
      <div class="flex-1 mb-2 px-1">
        <label for="inputCheckOut">Check-out</label>
        <input v-model="inputCheckOut" type="date" class="form-control rounded text-sm" placeholder="Check-Out Date">
      </div>
      <div class="flex-1 mb-2 px-1">
        <label for="trips">Sort By:</label>
        <select class="form-select text-sm" v-model="sortedTrips">
          <option value="filterRecent">Most Recent</option>
          <option value="filterOldest">Oldest</option>
          <option value="sortByDestination">Destination</option>
          <option value="sortByDuration">Duration</option>
          <option value="sortByOrganizer">Organzier</option>
          <option value="sortByMembers">Members</option>
        </select>
      </div>
      <div class="flex-1 mb-2 px-1">
        <button class="btn btn-primary mt-2 shadow rounded text-sm" type="submit">FILTER</button>
      </div>
      <div class="flex-1 mb-2 px-1">
        <button class="btn btn-secondary mt-2 shadow rounded text-sm mx-1" type="button" @click="clearFilters">
          <i class="bi bi-arrow-counterclockwise"></i> Clear
        </button>
      </div>
    </form>
      <div class="grid gap-6 mt-4">
        <template v-if="loading">
          <div class="text-center">
            <div class="spinner-border text-primary" role="status">
              <span class="sr-only">Loading...</span>
            </div>
          </div>
        </template>
        <template v-else>
          <div v-if="trips.length === 0" class="text-center col-span-full mt-2">No trips found</div>
          <div v-else v-for="trip in trips" :key="trip.id" class="bg-white rounded-lg shadow-md p-4">
            <div class="cursor-pointer" @click="viewTrip(trip.id)">
              <img class="w-full h-48 object-cover object-center rounded-lg mb-4" :src="trip.imageUrl" :alt="trip.title + ' Trip Image'">
              <h3 class="text-lg font-semibold text-gray-800">{{ trip.title }}</h3>
              <p class="text-gray-600">{{ trip.destination }}</p>
              <div class="flex items-center mt-2 text-sm text-gray-600">
                <p>{{ formatDate(trip.start_date) }}</p>
                <span class="mx-1">&rarr;</span>
                <p>{{ formatDate(trip.end_date) }}</p>
                <span class="mx-1">({{ getTripDuration(trip.start_date, trip.end_date) }})</span>
              </div>
              <div class="flex flex-wrap  mt-2">
                <template v-for="memberData in trip.membersData">
                  <img v-if="members[memberData.id]" class="w-8 h-8 rounded-full mb-2 mx-1" :src="memberData.photoURL" :alt="memberData.displayName">
                </template>
              </div>
              <div class="flex items-center mt-2 text-sm text-gray-700">
                <span class="font-bold">Organizer:</span>
                <span class="mx-1">{{ members[trip.organizer] ? members[trip.organizer].username : 'Unknown' }}</span>
              </div>
            </div>
          </div>
          <div v-if="error" class="text-red-500 text-center mt-4">{{ error }}</div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, getDocs, doc, getDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';

const router = useRouter();
const toast = useToast();
const firestore = getFirestore();
const auth = getAuth();
const storage = getStorage();
const currentUser = ref(auth.currentUser ? auth.currentUser : null);
const trips = ref([]);
const originalTrips = ref([]);
const loading = ref(false);
const error = ref(null);
const members = ref({});
const inputDestination = ref('');
const inputCheckIn = ref('');
const inputCheckOut = ref('');
const inputUsername = ref('');
const sortedTrips = ref('filterRecent');

let storageReference;

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDocRef = doc(firestore, 'users', user.uid);
      try {
        const userDocSnapshot = await getDoc(userDocRef);
        if (userDocSnapshot.exists()) {
          currentUser.value = { uid: user.uid, ...userDocSnapshot.data() };
        } else {
          console.error('User document does not exist');
        }
      } catch (error) {
        console.error('Error retrieving user document:', error);
      }
    }
  });

  storageReference = storageRef(storage, ''); 

  fetchTrips(); 
});

const fetchMembersData = async (trip) => {
  const members = trip.members || [];

  const memberDataPromises = members.map(async (memberId) => {
    try {
      const userDocRef = doc(firestore, 'users', memberId);
      const userDocSnapshot = await getDoc(userDocRef);
      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        userData.displayName = userData.firstName + ' ' + userData.lastName;

        return {
          id: memberId,
          displayName: userData.displayName || 'Unknown',
          photoURL: userData.photoURL || 'default_photo_url',
          username: userData.username || 'Unknown',
        };
      } else {
        console.error('User document does not exist for memberId:', memberId);
        return null;
      }
    } catch (error) {
      console.error('Error retrieving user document for memberId:', memberId, error);
      return null;
    }
  });

  const memberData = await Promise.all(memberDataPromises);
  return memberData.filter((member) => member !== null);
};

const getTripDuration = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const duration = (end - start) / (1000 * 3600 * 24);
  return duration === 1 ? `${duration} day` : `${duration} days`;
};

const fetchTrips = async () => {
  loading.value = true;
  try {
    const q = query(collection(firestore, 'trips'));
    const querySnapshot = await getDocs(q);

    const tripsDataPromises = querySnapshot.docs.map(async (doc) => {
      const tripData = { id: doc.id, ...doc.data() };
      tripData.membersData = await fetchMembersData(tripData);

      tripData.membersData.forEach((member) => {
        if (!members.value[member.id]) {
          members.value[member.id] = member;
        }
      });

      return tripData;
    });

    const tripsData = await Promise.all(tripsDataPromises);

    const filteredTrips = tripsData.filter((trip) =>
      trip.membersData.some((member) => member.id === currentUser.value.uid)
    );

    filteredTrips.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));

    trips.value = filteredTrips;
    originalTrips.value = [...filteredTrips];
  } catch (err) {
    console.error('Error fetching trips:', err);
    error.value = 'Error fetching trips';
  } finally {
    loading.value = false;
  }
};

const viewTrip = (tripId) => {
  router.push(`/trips/${tripId}`);
};

const formatDate = (dateString) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const days = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  const date = new Date(dateString);

  const dayOfWeek = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${dayOfWeek}, ${month} ${day}, ${year}`;
};

const filterTrips = async () => {
  const destination = inputDestination.value.toLowerCase();
  const checkIn = inputCheckIn.value;
  const checkOut = inputCheckOut.value;
  const username = inputUsername.value.toLowerCase();

  loading.value = true;

  try {
    if (checkOut && checkIn && new Date(checkOut) < new Date(checkIn)) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

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

    if (sortedTrips.value === 'filterRecent') {
      filteredTrips.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
    } else if (sortedTrips.value === 'filterOldest') {
      filteredTrips.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
    } else if (sortedTrips.value === 'sortByDestination') {
      filteredTrips.sort((a, b) => a.destination.localeCompare(b.destination));
    } else if (sortedTrips.value === 'sortByDuration') {
      filteredTrips.sort((a, b) => {
        const durationA = new Date(a.end_date) - new Date(a.start_date);
        const durationB = new Date(b.end_date) - new Date(b.start_date);
        return durationA - durationB;
      });
    } else if (sortedTrips.value === 'sortByOrganizer') {
      filteredTrips.sort((a, b) => {
        const organizerA = members.value[a.organizer]?.username || '';
        const organizerB = members.value[b.organizer]?.username || '';
        return organizerA.localeCompare(organizerB);
      });
    } else if (sortedTrips.value === 'sortByMembers') {
      filteredTrips.sort((a, b) => a.membersData.length - b.membersData.length);
    }

    trips.value = filteredTrips;

  } catch (error) {
    console.error('Error filtering trips:', error);
    error.value = 'Error filtering trips';
  } finally {
    loading.value = false;
  }
};

const clearFilters = () => {
  inputDestination.value = '';
  inputCheckIn.value = '';
  inputCheckOut.value = '';
  inputUsername.value = '';
  sortedTrips.value = 'filterRecent';
  trips.value = originalTrips.value;
  toast.info('Filters cleared');
};

// Responsive check for mobile view
const screenWidth = ref(window.innerWidth);
window.addEventListener('resize', () => {
  screenWidth.value = window.innerWidth;
});

const isMobile = computed(() => screenWidth.value < 768); // Adjust as needed for your mobile breakpoint
const isMobileView = computed(() => isMobile.value);

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
