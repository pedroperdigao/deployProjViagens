<template>
  <div v-if="!isMobileView" class="container-full shadow-lg">
    <div class="d-flex" style="width: 100%; justify-content: space-between">
      <button
        class="profile-btns"
        style="
          border-bottom: 1px solid #c9c9c9;
          margin-top: 20px;
          padding-bottom: 20px;
        "
        @click="tabTripEvents(tripId)"
      >
        <i class="bi bi-calendar-event-fill mx-2"></i>Events
      </button>
      <button
        class="profile-btns"
        style="
          border-bottom: 1px solid #c9c9c9;
          margin-top: 20px;
          padding-bottom: 20px;
        "
        @click="tabTripDetails(tripId)"
      >
        <i class="bi bi-info-circle-fill mx-2"></i>Trip Info
      </button>
      <button
        class="profile-btns"
        style="
          border-bottom: 2px solid #3b82f6;
          margin-top: 20px;
          padding-bottom: 20px;
          color: #3b82f6;
        "
      >
        <i class="bi bi-people-fill mx-2"></i>Members
      </button>
      <button
        class="profile-btns"
        style="
          border-bottom: 1px solid #c9c9c9;
          margin-top: 20px;
          padding-bottom: 20px;
        "
        @click="tabTripMedia(tripId)"
      >
        <i class="bi bi-image-fill mx-2"></i>Media
      </button>
      <button
        class="profile-btns"
        style="
          border-bottom: 1px solid #c9c9c9;
          margin-top: 20px;
          padding-bottom: 20px;
        "
        @click="tabTripReviews(tripId)"
      >
        <i class="bi bi-star-fill mx-2"></i>Reviews
      </button>
    </div>
    <template v-if="loading">
      <div class="d-flex justify-content-center align-items-center mt-4">
        <div class="spinner-border text-primary" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>
    </template>
    <template v-else>
      <div v-if="trip" class="p-4 mx-2">
        <div class="d-flex">
          <!-- Display the organizer of the trip -->
          <div>
            <div class="d-flex">
              <img
                src="@/assets/crown.png"
                alt="Crown Icon"
                class="w-8 h-8 position-relative top-1"
              />
              <label for="organizer" class="form-label mx-14">Organizer</label>
            </div>
            <div
              v-if="organizer"
              class="members-div"
              style="border: 2px solid #c9c9c9"
            >
              <img
                :src="organizer.photoURL"
                :alt="organizer.username"
                class="rounded-circle me-3"
                width="40"
                height="40"
              />
              <p class="m-0" v-if="organizer">{{ organizer.username }}</p>
            </div>
          </div>

          <!-- Invite -->
          <div v-if="isOrganizer" class="user-invites">
            <input
              type="text"
              class="form-control"
              placeholder="Username"
              v-model="invitedUser"
            />
            <button
              class="btn btn-primary mx-2"
              @click="btnInviteMember(invitedUser)"
            >
              Invite
            </button>
          </div>
        </div>

        <!-- Display members with pending invites -->
        <div v-if="isOrganizer">
          <label for="invites" class="form-label">Pending Invites</label>
          <div
            v-if="filteredInvites && filteredInvites.length > 0"
            class="d-flex"
          >
          <div class="d-flex flex-wrap">
              <div
                class="invited-div mr-5"
                v-for="(invite, index) in filteredInvites"
                :key="index"
              >
                <img
                  :src="invite.photoURL"
                  class="rounded-circle me-3"
                  width="40"
                  height="40"
                />
                <p class="m-0">{{ invite.username }}</p>
              </div>
          </div>
          </div>
          <div v-else>
            <p>No pending invites</p>
          </div>
        </div>

        <!-- Display the members of the trip -->
        <label for="members" class="form-label">Members</label>
        <div
          v-if="filteredMembers && filteredMembers.length > 0"
          class="d-flex"
        >
          <div class="d-flex">
            <div class="d-flex flex-wrap">
              <template v-for="(member, index) in filteredMembers" :key="index">
                <div class="members-div mr-5 mb-3">
                  <img
                    :src="member.photoURL"
                    class="rounded-circle me-3"
                    width="40"
                    height="40"
                  />
                  <p class="m-0">{{ member.username }}</p>
                </div>
                <!-- Adicione uma quebra de linha a cada 5 membros -->
                <template v-if="(index + 1) % 5 === 0">
                  <br v-if="index + 1 !== filteredMembers.length" />
                </template>
              </template>
            </div>
          </div>
        </div>
        <div v-else>
          <p>No Members</p>
        </div>
      </div>
    </template>
  </div>
  <div v-else>
    <div class="container-full mobile-container shadow-lg">
      <div class="d-flex mobile-tabs" style="justify-content: space-between">
        <button class="mobile-profile-btns" @click="tabTripEvents(tripId)">
          <i class="bi bi-calendar-event-fill mx-2"></i>
          Events
        </button>
        <button class="mobile-profile-btns" @click="tabTripInfo(tripId)">
          <i class="bi bi-info-circle-fill mx-2"></i>
          Trip Info
        </button>
        <button class="mobile-profile-btns" @click="tabTripMembers(tripId)">
          <i class="bi bi-people-fill mx-2"></i>
          Members
        </button>
        <button class="mobile-profile-btns" @click="tabTripMedia(tripId)">
          <i class="bi bi-image-fill mx-2"></i>
          Media
        </button>
        <button class="mobile-profile-btns" @click="tabTripReviews(tripId)">
          <i class="bi bi-star-fill mx-2"></i>
          Reviews
        </button>
      </div>
      <template v-if="loading">
        <div class="d-flex justify-content-center align-items-center mt-4">
          <div class="spinner-border text-primary" role="status">
            <span class="sr-only">Loading...</span>
          </div>
        </div>
      </template>
      <template v-else>
        <div v-if="trip" class="p-2">
          <!-- Organizer Section -->
          <div class="d-flex flex-column mb-3">
            <div class="d-flex align-items-center mb-2">
              <img src="@/assets/crown.png" alt="Crown Icon" class="w-6 h-6" />
              <label class="form-label ml-2">Organizer</label>
            </div>
            <div
              v-if="organizer"
              class="d-flex align-items-center border p-2 rounded"
            >
              <img
                :src="organizer.photoURL"
                :alt="organizer.username"
                class="rounded-circle me-3"
                width="30"
                height="30"
              />
              <p class="m-0">{{ organizer.username }}</p>
            </div>
          </div>

          <!-- Invite Section -->
          <div v-if="isOrganizer" class="d-flex flex-column mb-3">
            <input
              type="text"
              class="form-control mb-2"
              placeholder="Username"
              v-model="invitedUser"
            />
            <button
              class="btn btn-primary"
              @click="btnInviteMember(invitedUser)"
            >
              Invite
            </button>
          </div>

          <!-- Pending Invites Section -->
          <div v-if="isOrganizer">
            <label class="form-label">Pending Invites</label>
            <div v-if="filteredInvites.length" class="d-flex flex-wrap">
              <div
                v-for="(invite, index) in filteredInvites"
                :key="index"
                class="d-flex align-items-center border p-2 rounded m-1"
              >
                <img
                  :src="invite.photoURL"
                  class="rounded-circle me-2"
                  width="30"
                  height="30"
                />
                <p class="m-0">{{ invite.username }}</p>
              </div>
            </div>
            <div v-else>
              <p>No pending invites</p>
            </div>
          </div>

          <!-- Members Section -->
          <label class="form-label">Members</label>
          <div v-if="filteredMembers.length" class="d-flex flex-wrap">
            <div
              v-for="(member, index) in filteredMembers"
              :key="index"
              class="d-flex align-items-center border p-2 rounded m-1"
            >
              <img
                :src="member.photoURL"
                class="rounded-circle me-2"
                width="30"
                height="30"
              />
              <p class="m-0">{{ member.username }}</p>
            </div>
          </div>
          <div v-else>
            <p>No Members</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, inject } from "vue";
