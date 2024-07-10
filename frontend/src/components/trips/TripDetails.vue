<template>
    <div class="container-full shadow-lg">
        <!-- Desktop Template -->
        <template v-if="!isMobileView">
            <div class="d-flex" style="width: 100%; justify-content: space-between">
                <button class="profile-btns"
                    style="border-bottom: 1px solid #c9c9c9; margin-top: 20px;padding-bottom: 20px;"
                    @click="tabTripEvents(tripId)"><i class="bi bi-calendar-event-fill mx-2"></i>Events</button>
                <button class="profile-btns"
                    style="border-bottom: 2px solid #3b82f6; margin-top: 20px;padding-bottom: 20px; color:#3b82f6"><i
                        class="bi bi-info-circle-fill mx-2"></i>Trip Info</button>
                <button class="profile-btns"
                    style="border-bottom: 1px solid #c9c9c9; margin-top: 20px;padding-bottom: 20px;"
                    @click="tabTripMembers(tripId)"><i class="bi bi-people-fill mx-2"></i>Members</button>
                <button class="profile-btns"
                    style="border-bottom: 1px solid #c9c9c9; margin-top: 20px;padding-bottom: 20px;"
                    @click="tabTripMedia(tripId)"><i class="bi bi-image-fill mx-2"></i>Media</button>
                <button class="profile-btns"
                    style="border-bottom: 1px solid #c9c9c9; margin-top: 20px;padding-bottom: 20px;"
                    @click="tabTripReviews(tripId)"><i class="bi bi-star-fill mx-2"></i>Reviews</button>
            </div>
            <template v-if="loading">
                <div class="d-flex justify-content-center align-items-center mt-4">
                    <div class="spinner-border float-right text-primary" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                </div>
            </template>
            <template v-else>
                <div v-if="trip" class="d-flex p-4">
                    <div class="col">
                        <img v-if="trip.imageUrl==='/src/assets/defaultImageTrip.jpg'" class="trip-image object-cover object-center mb-4"  :src="defaultImageTrip" alt="Trip Picture">
                        <img v-else class="trip-image object-cover object-center mb-4" :src="trip.imageUrl" alt="Trip Picture">
                        <!-- Categories -->
                        <div class="categories-grid">
                            <div v-for="(tag, index) in trip.tags" :key="index" class="category-item"
                                :style="{ borderColor: '#000000' }">
                                <!--<div class="category-square" :style="{ backgroundColor: category.color }"></div>-->
                                <label>{{ tag }}</label>
                                <button v-if="isOrganizer" type="button" class="ml-1 bold bi bi-x-lg bi-sm"
                                    style="margin-left:auto" @click="removeTagFromTrip(tag)"></button>
                            </div>
                            <!-- Add Category Button -->
                            <div v-if="isOrganizer" class="category-item add-category cursor-pointer"
                                @click="openCategoryModal">
                                <div class="category-square"
                                    style="background-color: white; display: flex; align-items: center; justify-content: center;">
                                    <i class="bi bi-plus" style="color: #3b82f6"></i>
                                </div>
                                <label class="cursor-pointer flex-1 text-center mr-5">Add Tag</label>
                            </div>
                        </div>
                    </div>
                    <div class="col2">
                        <!-- Trip Form -->
                        <form class="row g-3 needs-validation mx-5" @submit.prevent="saveChanges">
                            <div class="col-md-12">
                                <label for="title" class="form-label">Title</label>
                                <input v-model="trip.title" :readonly="!editMode" type="text"
                                    class="form-control form-control-lg" @input="validateForm"
                                    :class="{ 'is-invalid': formSubmitted && titleValid, 'is-invalid': formSubmitted && !titleValid }"
                                    id="title">
                                <div v-if="formSubmitted && !titleValid" class="invalid-format">{{ errorMessage.title }}
                                </div>
                            </div>
                            <div class="col-md-6">
                                <label for="destination" class="form-label">Destination</label>
                                <input v-model="trip.destination" :readonly="!editMode" type="text"
                                    class="form-control form-control-lg" @input="validateForm"
                                    :class="{ 'is-invalid': formSubmitted && destinationValid, 'is-invalid': formSubmitted && !destinationValid }"
                                    id="place">
                                <div v-if="formSubmitted && !destinationValid" class="invalid-format">{{
                                    errorMessage.destination }}</div>
                            </div>
                            <div class="col-md-6">
                                <label for="created_at" class="form-label">Created At</label>
                                <input v-model="trip.created_at" readonly type="text"
                                    class="form-control form-control-lg" id="created_at">
                            </div>
                            <div class="col-md-6">
                                <label for="start_date" class="form-label">Start Date</label>
                                <input v-model="trip.start_date" :readonly="!editMode" type="date"
                                    class="form-control form-control-lg" @input="validateForm"
                                    :class="{ 'is-invalid': formSubmitted && startDateValid, 'is-invalid': formSubmitted && !startDateValid }"
                                    id="start_date">
                            </div>
                            <div class="col-md-6">
                                <label for="end_date" class="form-label">End Date</label>
                                <input v-model="trip.end_date" :readonly="!editMode" type="date"
                                    class="form-control form-control-lg" @input="validateForm"
                                    :class="{ 'is-invalid': formSubmitted && endDateValid, 'is-invalid': formSubmitted && !endDateValid }"
                                    id="end_date">
                            </div>
                            <div v-if="formSubmitted && !startDateValid || formSubmitted && !endDateValid"
                                class="invalid-format">{{ errorMessage.startDate }}</div>
                            <div class="col-md-12">
                                <label for="description" class="form-label">Description</label>
                                <textarea v-model="trip.description" :readonly="!editMode" class="form-control"
                                    id="description" @input="validateForm"
                                    :class="{ 'is-invalid': formSubmitted && descriptionValid, 'is-invalid': formSubmitted && !descriptionValid }"
                                    rows="4"></textarea>
                            </div>
                            <div v-if="formSubmitted && !descriptionValid" class="invalid-format">{{
                                errorMessage.description }}</div>
                            <button v-if="!editMode && isOrganizer" class="ml-2 btn btn-primary col-md-2" type="button"
                                @click="editMode = true">Edit</button>
                            <button v-if="editMode && isOrganizer" class="ml-2 btn btn-primary col-md-2"
                                type="submit">Save</button>
                        </form>
                    </div>
                </div>
            </template>
        </template>

        <!-- Mobile Template -->
        <template v-else>
            <div class="d-flex flex-column " style="width: 100%;">
                <div class="d-flex mobile-tabs " style="justify-content: space-between; padding: 10px;">
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
                        <div class="spinner-border float-right text-primary" role="status">
                            <span class="sr-only">Loading...</span>
                        </div>
                    </div>
                </template>
                <template v-else>
                    <div v-if="trip" class="d-flex flex-column p-4">
                        <img v-if="trip.imageUrl==='/src/assets/defaultImageTrip.jpg'" class="trip-image object-cover object-center mb-4"  :src="defaultImageTrip" alt="Trip Picture">
                        <img v-else class="trip-image object-cover object-center mb-4" :src="trip.imageUrl" alt="Trip Picture">
                        <!-- Categories -->
                        <div class="categories-grid d-flex flex-wrap">
                            <div v-for="(tag, index) in trip.tags" :key="index" class="category-item"
                                :style="{ borderColor: '#000000' }">
                                <!--<div class="category-square" :style="{ backgroundColor: category.color }"></div>-->
                                <label>{{ tag }}</label>
                                <button v-if="isOrganizer" type="button" class="ml-1 bold bi bi-x-lg bi-sm"
                                    style="margin-left:auto" @click="removeTagFromTrip(tag)"></button>
                            </div>
                            <!-- Add Category Button -->
                            <div v-if="isOrganizer" class="category-item add-category cursor-pointer"
                                @click="openCategoryModal">
                                <div class="category-square"
                                    style="background-color: white; display: flex; align-items: center; justify-content: center;">
                                    <i class="bi bi-plus" style="color: #3b82f6"></i>
                                </div>
                                <label class="cursor-pointer flex-1 text-center mr-5">Add Tag</label>
                            </div>
                        </div>
                        <!-- Trip Form -->
                        <form class="row g-3 needs-validation mt-4" @submit.prevent="saveChanges">
                            <div class="col-md-12">
                                <label for="title" class="form-label">Title</label>
                                <input v-model="trip.title" :readonly="!editMode" type="text"
                                    class="form-control form-control-lg" @input="validateForm"
                                    :class="{ 'is-invalid': formSubmitted && titleValid, 'is-invalid': formSubmitted && !titleValid }"
                                    id="title">
                                <div v-if="formSubmitted && !titleValid" class="invalid-format">{{ errorMessage.title }}
                                </div>
                            </div>
                            <div class="col-md-12">
                                <label for="destination" class="form-label">Destination</label>
                                <input v-model="trip.destination" :readonly="!editMode" type="text"
                                    class="form-control form-control-lg" @input="validateForm"
                                    :class="{ 'is-invalid': formSubmitted && destinationValid, 'is-invalid': formSubmitted && !destinationValid }"
                                    id="place">
                                <div v-if="formSubmitted && !destinationValid" class="invalid-format">{{
                                    errorMessage.destination }}</div>
                            </div>
                            <div class="col-md-12">
                                <label for="created_at" class="form-label">Created At</label>
                                <input v-model="trip.created_at" readonly type="text"
                                    class="form-control form-control-lg" id="created_at">
                            </div>
                            <div class="col-md-12">
                                <label for="start_date" class="form-label">Start Date</label>
                                <input v-model="trip.start_date" :readonly="!editMode" type="date"
                                    class="form-control form-control-lg" @input="validateForm"
                                    :class="{ 'is-invalid': formSubmitted && startDateValid, 'is-invalid': formSubmitted && !startDateValid }"
                                    id="start_date">
                            </div>
                            <div class="col-md-12">
                                <label for="end_date" class="form-label">End Date</label>
                                <input v-model="trip.end_date" :readonly="!editMode" type="date"
                                    class="form-control form-control-lg" @input="validateForm"
                                    :class="{ 'is-invalid': formSubmitted && endDateValid, 'is-invalid': formSubmitted && !endDateValid }"
                                    id="end_date">
                            </div>
                            <div v-if="formSubmitted && !startDateValid || formSubmitted && !endDateValid"
                                class="invalid-format">{{ errorMessage.startDate }}</div>
                            <div class="col-md-12">
                                <label for="description" class="form-label">Description</label>
                                <textarea v-model="trip.description" :readonly="!editMode" class="form-control"
                                    id="description" @input="validateForm"
                                    :class="{ 'is-invalid': formSubmitted && descriptionValid, 'is-invalid': formSubmitted && !descriptionValid }"
                                    rows="4"></textarea>
                            </div>
                            <div v-if="formSubmitted && !descriptionValid" class="invalid-format">{{
                                errorMessage.description }}</div>
                            <button v-if="!editMode && isOrganizer" class="ml-2 btn btn-primary col-md-2" type="button"
                                @click="editMode = true">Edit</button>
                            <button v-if="editMode && isOrganizer" class="ml-2 btn btn-primary col-md-2"
                                type="submit">Save</button>
                        </form>
                    </div>
                </template>
            </div>
        </template>
    </div>


    <!-- Categories modal-->
    <div>
        <div class="modal" tabindex="-1" style="display: block" v-if="categoriesModal">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Tags</h5>
                        <button type="button" class="btn-close" @click="closeCategoryModal"></button>
                    </div>
                    <div class="modal-body">
                        <label for="category">Tags</label>
                        <div class="flex items-center space-x-2">
                            <select v-model="selectedCategory" id="category" class="form-select custom-select"
                                @change="addTag" required>
                                <option value="" disabled class="form-control">Select a tag</option>
                                <option v-for="(tag, index) in availableTags" :key="index" :value="tag">{{ tag }}
                                </option>
                            </select>
                            <input v-model="tagManual" class="form-control" placeholder="Insert manually"></input>
                            <button @click="addTagManually" type="button"
                                class="btn w-48 btn-primary shadow rounded">Add
                            </button>
                        </div>

                        <div class="categories-container">
                            <div v-for="(category, index) in selectedCategories" :key="index" class="category-item">
                                <!--<span :style="{ backgroundColor: category.color }" class="category-color"></span>-->
                                <span class="mr-1">{{ category }}</span>
                                <button type="button" class="ml-1 bold bi bi-x-lg bi-sm"
                                    @click="removeCategory(index)"></button>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeCategoryModal">Close</button>
                        <button type="button" class="btn btn-primary" @click="saveNewCategories">Save</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getFirestore, doc, getDoc, updateDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useToast } from "vue-toastification";
