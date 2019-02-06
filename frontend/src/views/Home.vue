<template>
	<div id='home'>
		<div class='columns is-desktop'>
			<div class='column left-pane'>
				<Rota></Rota>
			</div>
			<div class='column is-3 right-pane'>
				<Sidebar></Sidebar>
			</div>
		</div>
	</div>
</template>

<script>
import Rota from '../components/Rota.vue';
import Sidebar from '../components/Sidebar.vue';

export default {
	name: 'home',
	components: {
		Rota,
		Sidebar,
	},
};
</script>

<style>
.left-pane {
	overflow: auto;
}

.right-pane {
	margin-top: 20px;
}
</style>
