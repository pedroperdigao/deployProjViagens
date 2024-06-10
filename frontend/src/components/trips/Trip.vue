<template>
  <div class="container-full">
    <div class="d-flex" style="width: 100%; justify-content: space-between">
      <button class="profile-btns"
        style="border-bottom: 2px solid #3b82f6; margin-top: 20px;padding-bottom: 20px; color:#3b82f6" @click=""><i
          class="bi bi-calendar-event-fill mx-2"></i>Events</button>
      <button class="profile-btns" style="border-bottom: 1px solid #c9c9c9; margin-top: 20px;padding-bottom: 20px;"
        @click="tabTripInfo(tripId)"><i class="bi bi-info-circle-fill mx-2"></i>Trip Info</button>
      <button class="profile-btns" style="border-bottom: 1px solid #c9c9c9; margin-top: 20px;padding-bottom: 20px;"
        @click="tabTripMembers(tripId)"><i class="bi bi-people-fill mx-2"></i>Members</button>
      <button class="profile-btns" style="border-bottom: 1px solid #c9c9c9; margin-top: 20px;padding-bottom: 20px;"
        @click="tabTripMedia(tripId)"><i class="bi bi-image-fill mx-2"></i>Media</button>
      <button class="profile-btns" style="border-bottom: 1px solid #c9c9c9; margin-top: 20px;padding-bottom: 20px;"
        @click="tabTripReviews(tripId)"><i class="bi bi-star-fill mx-2"></i>Reviews</button>
    </div>
    <!-- filtro -->
    <div class="d-flex items-center p-3 mt-2">
      <!-- FILTER BY CATEGORY -->
      <label for="category" class="filter-cat">Filter by Category:</label>
      <select v-model="selectedCategory" id="category" class="form-select max-w-80 mr-20">
        <option value="all">All</option>
        <template v-for="category in views">
          <option v-if="!category.name.includes('defaultCategoryFor')" :value="category">
            <span>{{ category.name }}</span>
          </option>
        </template>

      </select>
      <!-- LIST | CALENDAR | MAP BUTTONS -->
      <div class="m-auto">
        <button type="button" class="btns-toggle btn-list-show"
          :class="[showEventList ? 'btn-primary' : 'btn-off', 'btn']" @click="toggleEventVisibility">
          <span class="bi bi-list mr-2"></span>
          {{ showEventList ? "Hide List" : "Show List" }}
        </button>
        <button type="button" class="btns-toggle btn-calendar-show"
          :class="[showCalendar ? 'btn-primary' : 'btn-off', 'btn']" @click="toggleCalendar">
          <span class="bi bi-calendar2-event mr-2"></span>
          {{ showCalendar ? "Hide Calendar" : "Show Calendar" }}
        </button>
        <button type="button" class="btns-toggle btn-map-show" :class="[showMap ? 'btn-primary' : 'btn-off', 'btn']"
          @click="toggleMap">
          <span class="bi bi-map mr-2"></span>
          {{ showMap ? " Hide Map" : " Show Map" }}
        </button>
      </div>
    </div>

    <div class="row p-3">
      <!-- Lista de Eventos -->
      <div v-if="showEventList" class="col-md-4">
        <div class="d-flex">
          <div class="reservation-container d-flex flex-column" style="overflow-y: auto; width: 70%;">
            <h6 class="d-flex justify-content-center mt-3"><b>Add Events and Reservations</b></h6>
            <div class="d-flex justify-content-center">
              <div class="reservation-item" v-for="(reservation, index) in reservations" :key="index">
                <button v-if="reservation.label === 'Events'" @click="openDialog(null)">
                  <div class="reservation-button">
                    <span :class="reservation.icon" style="font-size: 20px;"></span>
                    <span class="reservation-label" style="font-size: 10px;">{{ reservation.label }}</span>
                  </div>
                </button>
                <button v-else @click="modelReservations(reservation)">
                  <div class="reservation-button">
                    <span :class="reservation.icon" style="font-size: 20px;"></span>
                    <span class="reservation-label" style="font-size: 10px;">{{ reservation.label }}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
          <div class="reservation-container d-flex flex-column ml-2" style="overflow-y: auto; width: 29%;">
            <div class="">
              <h6 class="d-flex justify-content-center mt-3"><b>Budget</b></h6>
              <p class="d-flex mt-3 justify-content-center" style="font-size: 24px;">{{ budget }}€</p>
              <div class="d-flex justify-content-center">
                <button class="view-budget-details btn btn-secondary" @click="openBudgetModal">View details</button>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div class="d-flex w-full mt-1">
            <button class="event-list-btn flex-1 border-b border-gray-300"
              :class="{ 'border-b-0 bg-gray-100': isEventListVisible }" @click="setEventListVisible">Event List</button>
            <button class="reservation-list-btn flex-1 border-b border-gray-300"
              :class="{ 'border-b-0 bg-gray-100': isReservationListVisible }"
              @click="setReservationListVisible">Reservation
              List</button>
          </div>
          <div class="container-list" style="overflow-y: auto">
            <div v-if="isEventListVisible">
              <div v-if="Object.keys(groupedEventsByCategory).length === 0" class="d-flex justify-content-center">
                <p>No events </p>
              </div>
            </div>

            <div v-if="isEventListVisible" v-for="(categoryEvents, category) in groupedEventsByCategory" :key="category"
              class="event-date mt-2">
              <div
                v-if="category !== 'defaultCategoryForFlights' && category !== 'defaultCategoryForLodging' && category !== 'defaultCategoryForRentalCars' && category !== 'defaultCategoryForAttachments'"
                @click="toggleEventList(category)" class="date-trigger flex items-center cursor-pointer mb-2">
                <span :class="{
                  'bi bi-caret-down-fill': isExpanded(category),
                  'bi bi-caret-right-fill': !isExpanded(category),
                }" class="mr-2"></span>
                <div class="flex items-center bg-gray-100 rounded-md px-3 py-1" style="background-color: #f6f7fa">
                  <h3 class="text-lg font-semibold">
                    {{ getCategoryName(category) }}
                  </h3>
                </div>
              </div>
              <div v-if="isExpanded(category)" class="event-list-popup panel panel-default">
                <div class="panel-body">
                  <div v-for="event in categoryEvents" :key="event.title"
                    class="popup-content relative p-3 mb-2 shadow-md"
                    style=" border-radius: 0.5rem; background-color: white;">
                    <div class="absolute top-4 left-4 w-2 rounded-full flex items-center justify-center "
                      style="height: 80%;" :style="{ backgroundColor: getEventColor(event.calendarId) }"></div>
                    <div class="flex justify-between items-center ml-5">
                      <div>
                        <h5 class="font-semibold text-sm">{{ event.title }}</h5>
                        <p class="text-gray-500 text-xs">{{ formatDateTime(event.start) }}</p>
                        <p class="text-gray-500 text-xs"> Price:{{ event.price !== "" ? event.price + "€" : " -" }}</p>
                        <p class="text-sm m-0"> {{ event.description === "" ? "&nbsp;" : event.description }} </p>
                      </div>
                      <div class="d-flex flex-column gap-2 justify-content-center">
                        <button type="button" class="btn btn-sm btn-primary bi bi-eye-fill mr-2"
                          @click="viewEvent(event.id)"></button>
                        <button v-if="isOrganizer" type="button" class="btn btn-sm btn-success mr-2 bi bi-pencil-square"
                          @click="editEvent(event.id)"></button>
                        <button v-if="isOrganizer" type="button" class="btn btn-sm btn-danger mr-2 bi bi-trash-fill"
                          @click="deleteEvent(event.id)"></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- RESERVAS -->
            <div v-if="isReservationListVisible">
              <div
                v-if="!allReservations.flights.length && !allReservations.lodging.length && !allReservations.rentalCars.length > 0"
                class="d-flex justify-content-center">
                <p>No reservations </p>
              </div>
              <!-- Voos -->
              <div v-if="allReservations.flights.length > 0" class="event-date">
                <div @click="toggleEventList('flights')" class="date-trigger flex items-center cursor-pointer mb-2">
                  <span
                    :class="{ 'bi bi-caret-down-fill': isExpanded('flights'), 'bi bi-caret-right-fill': !isExpanded('flights') }"
                    class="mr-2"></span>
                  <div class="flex items-center bg-gray-100 rounded-md px-3 py-1" style="background-color: #f6f7fa">
                    <h3 class="text-lg font-semibold"> Flights </h3>
                  </div>
                </div>
                <div v-if="isExpanded('flights')" class="event-list-popup panel panel-default">
                  <div class="panel-body">
                    <div v-for="event in allReservations.flights" :key="event.title"
                      class="popup-content relative p-3 mb-2 shadow-md"
                      style=" border-radius: 0.5rem; background-color: white;">
                      <!-- Conteúdo do evento -->
                      <div class="flex justify-between items-center ml-5">
                        <div class="absolute top-4 left-4 w-2 rounded-full flex items-center justify-center"
                          style="background-color: #5cceee; height: 85%;"></div>
                        <div style="max-width: 50%;">
                          <h5 class="font-semibold text-sm">{{ event.iataCodeDeparture }} <i
                              class="bi bi-arrow-right fs-6"></i> {{ event.iataCodeArrival }}</h5>
                          <p class="text-gray-500 text-xs">{{ formatDateTime(event.departureDate) }}</p>
                          <p class="text-gray-500 text-xs">Price: {{ event.price ? event.price + "€" : "-" }}</p>
                          <p class="text-sm">{{ event.notes === "" ? "" : event.notes }}</p>
                        </div>
                        <div class="d-flex flex-column gap-2 justify-content-center">
                          <button type="button" class="btn btn-sm btn-primary bi bi-eye-fill mr-2"
                            @click="viewReservation(event.id)"></button>
                          <button v-if="isOrganizer" type="button" class="btn btn-sm btn-success mr-2 bi bi-pencil-square"
                            @click="editReservation(event.id)"></button>
                          <button v-if="isOrganizer" type="button" class="btn btn-sm btn-danger bi bi-trash-fill mr-2"
                            @click="deleteReservation(event.id)"></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Hospedagem -->
              <div v-if="allReservations.lodging.length > 0" class="event-date">
                <div @click="toggleEventList('lodging')" class="date-trigger flex items-center cursor-pointer mb-2">
                  <span :class="{
                    'bi bi-caret-down-fill': isExpanded('lodging'),
                    'bi bi-caret-right-fill': !isExpanded('lodging'),
                  }" class="mr-2"></span>
                  <div class="flex items-center bg-gray-100 rounded-md px-3 py-1" style="background-color: #f6f7fa">
                    <h3 class="text-lg font-semibold"> Lodging </h3>
                  </div>
                </div>
                <div v-if="isExpanded('lodging')" class="event-list-popup panel panel-default">
                  <div class="panel-body">
                    <div v-for="event in allReservations.lodging" :key="event.title"
                      class="popup-content relative p-3 mb-2 shadow-md"
                      style=" border-radius: 0.5rem; background-color: white;">
                      <!-- Conteúdo do evento -->
                      <div class="flex justify-between items-center ml-5">
                        <div class="absolute top-4 left-4 w-2 rounded-full flex items-center justify-center"
                          style="background-color: #f6e58d; height: 85%;"></div>
                        <div style="max-width: 70%;">
                          <h5 class="font-semibold text-sm">{{ event.location }}</h5>
                          <p class="text-gray-500 text-xs">Check-in: {{ formatDateTime(event.checkInDate) }}</p>
                          <p class="text-gray-500 text-xs">Check-out: {{ formatDateTime(event.checkOutDate) }}</p>
                          <p class="text-gray-500 text-xs">Price: {{ event.price ? event.price + "€" : "-" }}</p>
                          <p class="text-sm">{{ event.notes === "" ? "" : event.notes }}</p>
                        </div>
                        <div class="d-flex flex-column gap-2 justify-content-center">
                          <button type="button" class="btn btn-sm btn-primary bi bi-eye-fill mr-2"
                            @click="viewReservation(event.id)"></button>
                          <button v-if="isOrganizer" type="button" class="btn btn-sm btn-success mr-2 bi bi-pencil-square"
                            @click="editReservation(event.id)"></button>
                          <button v-if="isOrganizer" type="button" class="btn btn-sm btn-danger bi bi-trash-fill mr-2"
                            @click="deleteReservation(event.id)"></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Aluguel de carros -->
              <div v-if="allReservations.rentalCars.length > 0" class="event-date">
                <div @click="toggleEventList('rentalCars')" class="date-trigger flex items-center cursor-pointer mb-2">
                  <span
                    :class="{ 'bi bi-caret-down-fill': isExpanded('rentalCars'), 'bi bi-caret-right-fill': !isExpanded('rentalCars') }"
                    class="mr-2"></span>
                  <div class="flex items-center bg-gray-100 rounded-md px-3 py-1" style="background-color: #f6f7fa">
                    <h3 class="text-lg font-semibold">
                      Rental Cars
                    </h3>
                  </div>
                </div>
                <div v-if="isExpanded('rentalCars')" class="event-list-popup panel panel-default">
                  <div class="panel-body">
                    <div v-for="event in allReservations.rentalCars" :key="event.title"
                      class="popup-content relative p-3 mb-2 shadow-md"
                      style=" border-radius: 0.5rem; background-color: white;">
                      <!-- Conteúdo do evento -->
                      <div class="flex justify-between items-center ml-5">
                        <div class="absolute top-4 left-4 w-2 rounded-full flex items-center justify-center"
                          style="background-color: #f9ca24; height: 85%;"></div>
                        <div style="max-width: 70%;">
                          <h5 class="font-semibold text-sm">{{ event.company }}</h5>
                          <p class="text-gray-500 text-xs">Drop off Date: {{ formatDateTime(event.pickUpDate) }}</p>
                          <p class="text-gray-500 text-xs">Drop off Date: {{ formatDateTime(event.dropOffDate) }}</p>
                          <p class="text-gray-500 text-xs">Price: {{ event.price ? event.price + "€" : "-" }}</p>
                          <p class="text-sm">{{ event.notes === "" ? "&nbsp;" : event.notes }}</p>
                        </div>
                        <div class="d-flex flex-column gap-2 justify-content-center">
                          <button type="button" class="btn btn-sm btn-primary bi bi-eye-fill mr-2"
                            @click="viewReservation(event.id)"></button>
                          <button v-if="isOrganizer" type="button" class="btn btn-sm btn-success mr-2 bi bi-pencil-square"
                            @click="editReservation(event.id)"></button>
                          <button v-if="isOrganizer" type="button" class="btn btn-sm btn-danger bi bi-trash-fill mr-2"
                            @click="deleteReservation(event.id)"></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="play-container" v-show="showCalendar && triploaded" :class="[
        showEventList && showMap
          ? 'col-md-4'
          : showEventList && !showMap
            ? 'col-md-8'
            : !showEventList && showMap
              ? 'col-md-6'
              : 'col-md-12',
      ]">
        <div class="w-full h-full">
          <div class="flex items-center justify-center space-x-4 mb-2" v-if="showCalendar">
            <div class="text-center" style="flex: auto">
              <button @click="previousWeek" type="button" class="btn btn-light bi bi-arrow-left"
                :disabled="!isDateInRange(previousWeekDisable)"></button>
              <button type="button" class="btn btn-light mx-3 mr-3" @click="todayWeek">
                Start
              </button>
              <button type="button" class="btn btn-light bi bi-arrow-right mr-3" @click="nextWeek"
                :disabled="!isDateInRange(nextWeekDisable)"></button>
              <label v-if="calendarRef">{{ formatarData(calendarRef.getInstance().getDateRangeStart()) }} ~ {{
                formatarData(calendarRef.getInstance().getDateRangeEnd()) }}</label>
            </div>
          </div>
        </div>
        <tui-calendar class="my-calendar" ref="calendarRef" view="week" :use-form-popup="false"
          :use-detail-popup="false" :week="options.week" :calendars="views" :events="events" :timezone="{
            timezoneName: 'Europe/Lisbon',
            displayLabel: 'GMT+01:00',
            tooltip: 'Lisbon',
          }" :template="{
            timegridDisplayPrimaryTime: function (time) {
              var hour = time.time.d.getHours();
              return hour + ':00';
            },
            milestoneTitle: function (model) {
              return `aaaaa${model.title}`;
            },
          }" />
      </div>
      <div v-if="showMap" :class="[
        showEventList && showCalendar
          ? 'col-md-4'
          : showEventList && !showCalendar
            ? 'col-md-8'
            : !showEventList && showCalendar
              ? 'col-md-6'
              : 'col-md-12',
      ]">
        <TripMap :events="events" :center="center" @eventClicked="eventClickedInMap" :key="mapKey"></TripMap>
      </div>
    </div>
  </div>

  <!-- Detalhes do evento -->
  <div v-show="dialogDetails" class="details-popup fixed" :style="{ top: mouseY + 'px', left: mouseX + 'px' }"
    @click="closeDialogIfClickedOutside">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Overlay -->
      <div class="fixed inset-0 transition-opacity" aria-hidden="true">
        <div class="absolute inset-0 bg-transparent"></div>
      </div>

      <!-- Dialog -->
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
      <div
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-[300px] sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <span :style="{ backgroundColor: eventColor }" class="rounded-md flex-shrink-0 h-3 w-12 mr-4"></span>
            </div>
            <!-- Fechar Dialog -->
            <button @click="closeDialogDetails" type="button"
              class="text-gray-400 hover:text-gray-500 focus:outline-none">
              <!-- Ícone de fechar -->
              <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <!-- Categoria -->
          <div class="mt-4">
            <h3 class="text-lg font-medium text-gray-900"> {{ eventData.title }} </h3>
          </div>
          <div class="mt-4">
            <!-- Data e hora do evento -->
            <p class="text-sm text-gray-500">{{ eventDateRange }}</p>
            <!-- Localização -->
            <div class="flex items-center mt-2">
              <!-- Ícone de localização -->
              <svg class="h-5 w-5 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                fill="currentColor">
                <path fill-rule="evenodd" d="M10 12a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                <path fill-rule="evenodd"
                  d="M10 0a8 8 0 00-8 8c0 5.25 7.333 11.5 7.75 11.95a.75.75 0 00.5.05c.2-.05 3.75-2.7 3.75-7 0-4.275-3.45-7-7.5-7zM2.55 8a7.25 7.25 0 014.2-6.55l-.95 2.85a.5.5 0 00.65.65l2.85-.95A7.25 7.25 0 012.55 8z"
                  clip-rule="evenodd" />
              </svg>
              <p class="text-sm text-gray-700">{{ eventData.location }}</p>
            </div>
            <!-- Descrição -->
            <div class="mt-4">
              <p class="text-sm text-gray-700">{{ eventData.description }}</p>
            </div>
            <!-- Categoria -->
            <div class="flex items-center mt-4">
              <span :style="{ backgroundColor: eventColor }" class="rounded-full h-3 w-3 mr-2"></span>
              <p class="text-sm text-gray-700">{{ eventData.calendarId }}</p>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <!-- Botão Eliminar -->
          <button @click="deleteEvent" type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 
            bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 
            focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
            Eliminar
          </button>
          <!-- Botão Editar -->
          <button @click="editEvent" type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 
            bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 
            focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
            Editar
          </button>
        </div>
      </div>
    </div>
  </div>

  <div v-show="showMapPopup" class="fixed z-10 inset-0 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Overlay -->
      <div class="fixed inset-0 transition-opacity" aria-hidden="true">
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <!-- Pop-up -->
      <div style="width: 70%"
        class="map-popup inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-full">
        <!-- Conteúdo do pop-up -->
        <div class="p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 ml-2"> Localização com Marcador </h3>
          <div class="mt-2 ml-2">
            <label for="locationPais" class="block text-sm font-medium text-gray-700">País destino:</label>
            <input type="text" id="locationPais" name="locationPais" v-model="searchQuery" @input="handleInput"
              @click="showResults = filteredCountries.length > 0" placeholder="Digite o nome de um país..."
              style="width: 30%; margin: 0px 3px 3px 3px"
              class="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm" />
            <div style="width: 30%; margin: 0px 3px 3px 30px" v-show="showResults" class="autocomplete-results"
              :class="{ show: showResults }">
              <div v-for="country in filteredCountries" :key="country.name" @click="selectCountry(country.name)"
                class="result-item"> {{ country.name }} </div>
            </div>
          </div>

          <div class="flex">
            <!-- Mapa -->
            <div class="map-container mx-auto relative" style="
                width: 70%;
                height: 400px;
                border: 3px solid #ccc;
                border-radius: 8px;
                margin: 20px 20px 5px 10px;
              ">
              <GoogleMap :apiKey="API_KEY" ref="mapRef" :center="center" :zoom="6" style="width: 100%; height: 100%"
                @click="mapClicked($event)">
                <Marker ref="markerRef" :options="{
                  position: markerCoordenates,
                  clickable: true,
                  draggable: true,
                  title: marker.title,
                }" @click="
                  markerClicked({
                    position: markerCoordenates,
                    clickable: true,
                    draggable: true,
                    title: marker.title,
                  })
                  " @dblclick="
                    markerDoubleClicked({
                      position: markerCoordenates,
                      clickable: true,
                      draggable: true,
                      title: marker.title,
                    })
                    " @dragend="markerDragged($event, marker)" />
              </GoogleMap>
            </div>

            <div class="w-1/3 bg-white p-4 shadow-lg ml-3">
              <h2 class="text-2xl font-semibold mb-4">Detalhes do Marcador</h2>
              <div>
                <p class="mb-2"><span class="font-semibold mr-2">Título:</span>{{ formData.title }}</p>
                <p class="mb-2"><span class="font-semibold mr-2">País:</span>{{ markerLocation.country }}</p>
                <p class="mb-2"><span class="font-semibold mr-2">Cidade:</span>{{ markerLocation.city }}</p>
                <p class="mb-2"><span class="font-semibold mr-2">Endereço Completo:</span>{{ markerLocation.address }}
                </p>
                <p class="mb-2" v-if="markerLocation.coordinates"><span class="font-semibold mr-2">Coordenadas:</span>{{
                  markerLocation.coordinates.lat }},{{ markerLocation.coordinates.lng }}</p>
                <p class="mb-2" v-show="locationError == true">
                  <span class="font-semibold mr-2 text-red-500">Erro:</span>
                  Localização Inválida
                </p>
              </div>
            </div>
          </div>
        </div>
        <!-- Botão Fechar -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button @click="guardarLocalizacao" type="button"
            class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium 
            text-blue-700 hover:bg-blue-700focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm">
            Guardar Localização
          </button>
          <button @click="closeMap" type="button"
            class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium 
            text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm">
            Fechar
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- POP UPS RESERVATIONS & ATTACHMENTS-->
  <div>
    <!--<div class="modal-backdrop fade show" v-if="openPopUpReservations"></div>-->
    <div class="modal" tabindex="-1" style="display: block" v-if="openPopUpReservations">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content custom-modal-content">
          <div class="modal-header custom-modal-header">
            <h5 v-if="newReservation.label === 'Flights'" class="modal-title custom-modal-title">{{ isNewReservation ?
              "Add your Flight" :
              showReservation ? "Flight Details" : "Edit your Reservation" }}</h5>
            <h5 v-if="newReservation.label === 'Lodging'" class="modal-title custom-modal-title">{{ isNewReservation ?
              "Add your Lodging" :
              showReservation ? "Lodging Details" : "Edit your Lodging" }}</h5>
            <h5 v-if="newReservation.label === 'Rental cars'" class="modal-title custom-modal-title">
              {{ isNewReservation ? "Add your Rental Car" : showReservation ?
                "Rental Car Details" : "Edit your Rental Car" }}</h5>
            <h5 v-if="newReservation.label === 'Other'" class="modal-title custom-modal-title">Add your Other</h5>
            <button type="button" @click="closePopUpReservations" aria-label="Close">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="modal-body" :class="{ 'readonly-container': showReservation }">
            <div v-if="newReservation.label === 'Flights'" class="mb-3">
              <label for="airline" class="form-label text-gray-700 font-bold">Airline <span
                  class="text-danger">*</span></label>
              <input type="text" id="airline" class="form-control" placeholder="Airline" v-model="newFlight.airline"
                @input="validateNewFlight"
                :class="{ 'is-valid': airlineValid && dialogSubmitedReservation, 'is-invalid': !airlineValid && dialogSubmitedReservation }">
              <div v-if="!airlineValid && dialogSubmitedReservation" class="invalid-format">{{
                errorMessageReservation.airline }}</div>
              <label for="departure" class="form-label mt-3 text-gray-700 font-bold">Departure <span
                  class="text-danger">*</span></label>
              <input type="text" id="departure" class="form-control" placeholder="Airport" @input="validateNewFlight"
                v-model="newFlight.departureAirport"
                :class="{ 'is-valid': departureValid && dialogSubmitedReservation, 'is-invalid': !departureValid && dialogSubmitedReservation }" />
              <input type="datetime-local" id="departure" class="form-control mt-2" @input="validateNewFlight"
                v-model="newFlight.departureDate" style="width: 50%;"
                :class="{ 'is-valid': departureDateValid && dialogSubmitedReservation, 'is-invalid': !departureDateValid && dialogSubmitedReservation }" />
              <div
                v-if="!departureValid && dialogSubmitedReservation || !departureDateValid && dialogSubmitedReservation"
                class="invalid-format">{{ errorMessageReservation.departure }}</div>

              <label for="arrival" class="form-label mt-3 text-gray-700 font-bold">Arrival <span
                  class="text-danger">*</span></label>
              <input type="text" id="arrival" class="form-control" placeholder="Airport" @input="validateNewFlight"
                v-model="newFlight.arrivalAirport"
                :class="{ 'is-valid': arrivalValid && dialogSubmitedReservation, 'is-invalid': !arrivalValid && dialogSubmitedReservation }" />
              <input type="datetime-local" id="arrival" class="form-control mt-2" v-model="newFlight.arrivalDate"
                @input="validateNewFlight" style="width: 50%;"
                :class="{ 'is-valid': arrivalDateValid && dialogSubmitedReservation, 'is-invalid': !arrivalDateValid && dialogSubmitedReservation }" />

              <div v-if="!arrivalValid && dialogSubmitedReservation || !arrivalDateValid && dialogSubmitedReservation"
                class="invalid-format">{{ errorMessageReservation.arrival }}</div>
              <div class="d-flex flex-row mt-3">
                <div class="col-8">
                  <label for="notes" class="form-label text-gray-700 font-bold">Notes</label>
                  <textarea id="notes" class="form-control" placeholder="Notes" v-model="newFlight.notes"></textarea>
                </div>
                <div class="col-4 ml-2">
                  <label for="price" class="form-label text-gray-700 font-bold">Price</label>
                  <input id="price" class="form-control" placeholder="Price" v-model="newFlight.price"></input>
                </div>
              </div>
            </div>
            <div v-if="newReservation.label === 'Lodging'" class="mb-3">
              <label for="location" class="form-label text-gary-700 font-bold">Location <span
                  class="text-danger">*</span></label>
              <input type="text" id="lodging" class="form-control" placeholder="Location" @input="validateNewLodging"
                v-model="newLodging.location"
                :class="{ 'is-invalid': !locationLodgingValid && dialogSubmitedLodging }" />
              <div v-if="!locationLodgingValid && dialogSubmitedLodging" class="invalid-format">{{
                errorMessageLodging.location }}</div>
              <div class="d-flex flex-row mt-3">
                <div class="col-6">
                  <label for="checkIn" class="form-label text-gary-700 font-bold">Check-in <span
                      class="text-danger">*</span></label>
                  <input type="datetime-local" id="checkIn" class="form-control" v-model="newLodging.checkInDate"
                    @input="validateNewLodging"
                    :class="{ 'is-valid': checkInValid && dialogSubmitedLodging, 'is-invalid': !checkInValid && dialogSubmitedLodging }" />
                </div>
                <div class="col-6">
                  <label for="checkOut" class="form-label text-gary-700 font-bold">Check-out <span
                      class="text-danger">*</span></label>
                  <input type="datetime-local" id="checkOut" class="form-control ml-2" v-model="newLodging.checkOutDate"
                    @input="validateNewLodging"
                    :class="{ 'is-valid': checkOutValid && dialogSubmitedLodging, 'is-invalid': !checkOutValid && dialogSubmitedLodging }" />
                </div>
              </div>
              <div v-if="!checkOutValid && dialogSubmitedLodging || !checkInValid && dialogSubmitedLodging"
                class="invalid-format">{{ errorMessageLodging.checkIn }}</div>
              <div class="d-flex flex-row mt-3">
                <div class="col-8">
                  <label for="notes" class="form-label text-gary-700 font-bold">Notes</label>
                  <textarea id="notes" class="form-control" placeholder="Notes" v-model="newLodging.notes"></textarea>
                </div>
                <div class="col-4 ml-2">
                  <label for="price" class="form-label text-gary-700 font-bold">Price</label>
                  <input id="price" class="form-control" placeholder="Price" v-model="newLodging.price"></input>
                </div>
              </div>
            </div>
            <div v-if="newReservation.label === 'Rental cars'">
              <label for="company" class="form-label text-gary-700 font-bold">Company <span
                  class="text-danger">*</span></label>
              <input type="text" id="company" class="form-control" placeholder="Company" v-model="newRentalCar.company"
                @input="validateNewRentalCar"
                :class="{ 'is-valid': companyValid && dialogSubmitedRentalCar, 'is-invalid': !companyValid && dialogSubmitedRentalCar }" />
              <div v-if="!companyValid && dialogSubmitedRentalCar" class="invalid-format">{{
                errorMessageRentalCar.company
              }}</div>
              <div class="d-flex flex-row mt-3">
                <div class="col-6 ">
                  <label for="pickUp" class="form-label text-gary-700 font-bold">Pick-up <span
                      class="text-danger">*</span></label>
                  <input type="datetime-local" id="pickUp" class="form-control" v-model="newRentalCar.pickUpDate"
                    @input="validateNewRentalCar"
                    :class="{ 'is-valid': pickUpValid && dialogSubmitedRentalCar, 'is-invalid': !pickUpValid && dialogSubmitedRentalCar }" />
                </div>
                <div class="col-6">
                  <label for="dropOff" class="form-label text-gary-700 font-bold ml-2">Drop-off <span
                      class="text-danger">*</span></label>
                  <input type="datetime-local" id="dropOff" class="form-control ml-2" @input="validateNewRentalCar"
                    v-model="newRentalCar.dropOffDate"
                    :class="{ 'is-valid': dropOffValid && dialogSubmitedRentalCar, 'is-invalid': !dropOffValid && dialogSubmitedRentalCar }" />
                </div>
              </div>
              <div v-if="!dropOffValid && dialogSubmitedRentalCar || !pickUpValid && dialogSubmitedRentalCar"
                class="invalid-format">{{ errorMessageRentalCar.pickUp }}</div>
              <div class="d-flex flex-row mt-3">
                <div class="col-8">
                  <label for="notes" class="form-label text-gary-700 font-bold">Notes</label>
                  <textarea id="notes" class="form-control" placeholder="Notes" v-model="newRentalCar.notes"></textarea>
                </div>
                <div class="col-4 ml-2">
                  <label for="price" class="form-label text-gary-700 font-bold">Price</label>
                  <input id="price" class="form-control" placeholder="Price" v-model="newRentalCar.price"></input>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closePopUpReservations">Close</button>
            <button v-if="!showReservation" type="button" class="btn btn-primary" @click="createNewReservation">{{
              isNewReservation ? 'Add' : 'Save' }}</button>
            <button v-if="showReservation && isOrganizer" type="button" class="btn btn-primary"
              @click="showReservation = false">Edit</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- POP UP ADD EVENT -->
  <div class="modal" tabindex="-1" style="display: block;" v-if="dialog">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content custom-modal-content" :class="{ 'readonly-container': showEvent }">
        <div class="modal-header custom-modal-header">
          <h3 v-if="!showEvent" class="modal-title custom-modal-title">
            {{ isNewEvent ? "New Event" : "Edit Event" }}
          </h3>
          <h3 v-if="showEvent" class="modal-title custom-modal-title">Event Details</h3>
          <button type="button" @click="closeDialog" aria-label="Close">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="criarEvento">
            <div>
              <div class="relative">
                <!-- Dropdown -->
                <label for="view" class="form-label text-gary-700 font-bold">Category <span
                    class="text-danger">*</span></label>
                <!-- Dropdown Content -->
                <div>
                  <div class="relative">
                    <button @click="toggleDropdown" type="button" aria-haspopup="listbox" aria-expanded="true"
                      class="form-control">
                      <div class="flex items-center">
                        <span :style="{
                          backgroundColor: testColor(selectedView),
                        }" class="rounded-full h-3 w-3 inline-block mr-1"></span>
                        <span class="block truncate">{{ selectedView === "" ? 'Select Category' : selectedView }}</span>
                      </div>
                    </button>
                    <div v-show="dropdownOpen" class="absolute mt-1 w-full bg-white shadow-lg rounded-md z-10"
                      role="listbox" aria-labelledby="listbox-label" tabindex="-1">
                      <ul
                        class="py-1 overflow-auto pl-3 mb-0 max-h-60 rounded-md ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                        tabindex="0" role="listbox" aria-labelledby="listbox-label"
                        aria-activedescendant="listbox-item-3">
                        <template v-for="view in views" :key="view.id">
                          <li v-if="!view.name.includes('defaultCategoryFor')" @click="selectView(view)"
                            class="text-gray-900 cursor-default select-none relative py-2  pr-9 hover:bg-gray-100"
                            role="option">
                            <div class="flex items-center">
                              <span :style="{
                                backgroundColor: view.backgroundColor,
                              }" class="rounded-full h-3 w-3 inline-block mr-1"></span>
                              <span :class="{
                                'font-semibold': view.name === selectedView,
                              }" class="block truncate">{{ view.name }}
                              </span>
                            </div>
                          </li>
                        </template>
                      </ul>
                    </div>
                  </div>
                </div>
                <!-- Input de Título -->
                <div class="mt-3">
                  <label for="title" class="form-label text-gary-700 font-bold">Title <span
                      class="text-danger">*</span></label>
                  <input type="text" v-model="formData.title" id="title" name="title" class="form-control"
                    :class="{ 'is-valid': titleValid && dialogSubmited, 'is-invalid': !titleValid && dialogSubmited }"
                    placeholder="Title" @input="validateNewEvent()" />
                  <div v-if="!titleValid && dialogSubmited" class="invalid-format">{{ errorMessage.title }}</div>
                </div>
                <!-- Input de Localização -->
                <div class="mt-3">
                  <label for="place" class="form-label text-gary-700 font-bold">Location <span
                      class="text-danger">*</span></label>
                  <div class="flex items-center">
                    <input id="place" type="text" v-model="formData.location" name="place" class="form-control w-full"
                      :class="{ 'is-invalid': locationValid && dialogSubmited, 'is-invalid': !locationValid && dialogSubmited }"
                      placeholder="Location" @input="validateNewEvent()" />
                    <!--
                    <button type="button"
                      class="ml-2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      @click="openMap">
                      
                      <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                        fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd"
                          d="M10 2a5 5 0 00-4.95 4.688L4 10h.636a7.5 7.5 0 017.528-6.5c.331 0 .659.027.983.082a7.5 7.5 0 011.504 14.905 5.5 5.5 0 01-9.976-.045A7.5 7.5 0 015.528 18H6a2 2 0 002-2v-2a2 2 0 00-2-2h-.528A7.5 7.5 0 013.636 8H3.5a5 5 0 000 10h13a5 5 0 000-10h-.136A7.5 7.5 0 0116 10h.364a2 2 0 002-2V6a2 2 0 00-2-2h-.364A7.5 7.5 0 0113.636 2H13z"
                          clip-rule="evenodd" />
                      </svg>
                    </button>-->
                  </div>
                  <div v-if="!locationValid && dialogSubmited" class="invalid-format">{{ errorMessage.location }}</div>
                </div>
                <!-- Input de Data e Hora -->
                <div class="mt-3">
                  <label for="datetime" class="form-label text-gary-700 font-bold">Date and Hour <span
                      class="text-danger">*</span></label>
                  <div class="flex rounded-md gap-2">
                    <input type="datetime-local" v-model="formData.datetime" id="datetime" name="datetime"
                      @input="validateNewEvent()"
                      :class="{ 'is-invalid': datetimeValid && dialogSubmited, 'is-invalid': !datetimeValid && dialogSubmited }"
                      class="form-control" />
                    <input type="datetime-local" v-model="formData.endDatetime" id="endDatetime" name="endDatetime"
                      @input="validateNewEvent()"
                      :class="{ 'is-invalid': endDatetimeValid && dialogSubmited, 'is-invalid': !endDatetimeValid && dialogSubmited }"
                      class="form-control" />
                  </div>
                  <div v-if="!datetimeValid && dialogSubmited || !endDatetimeValid && dialogSubmited"
                    class="invalid-format">{{ errorMessage.datetime }}</div>
                </div>
                <div class="d-flex flex-row mt-3">
                  <div class="col-8 ">
                    <label for="notes" class="form-label text-gary-700 font-bold">Description</label>
                    <textarea id="notes" class="form-control" placeholder="Description"
                      v-model="formData.description"></textarea>
                  </div>
                  <div class="col-4 ml-2">
                    <label for="price" class="form-label text-gary-700 font-bold">Price</label>
                    <input id="price" class="form-control" placeholder="Price" v-model="formData.price" inputmode="numeric"
                    pattern="[0-9]*"  @input="formData.price = formData.price.replace(/[^0-9.]/g, '').replace(/^([^.]*\.)|\./g, '$1')"></input>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" @click="closeDialog" class="btn btn-secondary">{{ showEvent ? "Close" :
            "Cancel" }}</button>
          <button v-if="!showEvent" type="button" @click="criarEvento(formData)" class="btn btn-primary">{{ isNewEvent ?
            "Create" : "Save" }}</button>
          <button v-if="showEvent && isOrganizer" type="button" @click="showEvent = false; activateAutocomplete = true"
            class="btn btn-primary">Edit</button>
        </div>
      </div>
    </div>
  </div>

  <!-- POP UP BUDGET DETAILS -->
  <div class="modal" tabindex="-1" style="display: block;" v-if="showBudgetDetails">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content custom-modal-content">
        <div class="modal-header custom-modal-header">
          <h5 class="modal-title custom-modal-title">Budget Details</h5>
          <button type="button" @click="showBudgetDetails = false" aria-label="Close">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="modal-body" style="overflow-y: auto; max-height: 40rem;">
          <div v-for="event in eventsWithPrice">
            <div class="card mb-3">
              <div class="card-body">
                <div class="d-flex align-items-baseline">
                  <span v-if="!event.marker.type" :style="{ backgroundColor: getEventColor(event.calendarId), }"
                    style="justify-items: center; " class="rounded-full h-3 w-3 inline-block mr-1"></span>
                  <h5 class="card-title">{{ event.title }}</h5>
                </div>
                <p class="card-text">{{ event.description }}</p>
                <p class="card-text">Price: {{ event.price }}€</p>
              </div>
            </div>

          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showBudgetDetails = false">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch, watchEffect } from "vue";
