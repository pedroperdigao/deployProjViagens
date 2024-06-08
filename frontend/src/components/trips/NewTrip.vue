<template>
  <div class="container-full p-12">
    <form class="row g-4 needs-validation" @submit.prevent="createTrip" novalidate>
      <!-- Title Field -->
      <div class="col-md-6 px-2">
        <label for="title" class="form-label">Title <span class="text-danger">*</span></label>
        <input v-model="title" type="text" class="form-control" id="title" placeholder="Title"
          :class="{ 'is-valid': titleValid && formSubmitted, 'is-invalid': !titleValid && formSubmitted }"
          @input="validateForm" required>
        <div class="valid-feedback">Looks good!</div>
        <div class="invalid-feedback">{{ errorMessage.title }}</div>
      </div>
      <!-- Destination -->
      <div class="col-md-6 px-2">
        <label for="destination">Where to? <span class="text-danger">*</span></label>
        <input id="place" v-model="destination" class="form-control" type="text" placeholder="Destination"
          :class="{ 'is-valid': destinationValid && formSubmitted, 'is-invalid': !destinationValid && formSubmitted }"
          @input="validateForm" required>
        <div class="valid-feedback">Looks good!</div>
        <div class="invalid-feedback">{{ errorMessage.destination }}</div>
      </div>
      <!-- Start and End Date -->
      <div class="col-md-6 px-2">
        <label for="start-date">Start Date <span class="text-danger">*</span></label>
        <input v-model="start_date" class="form-control" id="start-date" type="date"
          :class="{ 'is-valid': startDateValid && formSubmitted, 'is-invalid': !startDateValid && formSubmitted }"
          @input="validateForm" required>
        <div class="valid-feedback">Looks good!</div>
        <div class="invalid-feedback">{{ errorMessage.start_date }}</div>
      </div>
      <div class="col-md-6 px-2">
        <label for="end-date">End Date <span class="text-danger">*</span></label>
        <input v-model="end_date" class="form-control" id="end-date" type="date"
          :class="{ 'is-valid': endDateValid && formSubmitted, 'is-invalid': !endDateValid && formSubmitted }"
          @input="validateForm" required>
        <div class="valid-feedback">Looks good!</div>
        <div class="invalid-feedback">{{ errorMessage.end_date }}</div>
      </div>
      <!-- Image Upload Field -->
      <div class="col-md-6 px-2">
        <label for="image">Upload Image <span class="text-danger">*</span></label>
        <input @change="onImageChange" class="form-control" id="image" type="file" accept="image/*"
          :class="{ 'is-valid': imageValid && formSubmitted, 'is-invalid': !imageValid && formSubmitted }"
          @input="validateForm" required>
        <div class="valid-feedback">Looks good!</div>
        <div class="invalid-feedback">{{ errorMessage.image }}</div>
      </div>
      <!-- Category Picker -->
      <div class="col-md-6 px-2">
        <label for="category">Category <span class="text-danger">*</span></label>
        <div class="flex items-center space-x-2">
          <select v-model="selectedCategory" id="category" class="form-select custom-select"
          :class="{ 'is-valid': categoriesValid && formSubmitted, 'is-invalid': !categoriesValid && formSubmitted }"
          @change="validateForm" required>
            <option value="" disabled class="form-control">Select a category</option>
            <option v-for="(category, index) in categories" :key="index" :value="category">{{ category.name }}</option>
          </select>
          <button @click="addCategory" type="button" class="btn w-48 btn-primary shadow rounded">Add Category</button>
        </div>

        <div class="categories-container">
          <div v-for="(category, index) in selectedCategories" :key="index" class="category-item">
            <span :style="{ backgroundColor: category.color }" class="category-color"></span>
            <span class="mr-1">{{ category.name }}</span>
            <button type="button" class="ml-1 bold bi bi-x-lg bi-sm" @click="removeCategory(index)"></button>
          </div>
          <div v-if="!categoriesValid && formSubmitted" class="invalid-format">{{ errorMessage.categories }}</div>
        </div>
      </div>
      <!-- Description -->
      <div class="col-md-12">
        <label for="description">Description <span class="text-danger">*</span></label>
        <textarea v-model="description" id="description" rows="4" class="form-control" placeholder="Description"
          :class="{ 'is-valid': descriptionValid && formSubmitted, 'is-invalid': !descriptionValid && formSubmitted }"
          @input="validateForm" required />
        <div class="valid-feedback">Looks good!</div>
        <div class="invalid-feedback">{{ errorMessage.description }}</div>
      </div>
      <!-- Submit Button -->
      <div class="flex justify-center mt-6">
        <button class="btn btn-primary shadow rounded" type="submit">Start Planning</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { Loader } from "@googlemaps/js-api-loader"
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc, doc, getDoc, getDocs, query, where, } from "firebase/firestore";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, } from "firebase/storage";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";

const firestore = getFirestore();
const storage = getStorage();
const router = useRouter();
const auth = getAuth();
const toast = useToast();

const destination = ref("");
const start_date = ref("");
const end_date = ref("");
const title = ref("");
const description = ref("");
const categories = ref([]);
const selectedCategory = ref("");
const currentUser = ref(null);
const selectedCategories = ref([]);
const centerMap = ref();
const place = ref();
let image = null;

const formSubmitted = ref(false);
const titleValid = ref(false);
const destinationValid = ref(false);
const startDateValid = ref(false);
const endDateValid = ref(false);
const imageValid = ref(false);
const categoriesValid = ref(false);
const descriptionValid = ref(false);

const errorMessage = ({
  title: '',
  destination: '',
  start_date: '',
  end_date: '',
  image: '',
  categories: '',
  description: '',
});

