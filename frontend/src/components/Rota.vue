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
						<td>
							<button class='button' style='width: 40px' @click='toggle(index)'>{{ isExpanded(index) ? '-' : '+' }}</button>
						</td>
						<td>{{ week.date }}</td>
						<td v-for='person in staff.map(p => p.name)' :key='person'>
							<div :class='week[person] || "Day"'></div>
							<div class='select is-multiple'>
								<select size='1' :id='[index, person].join("_")' @change='changeShift'>
									<option selected disabled :value='null'>{{ week[person] || 'Day' }}</option>
									<option v-for='shift in shifts.map(s => s.name).sort()' :key='shift'>{{ shift }}</option>
									<option>Leave</option>
								</select>
							</div>
						</td>
					</tr>
					<template v-if='isExpanded(index)'>
						<!-- TODO: In progress -->
						<template v-for='day in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]'>
							<tr v-if='day in week.notes'>
								<td></td>
								<td>{{ day }}</td>
								<td v-for='person in staff.map(p => p.name)' :key='person'>
									{{ week.notes[day][person] }}
								</td>
							</tr>
						</template>
					</template>
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
import { getYear, getISOWeek, addWeeks, startOfWeek, format, differenceInCalendarISOWeeks } from 'date-fns';

export default {
	name: 'Rota',

	created() {
		// this.shifts is ordered based on a specific date, so get the weeks since that date
		// so we can adjust the pattern
		// TODO: Should maybe pull the initial offset from DynamoDB and require a token
		this.offset = differenceInCalendarISOWeeks(new Date(), new Date(2019, 0, 21)) % 6;

		// Used to keep track of changes
		this.initialRota = this.rota;
	},

	computed: {
		rota() {
			let [week, year, limit] = [this.startWeek, this.startYear, 10];

			// Fetch out the required shift info
			let shifts = this.shifts.slice().sort((a, b) => a.orderid - b.orderid);
			let pattern = shifts.map(shift => shift.name);
			let required = shifts.filter(shift => shift.required).map(shift => shift.name);

			// Fetch out the required staff info
			let people = this.staff.slice().sort((a, b) => a.orderid - b.orderid);
			let shiftWorkers = people.filter(person => person.shifts).map(person => person.name);
			let otherWorkers = people.filter(person => !person.shifts).map(person => person.name);

			let rota = [];
			let weekNo = week;

			let changes = this.$store.getters.changes;
			let warnings = [];

			// Rotate shift pattern $offset times
			if (this.offset > 0) {
				[...Array(this.offset)].map(() => pattern.push(pattern.shift()));
			} else if (this.offset < 0) {
				[...Array(Math.abs(this.offset))].map(() => pattern.unshift(pattern.pop()));
			}

			// Build the rota
			while (rota.length < limit) {
				let thisWeek = {};
				let weekDate = format(
					startOfWeek(addWeeks(new Date(year, 0, 1), weekNo - 1), {
						weekStartsOn: 1,
					}),
					'DD MMM YYYY'
				);

				// Check for changes
				let overrides = {};
				if (changes[weekDate]) {
					people.forEach(person => {
						if (changes[weekDate][person.name]) {
							overrides[person.name] = changes[weekDate][person.name].after;
						}
					});
				}

				// Assign out the shifts
				let workers = shiftWorkers.slice(0); // NOTE: Shallow clone

				pattern.forEach(shift => {
					let worker = workers.shift();
					thisWeek[worker] = overrides[worker] || shift;
				});

				// Add on the non shift workers if they are covering a shift
				otherWorkers.forEach(name => {
					if (overrides[name]) {
						thisWeek[name] = overrides[name];
					}
				});

				// Check for uncovered shifts and add warnings
				let covered = Object.values(thisWeek);
				let missing = required.filter(shift => !covered.includes(shift));
				warnings.push({
					week: weekDate,
					items: missing.map(shift => `No cover for ${shift} shift`),
				});

				// Rotate the shifts
				pattern.push(pattern.shift());

				// Add this week to the rota
				rota.push(
					Object.assign(thisWeek, {
						weekNo: weekNo,
						date: weekDate,

						// TODO: Dummy notes for testing
						notes: {
							Monday: { Dan: 'Early shift', Mat: 'Day shift' },
							Friday: { Dan: 'Back shift' },
						},
					})
				);

				weekNo++;
			}

			warnings.forEach(warning => this.$store.commit('setWarnings', warning));
			return rota;
		},
	},

	data() {
		return {
			// Default week and year to load
			startWeek: getISOWeek(new Date()),
			startYear: getYear(new Date()),
			offset: 0,

			expanded: [],

			initialRota: [], // to keep track of unsaved changes

			// We work a standard shift pattern that repeats every 6 weeks
			// The order id is used for the order we work the shifts
			shifts: [
				{ name: 'Early', required: true, orderid: 1 },
				{ name: 'Sat', required: true, orderid: 2 },
				{ name: 'Back', required: true, orderid: 3 },
				{ name: 'Day', required: false, orderid: 4 },
				{ name: 'Night', required: true, orderid: 5 },
				{ name: 'Day4', required: false, orderid: 6 },
			],

			// List of staff, the order they are in the rota and whether
			// they work shifts or not
			staff: [
				{ name: 'Jamie', shifts: true, orderid: 1 },
				{ name: 'Dan', shifts: true, orderid: 2 },
				{ name: 'Bogdan', shifts: true, orderid: 3 },
				{ name: 'Mat', shifts: true, orderid: 4 },
				{ name: 'Michael M', shifts: true, orderid: 5 },
				{ name: 'Michael P', shifts: true, orderid: 6 },

				{ name: 'Bryan', shifts: false, orderid: 7 },
				{ name: 'Brian', shifts: false, orderid: 8 },
			],
		};
	},

	methods: {
		changeShift(e) {
			let [weekIndex, person] = e.target.id.split('_');

			let week = this.rota[weekIndex];
			let ogWeek = this.initialRota[weekIndex];

			let change = {
				person: person,
				week: week.date,
				before: ogWeek[person] || 'Day',
				after: e.target.value,
				id: e.target.id,
			};

			// If this change is the same as the original rota then remove it and bail
			if (change.before == change.after) {
				this.$store.commit('removeChange', change);

				// Otherwise save the change
			} else {
				this.$store.commit('addChange', change);
			}
		},

		next() {
			this.offset = ++this.offset % 6;
			this.startWeek++;

			if (this.startWeek > 52) {
				this.startWeek = 1;
				this.startYear++;
			}
		},

		back() {
			this.offset = --this.offset % 6;
			this.startWeek--;

			if (this.startWeek < 1) {
				this.startWeek = 52;
				this.startYear--;
			}
		},

		toggle(index) {
			let i = this.expanded.indexOf(index);

			if (i > -1) {
				this.expanded.splice(i, 1);
			} else {
				this.expanded.push(index);
			}
		},

		isExpanded(index) {
			return this.expanded.indexOf(index) > -1;
		},
	},
};
</script>

<style scoped>
.control {
	margin-left: 10px;
}

table th,
table td {
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
.Leave {
	height: 2px;
	border: 2px solid darkgrey;
}
</style>
