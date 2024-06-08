<template>
    <div class="container-full">
        <div class="d-flex" style="width: 100%; justify-content: space-between">
            <button class="profile-btns" style="border-bottom: 1px solid #c9c9c9; margin-top: 20px;padding-bottom: 20px"
                @click="viewProfile"><i class="bi bi-person-fill mx-2"></i>Profile</button>
            <button class="profile-btns"
                style="border-bottom: 2px solid #3b82f6; margin-top: 20px;padding-bottom: 20px; color:#3b82f6"
                @click="editProfile"><i class="bi bi-person-fill-gear mx-2"></i>Edit Profile</button>
            <button class="profile-btns"
                style="border-bottom: 1px solid #c9c9c9; margin-top: 20px;padding-bottom: 20px;"
                @click="phoneVerification"><i class="bi bi-eye mx-2"></i>Phone Verification</button>
            <button class="profile-btns"
                style="border-bottom: 1px solid #c9c9c9; margin-top: 20px;padding-bottom: 20px;"
                @click="resetPassword"><i class="bi bi-key-fill mx-2"></i>Reset Password</button>
            <button class="profile-btns"
                style="border-bottom: 1px solid #c9c9c9; margin-top: 20px;padding-bottom: 20px;" @click="activityLog"><i
                    class="bi bi-eye mx-2"></i>Activity Log</button>
        </div>
        <div class="edit-profile d-flex justify-content-center mt-12 mx-20" style="width: 90%">
            <!-- Left side - Profile Card -->
            <div class="mr-20">
                <input type="file" ref="fileInput" style="display: none" @change="handleFileInput">
                <p class="mb-2 font-semibold" style="color: #465666;">Upload Profile Picture</p>
                <div ref="dropArea" class="image-box cursor-pointer" @dragover.prevent @drop="handleDrop"
                    @click="handleButtonClick">
                    <div v-if="!image" class="text-box text-center mt-10">
                        <i class="bi bi-cloud-upload" style="color:#3b82f6; font-size: 5vh;"></i>
                        <p class="font-semibold m-1" style="color:#465666">Drag and drop image here</p>
                        <p class="m-1">or</p>
                        <button class="shadow py-2 px-3 font-semibold rounded-full mt-2" type="button"
                            style="background-color:#3b82f6; color:white; font-size: 14px;">Browse Image</button>
                    </div>
                    <img v-else :src="image" alt="Uploaded Image"
                        style="width: 100%; height: 100%; object-fit: cover; border-radius: 10px">
                </div>
            </div>
            <!-- Profile information -->
            <form class="row g-3 needs-validation" @submit.prevent="saveChanges" novalidate>
                <div class="col-md-6">
                    <label for="firstName" class="form-label">First Name <span class="text-danger">*</span></label>
                    <input v-model="firstName" type="text" class="form-control" id="firstName" placeholder="First Name"
                        :class="{ 'is-valid': firstNameValid && formSubmitted, 'is-invalid': !firstNameValid && formSubmitted }"
                        @input="validateForm" required>
                    <div class="valid-feedback">Looks good!</div>
                    <div class="invalid-feedback">{{ errorMessage.firstName }}</div>
                </div>
                <div class="col-md-6">
                    <label for="lastName" class="form-label">Last Name</label>
                    <input v-model="lastName" type="text" class="form-control" id="lastName" placeholder="Last Name"
                        :class="{ 'is-valid': lastNameValid && formSubmitted && lastName.trim() !== '', 'is-invalid': !lastNameValid && formSubmitted && lastName.trim() !== '' }"
                        @input="validateForm">
                    <div v-if="lastName.trim() !== '' && lastNameValid" class="valid-feedback">Looks good!</div>
                    <div v-if="lastName.trim() !== '' && !lastNameValid" class="invalid-feedback">
                        {{ errorMessage.lastName }}</div>
                </div>
                <div class="col-md-6">
                    <label for="username" class="form-label">Username <span class="text-danger">*</span></label>
                    <input v-model="username" type="text" class="form-control" id="username" placeholder="Username"
                        :class="{ 'is-valid': usernameValid && formSubmitted, 'is-invalid': !usernameValid && formSubmitted }"
                        @input="validateForm" required>
                    <div class="valid-feedback">Looks good!</div>
                    <div class="invalid-feedback">{{ errorMessage.username }}</div>
                </div>
                <div class="col-md-6">
                    <label for="phoneNumber" class="form-label">Phone Number</label>
                    <input v-model="phoneNumber" type="text" class="form-control" id="phoneNumber"
                        placeholder="Phone Number"
                        :class="{ 'is-valid': phoneNumberValid && formSubmitted && phoneNumber.trim() !== '', 'is-invalid': !phoneNumberValid && formSubmitted && phoneNumber.trim() !== '' }"
                        @input="validateForm">
                    <div v-if="phoneNumber.trim() !== '' && phoneNumberValid" class="valid-feedback">Looks good!</div>
                    <div v-if="phoneNumber.trim() !== '' && !phoneNumberValid" class="invalid-feedback">
                        {{ errorMessage.phoneNumber }}</div>
                </div>
                
                
                <div class="col-md-6">
                    <label for="inputState" class="form-label">Country <span class="text-danger">*</span></label>
                    <input v-model="searchQueryCountry" @input="handleInput"
                        @click="showResults = filteredCountries.length > 0" type="text" placeholder="Your country"
                        class="form-control " id="country"
                        :class="{ 'is-valid': countryValid && formSubmitted, 'is-invalid': !countryValid && formSubmitted }"
                        required>
                    <div style="width: 15%" v-show="showResults" class="autocomplete-results"
                        :class="{ show: showResults }">
                        <div v-for="country in filteredCountries" :key="country.name"
                            @click="selectCountry(country.name)" class="result-item">
                            {{ country.flag }} {{ country.name }}
                        </div>
                    </div>
                    <div class="valid-feedback">Looks good!</div>
                    <div class="invalid-feedback">{{ errorMessage.country }}</div>
                </div>

                <div class="col-md-12">
                    <fieldset disabled>
                        <label for="inputAddress" class="form-label">Email</label>
                        <input type="email" class="form-control" v-model="email">
                    </fieldset>
                </div>
                <div>
                    <button type="button" class="btn btn-secondary shadow rounded signup-button"
                        @click.prevent="cancelChanges">Cancel</button>
                    <button type="submit" class="btn btn-primary shadow rounded signup-button mx-1">Save
                        Changes</button>
                </div>
            </form>
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
const firstName = ref("");
const lastName = ref("");
const username = ref("");
const phoneNumber = ref("");
const email = ref("");
const searchQueryCountry = ref('');

