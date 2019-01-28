<template>
	<div class='login-form'>
		<div class='columns'>
			<div class='column is-half'>
				<p class='subtitle'>Enter your email address and you'll receive a magic login link</p>

				<div class='notification is-danger' id='errors' v-if='errors.length'>
					<p v-for='error in errors' :key='error'>&#8226; {{error}}</p>
					<button class='delete' @click='errors = []'></button>
				</div>

				<div class='field'>
					<label class='label' for='email'>Email Address</label>
					<div class='control has-icons-left'>
						<span class='icon is-small is-left'>
							<i class='fas fa-envelope'></i>
						</span>
						<input id='email' type='email' class='input' placeholder='Email Address'/>
					</div>
				</div>
				<div class='field'>
					<label class='label' for='password'>Password</label>
					<div class='control has-icons-left'>
						<span class='icon is-small is-left'>
							<i class='fas fa-lock'></i>
						</span>
						<input id='password' type='password' class='input' placeholder='Password'/>
					</div>
				</div>
				<div class='field' v-if='registering'>
					<label class='label' for='password-confirm'>Confirm Password</label>
					<div class='control has-icons-left'>
						<span class='icon is-small is-left'>
							<i class='fas fa-lock'></i>
						</span>
						<input id='password-confirm' type='password' class='input' placeholder='Confirm Password'/>
					</div>
				</div>

				<div class='field'>
					<div v-if='registering'>
						<button class='button is-primary' @click='register'>Register</button>
					</div>
					<div v-else>
						<button class='button is-primary' @click='login'>Login</button>
						<button class='button is-text' @click='registering = true'>Register?</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import axios from 'axios'

export default {
	name: 'LoginForm',

	data() {
		return {
			registering: false,
			errors: [],
		}
	},

	methods: {
		login() {
			let email    = document.getElementById('email').value
			let password = document.getElementById('password').value

			// Validate
			this.validate(email, password)
			if (this.errors.length)
				return

			// TODO: Get Token
			this.$store.commit('setToken', 'blahblahblah')
		},

		register() {
			let email           = document.getElementById('email').value
			let password        = document.getElementById('password').value
			let passwordConfirm = document.getElementById('password-confirm').value

			// Validate
			this.validate(email, password, passwordConfirm)
			if (this.errors.length)
				return

			// TODO: Send register request
			this.login(email, password)
		},

		validate(email, password, passwordConfirm = '') {
			this.errors = [] //reset

			if (email == '') 
				this.errors.push('Email cannot be blank')

			// Registering
			if (passwordConfirm != '') {
				if (password.length < 8)
					this.errors.push('Password should be at least 8 characters')

				if (password != passwordConfirm)
					this.errors.push('Passwords do not match')
			} else {
				if (password == '')
					this.errors.push('Password cannot be blank')
			}
		}
	}
}
</script>

<style scoped>	
</style>
