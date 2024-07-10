<template>
    <div class="container-full shadow-lg" :style="{ padding: isMobileView ? '0' : '20px' }">

        <!-- Loading spinner while data is being fetched -->
        <template v-if="loading">
            <div class="clearfix mt-2">
                <div class="spinner-border float-right text-primary" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
            </div>
        </template>
        <!-- Display trip cards when data is loaded -->
        <template v-else>
            <h2 v-if="trips.length == 0" class="text-lg flex justify-content-center bold"> No invites</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                <!-- Loop through each trip and display its details -->
                <div v-for="trip in trips" :key="trip.id" class="flex flex-col mb-4  mt-10"
                    :class="{ 'mx-5': !isMobileView, 'mx-3': isMobileView }">
                    <div class="d-flex">
                        <!-- Card for displaying trip information -->
                        <div id="card" class="bg-gray-100 shadow-md rounded-lg overflow-hidden flex flex-col">
                            <!-- Trip image -->
                            <img class="w-full h-60 object-cover object-center" :src="trip.imageUrl"
                                :alt="trip.title + ' Trip Image Placeholder'" />
                            <div class="pt-4 px-4 pr-4">
                                <!-- Trip title -->
                                <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ trip.title }}</h3>
                                <!-- Trip dates -->
                                <div class="d-flex text-sm text-gray-500">
                                    <p>{{ formatDate(trip.start_date) }}</p>
                                    <p class="mx-2 mr-2 font-bold">TO</p>
                                    <p>{{ formatDate(trip.end_date) }}</p>
                                    <p class="mx-2">({{ getTripDuration(trip.start_date, trip.end_date) }})</p>
                                </div>
                                <div class="flex space-x-2">
                                    <div v-for="memberData in trip.membersData" :key="memberData.id">
                                        <img v-if="members[memberData.id]" class="w-8 h-8 rounded-full"
                                            :src="memberData.photoURL" :alt="memberData.displayName" />
                                    </div>
                                </div>
                                <!-- Organizer --><!-- Organizer -->
                                <div class="d-flex mt-3">
                                    <p class="text-gray-700 font-bold">Organizer:</p>
                                    <p class="text-gray-700 mx-1">{{ members[trip.organizer] ?
                                        members[trip.organizer].username :
                                        'Unknown' }}</p>
                                </div>
                            </div>
                        </div>
                        <!-- Buttons for accepting or declining trip invitations -->
                        <div class="flex flex-col">
                            <!-- Button to accept invite -->
                            <button id="btn_accept_invite" class="text-white font-bold px-2 py-8" title="Accept Invite"
                                @click="openConfirmationModalAccept(trip)">
                                <i class="bi bi-check-lg"></i>
                            </button>
                            <!-- Button to decline invite -->
                            <button id="btn_decline_invite" class="text-white font-bold px-2 py-8"
                                title="Decline Invite" @click="openConfirmationModalDecline(trip)">
                                <i class="bi bi-x-lg"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Display error message if there's an error -->
            <div v-if="error" class="text-red-500 text-center col-span-full">{{ error }}</div>
        </template>
    </div>

    <!-- Modal to confirm the accept -->
    <div>
        <div v-if="confirmationModal" class="modal" tabindex="-1" style="display: block">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Confirmation</h5>
                        <button type="button" class="btn-close" @click="closeModal"></button>
                    </div>
                    <div class="modal-body">
                        <p v-if="inviteAccepted">Are you sure you want to accept this trip invitation?</p>
                        <p v-if="!inviteAccepted">Are you sure you want to decline this trip invitation?</p>


                    </div>
                    <div class="modal-footer">
                        <button @click="closeModal" class="btn btn-secondary">No</button>
                        <button v-if="inviteAccepted" @click="acceptInvite(selectedTrip)" class="btn btn-primary">Yes</button>
                        <button v-if="!inviteAccepted" @click="declineInvite(selectedTrip)" class="btn btn-primary">Yes</button>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, onMounted, inject } from "vue";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc, query, collection, getDoc, getDocs, where } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref as storageRef } from "firebase/storage";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";

const router = useRouter();
const toast = useToast();
const firestore = getFirestore();
const auth = getAuth();
const storage = getStorage();
const currentUser = ref(null);
const trips = ref([]);
const loading = ref(false);
const error = ref(null);
const members = ref({}); // Store members' data
const emit = defineEmits(["numPendingInvites"]);
const isMobileView = ref(window.innerWidth <= 768);
const socket = inject("socket");
const inviteAccepted = ref(false);
const selectedTrip = ref(null);
const confirmationModal = ref(false);

let storageReference; // Declared storageReference