import { Loader } from "@googlemaps/js-api-loader"
import { useRoute } from "vue-router";
import { useRouter } from "vue-router";
import { getAuth } from 'firebase/auth';
import TripMap from "./TripMap.vue";
import TripList from "./TripList.vue";
import TuiCalendar from "toast-ui-calendar-vue3";
import "toast-ui-calendar-vue3/dist/style.css";
import { GoogleMap, Marker } from "vue3-google-map";
import axios from "axios";
import { TZDate } from "@toast-ui/calendar";
import { collection, getDocs, getFirestore, doc, addDoc, Timestamp, updateDoc, deleteDoc, where, query, getDoc } from "firebase/firestore";
import { useToast } from "vue-toastification";

const route = useRoute();
const router = useRouter();
const auth = getAuth();
const API_KEY = ref(import.meta.env.API_KEY);
const toast = useToast();
const db = getFirestore();
const currentUserId = ref(null);
const organizerId = ref(null);
const emit = defineEmits(["trip"]);
const showCalendar = ref(true);
const showMap = ref(false);
const tripId = ref();
const selectedCategory = ref("all");
const allEvents = ref([]);
const auxEvents = ref([]);
const eventsWithPrice = ref([]);
const allReservations = ref();
const mapKey = ref(0);
const trip = ref();
const place = ref();
const centerEvent = ref();
const openPopUpReservations = ref(false);
const isNewReservation = ref(false);
const newReservation = ref(null);
const showBudgetDetails = ref(false);
const reservationEncontrada = ref(null);
const showEvent = ref(false);
const showReservation = ref(false);
const startDate = ref();
const endDate = ref();
const triploaded = ref(false);
const budget = ref(0);
const disableDaysDate = ref();
const startCalendarDay = ref();
const diaSemanaAjustado = ref();
const previousWeekDisable = ref();
const nextWeekDisable = ref();
const reservations = ref([
  { icon: 'bi bi-calendar-plus', label: 'Events' },
  { icon: 'bi bi-airplane', label: 'Flights' },
  { icon: 'bi bi-house', label: 'Lodging' },
  { icon: 'bi bi-car-front', label: 'Rental cars' },
  //{ icon: 'bi bi-three-dots', label: 'Other' },
]);
const newFlight = ref({
  airline: "",
  marker: {},
  arrivalMarker: {},
  iata_code: "",
  departureDate: "",
  departureAirport: "",
  arrivalDate: "",
  arrivalAirport: "",
  price: "",
  flightNumber: "",
  notes: "",
});
const newLodging = ref({
  location: "",
  marker: {},
  checkInDate: "",
  checkOutDate: "",
  address: "",
  price: "",
  notes: "",
});
const newRentalCar = ref({
  company: "",
  marker: {},
  pickUpDate: "",
  dropOffDate: "",
  price: "",
  notes: "",
});
const showEventList = ref(true);
const isEventListVisible = ref(true);
const isReservationListVisible = ref(false);

