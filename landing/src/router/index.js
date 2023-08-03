import { createRouter, createWebHistory } from "vue-router";

import Login from "../components/pages/Login.vue";
import AddTicket from "../components/pages/AddTicket.vue";
import LeadershipAssign from "../components/pages/LeadershipAssign.vue";
import Analyzer from "@/components/pages/Analyzer.vue";

const routes = [
    {
        path: '/',
        redirect: '/login',
    },
    {
        path: '/login',
        name: 'login',
        component: Login,
    },
    {
        path: '/add-ticket',
        name: 'add-ticket',
        component: AddTicket,
    },
    {
        path: '/assign-ticket',
        name: 'assign-ticket',
        component: LeadershipAssign,
    },
    {
        path: '/analyze-ticket',
        name: 'analyze-ticket',
        component: Analyzer,
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router