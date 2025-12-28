'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader, Mail } from 'lucide-react';
import { Checkbox, TextField, FormControlLabel } from '@mui/material';
import { Controller } from 'react-hook-form';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else if (result?.ok) {
        // Prefer a caller-provided success handler, otherwise default to dashboard
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Email Field */}
      <div>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              variant="filled"
              label="Email"
              fullWidth
              disabled={isLoading}
              error={!!errors.email}
              helperText={errors.email?.message}
              InputProps={{
                endAdornment: <Mail className="text-gray-400 mr-2" size={18} />,
              }}
              sx={{
                '& .MuiFilledInput-root': {
                  backgroundColor: 'rgba(55, 65, 81, 0.8)',
                  borderRadius: '0.5rem 0.5rem 0 0',
                  '&:hover': {
                    backgroundColor: 'rgba(55, 65, 81, 0.9)',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'rgba(55, 65, 81, 0.8)',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: 'rgba(55, 65, 81, 0.5)',
                  },
                  '&:before': {
                    borderBottom: '1px solid rgba(156, 163, 175, 0.5)',
                  },
                  '&:hover:before': {
                    borderBottom: '1px solid rgba(156, 163, 175, 0.7)',
                  },
                  '&:after': {
                    borderBottom: '2px solid #34d399',
                  },
                },
                '& .MuiFilledInput-input': {
                  color: 'white',
                  paddingTop: '24px',
                  paddingBottom: '8px',
                  paddingRight: '40px !important',
                },
                '& .MuiInputLabel-root': {
                  color: '#9ca3af',
                  '&.Mui-focused': {
                    color: '#34d399',
                  },
                  '&.MuiInputLabel-shrink': {
                    transform: 'translate(12px, 7px) scale(0.75)',
                  },
                },
                '& .MuiFormHelperText-root': {
                  color: '#f87171',
                  marginLeft: 0,
                  marginTop: '0.5rem',
                },
              }}
            />
          )}
        />
      </div>

      {/* Password Field */}
      <div className="mt-4">
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              variant="filled"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              disabled={isLoading}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer mr-2"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                ),
              }}
              sx={{
                '& .MuiFilledInput-root': {
                  backgroundColor: 'rgba(55, 65, 81, 0.8)',
                  borderRadius: '0.5rem 0.5rem 0 0',
                  '&:hover': {
                    backgroundColor: 'rgba(55, 65, 81, 0.9)',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'rgba(55, 65, 81, 0.8)',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: 'rgba(55, 65, 81, 0.5)',
                  },
                  '&:before': {
                    borderBottom: '1px solid rgba(156, 163, 175, 0.5)',
                  },
                  '&:hover:before': {
                    borderBottom: '1px solid rgba(156, 163, 175, 0.7)',
                  },
                  '&:after': {
                    borderBottom: '2px solid #34d399',
                  },
                },
                '& .MuiFilledInput-input': {
                  color: 'white',
                  paddingTop: '24px',
                  paddingBottom: '8px',
                  paddingRight: '40px !important',
                },
                '& .MuiInputLabel-root': {
                  color: '#9ca3af',
                  '&.Mui-focused': {
                    color: '#34d399',
                  },
                  '&.MuiInputLabel-shrink': {
                    transform: 'translate(12px, 7px) scale(0.75)',
                  },
                },
                '& .MuiFormHelperText-root': {
                  color: '#f87171',
                  marginLeft: 0,
                  marginTop: '0.5rem',
                },
              }}
            />
          )}
        />
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between text-sm mt-4">
        <FormControlLabel
          control={
            <Checkbox
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
              sx={{
                color: '#34d399',
                padding: '4px',
                '&.Mui-checked': {
                  color: '#34d399',
                },
                '& .MuiSvgIcon-root': {
                  fontSize: 20,
                },
                '&.Mui-disabled': {
                  color: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            />
          }
          label="Remember me"
          sx={{
            color: '#d1d5db',
            margin: 0,
            '& .MuiFormControlLabel-label': {
              fontSize: '0.8rem',
            },
          }}
        />
        <a
          href="#"
          className="text-profit hover:text-blue-300 font-medium transition-colors"
        >
          Forgot password?
        </a>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gray-700/90 cursor-pointer text-profit font-medium py-2.5 px-4 rounded-lg
                   transition-all flex items-center justify-center gap-2 mt-6
                   disabled:opacity-50 disabled:cursor-not-allowed
                   hover:bg-gray-800 active:scale-[0.98]"
      >
        {isLoading && <Loader size={18} className="animate-spin" />}
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
