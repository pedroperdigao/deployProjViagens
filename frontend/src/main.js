import { createApp } from 'vue'
import "./assets/font.css"
import App from './App.vue'
import router from './router'
import './index.css'
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap"

import Toast from "vue-toastification";
import 'vue-toastification/dist/index.css'

import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { io } from "socket.io-client"

const firebaseConfig = {
    apiKey: "AIzaSyD-lDyusU2NaFt1y6AaB7HtxDAnCDC8OEs",
    authDomain: "planeamento-de-viagens.firebaseapp.com",
    databaseURL: "https://planeamento-de-viagens-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "planeamento-de-viagens",
    storageBucket: "planeamento-de-viagens.appspot.com",
    messagingSenderId: "481725296434",
    appId: "1:481725296434:web:7cfd5fc2cee18c38a7712b"
};

const toastOptions = {
    transition: "Vue-Toastification__fade",
    position: "top-center",
    timeout: 5000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    icon: true,
    rtl: false
};

initializeApp(firebaseConfig);

const app = createApp(App);
app.use(Toast, toastOptions);
app.use(router);
app.provide('socket', io("https://websocketsprofianl.onrender.com"))
app.mount('#app');