import { Loader } from "@googlemaps/js-api-loader"
import defaultImageTrip from '@/assets/defaultImageTrip.jpg';


const router = useRouter();
const auth = getAuth();
const toast = useToast();
const tripId = router.currentRoute.value.params.tripId;
const firestore = getFirestore();
const trip = ref(null);
const currentUserId = ref(null);
const organizerId = ref(null);
const editMode = ref(false);
const place = ref(null);
const events = ref([]);
const loading = ref(true);
const lowestEventDate = ref(null);
const highestEventDate = ref(null);
const autoCompleteLocation = ref(true);
const categories = ref([]);
const availableCategories = ref([]);
const selectedCategories = ref([]);
const categoriesModal = ref(false);
const selectedCategory = ref("");
const tagManual = ref("");
const tags = ref([
    'Adventure', 'Culture', 'Nature', 'Beach', 'Romance', 'Urban', 'Family', 'Friends', 'Group',
    'Mountain', 'Desert', 'Countryside', 'Island', 'City', 'Museum', 'Park', 'Zoo',
    'Aquarium', 'Theater', 'Cinema', 'Shopping', 'Restaurant', 'Bar', 'Cafe', 'Hotel',
    'Camping', 'Resort', 'Spa', 'Photography'
]);
const availableTags = ref([]);
const isMobileView = ref(window.innerWidth <= 768);

