<template>
  <div class="container-full" style="height: 74vh;">
    <div class="d-flex" style="width: 100%; justify-content: space-between">
      <button class="profile-btns" style="border-bottom: 1px solid #c9c9c9; margin-top: 20px;padding-bottom: 20px;"
        @click="tabTripEvents(tripId)"><i class="bi bi-calendar-event-fill mx-2"></i>Events</button>
      <button class="profile-btns" style="border-bottom: 1px solid #c9c9c9; margin-top: 20px;padding-bottom: 20px;"
        @click="tabTripDetails(tripId)"><i class="bi bi-info-circle-fill mx-2"></i>Trip Info</button>
      <button class="profile-btns" style="border-bottom: 1px solid #c9c9c9; margin-top: 20px;padding-bottom: 20px;"
        @click="tabTripMembers(tripId)"><i class="bi bi-people-fill mx-2"></i>Members</button>
      <button class="profile-btns" style="border-bottom: 1px solid #c9c9c9; margin-top: 20px;padding-bottom: 20px;"
        @click="tabTripMedia(tripId)">
        <i class="bi bi-image-fill mx-2"></i>Media</button>
      <button class="profile-btns"
        style="border-bottom: 2px solid #3b82f6; margin-top: 20px;padding-bottom: 20px;color:#3b82f6"><i
          class="bi bi-star-fill mx-2"></i>Reviews</button>
    </div>
    <template v-if="loading">
      <div class="d-flex justify-content-center align-items-center mt-4">
        <div class="spinner-border text-primary" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="container d-flex mt-3">
        <h2 class="mt-2 font-bold" style="color: gold;">{{ (reviewMedia / reviews.length).toFixed(1) > 0 ? (reviewMedia /
          reviews.length).toFixed(1) : "0.0"}}</h2>
        <div class="star-container ml-4">
          <div class="star-review" v-for="n in 5" :key="n">
            <!-- se for .5 usar meia estrela-->
            <i class="bi" style="font-size: 25px;color: gold;"
              :class="((reviewMedia / reviews.length).toFixed(1) >= n ? 'bi-star-fill' : ((reviewMedia / reviews.length).toFixed(1) >= n - 0.5 ? 'bi-star-half' : 'bi-star'))"></i>
          </div>
        </div>
        <div class="ml-2 star-container" style="color: gray;">({{ reviews.length }} reviews)</div>
        <div class="star-container" style="margin-left: auto;">
          <span>Sort by:</span>
          <select class="form-select ml-2" style="width: 150px;" v-model="sort">
            <option value="date" selected>Most Recent</option>
            <option value="bestRating"> Best Rating</option>
            <option value="worstRating"> Worst Rating</option>
          </select>
        </div>
      </div>
      <!-- submit review -->
      <div class="d-flex justify-content-between container mt-4 mb-4" style="margin-top: 60vh;">

        <form class="needs-validation w-50" novalidate>
          <textarea id="comment" v-model="comment" class="form-control" type="text" placeholder="Write a review"
            :class="{ 'is-valid': commentValid && formSubmitted, 'is-invalid': !commentValid && formSubmitted }"
            @input="validateForm" required />
          <div class="valid-feedback">Looks good!</div>
          <div class="invalid-feedback">{{ errorMessage.comment }}</div>
        </form>
        <div class="star-rating mx-3 mr-3">
          <span v-for="n in 5" :key="n" :class="['star-review', { filled: n <= rating }]" @click="setRating(n)">
            <i class="bi" style="font-size: 25px;" :class="n <= rating ? 'bi-star-fill' : 'bi-star'"></i>
          </span>
        </div>
        <button class="btn btn-primary h-10 min-w-40" @click="submitReview">Submit Review</button>
      </div>
      <div class="container mt-2" style="overflow-y: auto;">
        <div style="max-height: 50vh;">
          <div v-for="review in reviews" :key="review.id" class="review-item">
            <div class="review-content">
              <div class="d-flex">
                <div class="b-flex" style="max-width: 100vh;">
                  <div class="d-flex">
                    <img :src="review.userImage" alt="User Image" class="user-image mx-4" />
                    <div class="b-flex">
                      <div class="date mt-3">{{ review.displayName + " - " + review.date }}</div>
                      <div class="stars">
                        <span v-for="n in 5" :key="n" class="star">
                          <i :class="n <= review.rating ? 'bi bi-star-fill' : 'bi bi-star'"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                  <p class="comment mb-2 mt-3 mx-8">{{ review.comment }}</p>
                </div>
                <button v-if="loggedInUserId === review.userId" @click="removeReview(review.id)"
                  class="btn-delete btn btn-danger ml-auto">Delete Review</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getFirestore, doc, getDoc, getDocs, query, collection, addDoc, deleteDoc, where } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { useToast } from "vue-toastification";