function formatDateTime(dateTimeString) {
  const date = new Date(dateTimeString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} - ${hours}:${minutes}h`;
}

const isOrganizer = computed(() => {
    //console.log("==========> currentUserId.value: ", currentUserId.value);
    //console.log("==========> organizerId.value: ", organizerId.value);
    
    return currentUserId.value === organizerId.value;
});

const setEventListVisible = () => {
  isEventListVisible.value = true;
  isReservationListVisible.value = false;
};

const setReservationListVisible = () => {
  isReservationListVisible.value = true;
  isEventListVisible.value = false;
};


const toggleEventVisibility = () => {
  showEventList.value = !showEventList.value;
};

function toggleCalendar() {
  showCalendar.value = !showCalendar.value;
}

function showListButton() {
  showEventList.value = true;
}

function hideListButton() {
  showEventList.value = false;
}

function toggleMap() {
  showMap.value = !showMap.value;
}

const calendarRef = ref();
const formatarData = (data) => {
  const dia = data.getDate();
  const mes = data.getMonth() + 1;
  const ano = data.getFullYear();

  return `${dia}/${mes}/${ano} `;
};

function modelReservations(reservation) {

  if(!isOrganizer.value) {
    toast.error("You don't have permission to add reservations to this trip.");
    return;
  }

  newReservation.value = reservation;
  //console.log(reservation);
  isNewReservation.value = true;
  openPopUpReservations.value = true;
}



const closePopUpReservations = () => {
  showReservation.value = false;
  openPopUpReservations.value = false;
  newReservation.value = null;
  newFlight.value = {
    airline: "",
    departureDate: "",
    marker: {},
    arrivalMarker: {},
    iataCodeDeparture: "",
    iataCodeArrival: "",
    departureAirport: "",
    arrivalDate: "",
    arrivalAirport: "",
    price: "",
    flightNumber: "",
    notes: "",
  };
  newLodging.value = {
    location: "",
    checkInDate: "",
    marker: {},
    checkOutDate: "",
    address: "",
    price: "",
    notes: "",
  };
  newRentalCar.value = {
    company: "",
    marker: {},
    pickUpDate: "",
    dropOffDate: "",
    price: "",
    notes: "",
  };

  dialogSubmitedReservation.value = false;
  dialogSubmitedRentalCar.value = false;
  dialogSubmitedLodging.value = false;
  errorMessageReservation.value = {
    airline: "",
    departure: "",
    departureDate: "",
    arrival: "",
    arrivalDate: "",
  }
  errorMessageRentalCar.value = {
    company: "",
    pickUp: "",
    dropOff: "",
  };
  errorMessageLodging.value = {
    location: "",
    checkIn: "",
    checkOut: "",
  };

};

async function createNewReservation() {
  if (newReservation.value.label === 'Flights') {
    dialogSubmitedReservation.value = true;
    validateNewFlight();
    if (!airlineValid.value || !departureValid.value || !arrivalValid.value || !departureDateValid.value || !arrivalDateValid.value) {
      toast.error("Errors in the form");
      return;
    }

    newFlight.value.iataCodeDeparture = await fetchIATACode(newFlight.value.marker.lat, newFlight.value.marker.lng);
    //console.log('newFlight', newFlight.value);
    newFlight.value.iataCodeArrival = await fetchIATACode(newFlight.value.arrivalMarker.lat, newFlight.value.arrivalMarker.lng);

    if (isNewReservation.value === true) {
      await addDoc(collection(db, "flights"), {
        airline: newFlight.value.airline,
        marker: newFlight.value.marker,
        arrivalMarker: newFlight.value.arrivalMarker,
        iataCodeDeparture: newFlight.value.iataCodeDeparture,
        iataCodeArrival: newFlight.value.iataCodeArrival,
        departureDate: newFlight.value.departureDate,
        departureAirport: newFlight.value.departureAirport,
        arrivalDate: newFlight.value.arrivalDate,
        arrivalAirport: newFlight.value.arrivalAirport,
        price: newFlight.value.price,
        flightNumber: newFlight.value.flightNumber,
        notes: newFlight.value.notes,
        tripId: tripId.value,
      });
    } else {
      await updateDoc(doc(db, "flights", eventoSelecionado.value), {
        airline: newFlight.value.airline,
        marker: newFlight.value.marker,
        arrivalMarker: newFlight.value.arrivalMarker,
        iataCodeDeparture: newFlight.value.iataCodeDeparture,
        iataCodeArrival: newFlight.value.iataCodeArrival,
        departureDate: newFlight.value.departureDate,
        departureAirport: newFlight.value.departureAirport,
        arrivalDate: newFlight.value.arrivalDate,
        arrivalAirport: newFlight.value.arrivalAirport,
        price: newFlight.value.price,
        flightNumber: newFlight.value.flightNumber,
        notes: newFlight.value.notes,
        tripId: tripId.value,
      });
    }

  } else if (newReservation.value.label === 'Lodging') {
    dialogSubmitedLodging.value = true;
    validateNewLodging();
    if (!locationLodgingValid.value || !checkInValid.value || !checkOutValid.value) {
      toast.error("Errors in the form");
      return;
    }

    if (isNewReservation.value === true) {
      await addDoc(collection(db, "lodging"), {
        location: newLodging.value.location,
        checkInDate: newLodging.value.checkInDate,
        marker: newLodging.value.marker,
        checkOutDate: newLodging.value.checkOutDate,
        address: newLodging.value.address,
        price: newLodging.value.price,
        notes: newLodging.value.notes,
        tripId: tripId.value,
      });
    } else {
      await updateDoc(doc(db, "lodging", eventoSelecionado.value), {
        location: newLodging.value.location,
        checkInDate: newLodging.value.checkInDate,
        marker: newLodging.value.marker,
        checkOutDate: newLodging.value.checkOutDate,
        address: newLodging.value.address,
        price: newLodging.value.price,
        notes: newLodging.value.notes,
        tripId: tripId.value,
      });
    }
  } else if (newReservation.value.label === 'Rental cars') {
    dialogSubmitedRentalCar.value = true;
    validateNewRentalCar();
    if (!companyValid.value || !pickUpValid.value || !dropOffValid.value) {
      toast.error("Errors in the form");
      return;
    }

    if (isNewReservation.value === true) {
      await addDoc(collection(db, "rentalCars"), {
        company: newRentalCar.value.company,
        marker: newRentalCar.value.marker,
        pickUpDate: newRentalCar.value.pickUpDate,
        dropOffDate: newRentalCar.value.dropOffDate,
        price: newRentalCar.value.price,
        notes: newRentalCar.value.notes,
        tripId: tripId.value,
      });
    } else {
      await updateDoc(doc(db, "rentalCars", eventoSelecionado.value), {
        company: newRentalCar.value.company,
        marker: newRentalCar.value.marker,
        pickUpDate: newRentalCar.value.pickUpDate,
        dropOffDate: newRentalCar.value.dropOffDate,
        price: newRentalCar.value.price,
        notes: newRentalCar.value.notes,
        tripId: tripId.value,
      });
    }
  }
  getEvents();
  getReservations();
  closePopUpReservations();
}

watch(newReservation, async (newValue) => {
  if (newValue) {
    const loader = new Loader({
      apiKey: import.meta.env.API_KEY,
      version: "weekly",

    });
    const Places = await loader.importLibrary('places')

    if (newReservation.value.label === 'Flights') {
      console.log('Flights');


      const input = document.getElementById("departure"); //binds to our input element
      console.log('input', input);
      const input2 = document.getElementById("arrival"); //binds to our input element
      console.log('input2', input2);


      //this object will be our second arg for the new instance of the Places API
      const options = {
        types: ["airport"], //optional
        fields: ["address_components", "geometry", "name"], //allows the api to accept these inputs and return similar ones
        strictBounds: false, //optional
      };

      // per the Google docs create the new instance of the import above. I named it Places.
      const autocomplete = new Places.Autocomplete(input, options);
      const autocomplete2 = new Places.Autocomplete(input2, options);

      //add the place_changed listener to display results when inputs change
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace(); //this callback is inherent you will see it if you logged autocomplete
        console.log('place', place);
        newFlight.value.departureAirport = place.name;
        newFlight.value.marker = place.geometry.location.toJSON();

      });

      autocomplete2.addListener('place_changed', () => {
        const place = autocomplete2.getPlace(); //this callback is inherent you will see it if you logged autocomplete
        console.log('place', place);
        newFlight.value.arrivalAirport = place.name;
        newFlight.value.arrivalMarker = place.geometry.location.toJSON();
      });
    }
    else if (newReservation.value.label === 'Lodging') {
      console.log('Lodging');
      const input = document.getElementById("lodging"); //binds to our input element
      console.log('input', input);
      const options = {
        types: ["lodging"], //optional
        fields: ["address_components", "geometry", "name", "formatted_address"], //allows the api to accept these inputs and return similar ones
        strictBounds: false, //optional
      };

      const autocomplete = new Places.Autocomplete(input, options);

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace(); //this callback is inherent you will see it if you logged autocomplete
        console.log('place', place);
        newLodging.value.location = place.name;
        newLodging.value.address = place.formatted_address;
        newLodging.value.marker = place.geometry.location.toJSON();
      });

    }
    else if (newReservation.value.label === 'Rental cars') {
      console.log('Rental cars');
      const input = document.getElementById("company"); //binds to our input element
      console.log('input', input);
      const options = {
        types: ["car_rental"], //optional
        fields: ["address_components", "geometry", "name", "formatted_address"], //allows the api to accept these inputs and return similar ones
        strictBounds: false, //optional
      };
      const autocomplete = new Places.Autocomplete(input, options);

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace(); //this callback is inherent you will see it if you logged autocomplete
        console.log('place', place);
        newRentalCar.value.company = place.name;
        newRentalCar.value.marker = place.geometry.location.toJSON();
      });
    }
    else if (newReservation.value.label === 'Other') {
      console.log('Other');
    }
  }
});

async function fetchIATACode(lat, lng) {
  try {
    const response = await axios.get(`https://iatageo.com/getCode/${lat}/${lng}`);
    console.log('response', response.data.IATA);
    return response.data.IATA;
  } catch (error) {
    console.error('Erro ao obter código IATA:', error);
    throw error;
  }
}