const validateForm = () => {
  errorMessage.title = '';
  errorMessage.destination = '';
  errorMessage.start_date = '';
  errorMessage.end_date = '';
  errorMessage.image = '';
  errorMessage.categories = '';
  errorMessage.description = '';

  titleValid.value = true;
  destinationValid.value = true;
  startDateValid.value = true;
  endDateValid.value = true;
  imageValid.value = true;
  categoriesValid.value = true;
  descriptionValid.value = true;

  // Validate Title
  if (title.value.trim() === "") {
    titleValid.value = false;
    errorMessage.title = "Title is required.";
  } else if (title.value.length < 3) {
    titleValid.value = false;
    errorMessage.title = "Title must be at least 5 characters long.";
  }

  // Validate Destination
  if (destination.value.trim() === "") {
    destinationValid.value = false;
    errorMessage.destination = "Destination is required.";
  } else if (!place.value) {
    destinationValid.value = false;
    errorMessage.destination = "Please select a valid destination.";
  }

  // Validate Start Date
  if (start_date.value.trim() === "") {
    startDateValid.value = false;
    errorMessage.start_date = "Start date is required.";
  }

  // Validate End Date
  if (end_date.value.trim() === "") {
    endDateValid.value = false;
    errorMessage.end_date = "End Date is required.";
  } else if (new Date(end_date.value) < new Date(start_date.value)) {
    endDateValid.value = false;
    errorMessage.end_date = "End date must be later than the start date.";
  }

  // Validate Image
  if (!image) {
    imageValid.value = false;
    errorMessage.image = "Image is required.";
  }

  // Validate Categories
  if (selectedCategories.value.length === 0) {
    categoriesValid.value = false;
    errorMessage.categories = "At least one category is required.";
  } else {
    categoriesValid.value = true;
  }

  // Validate Description
  if (description.value.trim() === "") {
    descriptionValid.value = false;
    errorMessage.description = "Description is required.";
  }

  if (!titleValid.value || !destinationValid.value || !startDateValid.value || !endDateValid.value ||
    !imageValid.value || !categoriesValid.value || !descriptionValid.value) {
    return false;
  }

  return true;
}

const createTrip = async () => {
  formSubmitted.value = true;
  if (!validateForm()) {
    toast.error('Please check for any validation errors');
    return;
  }

  // Default image URL
  let defaultImageUrl = "/src/assets/trip.png";
  let imageUrl = defaultImageUrl; // Initialize imageUrl with default image URL

  // Upload image to storage if it exists
  if (image) {
    const tripImageRef = storageRef(
      storage,
      `trips/${new Date().getTime()}/image/${image.name}`
    );
    await uploadBytes(tripImageRef, image);
    imageUrl = await getDownloadURL(tripImageRef);
  }

  // Add trip data to Firestore
  await addDoc(collection(firestore, "trips"), {
    title: title.value,
    description: description.value,
    destination: destination.value,
    start_date: start_date.value,
    end_date: end_date.value,
    imageUrl: imageUrl,
    organizer: auth.currentUser.uid,
    members: [auth.currentUser.uid],
    invites: [],
    categories: selectedCategories.value,
    center: centerMap.value,
    created_at: new Date().toISOString(),
    state: "in progress",
  });

  // Redirect to the trips page
  router.push({ path: "/trips" });
  toast.success("Trip created successfully!");

  // Reset form fields
  destination.value = "";
  start_date.value = "";
  end_date.value = "";
  image = null;
};

const onImageChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    image = file;
    imageValid.value = true;
  }
};

// Função para adicionar uma nova categoria
const addCategory = () => {
  if (selectedCategory.value) {
    selectedCategories.value.push(selectedCategory.value);
    selectedCategory.value = "";
  } else {
    categoriesValid.value = false;
    errorMessage.categories = "Please select a category.";
  }

  categories.value = categories.value.filter((category) => {
    return !selectedCategories.value.some(
      (selectedCategory) => selectedCategory.uid === category.uid
    );
  });
};

const removeCategory = (index) => {
  categories.value.push(selectedCategories.value[index]);
  selectedCategories.value.splice(index, 1);
};

async function getCategories() {
  categories.value = [];
  const querySnapshot = await getDocs(
    query(
      collection(firestore, "categories"),
      where("userId", "==", currentUser.value.uid)
    )
  );
  querySnapshot.forEach((doc) => {
    categories.value.push({ uid: doc.id, ...doc.data() });
  });

}

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);
      try {
        const userDocSnapshot = await getDoc(userDocRef);
        if (userDocSnapshot.exists()) {
          // Set the currentUser value with the data from Firestore
          currentUser.value = { uid: user.uid, ...userDocSnapshot.data() };
          getCategories();
        } else {
          console.error("User document does not exist");
        }
      } catch (error) {
        console.error("Error retrieving user document:", error);
      }
    } else {
      //console.error('User is not logged in');
    }
  });
});

//autocomplete code
onMounted(async () => {

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
    console.log('place', place.value);
    destination.value = place.value.formatted_address;
    centerMap.value = place.value.geometry.location.toJSON();
  });

});
</script>

<style scoped>
* {
  color: rgb(55 65 81);
}

.container-full {
  background-color: white;
  background-size: cover;
  background-position: center;
  border-radius: 20px;
  min-height: 70vh;
  margin-top: 10px;
}

label {
  font-weight: bold;
  margin-bottom: 5px;
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

.invalid-format {
  width: 100%;
  font-size: 90%;
  color: #dc3545; /* Cor vermelha */
}
</style>
