'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    console.log('📨 Attempting registration with:', { username, email, password })

    try {
      const res = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        console.error('❌ Registration failed:', data)
        setError(data.detail || 'Registration failed')
        return
      }

      console.log('✅ Registration successful')
      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } catch (err) {
      console.error('🚨 Error during registration:', err)
      setError('Something went wrong')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 shadow-lg rounded-lg p-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full px-4 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
            required
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
            required
          />
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md"
          >
            Register
          </button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-400 text-sm">Registration successful! Redirecting...</p>}
        </form>
        <p className="mt-4 text-sm text-center text-gray-300">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