const calculateBudget = () => {
  budget.value = 0;
  eventsWithPrice.value = [];
  allEvents.value.forEach((events) => {
    if (events.price !== undefined && events.price !== null && events.price !== "" && events.price !== 0 && events.price !== "-" && eventsWithPrice.value.find((event) => event.id === events.id) === undefined) {
      events.price = events.price.replace(",", ".");
      budget.value += parseFloat(events.price);
      eventsWithPrice.value.push(events);
    }
  });
};

watch(selectedCategory, (newValue) => {
  if (selectedCategory.value === "all") {
    events.value = auxEvents.value;
    mapKey.value += 1;
  } else {
    events.value = allEvents.value.filter(
      (event) => event.calendarId === selectedCategory.value.id
    );
    allEvents.value = auxEvents.value;
    mapKey.value += 1;
  }
});

const openBudgetModal = () => {
  console.log('eventsWithPrice', eventsWithPrice.value);
  showBudgetDetails.value = true;
};

const eventClickedInMap = (event) => {
  if (event.marker.type) {
    if (event.marker.type === 'flight') {
      newReservation.value = { label: 'Flights' };
    }
    else if (event.marker.type === 'lodging') {
      newReservation.value = { label: 'Lodging' };
    }
    else if (event.marker.type === 'rentalCar') {
      newReservation.value = { label: 'Rental cars' };
    }

    viewReservation(event.id);
  }
  else {
    viewEvent(event.id);
    //showEventList.value = true;
  }
};

