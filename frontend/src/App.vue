<template>
	<div id='app'>
		<section class='hero is-primary is-bold'>
			<div class='hero-body'>
				<div class='container'>
					<h1 class='title'>Traveltek Support Rota</h1>
				</div>
			</div>
		</section>

		<div class='notifications'>
			<div v-for='notif in notifications' :key='notif.id' class='notification' :class='notif.type'>
				<h1 class='title'>{{ notif.title }}</h1>
				<h1 class='subtitle'>{{ notif.subtitle }}</h1>
				<button class='delete' @click='$store.commit("removeNotification", notif.id)'></button>
			</div>
			<br>
		</div>

		<div class='main-body'>
			<router-view></router-view>
		</div>

		<!-- External stuff -->
		<link rel='stylesheet' href='https://use.fontawesome.com/releases/v5.6.3/css/all.css' integrity='sha384-UHRtZLI+pbxtHCWp1t77Bi1L4ZtiqrqD80Kn4Z8NTSRyMA2Fd33n5dQ8lWUE00s/' crossorigin='anonymous'>
	</div>
</template>

<script>
export default {
	name: 'app',

	computed: {
		notifications() {
			let notifs = this.$store.getters.notifications
			return notifs.filter(n => n.page ? n.page == this.$route.name : true)
		}
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