import { useRouter } from "vue-router";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  query,
  collection,
  updateDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useToast } from "vue-toastification";

const router = useRouter();
const toast = useToast();
const tripId = router.currentRoute.value.params.tripId;
const firestore = getFirestore();
const trip = ref(null);
const organizer = ref(null);
const organizerId = ref(null);
const members = ref([]);
const loading = ref(false);
const auth = getAuth();
const loggedInUserId = ref(null);
const membersIds = ref([]);
const invitesIds = ref([]);
const invitedUser = ref("");
const users = ref([]);
const error = ref(null);
const isMobileView = ref(window.innerWidth <= 768);
const socket = inject("socket");

onMounted(async () => {
  loading.value = true;
  try {
    const tripDoc = doc(firestore, "trips", tripId);
    const tripSnapshot = await getDoc(tripDoc);
    if (tripSnapshot.exists()) {
      trip.value = tripSnapshot.data();
      // Fetch organizer details
      const organizerDoc = await getDoc(
        doc(firestore, "users", trip.value.organizer)
      );
      if (organizerDoc.exists()) {
        organizer.value = organizerDoc.data();
      }
      // Fetch members details
      await Promise.all(
        trip.value.members.map(async (memberId) => {
          const memberDoc = await getDoc(doc(firestore, "users", memberId));
          if (memberDoc.exists()) {
            members.value.push(memberDoc.data());
          }
          loading.value = false;
        })
      );

      organizerId.value = trip.value.organizer;
      membersIds.value.push(trip.value.members);
      invitesIds.value.push(trip.value.invites);
    } else {
      console.error("Trip document does not exist");
      loading.value = false;
    }
  } catch (error) {
    console.error("Error retrieving trip document:", error);
    loading.value = false;
  }

  auth.onAuthStateChanged((user) => {
    if (user) {
      loggedInUserId.value = user.uid;
      console.log("Logged in user:", loggedInUserId);
    } else {
      loggedInUserId.value = null;
    }
  });

  fetchUsersData();
});

