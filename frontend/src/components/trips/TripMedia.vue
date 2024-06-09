<template>
    <div class="container-full">
        <div class="d-flex" style="width: 100%; justify-content: space-between">
            <button class="profile-btns"
                style="border-bottom: 1px solid #c9c9c9; margin-top: 20px;padding-bottom: 20px;"
                @click="tabTripEvents(tripId)"><i class="bi bi-calendar-event-fill mx-2"></i>Events</button>
            <button class="profile-btns"
                style="border-bottom: 1px solid #c9c9c9; margin-top: 20px;padding-bottom: 20px;"
                @click="tabTripDetails(tripId)"><i class="bi bi-info-circle-fill mx-2"></i>Trip Info</button>
            <button class="profile-btns"
                style="border-bottom: 1px solid #c9c9c9; margin-top: 20px;padding-bottom: 20px;"
                @click="tabTripMembers(tripId)"><i class="bi bi-people-fill mx-2"></i>Members</button>
            <button class="profile-btns"
                style="border-bottom: 2px solid #3b82f6; margin-top: 20px;padding-bottom: 20px;color:#3b82f6">
                <i class="bi bi-image-fill mx-2"></i>Media</button>
            <button class="profile-btns"
                style="border-bottom: 1px solid #c9c9c9; margin-top: 20px;padding-bottom: 20px;"
                @click="tabTripReviews(tripId)"><i class="bi bi-star-fill mx-2"></i>Reviews</button>
        </div>
        <template v-if="loading">
            <div class="d-flex justify-content-center align-items-center mt-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
            </div>
        </template>
        <template v-else>
            <div class="media-container" style="padding-top: 5vh; padding-left: 10vh;">
                <!--<div class="add-photo" @click="openFilePicker">
                    <input type="file" ref="fileInput" style="display: none;" @change="uploadImages" multiple>
                    <i class="bi bi-plus"></i>
                </div>-->
                <div class="add-photo-container">
                    <div v-if="isOrganizer" class="add-photo" @click="openInserImageModal">
                        <input type="file" ref="fileInput" style="display: none;">
                        <p>+</p>
                    </div>
                </div>
                <div v-for="(photo, index) in photos" :key="photo.id" class="photo-item">
                    <div class="image-container">
                        <button @click="previewImage(index)"><img :src="photo.url" alt="Photo"></button>
                        <button class="remove-btn" v-if="isOrganizer"
                            @click="deletePhoto(photo.id, photo.url)">✕</button>
                    </div>

                </div>

            </div>
        </template>
    </div>

    <!-- Imagem Modal -->
    <div v-if="selected" class="modal" style="display: block;">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Photo</h5>
                    <button type="button" class="btn-close" @click="closeImageModal"></button>
                </div>
                <div class="modal-body">
                    <img :src="selectedPhoto.url" alt="Photo" style="max-width: 100%; max-height: 100%;">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="closeImageModal">Close</button>
                    <!--download-->
                    <button type="button" class="btn btn-primary"
                        @click="downloadPhoto(selectedPhoto.url)">Download</button>
                    <button type="button" class="btn btn-danger"
                        @click="deletePhoto(selectedPhoto.id, selectedPhoto.url)">Delete</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Preview Image modal-->
    <div class="modal" v-if="insertImage" style="display: block;">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Photo</h5>
                    <button type="button" class="btn-close" @click="closeInserImageModal"></button>
                </div>
                <div class="modal-body">
                    <div v-if="images.length === 0"
                        class="d-flex justify-content-center align-items-center flex-column">
                        <input type="file" ref="fileInput" style="display: none" @change="handleFileInput" multiple>
                        <div ref="dropArea" class="image-box cursor-pointer" @dragover.prevent @drop="handleDrop"
                            @click="handleButtonClick">
                            <div class="text-box text-center mt-10">
                                <i class="bi bi-cloud-upload" style="color:#3b82f6; font-size: 5vh;"></i>
                                <p class="font-semibold m-1" style="color:#465666">Drag and drop one or more images here
                                </p>
                                <p class="m-1">or</p>
                                <button class="shadow py-2 px-3 font-semibold rounded-full mt-2" type="button"
                                    style="background-color:#3b82f6; color:white; font-size: 14px;">Browse
                                    Image/s</button>
                            </div>

                        </div>
                    </div>
                    <div v-else class="d-flex flex-wrap justify-content-center">
                        <div v-for="(image, index) in images" :key="index" class="p-2" :style="{ width: imageWidth }">
                            <div class="image-container">
                                <img :src="image" alt="Uploaded Image" class="uploaded-image">
                                <button class="remove-btn" @click="removeImage(index)">✕</button>
                            </div>
                        </div>
                        <input type="file" ref="fileInput" style="display: none" @change="handleFileInput" multiple>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="closeInserImageModal">Close</button>
                    <button type="button" class="btn btn-primary" @click="uploadImages">Upload</button>
                </div>
            </div>
        </div>
    </div>

    <div v-if="openImageModal" class="modal-overlay" @click.self="closeImageModal">
        <div class="modal-content">
            <carousel :items-to-show="1" v-model="currentSlide">
                <slide v-for="(slide, index) in photos" :key="slide.id">
                    <img :src="slide.url" alt="Photo" class="carousel-image">
                </slide>

                <template #addons>
                    <navigation />
                    <pagination />
                </template>
            </carousel>

            <carousel id="thumbnails" :items-to-show="4" :wrap-around="true" v-model="currentSlide"
                ref="thumbnailCarousel" class="thumbnail-carousel">
                <slide v-for="(slide, index) in photos" :key="slide.id">
                    <div class="carousel__item" @click="slideTo(index)">
                        <img :src="slide.url" alt="Photo" class="thumbnail-image">
                    </div>
                </slide>
            </carousel>
        </div>
    </div>