onMounted(async () => {
    getTrip();

    auth.onAuthStateChanged(user => {
        if (user) {
            currentUserId.value = user.uid;
            console.log('Logged in user ID:', currentUserId);
        } else {
            currentUserId.value = null;
        }
    });

    getEvents();
});

const formatted_date = (date) => {
    //datas ao contrario
    return new Date(date).toLocaleDateString('pt-PT', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    });
};

const saveChanges = async () => {
    formSubmitted.value = true;
    if (!validateForm()) {
        return;
    }

    try {
        const tripDoc = doc(firestore, 'trips', tripId);
        const tripData = {
            title: trip.value.title,
            destination: trip.value.destination,
            start_date: trip.value.start_date,
            end_date: trip.value.end_date,
            description: trip.value.description,
            center: trip.value.center,
        }
        await updateDoc(tripDoc, tripData);
        editMode.value = false;
        getTrip();
        toast.success("Trip updated successfully");
    } catch (error) {
        console.error('Error updating trip document:', error);
    }
};

const addTag = () => {
    console.log('tag', selectedCategory.value);
    availableTags.value = availableTags.value.filter((tag) => tag !== selectedCategory.value);
    selectedCategories.value.push(selectedCategory.value);
    selectedCategory.value = "";
};

const getTrip = async () => {
    try {
        const tripDoc = doc(firestore, 'trips', tripId);
        const tripSnapshot = await getDoc(tripDoc);
        if (tripSnapshot.exists()) {

            loading.value = false;
            trip.value = tripSnapshot.data();
            organizerId.value = trip.value.organizer;
            trip.value.created_at = formatted_date(trip.value.created_at);
            availableTags.value = tags.value.filter(tag => !trip.value.tags.includes(tag));
            //trip.value.start_date = formatted_date(trip.value.start_date);
            //trip.value.end_date   = formatted_date(trip.value.end_date);
        } else {
            console.error('Trip document does not exist');
        }
    } catch (error) {
        console.error('Error retrieving trip document:', error);
    }
    //getCategories();
}

