<template>
    <v-app class="rounded rounded-md">
        <!-- Componente de la barra que se encuentra arriba -->
        <v-app-bar
            flat
            class="pa-md-3"
            color="#17a499">
            <appBar />
        </v-app-bar>
        <!-- Componente principal -->
        <v-main
            class="d-flex align-center justify-center">
            <!-- Recuadro redondeado de color cyan -->
            <v-card
                color="#17a499"
                :elevation="5"
                class="rounded-lg px-10 py-5 align-center text-center"
                min-width="1000">

                <v-row justify="center">
                    <v-col align-self="center">
                        <!-- Botón de tickets por responder -->
                        <v-btn
                            variant="outlined"
                            @click=""
                            class="rounded-lg text-white px-5">
                            Tickets por responder
                        </v-btn>
                    </v-col>
                </v-row>

                <!-- Espacio para mostrar los tickets -->
                <v-card-text
                    align="center"
                    class="ma-5"
                    color="#17a499">

                    <v-progress-circular
                        v-if="loadingTickets"
                        color="white"
                        indeterminate>
                    </v-progress-circular>

                    <!-- Lista de tickets -->
                    <!-- Si es mayor a 0: -->
                    <v-list
                        v-else-if="listTickets.length > 0"
                        lines="one"
                        base-color="white"
                        bg-color="#17a499">

                        <!-- Elemento de la lista -->
                        <!-- Se identifica según su ticket -->
                        <v-list-item
                            v-for="ticket in listTickets"
                            :key="ticket.idTicket"
                            variant="outlined"
                            class="py-3 my-3 rounded-lg">

                           <!-- Se hace una fila por cada componente de la lista -->
                           <v-row>
                              <!-- Se hace una columna que contiene el id, motivo y descripción del ticket -->
                              <v-col align-self="center">
                                  <v-list-item-title class="text-left">
                                      ID: {{ ticket.idTicket }}<br>Motivo: {{ ticket.category }}
                                  </v-list-item-title>
                                  <v-list-item-subtitle class="text-left">
                                      {{ ticket.description }}
                                  </v-list-item-subtitle>
                              </v-col>
                              <!-- Se hace una columna más, donde se le insertará una fila. -->
                              <v-col class="d-flex align-center">
                                  <v-row justify="space-between">
                                      <!-- Se le agrega una columna -->
                                      <v-col>
                                          <!-- Se le agrega un botón con el texto "Responder" -->
                                          <v-btn
                                              @click="openPopup(ticket.idTicket)"
                                              variant="text">
                                              Responder
                                          </v-btn>
                                      </v-col>
                                  </v-row>
                              </v-col>
                           </v-row>
                        </v-list-item>
                    </v-list>
                    <!-- Si la lista de tickets por responder es 0, se coloca este mensaje -->
                    <h3 class="text-white" v-else>
                        No hay tickets por responder
                    </h3>
                </v-card-text>
            </v-card>

        </v-main>
    </v-app>
</template>

<script>
import axios from 'axios'
import appBar from '../appBar.vue'
import {id} from "vuetify/locale";

export default {
  name: 'Analyzer',
  computed: {
    id() {
      return id
    },
    formIsValid() {
      return this.category && this.idAcademicUnit && this.description;
    },
  },
  data: () => ({
    category: null,
    academicUnits: [],
    description: null,
    idAcademicUnit: null,
    idLeadership: null,
    creation: null,
    successMessage: "",
    showPopup: false,
    descriptionInvalid: false,
  }),
  components: {
    appBar
  },
  methods: {
    initFetch() {
      // Método inicial, se ejecuta al cargar la página
      // Si hay un usuario logueado, se obtienen las unidades académicas
      // Sino, se redirige a la página de login
      localStorage.getItem('userId')?
          this.getUnits():
          this.$router.push('/login')

    },
    async sendData() {
      // Método para enviar los datos del ticket

      try {
        this.descriptionInvalid = false;

        this.clientId = localStorage.getItem('userId')
        console.log(this.idAcademicUnit)
        await this.getIdLeadership()

        this.creation = new Date()
        const numBusinessDays = 20

        const ticketData = {
          description: this.description,
          category: this.category,
          state: "Sin asignar",
          creation: this.creation,
          responseLimit: addBusinessDays(this.creation, numBusinessDays),
          fkIdClient: Number(this.clientId),
          fkIdAcademicUnit: this.idAcademicUnit,
          fkIdLeadership: this.idLeadership
        };

        const response = await axios.post(
            `http://localhost:8081/tickets/add-ticket/${this.clientId}/`,
            ticketData)

        const idTicket = response.data.idTicket

        await axios.put(`http://localhost:8081/units/leaderships/${this.idLeadership}/tickets/${idTicket}`)

        this.showPopup = true

        this.category = null
        this.idAcademicUnit = null
        this.description = ""

        this.descriptionInvalid = false
        this.description = ""

      } catch (error) {
        console.error(error)
      }
    },
    async getUnits(){
      try {
        const response = await axios.get(`http://localhost:8081/units/`)
        this.academicUnits = response.data
      } catch (error){
        console.error(error)
        this.descriptionInvalid = true
      }
    },
    async getIdLeadership(){
      try {
        const response = await axios.get(`http://localhost:8081/units/${this.idAcademicUnit}/leadership`)
        this.idLeadership = response.data
      } catch(error){
        console.error(error)
      }
    },
    closePopup() {
      this.showPopup = false
      window.location.reload()
    }

  },
  mounted() {
    this.initFetch()
  }
}
</script>