</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getFirestore, doc, getDoc, getDocs, query, collection, addDoc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { useToast } from "vue-toastification";
import 'vue3-carousel/dist/carousel.css'
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'


const router = useRouter();
const toast = useToast();
const tripId = router.currentRoute.value.params.tripId;
const firestore = getFirestore();
const storage = getStorage();
const trip = ref(null);
const photos = ref([]);
const loading = ref(false);
const auth = getAuth();
const loggedInUserId = ref(null);
const openImageModal = ref(false)
const selectedPhoto = ref(null);
const insertImage = ref(false);
const images = ref([]);
const fileInput = ref(null);
let uploadedFile = null;
let storageReference;
const files = ref([]);
const currentSlide = ref(0);
const currentUserId = ref(null);
const organizerId = ref(null);


onMounted(async () => {
    loading.value = true;
    try {
        const tripDoc = doc(firestore, 'trips', tripId);
        const tripSnapshot = await getDoc(tripDoc);
        if (tripSnapshot.exists()) {
            trip.value = tripSnapshot.data();
            organizerId.value = trip.value.organizer;
            await fetchPhotos();
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
            currentUserId.value = user.uid;

        } else {
            loggedInUserId.value = null;
        }
    });
});

const tabTripEvents = (tripId) => {
    router.push(`/trips/${tripId}`);
};

const tabTripDetails = (tripId) => {
    router.push(`/trips/${tripId}/details`);
};

const tabTripMembers = (tripId) => {
    router.push(`/trips/${tripId}/members`);
};

const openFilePicker = () => {
    fileInput.value.click();
};

const openInserImageModal = () => {
    insertImage.value = true;
};

const closeInserImageModal = () => {
    insertImage.value = false;
    images.value = [];
    files.value = [];
};

const handleButtonClick = () => {
    fileInput.value.click();
};

const readImage = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        images.value.push(e.target.result);
    };
    reader.readAsDataURL(file);
};

const slideTo = (index) => {
    currentSlide.value = index;
};

const handleFileInput = (event) => {
    files.value = event.target.files;
    images.value = [];
    for (let i = 0; i < files.value.length; i++) {
        readImage(files.value[i]);
    }
};

const handleDrop = (event) => {
    event.preventDefault();
    files.value = event.dataTransfer.files;
    images.value = [];
    for (let i = 0; i < files.value.length; i++) {
        readImage(files.value[i]);
    }
};

const imageWidth = computed(() => {
    const numImages = images.value.length;
    if (numImages === 1) return '90%';
    if (numImages === 2) return '50%';
    if (numImages === 3) return '33.33%';
    return '25%'; // default case for 4 or more images
});

const handleFileSelection = (event) => {
    files.value = event.target.files;
    images.value = [];
    for (let i = 0; i < files.length; i++) {
        readImage(files[i]);
    }
};

const uploadImages = async () => {
    const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    const uploadPromises = [];

    for (let i = 0; i < files.value.length; i++) {
        const file = files.value[i];
        if (!file) {
            return;
        }

        if (!validImageTypes.includes(file.type)) {
            toast.error('Invalid file type. Please upload an image file');
            continue;
        } else if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size exceeds 5MB. Please upload a smaller image');
            continue;
        } else {
            const storagePath = `photos/${tripId}/${file.name}`;
            const storageReference = storageRef(storage, storagePath);

            const uploadPromise = uploadBytes(storageReference, file)
                .then(() => getDownloadURL(storageReference))
                .then(async (url) => {
                    await addDoc(collection(firestore, 'trips', tripId, 'photos'), { url });
                    photos.value.push({ url });
                })
                .catch((error) => {
                    console.error('Error uploading image:', error);
                    throw error;
                });

            uploadPromises.push(uploadPromise);
        }
    }
    try {
        await Promise.all(uploadPromises);
        toast.success('All images uploaded successfully');
        closeInserImageModal();
        fetchPhotos();
    } catch (error) {
        toast.error('Error uploading one or more images');
    }
};