const addTagManually = () => {
    if (tagManual.value !== "") {
        tags.value.push(tagManual.value);
        selectedCategories.value.push(tagManual.value);
        if (availableTags.value.includes(tagManual.value)) {
            availableTags.value = availableTags.value.filter((tag) => tag !== tagManual.value);
        }
        tagManual.value = "";
    }
};

const getEvents = async () => {
    try {
        const eventsCollection = collection(firestore, 'events');
        const eventsSnapshot = await getDocs(query(eventsCollection, where('tripId', '==', tripId)));
        events.value = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (events.value.length > 0) {
            lowestEventDate.value = events.value.reduce((prev, current) =>
                convertTimestampToDate(prev.start) < convertTimestampToDate(current.start) ? prev : current
            )

            console.log('Lowest Event Date:', lowestEventDate.value);

            highestEventDate.value = events.value.reduce((prev, current) =>
                convertTimestampToDate(prev.start) > convertTimestampToDate(current.start) ? prev : current
            )
            console.log('Highest Event Date:', highestEventDate.value);
        }

        //console.log('Events:', events.value);
    } catch (error) {
        console.error('Error retrieving events:', error);
    }

};

async function getCategories() {
    categories.value = [];
    const querySnapshot = await getDocs(query(collection(firestore, 'categories'), where('userId', '==', organizerId.value)));
    querySnapshot.forEach((doc) => {
        categories.value.push({ uid: doc.id, ...doc.data() });
    });

    const tripCategoryNames = trip.value.categories.map(cat => cat.name)
    availableCategories.value = categories.value.filter(category => !tripCategoryNames.includes(category.name));
    console.log('Categories:', availableCategories.value);
}



