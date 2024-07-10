<template>
  <div class="container-full shadow-lg">
    <!-- Main Content Section -->
    <section class="mt-16">
      <div class="flex flex-wrap justify-center">
        <div class="w-full max-w-xs m-4">
          <form class="mt-3 needs-validation" @submit.prevent="login" novalidate>
            <div class="mb-3">
              <label for="email" class="form-label">Email address <span class="text-danger">*</span></label>
              <div class="input-group has-validation">
                <span class="input-group-text" id="inputGroupPrepend3">@</span>
                <input v-model="email" type="email" class="form-control" id="email" placeholder="Email"
                  :class="{ 'is-valid': emailValid && formSubmitted, 'is-invalid': !emailValid && formSubmitted }"
                  @input="validateForm" required>
                <div class="valid-feedback">Looks good!</div>
                <div class="invalid-feedback">{{ errorMessage.email }}</div>
              </div>
            </div>

            <div class="mb-3">
              <label for="password" class="form-label">Password <span class="text-danger">*</span></label>
              <input v-model="password" type="password" class="form-control" id="password" placeholder="Password"
                :class="{ 'is-valid': passwordValid && passwordSubmit, 'is-invalid': !passwordValid && passwordSubmit }"
                required>
              <div class="valid-feedback">Looks good!</div>
              <div class="invalid-feedback">{{ errorMessage.password }}</div>
            </div>

            <button type="submit" class="btn btn-primary w-full shadow">Login</button>
          </form>
          <div class="d-flex mt-2">
            <p style="font-size: 13px;">Don't have an account?</p>
            <p class="font-semibold mx-1 cursor-pointer" style="font-size: 13px; color:#3b82f6" @click="signupRedirect">
              Sign Up</p>
          </div>
          <div class="d-flex justify-content-center">
            <p style="font-size: 14px; color:lightgray">____________________</p>
            <p class="m-1" style="font-size: 14px; color:lightgray">or</p>
            <p style="font-size: 14px; color:lightgray">____________________</p>
          </div>
          <div class="div-google flex mt-2" @click.prevent="signInWithGoogle">
            <button type="button" class="btn btn-google w-full border">
              <div class="flex justify-content-center mx-2">
                <img src="@/assets/google_logo.png" alt="Google Icon" class="google-icon">
                <span class="text-center">Join us with Google Auth</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, addDoc, collection, updateDoc } from 'firebase/firestore';
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";

const email = ref("");
const password = ref("");
const formSubmitted = ref(false);
const emailValid = ref(false);
const passwordValid = ref(false);
const errorMessage = ref({ email: '', password: '' });
const errMsg = ref("");
const router = useRouter();
const toast = useToast();
const auth = getAuth();
const firestore = getFirestore();
const passwordSubmit = ref(false); 

const validateForm = () => {
  errorMessage.value.email = '';
  errorMessage.value.password = '';

  emailValid.value = true;

  // Validate Email
  if (email.value.trim() === '') {
    emailValid.value = false;
    errorMessage.value.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    emailValid.value = false;
    errorMessage.value.email = 'Please enter a valid email address.';
  }

  return true;
};

const login = () => {
  formSubmitted.value = true;
  validateForm();

  signInWithEmailAndPassword(auth, email.value, password.value)
    .then(() => {
      passwordSubmit.value = true;
      passwordValid.value = true;
      console.log("Successfully signed in");
      router.push({ path: "/profile" });
      toast.success("Welcome back! You are now logged in");
    })
    .catch(() => {
      passwordSubmit.value = true;
      if (password.value.trim() === '') {
        passwordValid.value = false;
        errorMessage.value.password = 'Password is required.';
      } else {
        passwordValid.value = false;
        errorMessage.value.password = 'Incorrect password.';
      }

      toast.error("Error signing in. Please try again");
    });
};

const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("user", result);
    console.log("result", user);
    const { uid, displayName, email, photoURL } = user;

    let firstName, lastName;

    if (displayName && displayName.includes(" ")) {
      [firstName, lastName] = displayName.split(" ");
    } else {
      firstName = displayName;
      lastName = ""; 
    }

    const userDocRef = doc(firestore, 'users', uid);
    const userDocSnapshot = await getDoc(userDocRef);

    if (userDocSnapshot.exists()) {
      console.log("Successfully signed in with Google");
      router.push("/profile");
      toast.success("Welcome back! You are now logged in");
    } else {
      await createUserDoc(user, photoURL, firstName, lastName);
      console.log("New user created with Google");
      router.push("/profile");
      toast.success("Account created successfully!");
    }
  } catch (error) {
    console.error(error.code);
    console.error(error.message);
    toast.error("An error occurred. Please try again.");
  }
};

const createUserDoc = async (user, photoURL, firstName, lastName) => {
  const { uid, email } = user;
  const username = email.split('@')[0];

  const userData = {
    email: email,
    password: null,
    username: username,
    firstName: firstName,
    lastName: lastName,
    photoURL: photoURL,
    phoneNumber: '',
    country: '',
  };

  try {
    const userDocRef = doc(firestore, 'users', uid);
    await setDoc(userDocRef, userData);

    const  categories=[
                { name: 'Museum', color: '#FFD700', userId: uid},
                { name: 'SPA', color: '#FF6347', userId: uid},
                { name: 'Beach', color: '#20B2AA', userId: uid},
                { name: 'Party', color: '#FFA07A', userId: uid},
                { name: 'Restaurant', color: '#FF4500', userId: uid},
                { name: 'Cinema', color: '#FF69B4', userId: uid},
                { name: 'Shopping', color: '#FFD700', userId: uid},
                { name: 'Park', color: '#32CD32', userId: uid},
                { name: 'Bar', color: '#8A2BE2', userId: uid}
            ]
        categories.forEach(async (category) => {
            await  addDoc(collection(firestore, "categories"), category);
        });

      //convidar para a trip so para o deploy
      const tripDocRef = doc(firestore, "trips", "w1JtnlhxYNP0BdtBCmTy");
        const tripSnapshot = await getDoc(tripDocRef);
        if (tripSnapshot.exists()) {
            const tripData = tripSnapshot.data();
            if (!tripData.invites) {
                tripData.invites = [];
            }
            // Add the invited user's ID to the invites array
            tripData.invites.push(uid);
            // Update the trip document with the modified invites array
            await updateDoc(tripDocRef, { invites: tripData.invites });
        }
        

  } catch (error) {
    console.error("Error creating user document:", error);
  }
};

const signupRedirect = () => {
  router.push("/signup");
};
</script>

<style scoped>
* {
  color: #465666;
}

.container-full {
  background-color: white;
  background-size: cover;
  background-position: center;
  border-radius: 20px;
  padding: 20px;
  min-height: 70vh;
  margin-top: 10px;
}

.btn-google {
  border-radius: 5px;
  border: 1px solid #e0e0e0;
}

.btn-google:hover {
  background-color: #f1f1f1;
}

.google-icon {
  width: 20px;
  margin-right: 10px;
}

.error-message {
  color: red;
  font-size: 12px;
}
</style>
