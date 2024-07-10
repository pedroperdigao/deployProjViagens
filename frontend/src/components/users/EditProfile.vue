<template>
    <div class="container-full shadow-lg">
        <div class="d-flex" style="width: 100%; justify-content: space-between">
            <button class="profile-btns" style="border-bottom: 1px solid #c9c9c9; margin-top: 20px;padding-bottom: 20px"
                @click="viewProfile"><i class="bi bi-person-fill mx-2"></i>Profile</button>
            <button class="profile-btns"
                style="border-bottom: 2px solid #3b82f6; margin-top: 20px;padding-bottom: 20px; color:#3b82f6"
                @click="editProfile"><i class="bi bi-person-fill-gear mx-2"></i>Edit Profile</button>
            <button class="profile-btns"
                style="border-bottom: 1px solid #c9c9c9; margin-top: 20px;padding-bottom: 20px;"
                @click="resetPassword"><i class="bi bi-key-fill mx-2"></i>Reset Password</button>
        </div>
        <div class="edit-profile justify-content-center " style="width: 90%"
            :class="{ 'mx-20': !isMobileView, 'mt-12': !isMobileView, 'p-6': isMobileView, 'd-flex': !isMobileView }">

            <!-- Left side - Profile Card -->
            <div :class="{ 'mr-20': !isMobileView, 'mb-4': isMobileView }">
                <p class="mb-2 font-semibold" style="color: #465666;">Upload Profile Picture</p>
                <div v-if="!imageSrc" ref="dropArea" class="image-box" @dragover.prevent @drop="handleDrop">
                    <div class="text-box text-center mt-10">
                        <i class="bi bi-cloud-upload" style="color:#3b82f6; font-size: 5vh;"></i>
                        <p class="font-semibold m-1" style="color:#465666">Drag and drop image here</p>
                        <p class="m-1">or</p>
                        <button class="shadow py-2 px-3 font-semibold rounded-full mt-2" @click="imageInput.click()"
                            style="background-color:#3b82f6; color:white; font-size: 14px;">Browse Image</button>
                    </div>
                    <input type="file" ref="imageInput" accept=".jpg,.jpeg,.png" @change="fileChanged"
                        style="display: none;" />
                </div>
                <div v-show="imageSrc" class=" w-64 h-64 mx-auto">
                    <img ref="img" :src="imageSrc" />
                </div>
                <p v-show="imageSrc" class="flex mt-1 mb-0 justify-center font-semibold">
                    Drag & zoom your picture
                </p>
                <p v-show="imageSrc" class="flex mb-1 justify-center text-gray-700" >or</p>
                <button v-show="imageSrc" class="btn btn-secondary w-full shadow" @click="fileCleared">
                    Cancel
                </button>
            </div>

            <!-- Profile information -->
            <form class="row g-3 needs-validation " @submit.prevent="saveChanges" novalidate>
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
                    <label for="country" class="form-label">Country</label>
                    <input v-model="country" type="text" class="form-control" id="country" placeholder="Country">
                </div>

                <div class="col-md-12">
                    <fieldset disabled>
                        <label for="inputAddress" class="form-label">Email</label>
                        <input type="email" class="form-control" v-model="email">
                    </fieldset>
                </div>
                <div>
                    <button type="button" class="btn btn-secondary shadow rounded signup-button mt-2"
                        @click.prevent="cancelChanges">Cancel</button>
                    <button type="submit" class="btn btn-primary shadow rounded signup-button mx-1 mt-2">Save
                        Changes</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, watchEffect } from 'vue';
import { useRouter } from "vue-router";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from "vue-toastification";
import Cropper from 'cropperjs';

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
const country = ref('');
const formSubmitted = ref(false);
const firstNameValid = ref(false);
const lastNameValid = ref(true);
const usernameValid = ref(false);
const phoneNumberValid = ref(true);
const isMobileView = ref(window.innerWidth <= 768);

const errorMessage = ({
    firstName: '',
    lastName: '',
    username: '',
    phoneNumber: ''
});

let storageReference; // Declared storageReference

const imageInput = ref(null);
const selectedFile = ref(null);
const imageSrc = ref(null);
const img = ref(null);
const fileReader = new FileReader();
let cropper = null;

