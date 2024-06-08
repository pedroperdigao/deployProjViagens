// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

import Dashboard from '../components/Dashboard.vue'
import Login from "../components/auth/Login.vue"
import SignUp from "../components/auth/SignUp.vue"
import Profile from "../components/users/Profile.vue"
import EditProfile from "../components/users/EditProfile.vue"
import NewTrip from "../components/trips/NewTrip.vue"
import Trips from '@/components/trips/Trips.vue'
import Trip from '@/components/trips/Trip.vue'
import Invites from '@/components/invites/Invites.vue'
import Categories from '@/components/categories/Categories.vue'
import List from '@/components/trips/TripList.vue'
import TripDetails from '@/components/trips/TripDetails.vue'
import TripMembers from '@/components/trips/TripMembers.vue'
import TripMedia from '@/components/trips/TripMedia.vue'
import TripReview from '@/components/trips/TripReview.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Dashboard },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/signup',
      name: 'SignUp',
      component: SignUp
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/profile/edit',
      name: 'EditProfile',
      component: EditProfile,
    },
    {
      path: '/trips/new',
      name: 'NewTrip',
      component: NewTrip
    },
    {
      path: '/trips',
      name: 'Trips',
      component: Trips,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/trips/:tripId',
      name: 'Trip',
      component: Trip,
      params: true
    },
    {
      path: '/trips/:tripId/details',
      name: 'TripDetails',
      component: TripDetails,
      params: true
    },
    {
      path: '/trips/:tripId/members',
      name: 'TripMembers',
      component: TripMembers,
      params: true
    },
    {
      path: '/trips/:tripId/media',
      name: 'TripMedia',
      component: TripMedia,
      params: true
    },
    {
      path: '/trips/:tripId/reviews',
      name: 'TripReview',
      component: TripReview,
      params: true
    },
    {
      path: '/invites',
      name: 'Invites',
      component: Invites
    },
    {
      path: '/categories',
      name: 'Categories',
      component: Categories

    },
    {
      path: '/list',
      name: 'List',
      component: List

    },
    {
      path: '/:catchAll(.*)', 
      redirect: '/'
    },

  ]
})

const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const removeListener = onAuthStateChanged(getAuth(), (user) => {
      removeListener()
      resolve(user)
    }, reject)
  })
}

const checkTripAccess = async (tripId, userId) => {
  const db = getFirestore();
  const tripDoc = await getDoc(doc(db, "trips", tripId));
  console.log(tripDoc);
  
  if (tripDoc.exists()) {
    const tripData = tripDoc.data();
    const isMember = tripData.members.includes(userId);
    const isOrganizer = tripData.organizer.includes(userId);
    return isMember || isOrganizer;
  } else {
    return false;
  }
}

router.beforeEach(async (to, from, next) => {
  const currentUser = await getCurrentUser();

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (currentUser) {
      if (to.params.tripId) {
        const hasAccess = await checkTripAccess(to.params.tripId, currentUser.uid);
        if (hasAccess) {
          next();
        } else {
          next('/trips');
          alert("You don't have permission to access this trip.");
        }
      } else {
        next();
      }
    } else {
      next("/login");
      alert("You don't have permission to access this page. Please login.");
    }
  } else if (to.name === 'Invites' || to.name === 'Categories' || to.name === 'EditProfile' || to.name === 'TripDetails' || to.name === 'TripMembers' || to.name === 'TripMedia' || to.name === 'TripReview' || to.name === 'Trip') {
    if (currentUser) {
      if (to.params.tripId) {
        const hasAccess = await checkTripAccess(to.params.tripId, currentUser.uid);
        if (hasAccess) {
          next();
        } else {
          next('/trips');
          alert("You don't have permission to access this trip.");
        }
      } else {
        next();
      }
    } else {
      next("/login");
      alert("You don't have permission to access this page. Please login.");
    }
  } else {
    next();
  }
});

export default router