// Fetch trips and user data when component is mounted
onMounted(() => {
    // Check if user is authenticated
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Fetch user data
            const userDocRef = doc(firestore, "users", user.uid);
            try {
                const userDocSnapshot = await getDoc(userDocRef);
                if (userDocSnapshot.exists()) {
                    // Set the currentUser value with the data from Firestore
                    currentUser.value = { uid: user.uid, ...userDocSnapshot.data() };
                    // Fetch trips data
                    fetchTrips();
                } else {
                    console.error("User document does not exist");
                }
            } catch (error) {
                console.error("Error retrieving user document:", error);
            }
        }
    });

    // Initialize storageReference after storage is available
    storageReference = storageRef(storage, "");
});

const fetchMembersData = async (trip) => {
    const members = trip.members || []; // Default to an empty array if members is undefined

    // Create an array of promises for fetching user data
    const memberDataPromises = members.map((memberId) => {
        const userDocRef = doc(firestore, "users", memberId);
        return getDoc(userDocRef)
            .then(userDocSnapshot => {
                if (userDocSnapshot.exists()) {
                    const userData = userDocSnapshot.data();

                    // Return user data with default values
                    return {
                        id: memberId,
                        displayName: `${userData.firstName || 'Unknown'} ${userData.lastName || 'Unknown'}`,
                        photoURL: userData.photoURL || "default_photo_url",
                        username: userData.username || "Unknown",
                    };
                } else {
                    console.error("User document does not exist for memberId:", memberId);
                    return null; // Return null if the document does not exist
                }
            })
            .catch(error => {
                console.error("Error retrieving user document for memberId:", memberId, error);
                return null; // Return null if there was an error
            });
    });

    // Wait for all promises to resolve and filter out any null values
    const memberDataResults = await Promise.allSettled(memberDataPromises);
    return memberDataResults
        .filter(result => result.status === 'fulfilled' && result.value !== null)
        .map(result => result.value);
};

socket.on("sendInvite", async (invite) => {
    console.log('sendInvite:', invite)

    if (currentUser.value.uid == invite.id) {

        await new Promise((resolve) => {
            setTimeout(resolve, 1000);
        });
        fetchTrips();

    }

});

const openConfirmationModalAccept = (trip) => {
    inviteAccepted.value=true;
    selectedTrip.value = trip;
    console.log('selectedTrip:', selectedTrip.value)
    confirmationModal.value = true;
};

const openConfirmationModalDecline = (trip) => {
    inviteAccepted.value=false;
    selectedTrip.value = trip;
    confirmationModal.value = true;
};

const closeModal = () => {
    confirmationModal.value = false;
    selectedTrip.value = null;
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
        // Query to fetch trips where the current user is in the invites array
        const q = query(collection(firestore, "trips"), where("invites", "array-contains", currentUser.value.uid));
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

        // Sort trips by start date in descending order
        tripsData.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));

        // Update the reactive variables
        trips.value = tripsData;
    } catch (err) {
        console.error("Error fetching trips:", err);
        error.value = "Error fetching trips";
    } finally {
        loading.value = false;
    }
};

// Function to accept trip invitation
const acceptInvite = async (trip) => {


    try {
        const index = trip.invites.indexOf(currentUser.value.uid);
        if (index !== -1) {
            trip.invites.splice(index, 1);
            const tripDocRef = doc(firestore, "trips", trip.id);
            await updateDoc(tripDocRef, { invites: trip.invites });
            trip.members.push(currentUser.value.uid);
            await updateDoc(tripDocRef, { members: trip.members });
            await fetchTrips();
            toast.success("Trip invitation accepted successfully");
            router.push({ name: "Trip", params: { tripId: trip.id } });
        } else {
            console.error("User ID not found in trip's invites array");
        }
        closeModal();
    } catch (error) {
        console.error("Error accepting invite:", error);
        toast.error("Error accepting trip invitation");
    }
};

// Function to decline trip invitation
const declineInvite = async (trip) => {
    
    try {
        const index = trip.invites.indexOf(currentUser.value.uid);
        if (index !== -1) {
            trip.invites.splice(index, 1);
            const tripDocRef = doc(firestore, "trips", trip.id);
            await updateDoc(tripDocRef, { invites: trip.invites });
            //await fetchTrips();
            trips.value = trips.value.filter((t) => t.id !== trip.id);
            toast.success("Trip invitation declined successfully");
        } else {
            console.error("User ID not found in trip's invites array");
        }
        closeModal();
    } catch (error) {
        console.error("Error declining invite:", error);
        toast.error("Error declining trip invitation");
    }
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
</script>


<style scoped>
.container-full {
    background-color: white;
    background-size: cover;
    background-position: center;
    border-radius: 20px;
    /*padding: 20px;*/
    min-height: 70vh;
    margin-top: 10px;
}

#card {
    width: 100%;
    border-radius: 15px 0 15px 15px;
}

#btn_accept_invite {
    background-color: #4ADE80;
    border-radius: 0 15px 0 0;
}

#btn_accept_invite:hover {
    background-color: #22C55E;
}

#btn_decline_invite {
    background-color: #FB7185;
    border-radius: 0 0 15px 0;
}

#btn_decline_invite:hover {
    background-color: #F43F5E;
}
</style>
