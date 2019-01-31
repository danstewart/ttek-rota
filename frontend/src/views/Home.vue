<template>
	<div id='home'>
		<div class='notification is-success' style='width: 100%' v-if='$store.getters.firstLogin'>
			<h1 class='title'>You have successfully signed up</h1>
			<h1 class='subtitle'>Welcome to the support rota</h1>
			<button class='delete' @click='$store.commit("setFirstLogin", false)'></button>
		</div>

		<div class='columns'>
			<div class='column left-pane'>
				<Rota></Rota>
			</div>
			<div class='column is-4 right-pane'>
				<Sidebar></Sidebar>
			</div>
		</div>
	</div>
</template>

<script>
import Rota from '../components/Rota.vue'
import Sidebar from '../components/Sidebar.vue'

export default {
	name: 'home',
	components: {
		Rota,
		Sidebar,
	}
}
</script>

<style>
.left-pane {
	overflow: auto;
}

.right-pane {
	margin-top: 20px;
}
</style>
