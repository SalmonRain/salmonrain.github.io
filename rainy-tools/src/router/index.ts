import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import IntervalPractice from '../views/IntervalPractice.vue';

const quizRoute = (path: string, name: string, quizId: string) => ({
  path,
  name,
  component: () => import('../views/QuizView.vue'),
  props: { quizId },
})

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/interval-practice',
      name: 'IntervalPractice',
      component: IntervalPractice,
    },
    // Intervallen (quizzen 1-3)
    quizRoute('/intervallen/intervalsprongen', 'intervalsprongen', 'intervalsprongen'),
    quizRoute('/intervallen/intervalstappen', 'intervalstappen', 'intervalstappen'),
    quizRoute('/intervallen/notenstappen', 'notenstappen', 'notenstappen'),
    // Sleutels (quizzen 4-6)
    quizRoute('/sleutels/voortekens', 'voortekens', 'voortekens'),
    quizRoute('/sleutels/grote-kleine-sleutel', 'grote-kleine-sleutel', 'grote-kleine-sleutel'),
    quizRoute('/sleutels/hoofddrieklanken', 'hoofddrieklanken', 'hoofddrieklanken'),
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    }
  ],
})

export default router