const tabTripEvents = (tripId) => {
  router.push(`/trips/${tripId}`);
};

const tabTripDetails = (tripId) => {
  router.push(`/trips/${tripId}/details`);
};

const tabTripMedia = (tripId) => {
  router.push(`/trips/${tripId}/media`);
};

const tabTripReviews = (tripId) => {
  router.push(`/trips/${tripId}/reviews`);
};

// Computed property to filter out the organizer from the members list
const filteredMembers = computed(() => {
  if (organizer.value) {
    return members.value.filter(
      (member) => member.username !== organizer.value.username
    );
  }
  return members.value;
});

// Filtered Invites
const filteredInvites = computed(() => {
  if (trip.value.invites) {
    return users.value.filter((user) => trip.value.invites.includes(user.id));
  }
  return [];
});

//make a function to check if the logged in user is the organizer or one of the members
const isOrganizer = computed(() => {
  return loggedInUserId.value === organizerId.value;
});

const isMember = computed(() => {
  return (memberId) =>
    membersIds.value.flat().includes(memberId) ? memberId : null;
});

const fetchUsersData = async () => {
  try {
    const q = query(collection(firestore, "users"));
    const querySnapshot = await getDocs(q);
    const usersData = [];
    for (const doc of querySnapshot.docs) {
      const userData = { id: doc.id, ...doc.data() };
      usersData.push(userData);
    }
    users.value = usersData;
    loading.value = false;
  } catch (err) {
    console.error("Error fetching users:", err);
    error.value = "Error fetching user";
    loading.value = false;
  }
};

