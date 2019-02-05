<template>
	<div class='sidebar'>
		<h2 class='subtitle'>Unsaved Changes</h2>
		<div class='changes' v-if='Object.keys(changes).length'>
			<ul>
				<li v-for='date in Object.keys(changes).sort()' :key='date'>
					<b>{{ date }}</b>
					<p v-for='(change, index) in Object.values(changes[date]).sort()' :key='index'>
						{{ change.person }}: {{ change.before }} <i class="fas fa-arrow-circle-right"></i> {{ change.after }}
					</p>
					<br>
				</li>
			</ul>
			<div class='control'>
				<button class='button is-danger' @click='undoChanges'>Reset</button>
				<span>&nbsp;</span>
				<button class='button is-primary' @click='saveChanges'>Save</button>
			</div>
		</div>
		<br>

		<h2 class='subtitle'>Warnings</h2>
		<div class='changes' v-if='Object.keys(warnings).length'>
			<ul>
				<li v-for='date in Object.keys(warnings).sort()' :key='date'>
					<b>{{ date }}</b>
					<p v-for='(warning, index) in Object.values(warnings[date]).sort()' :key='index'>
						{{ warning }}
					</p>
					<br>
				</li>
			</ul>
			<br>
		</div>
		<br>

		<!-- TODO -->
		<h2 class='subtitle'>Pending Requests</h2>
	</div>
</template>

<script>
export default {
	name: 'Sidebar',

	data() {
		return {};
	},

	computed: {
		warnings() {
			return this.$store.getters.warnings;
		},

		changes() {
			return this.$store.getters.changes;
		},
	},

	methods: {
		saveChanges() {
			// TODO
		},

		undoChanges() {
			// NOTE: This isn't too pretty but for some reason the selectedIndex
			// on <select> elements does not reset when the rota changes
			// So this will go through and reset them all manually

			let dropdowns = [];
			let changes = this.$store.getters.changes;

			// Get a list of all dropdowns that need to be reset
			Object.keys(changes).forEach(dt => {
				Object.keys(changes[dt]).forEach(person => {
					let change = changes[dt][person];
					dropdowns.push(change.id);
				});
			});

			// Wipe out the changes from Vuex
			this.$store.commit('emptyChanges');

			// Wait for DOM to update then reset the dropdowns
			this.$nextTick(() => {
				dropdowns.forEach(id => (document.getElementById(id).selectedIndex = 0));
			});
		},
	},
};
</script>

<style scoped>
.changes {
	border: solid 1px black;
	padding: 10px;
}

.changes button {
	width: 70px;
}
</style>
