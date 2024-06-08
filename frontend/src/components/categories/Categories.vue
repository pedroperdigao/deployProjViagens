<template>
    <div class="container-full">
        <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            <div @click="openEdit(category)" v-for="category in categories" :key="category.id" class="col">
                <div class="category-item cursor-pointer" :style="{ borderColor: category.color }">
                    <div class="category-square" :style="{ backgroundColor: category.color }"></div>
                    <label class="cursor-pointer" style="font-size: 18px;">{{ category.name }}</label>
                </div>
            </div>
        </div>
    </div>

    <!-- Pop up -->
    <div>
        <div class="modal" tabindex="-1" style="display: block" v-if="props.newCategory || openPopUpEdit">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" v-if="props.newCategory">New Category</h5>
                        <h5 class="modal-title" v-else>Edit Category</h5>
                        <button type="button" class="btn-close" @click="closePopUp"></button>
                    </div>
                    <div class="modal-body d-flex">
                        <div class="flex-grow-1">
                            <div class="mb-3">
                                <label for="name" class="form-label">Name </label>
                                <input v-model="name" type="text" class="form-control" id="name"
                                    :class="{ 'is-valid': nameValid && formSubmitted, 'is-invalid': !nameValid && formSubmitted }"
                                    @input="validateName" required>
                                <div class="valid-feedback">Looks good!</div>
                                <div class="invalid-feedback">{{ nameErrorMsg }}</div>
                            </div>
                        </div>
                        <div class="ml-2">
                            <label for="exampleColorInput" class="form-label">Color</label>
                            <input type="color" class="form-control form-control-color" id="exampleColorInput"
                                v-model="color" />
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closePopUp">
                            Cancel
                        </button>
                        <button v-if="!props.newCategory" class="btn btn-danger" @click="deleteCategory">Delete</button>
                        <button v-if="props.newCategory" type="button" class="btn btn-primary" @click="createCategory">
                            Create
                        </button>
                        <button v-else type="button" class="btn btn-primary" @click="editCategory">
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
    getFirestore,
    doc,
    getDocs,
    updateDoc,
    addDoc,
    collection,
    getDoc,
    query,
    where,
    deleteDoc,
} from "firebase/firestore";
import { useToast } from "vue-toastification";

const toast = useToast();
const name = ref("");
const color = ref("#563d7c");
const categories = ref([]);
const db = getFirestore();
const user = ref('');
const props = defineProps(["newCategory"]);
const emit = defineEmits(["category"]);
const auth = getAuth();
const currentUser = auth.currentUser ? ref(auth.currentUser) : ref(null);
const openPopUpEdit = ref(false);
const selectedCategory = ref(null);

const formSubmitted = ref(false);
const nameValid = ref(false);
const nameErrorMsg = ref("");

const validateName = () => {
    nameErrorMsg.value = "";
    nameValid.value = true;
    if (name.value.trim() === "") {
        nameErrorMsg.value = "Category name is required";
        nameValid.value = false;
    } else if (name.value.trim().length < 3) {
        nameErrorMsg.value = "Category name must be at least 3 characters long";
        nameValid.value = false;
    } else if (name.value.trim().length > 16) {
        nameErrorMsg.value = "Category name must be at most 16 characters long";
        nameValid.value = false;
    }

    return true;
};

function closePopUp() {
    name.value = "";
    color.value = "#563d7c";
    if (openPopUpEdit.value) {
        openPopUpEdit.value = false;
    } else {
        emit("category");
    }
    selectedCategory.value = null;
    formSubmitted.value = false;
}

async function createCategory() {
    const categoryName = name.value.trim(); // Trim whitespace from category name
    const categoryColor = color.value;
    const userId = currentUser.value.uid;

    formSubmitted.value = true;
    validateName();

    if (!nameValid.value) {
        toast.error("Category name is invalid");
        return;
    }

    // Proceed with creating the category if validation passes
    const category = {
        name: categoryName,
        color: categoryColor,
        userId: userId,
    };

    const docRef = await addDoc(collection(db, "categories"), category);
    getCategories();
    closePopUp();
    name.value = "";
    color.value = "#563d7c";
    // Include category name in the success toast
    toast.success(`Category "${category.name}" created successfully`);
}

async function editCategory() {
    const categoryName = name.value.trim(); // Trim whitespace from category name
    const categoryColor = color.value;
    const userId = currentUser.value.uid;

    formSubmitted.value = true;
    validateName();

    if (!nameValid.value) {
        toast.error("Category name is invalid");
        return;
    }

    const category = {
        id: categoryName.toLowerCase(),
        name: categoryName,
        color: categoryColor,
        userId: userId,
    };

    const docRef = await updateDoc(doc(db, "categories", selectedCategory.value.uid), category);
    closePopUp();
    getCategories();
    name.value = "";
    color.value = "#563d7c";
    // Include category name in the success toast
    toast.success(`Category "${category.name}" updated successfully`);
}

async function deleteCategory() {
    console.log(selectedCategory.value);
    const categoryName = selectedCategory.value.name;
    await deleteDoc(doc(db, "categories", selectedCategory.value.uid));
    closePopUp();
    getCategories();
    selectedCategory.value = null;
    toast.success(`Category "${categoryName}" deleted successfully`);
}

function openEdit(editedCategory) {
    selectedCategory.value = editedCategory;
    name.value = editedCategory.name;
    color.value = editedCategory.color;
    openPopUpEdit.value = true;
}

async function getCategories() {
    categories.value = [];
    const querySnapshot = await getDocs(query(collection(db, 'categories'), where('userId', '==', currentUser.value.uid)));
    querySnapshot.forEach((doc) => {
        categories.value.push({ uid: doc.id, ...doc.data() });
    });
}

onMounted(() => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            try {
                const userDocSnapshot = await getDoc(userDocRef);
                if (userDocSnapshot.exists()) {
                    // Set the currentUser value with the data from Firestore
                    currentUser.value = { uid: user.uid, ...userDocSnapshot.data() };
                    getCategories();
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
});
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

.color-rectangle {
    width: 100%;
    height: 7vh;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 10px;
    margin-left: auto;
    border-radius: 10px;
}

.card-text {
    background-color: white;
    border-radius: 10px 10px 0 0;
    width: 80%;
    height: 3rem;
    display: flex;
    justify-content: center;
    margin-top: 2rem;
}

.category-item {
    display: flex;
    align-items: center;
    padding: 8px;
    border: 2px solid;
    border-radius: 10px;
    margin-left: 6px;
    margin-right: 6px;
    margin-top: 6px;
    background-color: rgb(247, 247, 247);
}

.category-square {
    width: 20px;
    height: 20px;
    margin-right: 8px;
    border-radius: 4px;
}
</style>