const validateForm = () => {
    errorMessage.firstName = '';
    errorMessage.lastName = '';
    errorMessage.username = '';
    errorMessage.phoneNumber = '';

    firstNameValid.value = true;
    lastNameValid.value = true;
    usernameValid.value = true;
    phoneNumberValid.value = true;

    // Validate First Name
    if (firstName.value.trim() === '') {
        firstNameValid.value = false;
        errorMessage.firstName = 'First name is required.';
    } else if (/\d/.test(firstName.value.trim())) {
        firstNameValid.value = false;
        errorMessage.firstName = 'First name must contain only letters.';
    } else if (firstName.value.trim().length < 3) {
        firstNameValid.value = false;
        errorMessage.firstName = 'First name must be at least 3 characters.';
    } else if (firstName.value.trim().length > 20) {
        firstNameValid.value = false;
        errorMessage.firstName = 'First name must be at most 20 characters.';
    }

    // Validate Last Name
    if (lastName.value.trim() === '') {
        lastNameValid.value = true;
    } else if (/\d/.test(lastName.value.trim())) {
        lastNameValid.value = false;
        errorMessage.lastName = 'Last name must contain only letters.';
    } else if (lastName.value.trim().length < 3) {
        lastNameValid.value = false;
        errorMessage.lastName = 'Last name must be at least 3 characters.';
    } else if (lastName.value.trim().length > 20) {
        lastNameValid.value = false;
        errorMessage.lastName = 'Last name must be at most 20 characters.';
    }

    // Validate Username
    if (username.value.trim() === '') {
        usernameValid.value = false;
        errorMessage.username = 'Username is required.';
    } else if (username.value.trim().length < 3) {
        usernameValid.value = false;
        errorMessage.username = 'Username must be at least 3 characters.';
    } else if (username.value.trim().length > 36) {
        usernameValid.value = false;
        errorMessage.username = 'Username must be at most 36 characters.';
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

    if (!firstNameValid.value || !lastNameValid.value || !usernameValid.value || !phoneNumberValid.value) {
        return false;
    }

    return true;
}

// Function to handle file reading
fileReader.onload = (event) => {
    imageSrc.value = event.target.result;
};

// Function to handle file selection change
const fileChanged = (e) => {
    const files = e.target.files || e.dataTransfer.files;
    if (files.length) {
        selectedFile.value = files[0];
        console.log('Selected file:', selectedFile.value);
    }
};

// Function to clear selected file
const fileCleared = () => {
    selectedFile.value = null;
};

const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];

const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    const reader = new FileReader();

    if (!validImageTypes.includes(file.type)) {
        console.error('Invalid file type. Please upload an image file.');
        toast.error('Invalid file type. Please upload an image file.');
        return;
    } else if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size exceeds 5MB. Please upload a smaller image');
        return;
    }

    reader.onload = () => {
        imageSrc.value = reader.result;
        uploadedFile = file;
    };

    reader.readAsDataURL(file);
};

const handleFileUpload = async (file) => {
    const userId = currentUser.value.uid;

    try {
        // Create a reference to the desired path in Firebase Storage
        const fileRef = storageRef(storage, `users/${userId}/profilePicture/user_photo.jpeg`);

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
            country: country.value,
        };

        // If there is an image, upload it to Firestore
        if (selectedFile.value) {
            cropper.getCroppedCanvas({
                width: 256,
                height: 256,
            }).toBlob((blob) => {
                handleFileUpload(blob);
            }, 'image/jpeg');

            // Add the photoURL to updatedData
            updatedData.photoURL = currentUser.value.photoURL;

            selectedFile.value = null;
            
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


onMounted(() => {
    onAuthStateChanged(auth, async (user) => {
        cropper = new Cropper(img.value, {
            aspectRatio: 1,
            minCropBoxWidth: 256,
            minCropBoxHeight: 256,
            viewMode: 3,
            dragMode: 'move',
            background: false,
            cropBoxMovable: false,
            cropBoxResizable: false,
            guides: false,
            zoomable: true,
            wheelZoomRatio: 0.2,
        });

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
                    country.value = currentUser.value.country;
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

// Destroy Cropper on component unmount
onUnmounted(() => {
    cropper.destroy();
});

// Watch for changes in selectedFile and update imageSrc accordingly
watchEffect(() => {
    if (selectedFile.value) {
        fileReader.readAsDataURL(selectedFile.value);
    } else {
        imageSrc.value = null;
    }
});

// Watch for changes in imageSrc and update Cropper instance
watch(imageSrc, () => {
    if (imageSrc.value) {
        cropper.replace(imageSrc.value);
    }
}, { flush: 'post' });

const viewProfile = () => {
    router.push("/profile");
};

const cancelChanges = () => {
    router.push("/profile");
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
</style>