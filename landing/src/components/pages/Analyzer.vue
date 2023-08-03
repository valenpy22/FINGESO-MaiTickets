<template>
    <v-app class="rounded rounded-md">
        <v-app-bar
          flat
          class="pa-md-3"
          color="#17a499"
        >
            <appBar />
        </v-app-bar>
        <v-main
          class="d-flex align-center justify-center"
        >
        </v-main>

    </v-app>
</template>

<script>
import axios from 'axios'
import appBar from '../appBar.vue'
import {id} from "vuetify/locale";
import {addBusinessDays} from "../../dateUtils";

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