const router = useRouter();
const toast = useToast();
const tripId = router.currentRoute.value.params.tripId;
const firestore = getFirestore();
const storage = getStorage();
const auth = getAuth();
const rating = ref(0);
const trip = ref(null);
const loading = ref(true);
const loggedInUserId = ref(null);
const user = ref(null);
const comment = ref('');
const reviewMedia = ref(0);
const sort = ref('date');
const reviews = ref([]);
const formSubmitted = ref(false);
const commentValid = ref(false);
const errorMessage = ({ comment: '' });

const validateForm = () => {
  errorMessage.comment = '';
  commentValid.value = true

  // Validate Comment
  if (!comment.value) {
    commentValid.value = false;
    errorMessage.comment = "Comment is required.";
  } else if (comment.value.length < 3) {
    commentValid.value = false;
    errorMessage.comment = "Comment must be at least 5 characters long.";
  }

  //Validate Rating
  if (rating.value === 0) {
    errorMessage.comment = "Please select a rating.";
    return false;
  }

  if (!commentValid.value) {
    return false;
  }

  return true;
}

const setRating = (n) => {
  rating.value = n
}

const submitReview = async () => {
  formSubmitted.value = true;
  if (!validateForm()) {
    toast.error('Error submitting review. Please check for errors.');
    return;
  }

  try {
    const review = {
      userId: loggedInUserId.value,
      tripId: tripId,
      rating: rating.value,
      comment: comment.value,
      date: new Date().toLocaleString(),
    }

    const docRef = await addDoc(collection(firestore, 'reviews'), review)
    reviews.value.push({ id: docRef.id, ...review, displayName: user.value.firstName + ' ' + user.value.lastName, userImage: user.value.photoURL })
    reviewMedia.value += rating.value;
    if (sort.value === 'bestRating') {
      const sortedRating = reviews.value.sort((a, b) => b.rating - a.rating);
      reviews.value = sortedRating;
    } else if (sort.value === 'worstRating') {
      const sortedRating = reviews.value.sort((a, b) => a.rating - b.rating);
      reviews.value = sortedRating;
    } else {
      const sortedDates = reviews.value.sort((a, b) => new Date(convertToDate(b.date)) - new Date(convertToDate(a.date)));
      reviews.value = sortedDates;
    }

    rating.value = 0
    comment.value = ''
    toast.success('Review submitted successfully')
  } catch (error) {
    console.error('Error adding review:', error)
    toast.error('An error occurred. Please try again')
  }
}

const fetchReviews = async () => {
  //reviews com a tripId
  try {
    const reviewsCollection = collection(firestore, 'reviews');
    const reviewsQuery = query(reviewsCollection, where('tripId', '==', tripId));
    const reviewsSnapshot = await getDocs(reviewsQuery);

    const data = reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    data.forEach(async (review) => {
      const userDoc = doc(firestore, 'users', review.userId);
      const userSnapshot = await getDoc(userDoc);
      if (userSnapshot.exists()) {
        review.displayName = userSnapshot.data().firstName + ' ' + userSnapshot.data().lastName;
        review.username = userSnapshot.data().username;
        review.userImage = userSnapshot.data().photoURL;
        reviews.value.push(review);
        reviewMedia.value += review.rating;
        if (reviews.value.length > 0) {
          console.log(reviews.value);
          const sortedDates = reviews.value.sort((a, b) => new Date(convertToDate(b.date)) - new Date(convertToDate(a.date)));
          reviews.value = sortedDates;
        }
      } else {
        console.error('User document does not exist');
      }
    });

    loading.value = false;
  } catch (error) {
    console.error('Error fetching reviews:', error);
  }

}

