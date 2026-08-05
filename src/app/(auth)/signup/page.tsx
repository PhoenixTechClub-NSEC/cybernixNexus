'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Flame, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useUser } from '@/components/providers/UserProvider';

export default function SignupPage() {
  const router = useRouter();
  const { updateUser } = useUser();
  
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Socials
  const [codeforces, setCodeforces] = useState('');
  const [leetcode, setLeetcode] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct full name
    const fullNameParts = [firstName.trim(), middleName.trim(), lastName.trim()].filter(Boolean);
    const fullName = fullNameParts.join(' ');

    // Update global state
    updateUser({
      name: fullName,
      email: email,
    });
    
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#FFF1D6] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-tomato-jam text-white shadow-lg shadow-tomato-jam/20 group-hover:scale-105 transition-transform">
            <Flame className="w-7 h-7 fill-current animate-pulse" />
          </div>
          <div className="text-left">
            <span className="font-extrabold text-2xl tracking-tight text-onyx">
              Cybernix<span className="text-tomato-jam">Nexus</span>
            </span>
            <p className="text-xs text-onyx/70 -mt-1 font-medium">
              NSEC Phoenix Tech Club
            </p>
          </div>
        </Link>
        <h2 className="mt-6 text-2xl sm:text-3xl font-black text-onyx tracking-tight">
          Create your CP Profile
        </h2>
        <p className="mt-2 text-sm text-onyx/70">
          Join the NSEC leaderboard and sync your competitive programming ratings.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl px-4">
        <div className="bg-white py-8 px-6 shadow-sm rounded-3xl border border-onyx/12 sm:px-10">
          
          <form className="space-y-6" onSubmit={handleSignup}>
            
            {/* Identity Section */}
            <div>
              <h3 className="text-sm font-bold text-onyx border-b border-onyx/10 pb-2 mb-4">1. Personal Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="first-name" className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">First Name *</label>
                  <input
                    id="first-name"
                    type="text"
                    required
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="modern-input w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam"
                  />
                </div>
                <div>
                  <label htmlFor="middle-name" className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">Middle Name</label>
                  <input
                    id="middle-name"
                    type="text"
                    autoComplete="additional-name"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    className="modern-input w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam"
                  />
                </div>
                <div>
                  <label htmlFor="last-name" className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">Last Name *</label>
                  <input
                    id="last-name"
                    type="text"
                    required
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="modern-input w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam"
                  />
                </div>
              </div>
            </div>

            {/* Account Section */}
            <div>
              <h3 className="text-sm font-bold text-onyx border-b border-onyx/10 pb-2 mb-4">2. Account Credentials</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">
                    College Email (@nsec.ac.in) *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="username"
                    pattern="^[a-zA-Z0-9._%+\-]+@nsec\.ac\.in$"
                    aria-describedby="email-error email-hint"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="modern-input w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam"
                  />
                  <div id="email-hint" className="hint-msg text-xs text-onyx/50 mt-1">
                    Must be your official NSEC email.
                  </div>
                  <div id="email-error" className="error-msg">
                    Please enter a valid @nsec.ac.in email address.
                  </div>
                </div>

                <div>
                  <label htmlFor="new-password" className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">
                    Password *
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    required
                    autoComplete="new-password"
                    pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}"
                    aria-describedby="password-error password-hint"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="modern-input w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam"
                  />
                  <div id="password-hint" className="hint-msg text-xs text-onyx/50 mt-1">
                    At least 8 chars, 1 uppercase, 1 lowercase, 1 number, and 1 symbol.
                  </div>
                  <div id="password-error" className="error-msg">
                    Password does not meet complexity requirements.
                  </div>
                </div>
              </div>
            </div>

            {/* Socials Section */}
            <div>
              <h3 className="text-sm font-bold text-onyx border-b border-onyx/10 pb-2 mb-4">3. Platform Handles (Optional)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="codeforces" className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">Codeforces</label>
                  <input
                    id="codeforces"
                    type="text"
                    value={codeforces}
                    onChange={(e) => setCodeforces(e.target.value)}
                    placeholder="e.g. tourist"
                    className="w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam"
                  />
                </div>
                <div>
                  <label htmlFor="leetcode" className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">LeetCode</label>
                  <input
                    id="leetcode"
                    type="text"
                    value={leetcode}
                    onChange={(e) => setLeetcode(e.target.value)}
                    placeholder="e.g. lee215"
                    className="w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam"
                  />
                </div>
                <div>
                  <label htmlFor="github" className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">GitHub</label>
                  <input
                    id="github"
                    type="text"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="e.g. torvalds"
                    className="w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam"
                  />
                </div>
                <div>
                  <label htmlFor="linkedin" className="block text-xs font-bold uppercase tracking-wider text-onyx/70 mb-1">LinkedIn</label>
                  <input
                    id="linkedin"
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="e.g. william-lin"
                    className="w-full px-4 py-2.5 rounded-xl border border-onyx/12 bg-golden-sand/8 text-sm text-onyx focus:outline-none focus:border-tomato-jam focus:ring-1 focus:ring-tomato-jam"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 px-4 rounded-xl bg-tomato-jam hover:bg-[#E8890C] text-white font-extrabold text-sm shadow-md shadow-tomato-jam/20 transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Complete Registration</span>
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-onyx/70 border-t border-onyx/10 pt-6">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-tomato-jam hover:underline">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
