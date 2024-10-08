import HomeOracleView from "@/views/HomeOracleView.vue";
import ManualeView from "@/views/ManualeView.vue";
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const routes = [
  { path: "/mysql", name: 'MySql', component: HomeView },
  { path: "/oracle", name: 'Oracle', component: HomeOracleView },
  { path: "/manuale", name: 'Manuale', component: ManualeView },
  { path: "/:catchAll(.*)", redirect: "/mysql",},
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});




//DA IMPLEMENTARE MA NON MI CONVINCE NELL USO QUOTIDIANO



/*
router.beforeEach((to, from, next) => {
  localStorage.clear(); // Svuota il localStorage prima di navigare
  next(); // Prosegui con la navigazione
});

*/

export default router;