const formSubmitted = ref(false);
const firstNameValid = ref(false);
const lastNameValid = ref(true);
const usernameValid = ref(false);
const phoneNumberValid = ref(true);
const countryValid = ref(false);

const errorMessage = ({
    firstName: '',
    lastName: '',
    username: '',
    country: '',
    phoneNumber: ''
});

const image = ref(null);
const fileInput = ref(null);
let uploadedFile = null;
let storageReference; // Declared storageReference

const validateForm = () => {
    errorMessage.firstName = '';
    errorMessage.lastName = '';
    errorMessage.username = '';
    errorMessage.phoneNumber = '';
    errorMessage.country = '';

    firstNameValid.value = true;
    lastNameValid.value = true;
    usernameValid.value = true;
    phoneNumberValid.value = true;
    countryValid.value = true;

    // Validate First Name
    if (firstName.value.trim() === '') {
        firstNameValid.value = false;
        errorMessage.firstName = 'First name is required.';
    } else if (!/^[a-zA-Z]+$/.test(firstName.value.trim())) {
        firstNameValid.value = false;
        errorMessage.firstName = 'First name must contain only letters.';
    } else if (firstName.value.trim().length < 3) {
        firstNameValid.value = false;
        errorMessage.firstName = 'First name must be at least 3 characters.';
    } else if (firstName.value.trim().length > 12) {
        firstNameValid.value = false;
        errorMessage.firstName = 'First name must be at most 12 characters.';
    }

    // Validate Last Name
    if (lastName.value.trim() === '') {
        lastNameValid.value = true;
    }
    else if (lastName.value.trim().length > 0 && !/^[a-zA-Z]+$/.test(lastName.value.trim())) {
        lastNameValid.value = false;
        errorMessage.lastName = 'Last name must contain only letters.';
    } else if (lastName.value.trim().length < 3) {
        lastNameValid.value = false;
        errorMessage.lastName = 'Last name must be at least 3 characters.';
    } else if (lastName.value.trim().length > 12) {
        lastNameValid.value = false;
        errorMessage.lastName = 'Last name must be at most 12 characters.';
    }

    // Validate Username
    if (username.value.trim() === '') {
        usernameValid.value = false;
        errorMessage.username = 'Username is required.';
    } else if (username.value.trim().length < 3) {
        usernameValid.value = false;
        errorMessage.username = 'Username must be at least 3 characters.';
    } else if (username.value.trim().length > 16) {
        usernameValid.value = false;
        errorMessage.username = 'Username must be at most 16 characters.';
    }

    // Validate Phone Number (Optional)
    if (phoneNumber.value.trim() === '') {
        phoneNumberValid.value = true;
    }
    else if (phoneNumber.value.trim().length > 0 && !/^[9]/.test(phoneNumber.value.trim())) {
        phoneNumberValid.value = false;
        errorMessage.phoneNumber = 'Phone number must start with 9.';
    } else if (!/^\d{9}$/.test(phoneNumber.value.trim())) {
        phoneNumberValid.value = false;
        errorMessage.phoneNumber = 'Please enter a valid 9-digit phone number.';
    } else {
        phoneNumberValid.value = true;
        errorMessage.phoneNumber = '';
    }

    // Validate Country
    const selectedCountry = searchQueryCountry.value.trim();
    if (searchQueryCountry.value.trim() === '') {
        countryValid.value = false;
        errorMessage.country = 'Please select a country.';
    } else {
        // Check if the selected country exists in the list of countries
        const countryExists = countries.value.some(country => country.name.toLowerCase() === selectedCountry.toLowerCase());
        if (!countryExists) {
            countryValid.value = false;
            errorMessage.country = 'Please select a valid country.';
        } else {
            countryValid.value = true;
            errorMessage.country = '';
        }
    }

    if (!firstNameValid.value || !lastNameValid.value || !usernameValid.value || !phoneNumberValid.value || !countryValid.value) {
        return false;
    }

    return true;
}