const options = computed(() => ({
  week: {
    dayNames: [],
    startDayOfWeek: 1,
    narrowWeekend: false,
    workweek: false,
    showNowIndicator: true,
    showTimezoneCollapseButton: false,
    timezonesCollapsed: true,
    hourStart: 0,
    hourEnd: 24,
    eventView: ["time"],
    taskView: false,
    collapseDuplicateEvents: true,
    hourGuideWidth: 50,
  },
}));

const views = ref([]);

async function getTrip() {
  tripId.value = route.params.tripId;
  trip.value = (await getDoc(doc(db, "trips", tripId.value))).data();
  center.value = trip.value.center;
  organizerId.value = trip.value.organizer;

  trip.value.categories.forEach((category) => {
    const data = {
      id: category.name.toLowerCase(),
      name: category.name,
      backgroundColor: category.color,
      borderColor: category.color,
      dragBackgroundColor: category.color,
    };
    views.value.push(data);
  });

  startDate.value = trip.value.start_date;
  endDate.value = trip.value.end_date;
  calendarRef.value.getInstance().setDate(trip.value.start_date);
  mapRef.value.map.setCenter(center.value);
  mapRef.value.map.setZoom(6);

  disableDaysDate.value = new Date(trip.value.start_date);
  const diaSemana = disableDaysDate.value.getDay();
  diaSemanaAjustado.value = (diaSemana === 0) ? 6 : diaSemana - 1;
  console.log('Posição do dia na semana:', diaSemanaAjustado);
  disableDaysDate.value.setDate(disableDaysDate.value.getDate() - diaSemanaAjustado.value);
  startCalendarDay.value = new Date(disableDaysDate.value);
  previousWeekDisable.value = new Date(new Date(disableDaysDate.value.getTime() - 7 * 24 * 60 * 60 * 1000));
  nextWeekDisable.value = new Date(new Date(disableDaysDate.value.getTime() + 7 * 24 * 60 * 60 * 1000));
  disableDays();

  triploaded.value = true;
}

const disableDays = () => {
  calendarRef.value.getInstance().render();

  for (let i = 0; i <= 6; i++) {
    const start = new Date(disableDaysDate.value);
    start.setDate(start.getDate() + i);
    if (!isDateInRange(start)) {
      if (i === 6) {
        const element = document.querySelector(`.toastui-calendar-column[data-testid="timegrid-column-${0}"]`);
        element.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
      } else {
        const element = document.querySelector(`.toastui-calendar-column[data-testid="timegrid-column-${i + 1}"]`);
        element.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
      }
    }
  }
};

function getCategoryName(id) {
  const category = views.value.find((view) => view.id === id);
  return category ? category.name : "";
}

function previousWeek() {
  calendarRef.value.getInstance().prev();
  disableDaysDate.value.setDate(disableDaysDate.value.getDate() - 7);
  previousWeekDisable.value = new Date(disableDaysDate.value.getTime() - 1 * 24 * 60 * 60 * 1000);
  nextWeekDisable.value = new Date(disableDaysDate.value.getTime() + 7 * 24 * 60 * 60 * 1000);
  console.log('previous', disableDaysDate.value);
  console.log('previousDisable', previousWeekDisable.value);
  disableDays();
}

function nextWeek() {
  calendarRef.value.getInstance().next();
  disableDaysDate.value.setDate(disableDaysDate.value.getDate() + 7);
  nextWeekDisable.value = new Date(disableDaysDate.value.getTime() + 7 * 24 * 60 * 60 * 1000);
  previousWeekDisable.value = new Date(disableDaysDate.value.getTime() - 1 * 24 * 60 * 60 * 1000);
  console.log('nextDisable', nextWeekDisable.value);
  console.log('previousDisable', previousWeekDisable.value);
  console.log('next', disableDaysDate.value);
  disableDays();
}

function todayWeek() {
  calendarRef.value.getInstance().setDate(trip.value.start_date);
  disableDaysDate.value = startCalendarDay.value;
  previousWeekDisable.value = new Date(disableDaysDate.value.getTime() - 1 * 24 * 60 * 60 * 1000);
  nextWeekDisable.value = new Date(disableDaysDate.value.getTime() + 7 * 24 * 60 * 60 * 1000);
  console.log('previousDisable', previousWeekDisable.value);
  console.log('nextDisable', nextWeekDisable.value);
  console.log('today', disableDaysDate.value);
  disableDays();
}

const events = ref([]);
const isLoading = ref(true);
const expandedDates = ref([]);

const groupedEvents = computed(() => {
  const grouped = {};
  events.value.forEach((event) => {
    const date = new Date(event.start).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(event);
  });
  return grouped;
});

const groupedEventsByCategory = computed(() => {
  const grouped = {};
  events.value.forEach((event) => {
    if (!grouped[event.calendarId]) {
      grouped[event.calendarId] = [];
    }
    grouped[event.calendarId].push(event);
  });
  return grouped;
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};

const toggleEventList = (date) => {
  if (isExpanded(date)) {
    expandedDates.value = expandedDates.value.filter((d) => d !== date);
  } else {
    expandedDates.value.push(date);
  }
};

const isExpanded = (date) => {
  return expandedDates.value.includes(date);
};

async function getEvents() {
  events.value = [];
  tripId.value = route.params.tripId;
  const eventos = await getDocs(
    query(collection(db, "events"), where("tripId", "==", tripId.value))
  );
  console.log(eventos.docs.map((doc) => doc.data()));

  eventos.forEach((event) => {
    const data = {
      id: event.id,
      calendarId: event.data().calendarId,
      title: event.data().title,
      price: event.data().price,
      location: event.data().location,
      isAllday: event.data().isAllday,
      isPrivate: event.data().isPrivate,
      state: event.data().state,
      start: new TZDate(event.data().start.toDate()),
      end: new TZDate(event.data().end.toDate()),
      isReadonly: false,
      description: event.data().description,
      marker: event.data().marker,
    };

    events.value.push(data);
  });

  isLoading.value = false;
  allEvents.value = events.value;
  auxEvents.value = events.value;

  if (selectedCategory.value === "all" || selectedCategory.value === "") {
    events.value = auxEvents.value;
  } else {
    events.value = allEvents.value.filter(
      (event) => event.calendarId === selectedCategory.value.id
    );
  }
}


async function getReservations() {
  allReservations.value = {
    flights: [],
    lodging: [],
    rentalCars: [],
  };
  tripId.value = route.params.tripId;

  views.value.push({
    id: "defaultCategoryForFlights",
    name: "defaultCategoryForFlights",
    backgroundColor: "#5cceee",
    borderColor: "#5cceee",
    dragBackgroundColor: "#5cceee",
  })
    ;
  views.value.push({
    id: "defaultCategoryForLodging",
    name: "defaultCategoryForLodging",
    backgroundColor: "#f6e58d",
    borderColor: "#f6e58d",
    dragBackgroundColor: "#f6e58d",
  });

  views.value.push({
    id: "defaultCategoryForRentalCars",
    name: "defaultCategoryForRentalCars",
    backgroundColor: "#f9ca24",
    borderColor: "#f9ca24",
    dragBackgroundColor: "#f9ca24",
  });

  const flights = await getDocs(
    query(collection(db, "flights"), where("tripId", "==", tripId.value))
  );

  flights.forEach((flight) => {
    const data = {
      id: flight.id,
      label: "Flights",
      airline: flight.data().airline,
      iataCodeArrival: flight.data().iataCodeArrival,
      iataCodeDeparture: flight.data().iataCodeDeparture,
      departureDate: flight.data().departureDate,
      departureAirport: flight.data().departureAirport,
      arrivalDate: flight.data().arrivalDate,
      arrivalAirport: flight.data().arrivalAirport,
      price: flight.data().price,
      flightNumber: flight.data().flightNumber,
      notes: flight.data().notes,
      marker: flight.data().marker,
      arrivalMarker: flight.data().arrivalMarker,
    };

    allReservations.value.flights.push(data);
    events.value.push({
      id: flight.id,
      calendarId: "defaultCategoryForFlights",
      title: `✈️ ${flight.data().airline}`,
      price: flight.data().price,
      location: flight.data().departureAirport,
      isAllday: false,
      isPrivate: false,
      state: "Busy",
      start: new TZDate(flight.data().departureDate),
      end: new TZDate(flight.data().arrivalDate),
      isReadonly: false,
      description: flight.data().notes,
      marker: { position: flight.data().marker, type: "flights" },
    });
  });

  const lodging = await getDocs(
    query(collection(db, "lodging"), where("tripId", "==", tripId.value))
  );

  lodging.forEach((lodging) => {
    const data = {
      id: lodging.id,
      label: "Lodging",
      location: lodging.data().location,
      checkInDate: lodging.data().checkInDate,
      checkOutDate: lodging.data().checkOutDate,
      address: lodging.data().address,
      price: lodging.data().price,
      notes: lodging.data().notes,
      marker: lodging.data().marker,
    };

    allReservations.value.lodging.push(data);
    const start = new TZDate(lodging.data().checkInDate);
    const endDate = new TZDate(lodging.data().checkOutDate);
    events.value.push({
      id: lodging.id,
      calendarId: "defaultCategoryForLodging",
      title: `🏨 ${lodging.data().location}`,
      price: lodging.data().price,
      location: lodging.data().address,
      isAllday: false,
      isPrivate: false,
      state: "Busy",
      start: new TZDate(lodging.data().checkInDate),
      end: start.setHours(start.getHours() + 1),
      isReadonly: false,
      description: lodging.data().notes,
      marker: { position: lodging.data().marker, type: "lodging" },
    });

    events.value.push({
      id: lodging.id,
      calendarId: "defaultCategoryForLodging",
      title: `🏨 ${lodging.data().location}`,
      price: lodging.data().price,
      location: lodging.data().address,
      isAllday: false,
      isPrivate: false,
      state: "Busy",
      start: new TZDate(lodging.data().checkOutDate),
      end: endDate.setHours(endDate.getHours() + 1),
      isReadonly: false,
      description: lodging.data().notes,
      marker: { position: lodging.data().marker, type: "lodging" },
    });

    console.log(events.value);
  });

  const rentalCars = await getDocs(
    query(collection(db, "rentalCars"), where("tripId", "==", tripId.value))
  );

  rentalCars.forEach((rentalCar) => {
    const data = {
      id: rentalCar.id,
      label: "Rental cars",
      company: rentalCar.data().company,
      pickUpDate: rentalCar.data().pickUpDate,
      dropOffDate: rentalCar.data().dropOffDate,
      price: rentalCar.data().price,
      notes: rentalCar.data().notes,
      marker: rentalCar.data().marker,
    };

    allReservations.value.rentalCars.push(data);
    const start = new TZDate(rentalCar.data().pickUpDate);
    const endDate = new TZDate(rentalCar.data().dropOffDate);
    events.value.push({
      id: rentalCar.id,
      calendarId: "defaultCategoryForRentalCars",
      title: `🚗 ${rentalCar.data().company}`,
      price: rentalCar.data().price,
      location: rentalCar.data().company,
      isAllday: false,
      isPrivate: false,
      state: "Busy",
      start: new TZDate(rentalCar.data().pickUpDate),
      end: start.setHours(start.getHours() + 1),
      isReadonly: false,
      description: rentalCar.data().notes,
      marker: { position: rentalCar.data().marker, type: "rentalCars" },
    });

    events.value.push({
      id: rentalCar.id,
      calendarId: "defaultCategoryForRentalCars",
      title: `🚗 ${rentalCar.data().company}`,
      price: rentalCar.data().price,
      location: rentalCar.data().company,
      isAllday: false,
      isPrivate: false,
      state: "Busy",
      start: new TZDate(rentalCar.data().dropOffDate),
      end: endDate.setHours(endDate.getHours() + 1),
      isReadonly: false,
      description: rentalCar.data().notes,
      marker: { position: rentalCar.data().marker, type: "rentalCars" },
    });

    console.log(events.value);
  });
  mapKey.value += 1;
  calculateBudget();

}

/////  Formulário pop-up

const dialog = ref(false);
const isNewEvent = ref(true);
const formData = ref({
  view: "",
  title: "",
  location: "",
  description: "",
  datetime: null,
  price: "",
  tripId: tripId.value,
  endDatetime: null,
  marker: null,
});

const showEvents = ref(true);
const activateAutocomplete = ref(false);

function formatLocalISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}