const fetchPhotos = async () => {
    loading.value = true;
    try {
        const photosCollection = collection(firestore, 'trips', tripId, 'photos');
        const photoDocs = await getDocs(photosCollection);

        const photoPromises = photoDocs.docs.map(async (photoDoc) => {
            const photoData = photoDoc.data();
            try {
                const url = await getDownloadURL(storageRef(storage, photoData.url));
                return { id: photoDoc.id, url };
            } catch (error) {
                console.error('Photo does not exist in storage:', photoData.url);
                return null;
            }
        });

        const photoUrls = (await Promise.all(photoPromises)).filter(photo => photo !== null);

        photos.value = photoUrls;
        console.log(photos.value);
    } catch (error) {
        console.error('Error fetching photos:', error);
        toast.error('Error fetching photos');
    } finally {
        loading.value = false;
    }
};


const previewImage = (index) => {
    selectedPhoto.value = index;
    currentSlide.value = index;
    openImageModal.value = true;
    console.log(index);
};

const deletePhoto = async (photoId, photoUrl) => {
    try {

        // Delete the photo reference from Firestore
        const photoDoc = doc(firestore, 'trips', tripId, 'photos', photoId);
        await deleteDoc(photoDoc);

        // Delete the photo from Firebase Storage
        const storageReference = storageRef(storage, photoUrl);
        await deleteObject(storageReference);



        // Remove the photo from the local state
        photos.value = photos.value.filter(photo => photo.id !== photoId);

        toast.success('Photo deleted successfully');
        closeImageModal();
        //fetchPhotos();
    } catch (error) {
        console.error('Error deleting photo:', error);
        toast.error('Error deleting photo');
        closeImageModal();
        fetchPhotos();
    }
};

const removeImage = (index) => {
    images.value.splice(index, 1);
    handleFileInput();
    handleDrop();
};

const closeImageModal = () => {
    openImageModal.value = false;
    currentSlide.value = 0;
    selectedPhoto.value = null;
};

const downloadPhoto = async (url) => {
    try {
        console.log('Imagem:', url);


        const a = document.createElement('a');
        a.href = url;
        a.download = url.split('/').pop();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } catch (error) {
        console.error('Erro ao baixar a imagem:', error);
    }
};

const isOrganizer = computed(() => {

    return currentUserId.value === organizerId.value;
});



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

.media-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 20px;
}

.add-photo-container {
    display: flex;
    justify-content: center;
    align-items: center;
}

.add-photo {
    width: 5vh;
    height: 5vh;
    border-radius: 50%;
    background-color: #0d6efd;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    position: relative;
    border: none;
    margin-right: 20px;
    margin-bottom: 10px;
}

.add-photo p {
    color: white;
    font-size: 3vh; /* Adjust size as needed */
    margin: 0; /* Remove default margin */
}

.add-photo i {
    font-size: 24px;
    color: #3b82f6;
}

.photo-item {
    width: 17vh;
    height: 17vh;
    border-radius: 10px;
    border: 1px solid #c9c9c9;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 10px;
}

.photo-item img {
    width: 17vh;
    height: 17vh;
    object-fit: contain;
}


.image-box {
    width: 250px;
    height: 250px;
    border: 2px dashed #ccc;
    border-radius: 10px;
}


.image-container {
    position: relative;
    width: 100%;
}

.uploaded-image {
    width: 100%;
    height: auto;
    object-fit: cover;
    border-radius: 10px;
}

.remove-btn {
    position: absolute;
    top: 5px;
    right: 5px;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    cursor: pointer;
}


.swiper-container {
    width: 100%;
    height: 100%;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}


.modal-content {
    background: white;
    padding: 20px;
    border-radius: 10px;
    width: 80%;
    max-width: 600px;
}

.carousel-image {
    width: 100%;
    height: auto;
    max-height: 70vh;
    /* Ajuste conforme necessário */
    object-fit: contain;
}


.thumbnail-carousel {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.carousel__item {
    margin: 0 10px;
    /* Espaçamento horizontal entre miniaturas */
    cursor: pointer;
}

.thumbnail-image {
    width: 100px;
    /* Ajuste o tamanho conforme necessário */
    height: 100px;
    object-fit: cover;
    border: 2px solid transparent;
    transition: border-color 0.3s;
}

.thumbnail-image:hover {
    border-color: #3b82f6;
    /* Cor da borda ao passar o mouse */
}
</style>