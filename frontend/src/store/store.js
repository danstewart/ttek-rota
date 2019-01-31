import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export const store = new Vuex.Store({
	state: {
		changes:  {},
		warnings: {},
		notes:    {},
		notifications: [],
		token: localStorage.getItem('token') || '',
	},
	
	mutations: {
		// Setting - empty and set
		setToken(state, token) {
			state.token = token
			localStorage.setItem('token', token)
		},

		setWarnings(state, warning) {
			if (warning.items.length == 0) {
				Vue.delete(state.warnings, warning.week)
				return
			}
			
			Vue.set(state.warnings, warning.week, warning.items)
		},

		// Appending
		addChange(state, change) {
			if (!state.changes.hasOwnProperty(change.week)) {
				Vue.set(state.changes, change.week, [])
			}

			Vue.set(state.changes[change.week], change.person, {
				before: change.before,
				after:  change.after,
				person: change.person,
				id:     change.id,
			})
		},

		addNotification(state, notif) {
			notif.type = notif.type || 'is-primary'
			state.notifications.push(notif)
		},

		// Removing individual items
		removeChange(state, change) {
			if (state.changes.hasOwnProperty(change.week)) {
				Vue.delete(state.changes[change.week], change.person)

				if (Object.keys(state.changes[change.week]) == 0)
					Vue.delete(state.changes, change.week)
			}
		},

		removeNotification(state, id) {
			state.notifications.splice(id, 1)
		},
		
		// Emptying
		emptyChanges(state) {
			Object.keys(state.changes).forEach(date => Vue.delete(state.changes, date))
		}
	},

	getters: {
		changes: state => state.changes,
		warnings: state => state.warnings,
		notes: state => state.notes,
		token: state => state.token,
		notifications: state => state.notifications,
	}
})
