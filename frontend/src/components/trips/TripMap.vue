<template>
  <div class="containerl">
    <div class="flex justify-center items-center col-auto mt-2">
      <p class="mr-2 mb-0">View Map Tracking</p>
      <button @click="toggleStatus" :class="['btn', polylineStatus ? 'btn-success' : 'btn-danger']">
        {{ polylineStatus ? 'ON' : 'OFF' }}
      </button>
    </div>
  </div>
  <div class="flex items-center space-x-4">

    <div class="w-full h-full">
      <div class="play-container">
        <div class="map-container mx-auto relative" style="
            width: 100%;
            height: 580px;
            border: 2px solid #ccc;
            border-radius: 8px;
            margin: 20px 20px 5px 10px;
          ">
          <GoogleMap :apiKey="API_KEY" ref="mapRef" :center="center" :zoom="8" style="width: 100%; height: 100%"
            @click="mapClicked($event)">
            <MarkerCluster>
              <CustomMarker v-for="(marker, i) in markers.filter(marker => !('type' in marker))" :key="i"
                :options="{ position: marker.position, title: marker.title, anchorPoint: 'BOTTOM_CENTER' }" @click="
                  markerClicked(marker)" @dblclick="
                    markerDoubleClicked({
                      position: marker.position,
                      clickable: true,
                      draggable: true,
                      title: marker.title,
                    })">
                <div style="text-align: center">
                  <img src="@/assets/normal.png" width="40" height="40" />
                </div>
              </CustomMarker>
            </MarkerCluster>
            <CustomMarker v-for="(marker, i) in markers.filter(marker => marker.type == 'flights')" :key="i"
              :options="{ position: marker.position, title: marker.title, anchorPoint: 'BOTTOM_CENTER' }" @click="
                markerClicked(marker)">
              <div style="text-align: center">
                <img src="@/assets/flights.png" width="40" height="40" />
              </div>
            </CustomMarker>
            <CustomMarker v-for="(marker, i) in markers.filter(marker => marker.type == 'lodging')" :key="i"
              :options="{ position: marker.position, title: marker.title, anchorPoint: 'BOTTOM_CENTER' }" @click="
                markerClicked(marker)">
              <div style="text-align: center">
                <img src="@/assets/reservation.png" width="40" height="40" />
              </div>
            </CustomMarker>

            <CustomMarker v-for="(marker, i) in markers.filter(marker => marker.type == 'rentalCars')" :key="i"
              :options="{ position: marker.position, title: marker.title, anchorPoint: 'BOTTOM_CENTER' }" @click="
                markerClicked(marker)">
              <div style="text-align: center">
                <img src="@/assets/rental.png" width="40" height="40" />
              </div>
            </CustomMarker>
            <Polyline ref="polylineRef" :options="markerPath" />
          </GoogleMap>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from "vue";
import "toast-ui-calendar-vue3/dist/style.css";
import { GoogleMap, Marker, MarkerCluster, Polyline, CustomMarker } from "vue3-google-map";
import { TZDate } from "@toast-ui/calendar";
import {
  collection,
  getDocs,
  getFirestore,
  doc,
  setDoc,
  addDoc,
  Timestamp,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

const db = getFirestore();


const props = defineProps(["events", "center"]);
const API_KEY = import.meta.env.API_KEY;
const polylineRef = ref(null);
const events = ref([]);
const markers = ref(props.events.map((event) => event.marker));
const markersOrdered = ref(props.events.sort((a, b) => a.start - b.start));
const polylines = ref(markersOrdered.value.map((marker) => marker.marker.position));
const polylineStatus = ref(false);
const center = ref(props.center);
const mapRef = ref();
const emit = defineEmits(["eventClicked"]);

const markerClicked = (marker) => {
  const event = props.events.find(
    (event) =>
      event.marker.title === marker.title &&
      event.marker.position.lat === marker.position.lat &&
      event.marker.position.lng === marker.position.lng
  );
  emit("eventClicked", event);
};

const markerDoubleClicked = (marker) => {
  console.log("marker double clicked", marker);
  mapRef.value.map.setCenter(marker.position);
  mapRef.value.map.setZoom(12);
};


function toggleStatus() {
  polylineStatus.value = !polylineStatus.value;
  console.log(props.events);

  if (polylineStatus.value) {
    polylineRef.value.polyline.setVisible(true);

  } else {
    polylineRef.value.polyline.setVisible(false);
  }

}

const markerPath = ref({
  path: polylines.value,
  geodesic: true,
  strokeColor: "#FF0000",
  strokeOpacity: 1.0,
  strokeWeight: 2,
  visible: false,
});

</script>

<style scoped>
.play-container {
  display: flex;
  flex-direction: column;
  padding: 8px;
}
</style>