const handleButtonClick = () => {
    fileInput.value.click();
};

const handleFileInput = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
        image.value = reader.result;
        uploadedFile = file;
    };

    reader.readAsDataURL(file);
    console.log('File uploaded:', fileInput.value.files[0]);
};

const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    const reader = new FileReader();

    reader.onload = () => {
        image.value = reader.result;
        uploadedFile = file;
    };

    reader.readAsDataURL(file);
    console.log('File uploaded:', file);
};

const handleFileUpload = async (file) => {
    const userId = currentUser.value.uid;

    try {
        // Create a reference to the desired path in Firebase Storage
        const fileRef = storageRef(storage, `users/${userId}/profilePicture/${file.name}`);

        // Upload the file to Firebase Storage
        await uploadBytes(fileRef, file);

        // Get the download URL of the uploaded file
        const imageUrl = await getDownloadURL(fileRef);

        // Update the user document in Firestore with the download URL
        const userDocRef = doc(firestore, 'users', userId);
        await updateDoc(userDocRef, { photoURL: imageUrl });
        console.log('Profile picture updated successfully');

        // Update currentUser with the new photo URL
        currentUser.value.photoURL = imageUrl; // Update the photoURL property of currentUser

    } catch (error) {
        console.error('Error uploading profile picture:', error);
    }
};