const convertTimestampToDate = (timestamp) => {
    return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000)
}


const formatDate = (data) => {
    const date = convertTimestampToDate(data)
    return date.toLocaleString()
}

watch(editMode, async (value) => {
    if (editMode.value === true) {
        const loader = new Loader({
            apiKey: import.meta.env.API_KEY,
            version: "weekly",

        });
        const Places = await loader.importLibrary('places')


        // the center, defaultbounds are not necessary but are best practices to limit/focus search results
        const center = { lat: 34.082298, lng: -82.284777 };
        // Create a bounding box with sides ~10km away from the center point
        const defaultBounds = {
            north: center.lat + 0.1,
            south: center.lat - 0.1,
            east: center.lng + 0.1,
            west: center.lng - 0.1,
        };

        //this const will be the first arg for the new instance of the Places API

        const input = document.getElementById("place"); //binds to our input element
        console.log('input', input);


        //this object will be our second arg for the new instance of the Places API
        const options = {
            fields: ["address_components", "geometry", "icon", "name", "formatted_address"], //allows the api to accept these inputs and return similar ones
            strictBounds: false, //optional
        };

        // per the Google docs create the new instance of the import above. I named it Places.
        const autocomplete = new Places.Autocomplete(input, options);


        //add the place_changed listener to display results when inputs change
        autocomplete.addListener('place_changed', () => {
            place.value = autocomplete.getPlace(); //this callback is inherent you will see it if you logged autocomplete
            autoCompleteLocation.value = true;
            console.log('place', place.value);
            trip.value.destination = place.value.formatted_address;
            trip.value.center = place.value.geometry.location.toJSON();
        });
    }
});




