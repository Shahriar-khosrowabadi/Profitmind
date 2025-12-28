'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import SignUpForm from '@/components/auth/SignUpForm';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  useEffect(() => {
    document.title = 'ProfitMind - Login';
  }, []);

  const handleSignInSuccess = () => {
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Section - Form */}
      <div className="w-full lg:w-1/3 flex flex-col bg-[#10212B] text-white">
        <div className="flex-1 flex items-center justify-center px-8 md:px-12 py-8">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-3">
                <span className="text-[#34D399]">Profit</span>
                <span className="text-white">Mind</span>
              </h1>
              <p className="text-base md:text-lg text-gray-300 font-light">
                Unlock the Power of Predictive Financial Analytics
              </p>
              {isSignUp && (
                <p className="text-lg text-[#30c58e] font-light mt-2">
                  Welcome! Start your journey with us today.
                </p>
              )}
            </div>

            {/* Sign In Link */}
            <AnimatePresence>
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  className="mb-6"
                >
                  <button
                    onClick={() => setIsSignUp(false)}
                    className="text-profit cursor-pointer hover:text-blue-300 text-sm transition-colors inline-flex items-center gap-1"
                  >
                    Already have an account?
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <div className="mb-6 overflow-hidden">
              <AnimatePresence mode="wait">
                {isSignUp ? (
                  <motion.div
                    key="signup"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <SignUpForm onSuccess={() => setIsSignUp(false)} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <LoginForm onSuccess={handleSignInSuccess} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sign Up/Sign In Toggle */}
            <AnimatePresence>
              {!isSignUp && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  className="mb-8"
                >
                  <button
                    onClick={() => setIsSignUp(true)}
                    className="text-profit cursor-pointer hover:text-blue-300 text-sm transition-colors"
                  >
                    Don&apos;t have an account?
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Right Section - City Skyline Background */}
      <div className="hidden lg:block lg:w-2/3 relative min-h-screen">
        <div className="absolute inset-0">
          <Image
            src="/sean-pollock-PhYq704ffdA-unsplash-min.jpg"
            alt="City skyline"
            fill
            className="object-cover"
            priority
            sizes="66vw"
          />
          {/* Overlay for better text contrast if needed */}
          <div className="absolute inset-0 bg-gradient-to-l from-black/20 to-transparent"></div>
        </div>
        {/* Optional: Add "Explore" button in bottom right if needed */}
      </div>
    </div>
  );
}
