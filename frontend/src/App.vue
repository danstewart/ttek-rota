<template>
	<div id='app'>
		<section class='hero is-primary is-bold'>
			<div class='hero-body'>
				<div class='container'>
					<h1 class='title'>Traveltek Support Rota</h1>
				</div>
			</div>
		</section>

		<div class='main-body'>
			<div class='notification is-success' style='width: 100%' v-if='$store.getters.firstLogin'>
				<h1 class='title'>You have successfully signed up</h1>
				<h1 class='subtitle'>Welcome to the support rota</h1>
				<button class='delete' @click='$store.commit("setFirstLogin", false)'></button>
			</div>

			<div v-if='$store.getters.token'>
				<div class='columns'>
					<div class='column left-pane'>
						<Rota></Rota>
					</div>
					<div class='column is-4 right-pane'>
						<Sidebar></Sidebar>
					</div>
				</div>
			</div>
			<div v-else>
				<LoginForm></LoginForm>
			</div>
		</div>

		<!-- External stuff -->
		<link rel='stylesheet' href='https://use.fontawesome.com/releases/v5.6.3/css/all.css' integrity='sha384-UHRtZLI+pbxtHCWp1t77Bi1L4ZtiqrqD80Kn4Z8NTSRyMA2Fd33n5dQ8lWUE00s/' crossorigin='anonymous'>
	</div>
</template>

<script>
import Rota from './components/Rota.vue'
import Sidebar from './components/Sidebar.vue'
import LoginForm from './components/LoginForm.vue'

export default {
	name: 'app',
	components: {
		Rota,
		Sidebar,
		LoginForm,
	}
}
</script>

<style>
/* Import bulma and bulma swatch */
@import '../node_modules/bulma/css/bulma.css';
@import '../node_modules/bulmaswatch/flatly/bulmaswatch.min.css';

#app {
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	color: #2c3e50;
}

/* CSS for this page */
.hero {
	margin-bottom: 25px;
}

.main-body {
	margin-left: 20px;
	margin-right: 20px;
}

.left-pane {
	overflow: auto;
}

.right-pane {
	margin-top: 20px;
}

/* My overrides */
*::placeholder {
	/* This is set to black since bulma is educing the opacity*/
	color: gray !important;
	opacity: 100 !important;
}

.icon {
	color: gray !important;
}

* {
	/* 2edgy4me */
	border-radius: 0px !important;
}
</style>