//VALIDATION FOR FORMS
const formSubmitted = ref(false);
const titleValid = ref(false);
const destinationValid = ref(false);
const startDateValid = ref(false);
const endDateValid = ref(false);
const descriptionValid = ref(false);

const errorMessage = ({
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    description: '',
});


const validateForm = () => {

    errorMessage.title = '';
    errorMessage.destination = '';
    errorMessage.startDate = '';
    errorMessage.endDate = '';
    errorMessage.description = '';

    titleValid.value = true;
    destinationValid.value = true;
    startDateValid.value = true;
    endDateValid.value = true;
    descriptionValid.value = true;

    if (!trip.value.title) {
        errorMessage.title = 'Title is required';
        titleValid.value = false;
    } else if (trip.value.title.length < 3) {
        errorMessage.title = 'Title must be at least 3 characters';
        titleValid.value = false;
    } else if (trip.value.title.length > 32) {
        errorMessage.title = 'Title must be less than 32 characters';
        titleValid.value = false;
    }

    if (!trip.value.destination) {
        errorMessage.destination = 'Destination is required';
        destinationValid.value = false;
    } else if (trip.value.destination.length < 3) {
        errorMessage.destination = 'Destination must be at least 3 characters';
        destinationValid.value = false;
    } else if (trip.value.destination.length > 16) {
        errorMessage.destination = 'Destination must be less than 16 characters';
        destinationValid.value = false;
    } else if (autoCompleteLocation.value === false) {
        errorMessage.destination = 'Please select a location from the dropdown';
        destinationValid.value = false;
    }

    if (!trip.value.start_date) {
        errorMessage.startDate = 'Start Date is required';
        startDateValid.value = false;
    } else if (events.value.length > 0) {
        if (formatted_date(trip.value.start_date) > formatDate(lowestEventDate.value.start).slice(0, 10)) {
            errorMessage.startDate = `Event created with date ${formatDate(lowestEventDate.value.start).slice(0, 10)}`;
            startDateValid.value = false;
        }
    }

    if (!trip.value.end_date) {
        errorMessage.startDate = 'End Date is required';
        endDateValid.value = false;
    } else if (trip.value.start_date > trip.value.end_date) {
        errorMessage.startDate = 'End Date must be after Start Date';
        endDateValid.value = false;
    } else if (events.value.length > 0) {
        if (formatted_date(trip.value.end_date) < formatDate(highestEventDate.value.start)) {
            console.log(trip.value.end_date)
            if (!(formatDate(highestEventDate.value.start).slice(0, 10) === formatted_date(trip.value.end_date))) {
                errorMessage.startDate = 'Event created with date ' + formatDate(highestEventDate.value.start).slice(0, 10);
                endDateValid.value = false;
            }
        }

    }


    if (!trip.value.description) {
        errorMessage.description = 'Description is required';
        descriptionValid.value = false;
    } else if (trip.value.description.length < 3) {
        errorMessage.description = 'Description must be at least 3 characters';
        descriptionValid.value = false;
    } else if (trip.value.description.length > 50) {
        errorMessage.description = 'Description must be less than 50 characters';
        descriptionValid.value = false;
    }

    if (!titleValid.value || !destinationValid.value || !startDateValid.value || !endDateValid.value || !descriptionValid.value) {
        formSubmitted.value = true;
        return false;
    }

    return true;
};



const isOrganizer = computed(() => {
    return currentUserId.value === organizerId.value;
});

//categories

const openCategoryModal = () => {
    categoriesModal.value = true;
};