const convertToDate = (dateString) => {
  const [day, month, year, time] = dateString.split(/\/|, /);
  const [hours, minutes, seconds] = time.split(":");
  return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
};

const removeReview = async (reviewId) => {
  const isConfirmed = window.confirm('Are you sure you want to delete this review?');

  if (!isConfirmed) {
    return; // If the user cancels, do nothing
  }

  try {
    reviewMedia.value -= reviews.value.find(review => review.id === reviewId).rating;
    await deleteDoc(doc(firestore, 'reviews', reviewId));
    reviews.value = reviews.value.filter(review => review.id !== reviewId);
    toast.success('Review deleted successfully');
  } catch (error) {
    console.error('Error deleting review:', error);
    toast.error('An error occurred. Please try again');
  }
}

watch(() => sort.value, (newValue) => {
  if (newValue === 'bestRating') {
    const sortedRating = reviews.value.sort((a, b) => b.rating - a.rating);
    reviews.value = sortedRating;
  } else if (newValue === 'worstRating') {
    const sortedRating = reviews.value.sort((a, b) => a.rating - b.rating);
    reviews.value = sortedRating;
  } else {
    const sortedDates = reviews.value.sort((a, b) => new Date(convertToDate(b.date)) - new Date(convertToDate(a.date)));
    reviews.value = sortedDates;
  }
});

onMounted(async () => {

  try {
    const tripDoc = doc(firestore, 'trips', tripId);
    const tripSnapshot = await getDoc(tripDoc);
    if (tripSnapshot.exists()) {
      trip.value = tripSnapshot.data();
      fetchReviews()
    } else {
      console.error('Trip document does not exist');
    }
  } catch (error) {
    console.error('Error retrieving trip document:', error);
  } finally {
    loading.value = false;
  }

  auth.onAuthStateChanged(user => {
    if (user) {
      loggedInUserId.value = user.uid;
    } else {
      loggedInUserId.value = null;
    }
  });
});

watch(() => loggedInUserId.value, async (newValue) => {
  if (newValue) {
    await getUser();
  }
});



const getUser = async () => {
  const userDoc = doc(firestore, 'users', loggedInUserId.value);
  const userSnapshot = await getDoc(userDoc);
  if (userSnapshot.exists()) {
    user.value = userSnapshot.data();

    console.log(user.value);
  } else {
    console.error('User document does not exist');
  }
}


const tabTripEvents = (tripId) => {
  router.push(`/trips/${tripId}`)
}

const tabTripDetails = (tripId) => {
  router.push(`/trips/${tripId}/details`)
}

const tabTripMembers = (tripId) => {
  router.push(`/trips/${tripId}/members`)
}

const tabTripMedia = (tripId) => {
  router.push(`/trips/${tripId}/media`)
}

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

.review-item {
  border: 1px solid #ccc;
  border-radius: 10px;
  margin-top: 10px;
  background-color: #fafafa;
}

.user-image {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 20px;
  margin-left: 10px;
  margin-top: 15px;
}

.review-content {
  flex: 1;
}

.date {
  max-width: 80%;
}

.comment {
  font-size: 18px;
  margin-bottom: 5px;
  word-wrap: break-word;
  white-space: normal;
}

.stars {
  font-size: 20px;
  color: gold;
  margin-bottom: 5px;
}

.btn-delete {
  height: 4vh;
  border-radius: 0 9px 0 20px;
  min-width: 15vh;
}

.star {
  margin-right: 5px;
}

.star-rating {
  display: flex;
  cursor: pointer;
}

.star-review {
  font-size: 24px;
  color: #cccccc;
  margin-right: 5px;
}

.star-review.filled {
  color: gold;
}


.star-container {
  display: flex;
  justify-content: center;
  /* Centraliza horizontalmente */
  align-items: center;
  /* Centraliza verticalmente */
}

/*
.star-review:hover,
.star-review:hover~.star-review {
  color: gold;
}*/
</style>