const openDialog = (event) => {

  if(!isOrganizer.value) {
    toast.error("You don't have permission to add events to this trip");
    return;
  }

  if (event != null) {
    formData.value.datetime = formatLocalISODate(event.start);
    formData.value.endDatetime = formatLocalISODate(event.end);
  } else { isNewEvent.value = true; }

  selectedView.value = views.value.find(view => !view.name.includes('defaultCategoryFor'))?.name || 'No Category';
  selectedViewId.value = views.value.find(view => !view.name.includes('defaultCategoryFor'))?.id || 'No Category';

  markerCoordenates.value = center.value;
  mapRef.value.map.setCenter(center.value);
  mapRef.value.map.setZoom(6);
  isNewEvent.value = true;
  showEventList.value = true;
  dialog.value = true;
  showEvents.value = false;
  activateAutocomplete.value = true;
};

const eventoSelecionado = ref(null);

const editEvent = (eventId) => {

  if(!isOrganizer.value) {
    toast.error("You don't have permission to edit events in this trip");
    return;
  }

  closeDialogDetails();
  showEvents.value = false;
  isNewEvent.value = false;

  if (eventId != null && typeof eventId === "string") {
    eventoSelecionado.value = eventId;
    console.log(eventId);
  }

  console.log(eventoSelecionado.value);

  const eventoEncontrado = events.value.find(
    (ev) => ev.id === eventoSelecionado.value
  );

  console.log(eventoEncontrado);
  formData.value = {
    view: eventoEncontrado.calendarId,
    title: eventoEncontrado.title,
    location: eventoEncontrado.location,
    description: eventoEncontrado.description,
    tripId: tripId.value,
    price: eventoEncontrado.price,
    datetime: new Date(eventoEncontrado.start).toISOString().slice(0, 16),
    endDatetime: new Date(eventoEncontrado.end).toISOString().slice(0, 16),
    marker: eventoEncontrado.marker,
  };

  if (eventoEncontrado.marker.position != null) {
    markerCoordenates.value = eventoEncontrado.marker.position;
    mapRef.value.map.setZoom(6);
  } else {
    markerCoordenates.value = center.value;
    mapRef.value.map.setZoom(6);
  }

  const alterarView = views.value.find(
    (view) => view.id === eventoEncontrado.calendarId
  );
  selectedView.value = alterarView.name;
  selectedViewId.value = alterarView.id;
  mapRef.value.map.setCenter(markerCoordenates.value);

  dialog.value = true;
};

const viewReservation = (reservationId) => {
  showReservation.value = true;
  editReservation(reservationId);
}

const editReservation = (reservationId) => {

  if(!isOrganizer.value) {
    toast.error("You don't have permission to edit reservations in this trip");
    return;
  }

  isNewReservation.value = false;

  if (reservationId != null && typeof reservationId === "string") {
    eventoSelecionado.value = reservationId;
    console.log(reservationId);
  }

  console.log(eventoSelecionado.value);

  if (allReservations.value.flights.find((ev) => ev.id === reservationId) != null) {
    const eventoEncontrado = allReservations.value.flights.find(
      (ev) => ev.id === reservationId
    );

    newFlight.value = {
      airline: eventoEncontrado.airline,
      marker: eventoEncontrado.marker,
      arrivalMarker: eventoEncontrado.arrivalMarker,
      iata_code: eventoEncontrado.iataCode,
      departureDate: eventoEncontrado.departureDate,
      departureAirport: eventoEncontrado.departureAirport,
      arrivalDate: eventoEncontrado.arrivalDate,
      arrivalAirport: eventoEncontrado.arrivalAirport,
      price: eventoEncontrado.price,
      flightNumber: eventoEncontrado.flightNumber,
      notes: eventoEncontrado.notes,
    };

    console.log(newFlight.value);
    newReservation.value = {
      label: "Flights",
    };
    openPopUpReservations.value = true;

  } else if (allReservations.value.lodging.find((ev) => ev.id === reservationId) != null) {
    const eventoEncontrado = allReservations.value.lodging.find(
      (ev) => ev.id === reservationId
    );

    newLodging.value = {
      location: eventoEncontrado.location,
      marker: eventoEncontrado.marker,
      checkInDate: eventoEncontrado.checkInDate,
      checkOutDate: eventoEncontrado.checkOutDate,
      address: eventoEncontrado.address,
      price: eventoEncontrado.price,
      notes: eventoEncontrado.notes,
    };

    newReservation.value = {
      label: "Lodging",
    };
    openPopUpReservations.value = true;

  } else if (allReservations.value.rentalCars.find((ev) => ev.id === reservationId) != null) {
    const eventoEncontrado = allReservations.value.rentalCars.find(
      (ev) => ev.id === reservationId
    );

    newRentalCar.value = {
      company: eventoEncontrado.company,
      marker: eventoEncontrado.marker,
      pickUpDate: eventoEncontrado.pickUpDate,
      dropOffDate: eventoEncontrado.dropOffDate,
      price: eventoEncontrado.price,
      notes: eventoEncontrado.notes,
    };

    newReservation.value = {
      label: "Rental cars",
    };
    openPopUpReservations.value = true;
  }
};

const deleteReservation = (reservationId) => {
  try {
    if (reservationId) {
      eventoSelecionado.value = reservationId;
    }
    if (allReservations.value.flights.find((ev) => ev.id === reservationId) != null) {
      deleteDoc(doc(db, "flights", eventoSelecionado.value));
    } else if (allReservations.value.lodging.find((ev) => ev.id === reservationId) != null) {
      deleteDoc(doc(db, "lodging", eventoSelecionado.value));
    } else if (allReservations.value.rentalCars.find((ev) => ev.id === reservationId) != null) {
      deleteDoc(doc(db, "rentalCars", eventoSelecionado.value));
    }
    console.log("Reserva eliminada com sucesso!");
    getEvents();
    getReservations();
    closePopUpReservations();
  } catch (error) {
    console.error("Erro ao eliminar reserva:", error);
  }
}

const viewEvent = (eventId) => {
  closeDialogDetails();
  showEvents.value = false;
  isNewEvent.value = false;

  if (eventId != null && typeof eventId === "string") {
    eventoSelecionado.value = eventId;
    console.log(eventId);
  }

  console.log(eventoSelecionado.value);

  const eventoEncontrado = events.value.find(
    (ev) => ev.id === eventoSelecionado.value
  );

  console.log(eventoEncontrado);
  formData.value = {
    view: eventoEncontrado.calendarId,
    title: eventoEncontrado.title,
    location: eventoEncontrado.location,
    description: eventoEncontrado.description,
    tripId: tripId.value,
    price: eventoEncontrado.price,
    datetime: formatLocalISODate(eventoEncontrado.start),
    endDatetime: formatLocalISODate(eventoEncontrado.end),
    marker: eventoEncontrado.marker,
  };

  if (eventoEncontrado.marker.position != null) {
    markerCoordenates.value = eventoEncontrado.marker.position;
    mapRef.value.map.setZoom(6);
  } else {
    markerCoordenates.value = center.value;
    mapRef.value.map.setZoom(6);
  }

  const alterarView = views.value.find(
    (view) => view.id === eventoEncontrado.calendarId
  );
  selectedView.value = alterarView.name;
  selectedViewId.value = alterarView.id;
  mapRef.value.map.setCenter(markerCoordenates.value);

  showEvent.value = true;
  dialog.value = true;
};

const deleteEvent = async (eventId) => {
  try {
    if (eventId) {
      eventoSelecionado.value = eventId;
    }
    await deleteDoc(doc(db, "events", eventoSelecionado.value));
    console.log("Evento eliminado com sucesso!");
    getEvents();
    getReservations();
    closeDialogDetails();
  } catch (error) {
    console.error("Erro ao eliminar evento:", error);
  }
};

const closeDialog = () => {
  showEvent.value = false;
  activateAutocomplete.value = false;
  dialog.value = false;
  showEvents.value = true;
  selectedView.value = "";
  dropdownOpen.value = false;
  calendarRef.value.getInstance().clearGridSelections();
  formData.value = {
    view: "home",
    title: "",
    location: "",
    description: "",
    datetime: null,
    price: "",
    tripId: tripId.value,
    endDatetime: null,
    marker: null,
  };

  centerEvent.value = null;

  dialogSubmited.value = false;
  titleValid.value = true;
  locationValid.value = true;
  datetimeValid.value = true;
  endDatetimeValid.value = true;
  dialogSubmited.value = false;
  errorMessage.value = {
    title: "",
    location: "",
    datetime: "",
    endDatetime: "",
  }
};

function closeDialogIfClickedOutside(event) {
  // Verifica se o clique ocorreu fora do pop-up de formulário
  if (!event.target.closest(".inline-block")) {
    closeDialog();
  }
}

function testColor(nameCat) {
  for (let i = 0; i < views.value.length; i++) {
    if (views.value[i].name === nameCat) {
      return views.value[i].backgroundColor;
    }
  }
}

const markerCoordenates = ref(null);

async function criarEvento(evento) {
  dialogSubmited.value = true;
  validateNewEvent();

  if (!titleValid.value || !locationValid.value || !datetimeValid.value || !endDatetimeValid.value) {
    return;
  }

  if (isNewEvent.value) {
    try {
      await addDoc(collection(db, "events"), {
        calendarId: selectedViewId.value,
        title: evento.title,
        location: evento.location,
        price: evento.price,
        description: evento.description,
        start: new Date(evento.datetime),
        end: new Date(evento.endDatetime),
        tripId: tripId.value,
        marker: {
          position: markerCoordenates.value ? markerCoordenates.value : null,
          clickable: true,
          draggable: true,
          title: evento.title,
        },
      });
      console.log("Evento criado com sucesso!", evento);
      getEvents();
      getReservations();
      closeDialog();
      markerCoordenates.value = null;
    } catch (error) {
      console.error("Erro ao criar evento:", error);
    }
  } else if (!isNewEvent.value) {
    try {
      const eventoEncontrado = events.value.find(
        (ev) => ev.id === eventoSelecionado.value
      );
      await updateDoc(doc(db, "events", eventoSelecionado.value), {
        calendarId: selectedViewId.value,
        title: evento.title,
        price: evento.price,
        location: evento.location,
        description: evento.description,
        start: Timestamp.fromDate(new Date(evento.datetime)),
        end: Timestamp.fromDate(new Date(evento.endDatetime)),
        marker: {
          position: markerCoordenates.value ? markerCoordenates.value : null,
          clickable: true,
          draggable: true,
          title: evento.title,
        },
      });
      console.log("Evento editado com sucesso!", evento);
      getEvents();
      getReservations();
      mapKey.value += 1;
      closeDialog();
      markerCoordenates.value = null;
    } catch (error) {
      console.error("Erro ao editar evento:", error);
    }
  }
}

const selectedView = ref("");
const dropdownOpen = ref(false);

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

const selectedViewId = ref(views.value.length > 0 ? views.value[0].id : "");
const showMapPopup = ref(false);

