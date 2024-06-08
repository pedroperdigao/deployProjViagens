<template>
  <div class="container-full">
    <div class="container">
      <!-- Features Section -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-10">
        <!-- Feature 1 -->
        <div class="bg-white rounded-lg p-8 shadow-lg mt-5">
          <img src="@/assets/explore-icon.png" alt="Explore Icon" class="w-10 h-10 mb-4">
          <!-- Adjust w-16 and h-16 to fit the size of your icon -->
          <h3 class="mt-4 text-xl font-semibold text-gray-800">Explore Destinations</h3>
          <p class="mt-2 text-gray-600">Find places to visit and things to do worldwide.</p>
        </div>

        <!-- Feature 2 -->
        <div class="bg-white rounded-lg p-8 shadow-lg mt-5">
          <img src="@/assets/itinerary-icon.png" alt="Itinerary Icon" class="w-10 h-10 mb-4">
          <h3 class="mt-4 text-xl font-semibold text-gray-800">Custom Itineraries</h3>
          <p class="mt-2 text-gray-600">Tailor your trips with personalized schedules.</p>
        </div>
        <!-- Feature 3 -->
        <div class="bg-white rounded-lg p-8 shadow-lg mt-5">
          <img src="@/assets/support-icon.png" alt="Support Icon" class="w-10 h-10 mb-4">
          <h3 class="mt-4 text-xl font-semibold text-gray-800">Travel with Friends</h3>
          <p class="mt-2 text-gray-600">Share your plans and travel with your friends.</p>
        </div>
      </section>

      <!-- Call to Action Section -->
      <section class="mt-24 bg-blue-500 text-white py-12 rounded-lg shadow-xl">
        <h2 class="text-3xl font-bold text-center">Ready to Start Planning?</h2>
        <div class="mt-8 text-center">
          <button
            class="bg-white text-blue-500 px-6 py-3 rounded-full shadow-lg hover:bg-gray-100 transition duration-300"
            type="button" @click="getStarted">Get Started</button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "vue-router";

const router = useRouter();
const isLoggedIn = ref(false);

let auth;
onMounted(() => {
  auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    isLoggedIn.value = !!user;
  });
});

const getStarted = () => {
  if (isLoggedIn.value) {
    router.push("/trips/new");
  } else {
    router.push("/login");
  }
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
</style>