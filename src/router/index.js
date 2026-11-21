import { createRouter, createWebHistory } from 'vue-router'
import { systems, findSystem, DEFAULT_SYSTEM } from '../systems'
import { useSettingsStore } from '../core/settingsStore'

const systemRoutes = systems.flatMap((system) => [
  { path: `/${system.slug}`, name: `${system.id}-sheet`, component: system.sheet, meta: { system: system.id } },
  { path: `/${system.slug}/einstellungen`, name: `${system.id}-settings`, component: system.settings, meta: { system: system.id } }
])

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Startseite: zuletzt benutztes System
    {
      path: '/',
      redirect: () => `/${(findSystem(useSettingsStore().settings.lastSystem) || DEFAULT_SYSTEM).slug}`
    },
    // Alte Adresse aus der Zeit vor mehreren Systemen
    { path: '/settings', redirect: `/${DEFAULT_SYSTEM.slug}/einstellungen` },
    ...systemRoutes,
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

router.afterEach((to) => {
  if (to.meta.system) useSettingsStore().settings.lastSystem = to.meta.system
})

export default router
