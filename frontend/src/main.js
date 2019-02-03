import Vue from 'vue';
import App from './App.vue';
import router from './router';
import { store } from './store/store';

Vue.config.productionTip = false;

router.beforeEach((to, from, next) => {
	// If the page requires auth and we don't have a token
	// go to the login page
	if (to.meta.auth && localStorage.token === undefined) {
		next('/login');
		return;
	}

	// If going to /login but user is logged in just go home
	if (to.name == 'login' && localStorage.token !== undefined) {
		next('/');
		return;
	}

	document.title = to.meta.title ? to.meta.title : document.title;
	next();
});

new Vue({
	router,
	render: h => h(App),
	store,
}).$mount('#app');
