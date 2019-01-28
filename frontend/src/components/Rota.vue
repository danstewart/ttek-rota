<template>
	<div class='rota'>
		<table class='table is-striped'>
			<thead>
				<tr>
					<th><!-- Blank --></th>
					<th>Date</th>
					<th v-for='person in staff' :key='person.orderid'>{{ person.name }}</th>
				</tr>
			</thead>
			<tbody>
				<template v-for='(week, index) in rota'>
					<tr :key='index'>
						<!-- TODO: Expand button for notes -->
						<td><!-- <ExpandBtn></ExpandBtn> --></td>
						<td>{{ week.date }}</td>
						<td v-for='person in staff.map(p => p.name)' :key='person'>
							<div :class='week[person] || "Day"'></div>
							<div class='select is-multiple'>
								<select size='1' :id='[index, person].join("_")' @change='changeShift'>
									<option selected disabled :value='null'>{{ week[person] || 'Day' }}</option>
									<option v-for='shift in shifts.map(s => s.name).sort()' :key='shift'>{{ shift }}</option>
								</select>
							</div>
						</td>
					</tr>
				</template>
			</tbody>
		</table>
		<div class='control'>
			<button class='button is-inverted' @click='back()'>Back</button>
			<span>&nbsp;</span>
			<button class='button is-inverted' @click='next()'>Next</button>
		</div>
	</div>
</template>

<script>
import { getYear, getISOWeek, addWeeks, startOfWeek, format, differenceInCalendarISOWeeks } from 'date-fns'

export default {
	name: 'Rota',

	created() {
		// this.shifts is ordered based on a specific date, so get the weeks since that date
		// so we can adjust the pattern
		// TODO: Should maybe pull the initial offset from DynamoDB and require a token
		this.offset = (differenceInCalendarISOWeeks(new Date(2019, 0, 21), new Date()) % 6)

		// Used to keep track of changes
		this.initialRota = this.rota
	},

	computed: {
		rota() {
			let [ week, year, limit ] = [ this.startWeek, this.startYear, 10 ]

			// Fetch out the required shift info
			let shifts   = this.shifts.slice().sort((a, b) => a.orderid - b.orderid)
			let pattern  = shifts.map(shift => shift.name)
			let required = shifts.filter(shift => shift.required).map(shift => shift.name)

			// Fetch out the required staff info
			let people = this.staff.slice().sort((a, b) => a.orderid - b.orderid)
			let shiftWorkers = people.filter(person => person.shifts).map(person => person.name)

			let rota   = []
			let weekNo = week

			// Rotate shift pattern $offset times
			if (this.offset > 0) {
				[...Array(this.offset)].map(() => pattern.push(pattern.shift()))
			} else if (this.offset < 0) {
				[...Array(Math.abs(this.offset))].map(() => pattern.unshift(pattern.pop()))
			}

			// Build the rota
			while (rota.length < limit) {
				let thisWeek = {}
				let weekDate = format(startOfWeek(addWeeks(new Date(year, 0, 1), weekNo - 1), { weekStartsOn: 1 }), 'YYYY-MM-DD')

				// NOTE: Shallow clone
				let workers = shiftWorkers.slice(0)

				// Check for changes
				let overrides = {}
				let changes = this.$store.getters.changes
				if (changes[weekDate]) {
					people.forEach(person => {
						if (changes[weekDate][person.name]) {
							overrides[person.name] = changes[weekDate][person.name].after
						}
					})
				}

				// Assign out the shifts
				pattern.forEach(shift => {
					let worker = workers.shift()
					thisWeek[worker] = overrides[worker] || shift
				})

				// Check for uncovered shifts
				// TODO: Only call setWarnings if we need to change stuff
				let warnings = []
				let covered  = Object.values(thisWeek)
				let missing  = required.filter(shift => !covered.includes(shift))
				missing.forEach(shift => warnings.push(`No cover for ${shift} shift`))
				this.$store.commit('setWarnings', { week: weekDate, items: warnings })

				// Rotate the shifts
				pattern.push(pattern.shift())

				// Add this week to the rota
				rota.push(Object.assign(thisWeek, {
					weekNo: weekNo,
					date: weekDate,

					// TODO: Add note functionality
					notes: ['Test note'],
				}))

				weekNo++
			}

			return rota
		}
	},

	data() {
		return {
			// Default week and year to load
			startWeek: getISOWeek(new Date()),
			startYear: getYear(new Date()),
			offset: 0,

			//rota: [],
			initialRota: [], // to keep track of unsaved changes

			// We work a standard shift pattern that repeats every 6 weeks
			// The order id is used for the order we work the shifts
			shifts: [
				{ name: 'Early', required: true,  orderid: 1 },
				{ name: 'Sat',   required: true,  orderid: 2 },
				{ name: 'Back',  required: true,  orderid: 3 },
				{ name: 'Day',  required: false,  orderid: 4 },
				{ name: 'Night', required: true,  orderid: 5 },
				{ name: 'Day4',  required: false, orderid: 6 },
			],

			// List of staff, the order they are in the rota and whether
			// they work shifts or not
			staff: [
				{ name: 'Jamie',     shifts: true, orderid: 1 },
				{ name: 'Dan',       shifts: true, orderid: 2 },
				{ name: 'Bogdan',    shifts: true, orderid: 3 },
				{ name: 'Mat',       shifts: true, orderid: 4 },
				{ name: 'Michael M', shifts: true, orderid: 5 },
				{ name: 'Michael P', shifts: true, orderid: 6 },

				{ name: 'Bryan',     shifts: false, orderid: 7 },
				{ name: 'Brian',     shifts: false, orderid: 8 },
			],
		}
	},

	methods: {
		changeShift(e) {
			let [weekIndex, person] = e.target.id.split('_')

			let week   = this.rota[weekIndex]
			let ogWeek = this.initialRota[weekIndex]

			let change = {
				person:   person,
				week:     week.date,
				before:   ogWeek[person] || 'Day',
				after:    e.target.value,
				id:       e.target.id,
			}

			// If this change is the same as the original rota then remove it and bail
			if (change.before == change.after) {
				this.$store.commit('removeChange', change)

			// Otherwise save the change
			} else {
				this.$store.commit('addChange', change)
			}
		},

		next() {
			this.offset++
			this.startWeek++

			if (this.startWeek > 52) {
				this.startWeek = 1
				this.startYear++
			}
		},

		back() {
			this.offset--
			this.startWeek--

			if (this.startWeek < 1) {
				this.startWeek = 52
				this.startYear--
			}
		}
	},
}
</script>

<style scoped>
.control {
	margin-left: 25px;
}

table th, table td {
	display: table-cell;
	vertical-align: middle;
}

/* Shift colours */
.Night {
	height: 2px;
	border: 2px solid blue;
}
.Back {
	height: 2px;
	border: 2px solid orange;
}
.Early {
	height: 2px;
	border: 2px solid rebeccapurple;
}
.Sat {
	height: 2px;
	border: 2px solid darkred;
}
.Day4 {
	height: 2px;
	border: 2px solid green;
}
.Day {
	height: 2px;
	border: 2px solid yellow;
}
</style>
