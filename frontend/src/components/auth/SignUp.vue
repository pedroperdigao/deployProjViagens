<template>
    <div class="container-full">
        <div class="col">
            <!-- Add Image -->
            <div>
                <input type="file" ref="fileInput" style="display: none" @change="handleFileInput">
                <p class="mb-2">Profile Picture</p>
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
        </div>
        <div class="col2">
            <!-- Create Account Form -->
            <form class="row g-3 needs-validation" @submit.prevent="signUp" novalidate>
                <div class="col-md-5">
                    <label for="firstName" class="form-label">First Name <span class="text-danger">*</span></label>
                    <input v-model="firstName" type="text" class="form-control" id="firstName" placeholder="First Name"
                        :class="{ 'is-valid': firstNameValid && formSubmitted, 'is-invalid': !firstNameValid && formSubmitted }"
                        @input="validateForm" required>
                    <div class="valid-feedback">Looks good!</div>
                    <div class="invalid-feedback">{{ errorMessage.firstName }}</div>
                </div>
                <div class="col-md-5">
                    <label for="lastName" class="form-label">Last Name</label>
                    <input v-model="lastName" type="text" class="form-control" id="lastName" placeholder="Last Name"
                        :class="{ 'is-valid': lastNameValid && formSubmitted && lastName.trim() !== '', 'is-invalid': !lastNameValid && formSubmitted && lastName.trim() !== '' }"
                        @input="validateForm">
                    <div v-if="lastName.trim() !== '' && lastNameValid" class="valid-feedback">Looks good!</div>
                    <div v-if="lastName.trim() !== '' && !lastNameValid" class="invalid-feedback">
                        {{ errorMessage.lastName }}</div>
                </div>
                <div class="col-md-5">
                    <label for="username" class="form-label">Username <span class="text-danger">*</span></label>
                    <input v-model="username" type="text" class="form-control" id="username" placeholder="Username"
                        :class="{ 'is-valid': usernameValid && formSubmitted, 'is-invalid': !usernameValid && formSubmitted }"
                        @input="validateForm" required>
                    <div class="valid-feedback">Looks good!</div>
                    <div class="invalid-feedback">{{ errorMessage.username }}</div>
                </div>
                <div class="col-md-5">
                    <label for="email" class="form-label">Email <span class="text-danger">*</span></label>
                    <div class="input-group has-validation">
                        <span class="input-group-text" id="inputGroupPrepend3">@</span>
                        <input v-model="email" type="email" class="form-control" id="email" placeholder="Email"
                            :class="{ 'is-valid': emailValid && formSubmitted, 'is-invalid': !emailValid && formSubmitted }"
                            @input="validateForm" required>
                        <div class="valid-feedback">Looks good!</div>
                        <div class="invalid-feedback">{{ errorMessage.email }}</div>
                    </div>
                </div>
                <div class="col-md-5">
                    <label for="phoneNumber" class="form-label">Phone Number</label>
                    <input v-model="phoneNumber" type="text" class="form-control" id="phoneNumber"
                        placeholder="Phone Number"
                        :class="{ 'is-valid': phoneNumberValid && formSubmitted && phoneNumber.trim() !== '', 'is-invalid': !phoneNumberValid && formSubmitted && phoneNumber.trim() !== '' }"
                        @input="validateForm">
                    <div v-if="phoneNumber.trim() !== '' && phoneNumberValid" class="valid-feedback">Looks good!</div>
                    <div v-if="phoneNumber.trim() !== '' && !phoneNumberValid" class="invalid-feedback">
                        {{ errorMessage.phoneNumber }}</div>
                </div>
                <div class="col-md-5">
                    <label for="country" class="form-label">Country</label>
                    <input v-model="country" type="text" class="form-control" id="country" placeholder="Country">
                </div>
                <div class="col-md-5">
                    <label for="password" class="form-label">Password <span class="text-danger">*</span></label>
                    <input v-model="password" type="password" class="form-control" id="password" placeholder="Password"
                        :class="{ 'is-valid': passwordValid && formSubmitted, 'is-invalid': !passwordValid && formSubmitted }"
                        @input="validateForm" required>
                    <div class="valid-feedback">Looks good!</div>
                    <div class="invalid-feedback">{{ errorMessage.password }}</div>
                </div>
                <div class="col-md-5">
                    <label for="confirmPassword" class="form-label">Confirm Password <span
                            class="text-danger">*</span></label>
                    <input v-model="confirmPassword" type="password" class="form-control" id="confirmPassword"
                        placeholder="Confirm Password"
                        :class="{ 'is-valid': confirmPasswordValid && formSubmitted, 'is-invalid': !confirmPasswordValid && formSubmitted }"
                        @input="validateForm" required>
                    <div class="valid-feedback">Looks good!</div>
                    <div class="invalid-feedback">{{ errorMessage.confirmPassword }}</div>
                </div>
                <div class="col-12">
                    <div class="form-check">
                        <input v-model="terms" class="form-check-input" type="checkbox" id="gridCheck"
                            :class="{ 'is-valid': termsValid && formSubmitted, 'is-invalid': !termsValid && formSubmitted }"
                            @input="validateForm" required>
                        <label class="form-check-label" for="gridCheck">
                            I agree to the terms and conditions
                            <span class="text-danger">*</span></label>
                        <div class="valid-feedback">Thanks for accepting the terms and conditions</div>
                        <div class="invalid-feedback">{{ errorMessage.terms }}</div>
                    </div>
                </div>
                <div class="col-12">
                    <button type="submit" class="btn btn-primary shadow rounded signup-button">Sign up</button>
                </div>
            </form>
        </div>
    </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, addDoc, collection, updateDoc, getDoc } from 'firebase/firestore';