const btnInviteMember = async (invitedUserName) => {
  // Check if the invitedUser exists in the users array
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  let invitedUserObj;

  if (emailRegex.test(invitedUserName)) { //Validações por email
    
    invitedUserObj = users.value.find(
      (user) => user.email.toLowerCase() === invitedUserName.toLowerCase()
    );

    if (!invitedUserObj) {
      toast.error(`User with email ${invitedUserName} does not exist`);
      return; 
    }

    
    if (invitedUserObj.id === loggedInUserId.value) {
      toast.warning("You can't invite yourself to the trip");
      return;
    }

    
    if (isMemberOfTrip(invitedUserObj.id)) {
      toast.warning(`${invitedUserObj.username} is already a member of the trip`);
      return; 
    }

    
    if (isMemberInvited(invitedUserObj.id)) {
      toast.warning(
        `${invitedUserObj.username} already has a pending invite of the trip`
      );
      return; 
    }
    
  }
  else{ //Validações por username

    invitedUserObj = users.value.find(
      (user) => user.username.toLowerCase() === invitedUserName.toLowerCase()
    );

    if (!invitedUserObj) {
    toast.error(`User ${invitedUserObj.username} does not exist`);
    return; // Exit the function if the invited user doesn't exist
  }

  // Check if the invited user is the same as the logged-in user
  if (invitedUserObj.id === loggedInUserId.value) {
    toast.warning("You can't invite yourself to the trip");
    return; // Exit the function if the invited user is the logged-in user
  }

  // Check if the invited user is already a member of the trip
  if (isMemberOfTrip(invitedUserObj.id)) {
    toast.warning(`${invitedUserObj.username} is already a member of the trip`);
    return; // Exit the function if the invited user is already a member
  }

  // Check if the invited user is already invited for the trip
  if (isMemberInvited(invitedUserObj.id)) {
    toast.warning(
      `${invitedUserObj.username} already has a pending invite of the trip`
    );
    return; // Exit the function if the invited user is already a member
  }

  }
  
  

  // Proceed with the invitation
  try {
    const tripDocRef = doc(firestore, "trips", tripId);
    const tripSnapshot = await getDoc(tripDocRef);
    if (tripSnapshot.exists()) {
      const tripData = tripSnapshot.data();
      if (!tripData.invites) {
        tripData.invites = [];
      }
      // Add the invited user's ID to the invites array
      tripData.invites.push(invitedUserObj.id);
      // Update the trip document with the modified invites array
      await updateDoc(tripDocRef, { invites: tripData.invites });

      // Update the invitesIds array with the new invite
      invitesIds.value.push(invitedUserObj.id);

      socket.emit("sendInvite", invitedUserObj);

      // Clear the input field after successful invitation
      invitedUser.value = "";
      toast.success(`Invited ${invitedUserObj.username} to the trip`);
      filteredInvites.value.push(invitedUserObj);
    } else {
      console.error("Trip document does not exist");
      toast.error("Error inviting user to trip");
    }
  } catch (error) {
    console.error("Error inviting user to trip:", error);
    toast.error("Error inviting user to trip");
  }
};

const isMemberOfTrip = (memberId) => {
  return membersIds.value.flat().includes(memberId);
};

const isMemberInvited = (invitedID) => {
  return invitesIds.value.flat().includes(invitedID);
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
  display: flex;
  justify-content: center;
  align-items: center;
}

.members-div {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  border: 1px solid #c9c9c9;
  border-radius: 5px;
  padding: 10px;
  width: 250px;
  min-width: 250px;
}

.invited-div {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  border: 1px dashed #c9c9c9;
  border-radius: 5px;
  padding: 10px;
  width: 250px;
  min-width: 250px;
  border-style: dashed;
}

label {
  font-weight: bold;
}

.members-div.authenticated {
  border: 2px solid rgb(0, 207, 0);
}

.user-invites {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 100px;
}

.mobile-container {
  padding: 10px;
}

.mobile-tabs {
  margin-bottom: 20px;
}

.mobile-profile-btns {
  flex: 1;
  text-align: center;
  margin: 0 5px;
}
</style>
