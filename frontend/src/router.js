import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Login from './views/Login.vue'

Vue.use(Router)
document.title = 'Ttek Rota'

export default new Router({
	routes: [
		{
			path: '/',
			name: 'home',
			component: Home,
			meta: { title: `${document.title}`, auth: true },
		},
		{
			path: '/login',
			name: 'login',
			component: Login,
			meta: { title: `${document.title} | Login` },
		},
	]
})