const selectView = (view) => {
  selectedView.value = view.name;
  console.log(view);
  selectedViewId.value = view.id;
  dropdownOpen.value = false;
};

const mapRef = ref();
const markerRef = ref();

function openMap() {
  if (centerEvent.value) {
    markerCoordenates.value = centerEvent.value;
    mapRef.value.map.setCenter(centerEvent.value);
    mapRef.value.map.setZoom(8);
  } else {
    markerCoordenates.value = center.value;
    mapRef.value.map.setCenter(center.value);
    mapRef.value.map.setZoom(6);
  }
  showMapPopup.value = true;
  locationError.value = false;

  getMarkerInfo(markerCoordenates.value.lat, markerCoordenates.value.lng);
}

function closeMap() {
  locationError.value = false;
  showMapPopup.value = false;
  markerLocation.value = {
    country: "",
    city: "",
    address: "",
    coordinates: null,
  };
  markerRef.value.marker.setPosition(markerCoordenates.value);
  mapRef.value.map.setCenter(markerCoordenates.value);
  mapRef.value.map.setZoom(6);
}

function guardarLocalizacao() {
  formData.value.location = markerLocation.value.address;
  markerCoordenates.value = markerLocation.value.coordinates;
  closeMap();
}

////Dialog de detalhes do evento
const dialogDetails = ref(false);
const eventData = ref({
  title: "",
  location: "",
  description: "",
  calendarId: "",
  start: "",
  end: "",
});
const eventColor = ref("");

const mouseX = ref(0);
const mouseY = ref(0);

const openDialogDetailsAtMousePosition = (event) => {
  mouseX.value = event.nativeEvent.clientX - event.nativeEvent.offsetX - 310;
  mouseY.value = event.nativeEvent.clientY - event.nativeEvent.offsetY - 430;
};

const openDialogDetails = ({ event }) => {
  const eventoEncontrado = events.value.find((ev) => ev.id === event.id);

  if (event) {
    // Carregar dados do evento
    eventData.value = {
      title: eventoEncontrado.title,
      location: eventoEncontrado.location,
      description: eventoEncontrado.description,
      calendarId: eventoEncontrado.calendarId,
      start: new Date(eventoEncontrado.start).toLocaleString(),
      end: new Date(eventoEncontrado.end).toLocaleString(),
    };
    // Carregar cor do evento
    eventColor.value = getEventColor(eventoEncontrado.calendarId);
  }

  dialogDetails.value = true;
};

const closeDialogDetails = () => {
  dialogDetails.value = false;
};

const getEventColor = (calendarId) => {
  const matchingView = views.value.find((view) => view.id === calendarId);
  return matchingView.backgroundColor;
};

const eventDateRange = computed(() => {
  return `${eventData.value.start} - ${eventData.value.end}`;
});

async function dragedEvent(event) {
  try {
    if (event.changes.start == null) {
      await updateDoc(doc(db, "events", event.event.id), {
        end: Timestamp.fromDate(new Date(event.changes.end)),
      });
    } else {
      await updateDoc(doc(db, "events", event.event.id), {
        start: Timestamp.fromDate(new Date(event.changes.start)),
        end: Timestamp.fromDate(new Date(event.changes.end)),
      });
    }

    console.log("Evento arrastado com sucesso!");
    getEvents();
    getReservations();
  } catch (error) {
    console.error("Erro ao arrastar evento:", error);
  }
}

////////////////////
const center = ref();
const locationError = ref(false);
const markers = ref([
  {
    position: center,
    clickable: true,
    draggable: true,
    title: "Marker 1",
  },
  {
    position: { lat: 40.689, lng: -74.045 },
    clickable: true,
    draggable: true,
    title: "Marker 2",
  },
]);

const marker = ref({
  position: center.value,
  clickable: true,
  draggable: true,
  title: "",
});

function markerClicked(marker) {
  //console.log("Marker clicked:", marker);
}

function markerDoubleClicked(marker) {
  console.log("Marker double clicked:", marker);
  mapRef.value.map.setCenter(marker.position);
  mapRef.value.map.setZoom(12);
}

async function mapClicked(map) {
  console.log("Map clicked:", map);
  console.log("Map clicked:", map.latLng.lat());
  markerRef.value.marker.setPosition(map.latLng);
  getMarkerInfo(map.latLng.lat(), map.latLng.lng());
}

async function getMarkerInfo(lat, lng) {
  // Chamada à API de Geocodificação do Google Maps para obter informações de localização
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyCeL7R-bu0duyFYi3FY1Y3G0505ssHDclQ`
  );
  const data = await response.json();

  if (data.status === "OK") {
    // Aqui você pode acessar as informações de localização
    const addressComponents = data.results[0].address_components;

    if (addressComponents.length <= 1) {
      locationError.value = true;
      return;
    } else {
      locationError.value = false;
      console.log(addressComponents);
      const country = addressComponents.find((component) =>
        component.types.includes("country")
      ).long_name;
      const city = addressComponents.find((component) =>
        component.types.includes("locality")
      ).long_name;
      const formattedAddress = data.results[0].formatted_address;

      console.log("País:", country);
      console.log("Cidade:", city);
      console.log("Endereço formatado:", formattedAddress);

      markerLocation.value = {
        country: country,
        city: city,
        address: formattedAddress,
        coordinates: {
          lat: lat,
          lng: lng,
        },
      };
    }
  } else {
    console.error("Erro ao obter informações de localização.");
    locationError.value = true;
  }
}

/*
async function markerDragged(event, index) {
  markers.value[index].position = {
    lat: event.latLng.lat(),
    lng: event.latLng.lng(),
  };
  console.log("Marker dragged:", markers.value[index]);

  // Chamada à API de Geocodificação do Google Maps para obter informações de localização
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${markers.value[index].position.lat},${markers.value[index].position.lng}&key=AIzaSyCeL7R-bu0duyFYi3FY1Y3G0505ssHDclQ`
  );
  const data = await response.json();

  if (data.status === "OK") {
    // Aqui você pode acessar as informações de localização
    const addressComponents = data.results[0].address_components;
    const country = addressComponents.find((component) =>
      component.types.includes("country")
    ).long_name;
    const city = addressComponents.find((component) =>
      component.types.includes("locality")
    ).long_name;
    const formattedAddress = data.results[0].formatted_address;

    console.log("País:", country);
    console.log("Cidade:", city);
    console.log("Endereço formatado:", formattedAddress);
  } else {
    console.error("Erro ao obter informações de localização.");
  }
}*/

const markerLocation = ref({
  country: "",
  city: "",
  address: "",
  coordinates: null,
});

async function markerDragged(event, marker) {
  marker.position = {
    lat: event.latLng.lat(),
    lng: event.latLng.lng(),
  };

  getMarkerInfo(event.latLng.lat(), event.latLng.lng());
}

const searchQuery = ref("");


const countries = ref([]);


const showResults = ref(false);
const filteredCountries = ref([]);

