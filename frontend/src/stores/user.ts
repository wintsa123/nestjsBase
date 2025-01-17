import { defineStore } from 'pinia'
import { alovaInstance } from '../api'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as any,
    token: localStorage.getItem('token') || null
  }),
  
  actions: {
    async login(username: string, password: string) {
      try {
        const response = await alovaInstance.Post('/auth/login', {
          username,
          password
        }).send()
        this.token = response.token
        this.user = response.user
        localStorage.setItem('token', this.token)
        return true
      } catch (error) {
        console.error('Login failed:', error)
        return false
      }
    },

    async register(userData: any) {
      try {
        const response = await alovaInstance.Post('/auth/register', userData).send()
        return response
      } catch (error) {
        console.error('Registration failed:', error)
        throw error
      }
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
    }
  }
})