import { useRouter } from 'vue-router';
import CryptoJS from 'crypto-js';
import defaultProfilePhoto from '@/assets/user-photo.png';
import { useToast } from 'vue-toastification';

const auth = getAuth();
const firestore = getFirestore();
const firstName = ref('');
const lastName = ref('');
const username = ref('');
const email = ref('');
const country = ref('');
const phoneNumber = ref('');
const password = ref('');
const confirmPassword = ref('');
const terms = ref(false);
const router = useRouter();
const toast = useToast();

const formSubmitted = ref(false);
const firstNameValid = ref(false);
const lastNameValid = ref(true);
const usernameValid = ref(false);
const emailValid = ref(false);
const phoneNumberValid = ref(true);
const passwordValid = ref(false);
const confirmPasswordValid = ref(false);
const termsValid = ref(false);
const image = ref(null);
const fileInput = ref(null);
let uploadedFile = null;
let storageReference; // Declared storageReference

const errorMessage = ({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    terms: ''
})

const validateForm = () => {
    // Reset error messages
    errorMessage.firstName = '';
    errorMessage.lastName = '';
    errorMessage.username = '';
    errorMessage.email = '';
    errorMessage.phoneNumber = '';
    errorMessage.password = '';
    errorMessage.confirmPassword = '';
    errorMessage.terms = '';

    // Reset field validity
    firstNameValid.value = true;
    lastNameValid.value = true;
    usernameValid.value = true;
    emailValid.value = true;
    phoneNumberValid.value = true;
    passwordValid.value = true;
    confirmPasswordValid.value = true;
    termsValid.value = true;

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
        errorMessage.lastName = '';
    } else if (/\d/.test(firstName.value.trim())) {
        lastNameValid.value = false;
        errorMessage.lastName = 'Last name must contain only letters.';
    } else if (lastName.value.trim().length < 3) {
        lastNameValid.value = false;
        errorMessage.lastName = 'Last name must be at least 3 characters.';
    } else if (lastName.value.trim().length > 20) {
        lastNameValid.value = false;
        errorMessage.lastName = 'Last name must be at most 20 characters.';
    } else {
        lastNameValid.value = true;
        errorMessage.lastName = '';
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

    // Validate Email
    if (email.value.trim() === '') {
        emailValid.value = false;
        errorMessage.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        emailValid.value = false;
        errorMessage.email = 'Please enter a valid email address.';
    }

    // Validate Phone Number
    if (phoneNumber.value.trim() === '') {
        phoneNumberValid.value = true;
        errorMessage.phoneNumber = '';
    } else if (!/^\d{9}$/.test(phoneNumber.value.trim())) {
        phoneNumberValid.value = false;
        errorMessage.phoneNumber = 'Please enter a valid 9-digit phone number.';
    } else if (!/^9/.test(phoneNumber.value.trim())) {
        phoneNumberValid.value = false;
        errorMessage.phoneNumber = 'Phone number must start with 9.';
    } else {
        phoneNumberValid.value = true;
        errorMessage.phoneNumber = '';
    }

    // Validate Password
    if (password.value.trim() === '') {
        passwordValid.value = false;
        errorMessage.password = 'Password is required.';
    } else if (password.value.length < 6) {
        passwordValid.value = false;
        errorMessage.password = 'Password must be at least 6 characters long.';
    } else if (password.value.length > 16) {
        passwordValid.value = false;
        errorMessage.password = 'Password must be at most 16 characters long.';
    } else {
        passwordValid.value = true;
        errorMessage.password = '';
    }

    // Validate Confirm Password
    if (confirmPassword.value.trim() === '') {
        confirmPasswordValid.value = false;
        errorMessage.confirmPassword = 'Please confirm your password.';
    } else if (confirmPassword.value !== password.value) {
        confirmPasswordValid.value = false;
        errorMessage.confirmPassword = 'Passwords do not match.';
    } else if (confirmPassword.value === password.value && passwordValid.value) {
        confirmPasswordValid.value = true;
        errorMessage.confirmPassword = '';
    } else {
        confirmPasswordValid.value = false; // Explicitly mark confirm password as invalid if the password is not valid
        errorMessage.confirmPassword = 'Your password is not invalid.';
    }

    // Validate Terms
    if (!terms.value) {
        termsValid.value = false;
        errorMessage.terms = 'Please agree to the terms and conditions.';
    } else {
        termsValid.value = true; // Set to true when terms are agreed upon
        errorMessage.terms = ''; // Reset error message
    }

    // console log every error message
    console.log(errorMessage);

    if (!firstNameValid.value || !lastNameValid.value || !usernameValid.value || !emailValid.value
        || !phoneNumberValid.value || !passwordValid.value ||
        !confirmPasswordValid.value || !termsValid.value) {
        return false;
    }

    return true;
};


