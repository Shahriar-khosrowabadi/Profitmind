'use client';

import { useState } from 'react';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { z } from 'zod';
import { Eye, EyeOff, Loader, Mail, User } from 'lucide-react';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import type { FieldErrors } from 'react-hook-form';

const signUpSchema = z
  .object({
    name: z.string().min(2, 'Please enter your full name'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-z]/, 'Password must include a lowercase letter')
      .regex(/[A-Z]/, 'Password must include an uppercase letter')
      .regex(/\d/, 'Password must include a number')
      .regex(/[^A-Za-z0-9]/, 'Password must include a special character'),
    confirmPassword: z.string(),
    countryCode: z.string().min(2, 'Please select a country'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

interface SignUpFormProps {
  onSuccess?: () => void;
}

const signUpResolver: Resolver<SignUpFormData> = async (values) => {
  const result = await signUpSchema.safeParseAsync(values);

  if (result.success) {
    return { values: result.data, errors: {} };
  }

  const fieldErrors: Record<
    string,
    { type?: string; message?: string; types?: Record<string, string> }
  > = {};

  result.error.issues.forEach((issue) => {
    const path = issue.path.join('.') || 'root';
    const existing = fieldErrors[path];

    if (existing) {
      fieldErrors[path] = {
        ...existing,
        types: {
          ...(existing.types || {}),
          [issue.code]: issue.message,
        },
      };
    } else {
      fieldErrors[path] = { type: issue.code, message: issue.message };
    }
  });

  return {
    values: {},
    errors: fieldErrors,
  };
};

export default function SignUpForm({ onSuccess }: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setError: setFieldError,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: signUpResolver,
    mode: 'onChange',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      countryCode: '',
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          countryCode: data.countryCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        if (Array.isArray(errorData)) {
          errorData.forEach(
            (issue: { path?: (string | number)[]; message?: string }) => {
              const path = issue?.path?.[0];
              const fieldName = path as keyof SignUpFormData;
              if (fieldName && issue.message) {
                setFieldError(fieldName, {
                  type: 'server',
                  message: issue.message,
                });
              }
            }
          );
        }

        const message: string =
          (errorData && (errorData.error || errorData.detail)) ||
          'Failed to create account';

        if (/password/i.test(message)) {
          setFieldError(
            'password',
            { type: 'server', message },
            { shouldFocus: true }
          );
        } else if (/email/i.test(message)) {
          setFieldError(
            'email',
            { type: 'server', message },
            { shouldFocus: true }
          );
        } else if (!Array.isArray(errorData)) {
          setError(message);
        }
        return;
      }

      onSuccess?.();
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onInvalid = (_formErrors: FieldErrors<SignUpFormData>) => {
    // Swallow validation rejections to avoid console noise; messages render under fields via helperText.
    return;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4" noValidate>
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Name Field */}
      <div>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              variant="filled"
              label="Full name"
              fullWidth
              disabled={isLoading}
              error={!!errors.name}
              helperText={errors.name?.message}
              FormHelperTextProps={{ sx: { color: '#f87171', marginLeft: 0 } }}
              InputProps={{
                endAdornment: <User className="text-gray-400 mr-2" size={18} />,
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
              FormHelperTextProps={{ sx: { color: '#f87171', marginLeft: 0 } }}
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

      {/* Country Code Field */}
      <div className="mt-4">
        <FormControl
          fullWidth
          variant="filled"
          error={!!errors.countryCode}
          sx={{ width: '100%' }}
        >
          <InputLabel
            id="country-label"
            sx={{
              color: '#9ca3af',
              '&.Mui-focused': {
                color: '#34d399',
              },
              '&.MuiInputLabel-shrink': {
                transform: 'translate(12px, 7px) scale(0.75)',
              },
            }}
          >
            Country
          </InputLabel>
          <Controller
            name="countryCode"
            control={control}
            render={({ field }) => (
              <div className="relative w-full bg-[#2F3B4A] rounded-t-sm">
                <Select
                  {...field}
                  labelId="country-label"
                  label="Country"
                  disabled={isLoading}
                  displayEmpty
                  sx={{
                    width: '100%',
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
                    '&.Mui-error:before, &.Mui-error:after': {
                      borderBottomColor: '#f87171',
                    },
                    '&.Mui-error': {
                      boxShadow: '0 0 0 1px rgba(248,113,113,0.4)',
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
                    '& .MuiSelect-select': {
                      color: 'white',
                      paddingTop: '24px',
                      paddingBottom: '8px',
                      paddingRight: '40px !important',
                      width: '100%',
                      '&:focus': {
                        backgroundColor: 'transparent',
                      },
                    },
                    '& .MuiSvgIcon-root': {
                      color: '#9ca3af',
                      right: '12px',
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: '#10212B',
                        '& .MuiMenuItem-root': {
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          },
                          '&.Mui-selected': {
                            backgroundColor: 'rgba(52, 211, 153, 0.2)',
                            '&:hover': {
                              backgroundColor: 'rgba(52, 211, 153, 0.3)',
                            },
                          },
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled></MenuItem>
                  <MenuItem value="US">United States</MenuItem>
                  <MenuItem value="UK">United Kingdom</MenuItem>
                  <MenuItem value="CA">Canada</MenuItem>
                  <MenuItem value="AU">Australia</MenuItem>
                  <MenuItem value="DE">Germany</MenuItem>
                  <MenuItem value="FR">France</MenuItem>
                  <MenuItem value="JP">Japan</MenuItem>
                  <MenuItem value="IN">India</MenuItem>
                  <MenuItem value="BR">Brazil</MenuItem>
                  <MenuItem value="MX">Mexico</MenuItem>
                </Select>
                {errors.countryCode && (
                  <p className="text-sm text-red-400 mt-2 ml-3">
                    {errors.countryCode.message}
                  </p>
                )}
              </div>
            )}
          />
        </FormControl>
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
              helperText={
                errors.password ? (
                  <ul className="text-sm text-red-400 mt-1 space-y-1 list-disc list-inside">
                    {Array.from(
                      new Set(
                        [
                          errors.password.message,
                          ...(errors.password.types
                            ? Object.values(
                                errors.password.types as Record<string, string>
                              )
                            : []),
                        ].filter(Boolean)
                      )
                    ).map((msg, idx) => (
                      <li key={idx}>{msg}</li>
                    ))}
                  </ul>
                ) : null
              }
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
                  '&.Mui-error:before, &.Mui-error:after': {
                    borderBottomColor: '#f87171',
                  },
                  '&.Mui-error': {
                    boxShadow: '0 0 0 1px rgba(248,113,113,0.4)',
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

      {/* Confirm Password Field */}
      <div className="mt-4">
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              variant="filled"
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              fullWidth
              disabled={isLoading}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              FormHelperTextProps={{ sx: { color: '#f87171', marginLeft: 0 } }}
              InputProps={{
                endAdornment: (
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer mr-2"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
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
        {isLoading ? 'Creating account...' : 'Create Account'}
      </button>

      <p className="text-xs text-gray-400 text-center mt-4">
        By signing up, you agree to our Terms of Service and Privacy Policy
      </p>
    </form>
  );
}
