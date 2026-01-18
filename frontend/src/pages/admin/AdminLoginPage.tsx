import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/authStore'
import { Loader2 } from 'lucide-react'

const loginSchema = z.object({
  email: z.email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { login, isLoading, error } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    const success = await login(data.email, data.password)
    if (success) {
      navigate('/admin/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-kobra-teal flex flex-col items-center justify-center px-4">
      {/* Geometric diamond decoration */}
      <div className="mb-6">
        <svg width="80" height="80" viewBox="0 0 80 80" className="text-kobra-pink">
          <polygon points="40,5 75,40 40,75 5,40" fill="none" stroke="currentColor" strokeWidth="3"/>
          <polygon points="40,20 60,40 40,60 20,40" fill="currentColor"/>
        </svg>
      </div>

      {/* Title */}
      <h1 className="text-4xl text-white mb-2 geometric">ADMIN</h1>
      <p className="text-kobra-yellow handwritten text-xl mb-8">Panel de Control</p>

      {/* Login form */}
      <div className="w-full max-w-md bg-white p-8 kobra-border-thick">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Error message */}
          {error && (
            <div className="bg-kobra-red/10 border-2 border-kobra-red text-kobra-red p-3 text-sm">
              {error}
            </div>
          )}

          {/* Email field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-bold uppercase">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              className="border-2 border-kobra-teal focus:ring-kobra-pink"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-kobra-red text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-bold uppercase">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="border-2 border-kobra-teal focus:ring-kobra-pink pr-20"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-kobra-teal"
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
            {errors.password && (
              <p className="text-kobra-red text-sm">{errors.password.message}</p>
            )}
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-kobra-pink text-white hover:bg-kobra-pink/90 text-lg py-6 kobra-border"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                SIGNING IN...
              </>
            ) : (
              'SIGN IN'
            )}
          </Button>
        </form>
      </div>

      {/* Bottom rainbow stripe */}
      <div className="absolute bottom-0 left-0 right-0 h-2 flex">
        <div className="flex-1 bg-kobra-red"></div>
        <div className="flex-1 bg-kobra-orange"></div>
        <div className="flex-1 bg-kobra-yellow"></div>
        <div className="flex-1 bg-kobra-green"></div>
        <div className="flex-1 bg-kobra-teal"></div>
        <div className="flex-1 bg-kobra-blue"></div>
        <div className="flex-1 bg-kobra-purple"></div>
      </div>
    </div>
  )
}