const handleInput = () => {
  if (searchQuery.value.length >= 2) {
    filteredCountries.value = countries.value.filter((country) =>
      country.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
    showResults.value = true;
    console.log(filteredCountries.value);
  } else {
    filteredCountries.value = [];
    showResults.value = false;
  }
};

const selectCountry = (country) => {
  searchQuery.value = country;
  showResults.value = false;

  center.value = {
    lat: countries.value.find((c) => c.name === country).coordinates.latitude,
    lng: countries.value.find((c) => c.name === country).coordinates.longitude,
  };
};

const isDateInRange = (date) => {
  return date >= new Date(startDate.value) && date <= new Date(endDate.value);
};

///////
onMounted(async () => {
  
  auth.onAuthStateChanged(user => {
    if (user) {
      currentUserId.value = user.uid;
      console.log('Logged in user ID:', currentUserId);
    } else {
      currentUserId.value = null;
    }
  });


  calendarRef.value.getInstance().on("selectDateTime", (event) => {
    if(isOrganizer.value ) {
      if (isDateInRange(event.start) && isDateInRange(event.end) || event.end.toISOString().slice(0, 10) === new Date(endDate.value).toISOString().slice(0, 10)) {
        isNewEvent.value = true;
        console.log(event);
        openDialog(event);
      } else {
        toast.error("You can't create events outside the trip date range")
        calendarRef.value.getInstance().clearGridSelections();
      }
    } else {
      toast.error("You don't have permission to create events")
      calendarRef.value.getInstance().clearGridSelections();
    }

  });
  calendarRef.value.getInstance().on("clickEvent", (event) => {
    if (event.event.calendarId.includes("defaultCategoryFor")) {
      if (event.event.calendarId === "defaultCategoryForFlights") {
        newReservation.value = {
          label: "Flights",
        };
      } else if (event.event.calendarId === "defaultCategoryForLodging") {
        newReservation.value = {
          label: "Lodging",
        };
      } else if (event.event.calendarId === "defaultCategoryForRentalCars") {
        newReservation.value = {
          label: "Rental cars",
        };
      }
      viewReservation(event.event.id);
    }
    else {
      eventoSelecionado.value = event.event.id;
      viewEvent(event.event.id);
    }
  });
  calendarRef.value.getInstance().on("beforeUpdateEvent", (event) => {
    if(!isOrganizer.value) {
      toast.error("You don't have permission to edit events in this trip");
      return;
    }
    dragedEvent(event);
  });
  if (triploaded.value) {
    console.log('triploaded', triploaded.value);
  }

  getTrip();
  getEvents();
  getReservations();
});

//watch do activateAutocomplete
const autoCompleteNewEvent = ref(false);

watch(activateAutocomplete, async (newValue) => {
  if (newValue) {
    console.log('activateAutocomplete', newValue);
    const loader = new Loader({
      apiKey: import.meta.env.API_KEY,
      version: "weekly",

    });
    const Places = await loader.importLibrary('places')

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
    console.log('input', input);

    //this object will be our second arg for the new instance of the Places API
    const options = {
      bounds: defaultBounds, //optional
      fields: ["address_components", "geometry", "icon", "name", "formatted_address"], //allows the api to accept these inputs and return similar ones
      strictBounds: false, //optional
    };

    // per the Google docs create the new instance of the import above. I named it Places.
    const autocomplete = new Places.Autocomplete(input, options);

    //add the place_changed listener to display results when inputs change
    autocomplete.addListener('place_changed', () => {
      autoCompleteNewEvent.value = true;
      place.value = autocomplete.getPlace(); //this callback is inherent you will see it if you logged autocomplete
      console.log('place', place.value);
      formData.value.location = place.value.formatted_address;
      centerEvent.value = place.value.geometry.location.toJSON();
      markerCoordenates.value = centerEvent.value;
    });
  }
});


const tabTripInfo = (tripId) => {
  router.push({ path: `/trips/${tripId}/details`, params: { tripId } });
};

const tabTripMembers = (tripId) => {
  router.push({ path: `/trips/${tripId}/members`, params: { tripId } });
};

const tabTripMedia = (tripId) => {
  router.push({ path: `/trips/${tripId}/media`, params: { tripId } });
};

const tabTripReviews = (tripId) => {
  router.push({ path: `/trips/${tripId}/reviews`, params: { tripId } });
};

const tabTripSettings = (tripId) => {
  toast.warning("In development");
};

//VALIDATION DIALOG
const dialogSubmited = ref(false);
const locationValid = ref(false);
const datetimeValid = ref(false);
const endDatetimeValid = ref(false);
const titleValid = ref(false);
const errorMessage = ref({
  location: "",
  datetime: "",
  endDatetime: "",
  title: "",
});

const validateNewEvent = () => {
  errorMessage.value = {
    location: "",
    datetime: "",
    endDatetime: "",
    title: "",
  }

  locationValid.value = true;
  datetimeValid.value = true;
  endDatetimeValid.value = true;
  titleValid.value = true;

  if (formData.value.location === "") {
    locationValid.value = false;
    errorMessage.value.location = "Location is required";
  }

  if (formData.value.datetime === null && formData.value.endDatetime === null) {
    datetimeValid.value = false;
    endDatetimeValid.value = false;
    errorMessage.value.datetime = "Start date and end date are required";
  }
  else if (formData.value.datetime === null) {
    datetimeValid.value = false;
    errorMessage.value.datetime = "Start date is required";
  }
  else if (formData.value.endDatetime === null) {
    endDatetimeValid.value = false;
    errorMessage.value.datetime = "End date is required";
  } else if (new Date(formData.value.datetime) < new Date(startDate.value) && isDateInRange(new Date(formData.value.datetime))) {
    datetimeValid.value = false;
    endDatetimeValid.value = false;
    errorMessage.value.datetime = "Start date must be in range of trip date";
  } else if (!isDateInRange(new Date(formData.value.endDatetime))) {
    if (!(new Date(formData.value.endDatetime).toISOString().slice(0, 10) === new Date(endDate.value).toISOString().slice(0, 10))) {
      datetimeValid.value = false;
      endDatetimeValid.value = false;
      errorMessage.value.datetime = "End date must be in range of trip date";
    }
  } else if (new Date(formData.value.datetime) > new Date(formData.value.endDatetime)) {
    datetimeValid.value = false;
    endDatetimeValid.value = false;
    errorMessage.value.datetime = "Start date must be before end date";
  }

  if (formData.value.title === "") {
    titleValid.value = false;
    errorMessage.value.title = "Title is required";
  } else if (formData.value.title.length < 3) {
    titleValid.value = false;
    errorMessage.value.title = "Title must have at least 3 characters";
  }
  else if (formData.value.title.length > 30) {
    titleValid.value = false;
    errorMessage.value.title = "Title must have a maximum of 30 characters";
  }

  if (locationValid.value && datetimeValid.value && endDatetimeValid.value && titleValid.value) {
    return true;
  } else {
    return false;
  }
}

//VALIDATION FLIGHT RESERVATION
const dialogSubmitedReservation = ref(false);
const airlineValid = ref(false);
const departureValid = ref(false);
const departureDateValid = ref(false);
const arrivalValid = ref(false);
const arrivalDateValid = ref(false);
const errorMessageReservation = ref({
  airline: "",
  departure: "",
  departureDate: "",
  arrival: "",
  arrivalDate: "",
});

const validateNewFlight = () => {
  errorMessageReservation.value = {
    airline: "",
    departure: "",
    departureDate: "",
    arrival: "",
    arrivalDate: "",
  }

  airlineValid.value = true;
  departureValid.value = true;
  departureDateValid.value = true;
  arrivalValid.value = true;
  arrivalDateValid.value = true;

  if (newFlight.value.airline === "") {
    airlineValid.value = false;
    errorMessageReservation.value.airline = "Airline is required";
  }

  if (newFlight.value.departureAirport === "" && newFlight.value.departureDate === "") {
    departureValid.value = false;
    departureDateValid.value = false;
    errorMessageReservation.value.departure = "Departure airport and date are required";
  }
  else if (newFlight.value.departureAirport === "") {
    departureValid.value = false;
    errorMessageReservation.value.departure = "Departure airport is required";
  } else if (newFlight.value.departureDate === "") {
    departureDateValid.value = false;
    errorMessageReservation.value.departure = "Departure date is required";
  } else if (new Date(newFlight.value.departureDate) < new Date(startDate.value)) {
    departureDateValid.value = false;
    errorMessageReservation.value.departure = "Departure date must be after trip start date";
  } else if (!isDateInRange(new Date(newFlight.value.departureDate))) {
    if (!(new Date(newFlight.value.departureDate).toISOString().slice(0, 10) === new Date(endDate.value).toISOString().slice(0, 10))) {
      departureDateValid.value = false;
      errorMessageReservation.value.departure = "Departure date must be before trip end date";
    }
  }
  else if (new Date(newFlight.value.departureDate) > new Date(newFlight.value.arrivalDate)) {
    departureDateValid.value = false;
    arrivalDateValid.value = false;
    errorMessageReservation.value.departure = "Departure date must be before arrival date";
  }


  if (newFlight.value.arrivalAirport === "" && newFlight.value.arrivalDate === "") {
    arrivalValid.value = false;
    arrivalDateValid.value = false;
    errorMessageReservation.value.arrival = "Arrival airport and date are required";
  } else if (newFlight.value.arrivalAirport === "") {
    arrivalValid.value = false;
    errorMessageReservation.value.arrival = "Arrival airport is required";
  } else if (newFlight.value.arrivalDate === "") {
    arrivalDateValid.value = false;
    errorMessageReservation.value.arrival = "Arrival date is required";
  } else if (new Date(newFlight.value.departureDate) >= new Date(newFlight.value.arrivalDate)) {
    departureDateValid.value = false;
    arrivalDateValid.value = false;
    errorMessageReservation.value.arrival = "Departure date must be before arrival date";
  } else if (new Date(newFlight.value.departureDate) < new Date(startDate.value)) {
    departureDateValid.value = false;
    arrivalDateValid.value = false;
    errorMessageReservation.value.arrival = "Departure date must be after trip start date";
  } else if (!isDateInRange(new Date(newFlight.value.arrivalDate))) {
    if (!(new Date(newFlight.value.arrivalDate).toISOString().slice(0, 10) === new Date(endDate.value).toISOString().slice(0, 10))) {
      arrivalDateValid.value = false;
      errorMessageReservation.value.arrival = "Arrival date must be before trip end date";
    }
  }
}

//VALIDATION LODGING RESERVATION
const dialogSubmitedLodging = ref(false);
const locationLodgingValid = ref(false);
const checkInValid = ref(false);
const checkOutValid = ref(false);
const errorMessageLodging = ref({
  location: "",
  checkIn: "",
  checkOut: "",
});

const validateNewLodging = () => {
  errorMessageLodging.value = {
    location: "",
    checkIn: "",
    checkOut: "",
  }

  locationLodgingValid.value = true;
  checkInValid.value = true;
  checkOutValid.value = true;

  if (newLodging.value.location === "") {
    locationLodgingValid.value = false;
    errorMessageLodging.value.location = "Location is required";
  }

  if (newLodging.value.checkInDate === "" && newLodging.value.checkOutDate === "") {
    checkInValid.value = false;
    checkOutValid.value = false;
    errorMessageLodging.value.checkIn = "Check-in and check-out dates are required";
  } else if (newLodging.value.checkInDate === "") {
    checkInValid.value = false;
    checkOutValid.value = false;
    errorMessageLodging.value.checkIn = "Check-in date is required";
  } else if (newLodging.value.checkOutDate === "") {
    checkOutValid.value = false;
    checkInValid.value = false;
    errorMessageLodging.value.checkIn = "Check-out date is required";
  } else if (new Date(newLodging.value.checkInDate) < new Date(startDate.value)) {
    checkInValid.value = false;
    checkOutValid.value = false;
    errorMessageLodging.value.checkIn = "Check-in date must be after trip start date";
  } else if (!isDateInRange(new Date(newLodging.value.checkOutDate))) {
    if (!(new Date(newLodging.value.checkOutDate).toISOString().slice(0, 10) === new Date(endDate.value).toISOString().slice(0, 10))) {
      checkOutValid.value = false;
      checkInValid.value = false;
      errorMessageLodging.value.checkIn = "Check-out date must be before trip end date";
    }
  } else if (new Date(newLodging.value.checkInDate) > new Date(newLodging.value.checkOutDate)) {
    checkInValid.value = false;
    checkOutValid.value = false;
    errorMessageLodging.value.checkIn = "Check-in date must be before check-out date";
  }

  if (locationLodgingValid.value && checkInValid.value && checkOutValid.value) {
    return true;
  } else {
    return false;
  }
}

//VALIDATION RENTAL CAR RESERVATION
const dialogSubmitedRentalCar = ref(false);
const companyValid = ref(false);
const pickUpValid = ref(false);
const dropOffValid = ref(false);

const errorMessageRentalCar = ref({
  company: "",
  pickUp: "",
  dropOff: "",
});

const validateNewRentalCar = () => {
  errorMessageRentalCar.value = {
    company: "",
    pickUp: "",
    dropOff: "",
  }

  companyValid.value = true;
  pickUpValid.value = true;
  dropOffValid.value = true;

  if (newRentalCar.value.company === "") {
    companyValid.value = false;
    errorMessageRentalCar.value.company = "Company is required";
  }

  if (newRentalCar.value.pickUpDate === "" && newRentalCar.value.dropOffDate === "") {
    pickUpValid.value = false;
    dropOffValid.value = false;
    errorMessageRentalCar.value.pickUp = "Pick-up date and drop-off date are required";
  } else if (newRentalCar.value.pickUpDate === "") {
    pickUpValid.value = false;
    errorMessageRentalCar.value.pickUp = "Pick-up date is required";
  } else if (newRentalCar.value.dropOffDate === "") {
    dropOffValid.value = false;
    pickUpValid.value = false;
    errorMessageRentalCar.value.pickUp = "Drop-off date is required";
  } else if (new Date(newRentalCar.value.pickUpDate) > new Date(newRentalCar.value.dropOffDate)) {
    pickUpValid.value = false;
    dropOffValid.value = false;
    errorMessageRentalCar.value.pickUp = "Pick-up date must be before drop-off date";
  } else if (new Date(newRentalCar.value.pickUpDate) < new Date(startDate.value)) {
    pickUpValid.value = false;
    pickUpValid.value = false;
    errorMessageRentalCar.value.pickUp = "Pick-up date must be after trip start date";
  } else if (!isDateInRange(new Date(newRentalCar.value.dropOffDate))) {
    if (!(new Date(newRentalCar.value.dropOffDate).toISOString().slice(0, 10) === new Date(endDate.value).toISOString().slice(0, 10))) {
      dropOffValid.value = false;
      pickUpValid.value = false;
      errorMessageRentalCar.value.pickUp = "Drop-off date must be before trip end date";
    }
  }

  if (companyValid.value && pickUpValid.value && dropOffValid.value) {
    return true;
  } else {
    return false;
  }
}
</script>

<style scoped>
.intro {
  max-width: clamp(60em, 62vw);
}

.play-container {
  display: flex;
  flex-direction: column;
  padding: 8px;
}

#map {
  height: 400px;
  width: 100%;
}

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
  /* No margin */
  display: flex;
  justify-content: center;
  align-items: center;
  /* Optionally, add other styling for button appearance */
}

.container-list {
  background-color: #f6f7fa;
  border-top: none;
  border-left: 1px solid #ccc;
  border-right: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
  border-radius: 0 0 8px 8px;
  padding: 20px;
  min-height: 500px;
  max-height: 500px;
}

.date-trigger {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.event-list {
  padding-left: 20px;
}

.event-list-btn {
  border-left: 1px solid #ccc;
  border-top: 1px solid #ccc;
  border-right: 1px solid #ccc;
  border-radius: 8px 30px 0 0;
  padding: 5px;
  font-weight: bold;
}

.reservation-list-btn {
  border-left: 1px solid #ccc;
  border-top: 1px solid #ccc;
  border-right: 1px solid #ccc;
  border-radius: 30px 8px 0 0;
  padding: 5px;
  font-weight: bold;
}

.event {
  border-bottom: 1px solid #ccc;
  padding: 8px 0;
}

#btn_view_list {
  background-color: #60a5fa;
}

#btn_view_map {
  background-color: #4ade80;
}

#btn_view_calendar {
  background-color: #fb7185;
}

/*
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}*/

/* Estilos para o componente de autocompletar */
.autocomplete-results {
  position: absolute;
  z-index: 999;
  /* Garante que o componente esteja acima de outros elementos */
  background-color: white;
  /* Cor de fundo */
  border: 1px solid #ccc;
  /* Borda */
  max-height: 200px;
  /* Altura máxima dos resultados */
  overflow-y: auto;
  /* Adiciona uma barra de rolagem vertical quando necessário */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  /* Sombra */
}

.result-item {
  padding: 8px;
  /* Espaçamento interno */
  cursor: pointer;
  /* Cursor ao passar o mouse */
}

/* Mostra os resultados quando a classe .show é adicionada */
.autocomplete-results.show {
  display: block;
}

.bi-arrow-right::before,
.bi-arrow-left::before {
  font-weight: bold !important;
}

.btns-toggle {
  font-size: 16px;
  width: 25vh;
  height: 4vh;
}

.btns-toggle:hover {
  background-color: #0056cf;

}

.btn-calendar-show {
  border-radius: 0;
}

.btn-map-show {
  border-radius: 0 5px 5px 0;
}

.btn-list-show {
  border-radius: 5px 0 0 5px;
}

.btn-off {
  background-color: white;
  border: 1px solid #0d6efd;
  color: #0d6efd;
}

.btn-off:hover {
  background-color: white;
  border: 1px solid #0d6efd;
  color: #0d6efd;
  background-color: #e0edff;
}

.reservation-container {
  display: flex;
  background-color: #f6f7fa;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 4px;
}

.view-budget-details {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  height: 3vh;
  width: 20vh;
  border-radius: 0 0 5px 5px;
}

.reservation-item {
  margin-top: 0px;
}

.reservation-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
}

.icon-image {
  width: 50px;
  height: 50px;
}

.reservation-label {
  margin-top: 5px;
  background-color: transparent;
  border: none;
  cursor: pointer;
}

.filter-cat {
  min-width: 18vh;
}

.readonly-container input,
.readonly-container textarea,
.readonly-container button.form-control,
.readonly-container select {
  pointer-events: none;
  background-color: #f8f9fa;
}

.invalid-format {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 80%;
  color: #dc3545;
  /* Cor vermelha */
}

.custom-modal-header {
  background-color: #0d6efd;
  color: white;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
}

.custom-modal-content {
  border: 1px solid #0d6efd;
}

.custom-modal-title {
  font-size: 19px;
  font-weight: bold;
}
</style>