const addCategory = () => {
    if (selectedCategory.value) {
        selectedCategories.value.push(selectedCategory.value);
        availableCategories.value = availableCategories.value.filter(category => category !== selectedCategory.value);
        selectedCategory.value = "";
    }
};


const removeCategory = (index) => {
    availableCategories.value.push(selectedCategories.value[index]);
    selectedCategories.value.splice(index, 1);
};

const removeCatFromTrip = async (category) => {
    console.log(category);

    //fazer verificação dos eventos se tem a categoria
    if (events.value.some(event => event.calendarId.toLowerCase() === category.name.toLowerCase())) {
        toast.error("Category is being used in an event, cannot be removed");
        return;
    }
    else {

        try {
            const tripDoc = doc(firestore, 'trips', tripId);

            const tripData = {
                categories: trip.value.categories.filter(cat => cat.name !== category.name),
            }
            await updateDoc(tripDoc, tripData);
            trip.value.categories = trip.value.categories.filter(cat => cat.name !== category.name);
            toast.success("Category removed successfully");
        } catch (error) {
            console.error('Error updating category document:', error);
        }
    }

};

const removeTagFromTrip = async (tag) => {
    try {
        const tripDoc = doc(firestore, 'trips', tripId);

        const tripData = {
            tags: trip.value.tags.filter(t => t !== tag),
        }
        await updateDoc(tripDoc, tripData);
        trip.value.tags = trip.value.tags.filter(t => t !== tag);
        toast.success("Tag removed successfully");
    } catch (error) {
        console.error('Error updating tag document:', error);
    }
};


const closeCategoryModal = () => {
    categoriesModal.value = false;
    selectedCategory.value = "";
    availableCategories.value = tags.value.filter(tag => !trip.value.tags.includes(tag));
    console.log('selectedCategories', selectedCategories.value);
    selectedCategories.value = [];
};

const saveNewCategories = async () => {
    trip.value.tags = [...trip.value.tags, ...selectedCategories.value];

    try {
        const tripDoc = doc(firestore, 'trips', tripId);
        const tripData = {
            tags: trip.value.tags,
        }
        await updateDoc(tripDoc, tripData);
        //getTrip();
        closeCategoryModal();
        toast.success("Tags updated successfully");
    } catch (error) {
        console.error('Error updating category document:', error);
    }


};


const tabTripEvents = (tripId) => {
    router.push(`/trips/${tripId}`);
};

const tabTripMembers = (tripId) => {
    router.push(`/trips/${tripId}/members`);
};

const tabTripMedia = (tripId) => {
    router.push(`/trips/${tripId}/media`);
};

const tabTripReviews = (tripId) => {
    router.push(`/trips/${tripId}/reviews`);
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

.col {
    flex: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.col2 {
    flex: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 10px;
}

.categories-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    width: 100%;
    margin-top: 16px;
}

.category-item {
    display: flex;
    align-items: center;
    padding: 8px;
    border: 2px solid;
    border-radius: 8px;
    box-sizing: border-box;
    margin-right: 6px;
}

.category-item.add-category {
    justify-content: center;
    font-weight: bold;
    color: white;
    background-color: #3b82f6;
}

.category-square {
    width: 20px;
    height: 20px;
    margin-right: 8px;
    border-radius: 4px;
}

.trip-image {
    border-radius: 10px;
    width: 85vh;
    height: 30vh;
}

.invalid-format {
    display: block;
    width: 100%;
    margin-top: 0.25rem;
    font-size: 80%;
    color: #dc3545;
    /* Cor vermelha */
}

label {
    font-weight: bold;
}

.categories-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
}

.category-item {
    display: flex;
    align-items: center;
    border: 1px solid #cccccc;
    border-radius: 4px;
    padding: 4px 8px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.category-color {
    border-radius: 50%;
    height: 12px;
    width: 12px;
    margin-right: 8px;
}

.mobile-profile-btns {
    flex: 1;
    text-align: center;
    margin: 0 5px;
}
</style>