const signUp = async () => {
    formSubmitted.value = true;
    if (!validateForm()) {
        toast.error('Please check for any validation errors');
        return;
    }

    try {
        const userData = await createUserWithEmailAndPassword(auth, email.value, password.value);
        const user = userData.user;

        // Encrypt the password before storing it
        const encryptedPassword = CryptoJS.AES.encrypt(password.value, 'secret').toString();

        const photoURL = image.value || defaultProfilePhoto;

        // Add user data to Firestore
        const userDocRef = doc(firestore, 'users', user.uid);
        await setDoc(userDocRef, {
            firstName: firstName.value,
            lastName: lastName.value,
            username: username.value,
            email: user.email,
            phoneNumber: phoneNumber.value.trim() === '' ? '' : phoneNumber.value,
            country: country.value,
            encryptedPassword: encryptedPassword,
            photoURL: photoURL
        });

        if (uploadedFile) {
            await handleFileUpload(uploadedFile); 
        }

        //Add default categories to User
        const categories = [
            { name: 'Museum', color: '#FFD700', userId: user.uid },
            { name: 'SPA', color: '#FF6347', userId: user.uid },
            { name: 'Beach', color: '#20B2AA', userId: user.uid },
            { name: 'Party', color: '#FFA07A', userId: user.uid },
            { name: 'Restaurant', color: '#FF4500', userId: user.uid },
            { name: 'Cinema', color: '#FF69B4', userId: user.uid },
            { name: 'Shopping', color: '#FFD700', userId: user.uid },
            { name: 'Park', color: '#32CD32', userId: user.uid },
            { name: 'Bar', color: '#8A2BE2', userId: user.uid }
        ]
        categories.forEach(async (category) => {
            await addDoc(collection(firestore, "categories"), category);
        });

        const tripDocRef = doc(firestore, "trips", "w1JtnlhxYNP0BdtBCmTy");
        const tripSnapshot = await getDoc(tripDocRef);
        if (tripSnapshot.exists()) {
            const tripData = tripSnapshot.data();
            if (!tripData.invites) {
                tripData.invites = [];
            }
            // Add the invited user's ID to the invites array
            tripData.invites.push(user.uid);
            // Update the trip document with the modified invites array
            await updateDoc(tripDocRef, { invites: tripData.invites });
        }



        toast.success('Account created successfully!');
        router.push({ path: '/profile' });
    } catch (error) {
        console.error('Error creating user or adding data to Firestore', error);
        toast.error(error.message);
    }
};

const setDefaultProfilePhoto = () => {
    image.value = defaultProfilePhoto;
};

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
};

const handleFileUpload = async (file) => {
    try {
        // Create a reference to the desired path in Firebase Storage
        const fileRef = storageReference.child(`profilePictures/${file.name}`);

        // Upload the file to Firebase Storage
        await uploadBytes(fileRef, file);

        // Get the download URL of the uploaded file
        const imageUrl = await getDownloadURL(fileRef);

        // Update the image ref with the URL
        image.value = imageUrl;

    } catch (error) {
        console.error('Error uploading profile picture:', error);
    }
};

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
    padding: 20px;
    min-height: 70vh;
    margin-top: 10px;
    display: flex;
}

.col {
    flex: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.col2 {
    flex: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 10px;
}

input {
    color: #465666;
}

select {
    color: #465666;
}

.signup-button {
    width: 20vh;
    height: 5vh;
}

.image-box {
    width: 250px;
    height: 250px;
    border: 2px dashed #ccc;
    border-radius: 10px;
}
</style>
