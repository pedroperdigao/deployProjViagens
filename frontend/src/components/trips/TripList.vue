<template>
  ola
  <div>
    <p><strong>Search for a place</strong></p>
    <input id="place" type="text" placeholder="Enter a location" style="width: 300px;«"/>
  </div>
</template>

<script setup lang="ts">
import { Loader } from "@googlemaps/js-api-loader"
import { onMounted } from "vue"; // this is for my next step




onMounted(async () => {

const loader = new Loader({
  apiKey: "AIzaSyCeL7R-bu0duyFYi3FY1Y3G0505ssHDclQ",
  version: "weekly",

});
console.log('loader', loader);
const Places = await loader.importLibrary('places')

//YOU ARE HERE !!!!!!!!!!!!!!

// the center, defaultbounds are not necessary but are best practices to limit/focus search results
const center = { lat: 34.082298, lng: -82.284777 }; 
// Create a bounding box with sides ~10km away from the center point
const defaultBounds = {
  north: center.lat + 0.1,
  south: center.lat - 0.1,
  east: center.lng + 0.1,
  west: center.lng - 0.1,
};

//this const will be the first arg for the new instance of the Places API

const input = document.getElementById("place"); //binds to our input element
  
console.log('input', input); //optional logging

//this object will be our second arg for the new instance of the Places API
const options = {
 fields: ["address_components", "geometry", "icon", "name"], //allows the api to accept these inputs and return similar ones
 strictBounds: false, //optional
};

// per the Google docs create the new instance of the import above. I named it Places.
const autocomplete = new Places.Autocomplete(input, options);

console.log('autocomplete', autocomplete); //optional log but will show you the available methods and properties of the new instance of Places.

//add the place_changed listener to display results when inputs change
autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace(); //this callback is inherent you will see it if you logged autocomplete
    console.log('place', place);
});

});

</script>