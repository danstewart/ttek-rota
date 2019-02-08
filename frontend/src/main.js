import Vue from 'vue';
import App from './App.vue';
import router from './router';
import { store } from './store/store';
import axios from 'axios';
import config from './config';

Vue.config.productionTip = false;

router.beforeEach((to, from, next) => {
	// If the page requires auth and we don't have a token
	// go to the login page
	if (to.meta.auth && localStorage.token === undefined) {
		next('/login');
		return;
	}

	// If we have a token stored then go to /
	if (to.name == 'login' && localStorage.token !== undefined) {
		next('/');
		return;
	}

	// /auth is used for setting the login token from verifying email or
	// magin login link
	if (to.name == 'auth' && to.query.token) {
		if (to.query.verify) {
			// TODO: Error handling
			axios.post(`${config.endpoint}/verify`, { token: to.query.token });
		}

		store.commit('setToken', to.query.token);
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