const saveChanges = async () => {
    formSubmitted.value = true;
    if (!validateForm()) {
        toast.error('Please check for any validation errors');
        return;
    }

    const userId = currentUser.value.uid;
    const userDocRef = doc(firestore, 'users', userId);
    try {
        const updatedData = {
            firstName: firstName.value,
            lastName: lastName.value || '', // Ensure that lastName is not null
            username: username.value,
            phoneNumber: phoneNumber.value || '', // Ensure that phoneNumber is not null
            email: email.value,
            country: searchQueryCountry.value,
        };

        // If there is an image, upload it to Firestore
        if (uploadedFile) {
            await handleFileUpload(uploadedFile);
            // Add the photoURL to updatedData
            updatedData.photoURL = currentUser.value.photoURL;
        }

        console.log('Updating user data:', updatedData);
        await updateDoc(userDocRef, updatedData);
        console.log('Changes saved successfully');
        // Redirect to profile view
        router.push("/profile");
        toast.success("Profile updated successfully");
    } catch (error) {
        console.error('Error saving changes:', error);
        toast.error("Error. Unable to update profile");
    }
};

const countries = ref([]);
const showResults = ref(false);
const filteredCountries = ref([]);

const getAllCountries = async () => {
    try {
        const response = await fetch('https://restcountries.com/v3.1/all');
        const countriesData = await response.json();

        countries.value = countriesData.map((country) => {
            const { name, flag } = country;
            return {
                name: name.common,
                flag: flag,
            };
        });

        console.log('Countries:', countries.value);
    } catch (error) {
        console.error('Erro ao buscar países:', error);
    }
};

const selectCountry = (country) => {
    searchQueryCountry.value = country;
    showResults.value = false;
};

onMounted(() => {
    getAllCountries();
    
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDocRef = doc(firestore, 'users', user.uid);
            try {
                const userDocSnapshot = await getDoc(userDocRef);
                if (userDocSnapshot.exists()) {
                    // Set the currentUser value with the data from Firestore
                    currentUser.value = { uid: user.uid, ...userDocSnapshot.data() };
                    // Set initial values for editing
                    firstName.value = currentUser.value.firstName;
                    lastName.value = currentUser.value.lastName;
                    username.value = currentUser.value.username;
                    phoneNumber.value = currentUser.value.phoneNumber
                    email.value = currentUser.value.email
                    searchQueryCountry.value = currentUser.value.country;
                } else {
                    console.error('User document does not exist');
                }
            } catch (error) {
                console.error('Error retrieving user document:', error);
            }
        } else {
            //console.error('User is not logged in');
        }
    });

    storageReference = storageRef(storage, ''); // Initialize storageReference after storage is available
});

const viewProfile = () => {
    router.push("/profile");
};

const cancelChanges = () => {
    router.push("/profile");
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

.edit-profile {
    color: #465666;
}

.profile-btns {
    color: #465666;
    font-size: 16px;
    flex: 1;
    margin: 0;
    display: flex;
    justify-content: center;
    align-items: center;
}

.image-box {
    width: 250px;
    height: 250px;
    border: 2px dashed #ccc;
    border-radius: 10px;
}

label {
    font-weight: bold;
    margin-bottom: 5px;
}

/* Styles for the autocomplete component */
.autocomplete-results {
    position: absolute;
    z-index: 999;
    background-color: white;
    border: 1px solid #ccc;
    max-height: 200px;
    overflow-y: auto;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.result-item {
    padding: 8px;
    cursor: pointer;
}

.autocomplete-results.show {
    display: block;
}
</style>