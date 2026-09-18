/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@/components/providers/UserProvider';
import CodeforcesVerificationModal from '@/components/profile/CodeforcesVerificationModal';
import {
  Save,
  Globe,
  Briefcase,
  Code2,
  Sparkles,
  UserCircle2,
  X,
  Plus,
  Loader2,
  GraduationCap,
  ImageIcon,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

const STANDARD_PLATFORMS = ['LeetCode', 'Codeforces', 'CodeChef'] as const;

export default function SettingsPage() {
  const { user, updateUser, refreshUser } = useUser();
  const [dpUrl, setDpUrl] = useState(user.avatar || '');
  const [bio, setBio] = useState(user.bio || '');

  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username || user.name.toLowerCase().replace(/\s+/g, '_'));
  const [department, setDepartment] = useState<string>(user.department || 'CSE');
  const [graduationYear, setGraduationYear] = useState<string>(String(user.graduationYear || 2026));
  const [rollNumber, setRollNumber] = useState<string>(user.rollNumber || '');

  const [github, setGithub] = useState(user.github || '');
  const [linkedin, setLinkedin] = useState(user.linkedin || '');

  const [platformHandles, setPlatformHandles] = useState<Record<string, string>>({
    LeetCode: '',
    Codeforces: '',
    CodeChef: '',
  });

  const initialHandlesRef = useRef<Record<string, string>>({
    LeetCode: '',
    Codeforces: '',
    CodeChef: '',
  });
  const initialNameRef = useRef<string>(user.name);
  const initialDpUrlRef = useRef<string>(user.avatar);
  const initialDeptRef = useRef<string>(user.department || 'CSE');
  const initialGradYearRef = useRef<string>(String(user.graduationYear || 2026));
  const initialRollRef = useRef<string>(user.rollNumber || '');
  const initialGithubRef = useRef<string>(user.github || '');
  const initialLinkedinRef = useRef<string>(user.linkedin || '');
  const initialUsernameRef = useRef<string>(user.username || user.name.toLowerCase().replace(/\s+/g, '_'));
  const initialBioRef = useRef<string>(user.bio || '');

  const [isSaving, setIsSaving] = useState(false);
  const [isPlatformModalOpen, setIsPlatformModalOpen] = useState(false);
  const [platformName, setPlatformName] = useState('Codeforces');
  const [platformHandle, setPlatformHandle] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Codeforces verification modal
  const [isCfVerifyModalOpen, setIsCfVerifyModalOpen] = useState(false);
  const [cfVerifiedHandle, setCfVerifiedHandle] = useState<string | null>(
    // Pre-mark as verified if the platform already has a saved handle from DB
    null
  );
  // Tracks what the user has typed before verifying
  const [cfPendingHandle, setCfPendingHandle] = useState('');

  useEffect(() => {
    if (!isPlatformModalOpen) return;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsPlatformModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlatformModalOpen]);

  // Fetch student profile & platform handles from DB on mount
  useEffect(() => {
    let isMounted = true;
    const fetchDbProfile = async () => {
      try {
        const res = await fetch('/api/student');
        if (!res.ok) return;
        const data = await res.json();
        if (data.student && isMounted) {
          const s = data.student;
          const handles = {
            LeetCode: s.leetcode || '',
            Codeforces: s.codeforces || '',
            CodeChef: s.codechef || '',
          };
          setPlatformHandles(handles);
          initialHandlesRef.current = handles;

          // Mark existing saved CF handle as verified (it was verified when saved)
          if (s.codeforces) {
            setCfVerifiedHandle(s.codeforces);
            setCfPendingHandle(s.codeforces);
          }

          if (s.name) {
            setName(s.name);
            initialNameRef.current = s.name;
          }
          if (s.department) {
            setDepartment(s.department);
            initialDeptRef.current = s.department;
          }
          if (s.graduationYear) {
            setGraduationYear(String(s.graduationYear));
            initialGradYearRef.current = String(s.graduationYear);
          }
          if (s.rollNumber) {
            setRollNumber(s.rollNumber);
            initialRollRef.current = s.rollNumber;
          }
          if (s.github) {
            setGithub(s.github);
            initialGithubRef.current = s.github;
          }
          if (s.linkedin) {
            setLinkedin(s.linkedin);
            initialLinkedinRef.current = s.linkedin;
          }
          if (s.user?.image) {
            setDpUrl(s.user.image);
            initialDpUrlRef.current = s.user.image;
          }
          if (s.username) {
            setUsername(s.username);
            initialUsernameRef.current = s.username;
          }
          if (s.bio) {
            setBio(s.bio);
            initialBioRef.current = s.bio;
          }
        }
      } catch (err) {
        console.error('[SettingsPage] Error fetching DB handles:', err);
      }
    };
    fetchDbProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddPlatform = (e: React.FormEvent) => {
    e.preventDefault();
    if (!platformHandle.trim()) return;

    // If Codeforces is chosen, open the verification modal instead of adding directly
    if (platformName === 'Codeforces') {
      setIsPlatformModalOpen(false);
      setIsCfVerifyModalOpen(true);
      return;
    }

    setPlatformHandles((prev) => ({ ...prev, [platformName]: platformHandle.trim() }));
    setIsPlatformModalOpen(false);
    setPlatformHandle('');
    setToastMessage(`Added ${platformName} (@${platformHandle.trim()}) to list.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCfVerificationSuccess = async (verifiedHandle: string, data?: any) => {
    // Update platform handles state with the verified Codeforces handle
    setPlatformHandles((prev) => ({ ...prev, Codeforces: verifiedHandle }));
    setCfVerifiedHandle(verifiedHandle);
    setCfPendingHandle(verifiedHandle);
    initialHandlesRef.current = {
      ...initialHandlesRef.current,
      Codeforces: verifiedHandle,
    };
    setIsCfVerifyModalOpen(false);

    // If stats were already synced (settings page, student exists), refresh user
    if (data?.stats) {
      await refreshUser();
    }

    setToastMessage(`✅ Codeforces @${verifiedHandle} verified and linked successfully!`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const currentHandles = {
      LeetCode: platformHandles['LeetCode'] || '',
      Codeforces: platformHandles['Codeforces'] || '',
      CodeChef: platformHandles['CodeChef'] || '',
    };

    const initial = initialHandlesRef.current;
    const hasHandleChanges =
      currentHandles.LeetCode.trim() !== (initial.LeetCode || '').trim() ||
      currentHandles.Codeforces.trim() !== (initial.Codeforces || '').trim() ||
      currentHandles.CodeChef.trim() !== (initial.CodeChef || '').trim();

    const hasAcademicChanges =
      department !== initialDeptRef.current ||
      graduationYear !== initialGradYearRef.current ||
      rollNumber.trim() !== initialRollRef.current.trim() ||
      github.trim() !== initialGithubRef.current.trim() ||
      linkedin.trim() !== initialLinkedinRef.current.trim();

    const hasProfileChanges =
      name !== initialNameRef.current ||
      dpUrl !== initialDpUrlRef.current ||
      username.trim() !== initialUsernameRef.current.trim() ||
      bio.trim() !== initialBioRef.current.trim();

    // Do NOT trigger endpoint if no changes are done
    if (!hasHandleChanges && !hasProfileChanges && !hasAcademicChanges) {
      setToastMessage('No changes detected in platform handles or profile.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setIsSaving(true);
    setToastMessage('⏳ Saving your profile...');
    try {
      const res = await fetch('/api/student/handles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leetcode: currentHandles.LeetCode,
          codeforces: currentHandles.Codeforces,
          codechef: currentHandles.CodeChef,
          name,
          avatar: dpUrl.trim() || null,
          department,
          graduationYear: Number(graduationYear),
          rollNumber: rollNumber.trim(),
          github: github.trim() || null,
          linkedin: linkedin.trim() || null,
          username: username.trim() || null,
          bio: bio.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save handles');
      }

      // Update initial references
      initialHandlesRef.current = currentHandles;
      initialNameRef.current = name;
      initialDpUrlRef.current = dpUrl;
      initialDeptRef.current = department;
      initialGradYearRef.current = graduationYear;
      initialRollRef.current = rollNumber.trim();
      initialGithubRef.current = github.trim();
      initialLinkedinRef.current = linkedin.trim();
      initialUsernameRef.current = username.trim();
      initialBioRef.current = bio.trim();

      // Update global UserProvider state & trigger page re-sync
      const getExisting = (platform: string) =>
        user.platforms?.find((p: any) => p.platform === platform);

      const updatedPlatforms = [
        {
          platform: 'LeetCode' as const,
          handle: currentHandles.LeetCode,
          rating: data.stats?.leetcodeRating ?? getExisting('LeetCode')?.rating ?? 0,
          solvedCount: data.stats?.leetcodeSolved ?? getExisting('LeetCode')?.solvedCount ?? 0,
          weight: 1.0,
        },
        {
          platform: 'Codeforces' as const,
          handle: currentHandles.Codeforces,
          rating: data.stats?.codeforcesRating ?? getExisting('Codeforces')?.rating ?? 0,
          solvedCount: data.stats?.codeforcesSolved ?? getExisting('Codeforces')?.solvedCount ?? 0,
          weight: 1.2,
        },

        {
          platform: 'CodeChef' as const,
          handle: currentHandles.CodeChef,
          rating: data.stats?.codechefRating ?? getExisting('CodeChef')?.rating ?? 0,
          solvedCount: getExisting('CodeChef')?.solvedCount ?? 0,
          weight: 1.0,
        },
      ];

      updateUser({
        name,
        username,
        bio,
        department: department as any,
        graduationYear: Number(graduationYear),
        rollNumber: rollNumber.trim(),
        github: github.trim(),
        linkedin: linkedin.trim(),
        avatar: dpUrl || user.avatar,
        platforms: updatedPlatforms as any,
        cpScore: data.stats?.totalScore ?? user.cpScore,
        collegeRank: data.stats?.ranking ?? user.collegeRank,
        deptRank: data.stats?.departmentRanking ?? user.deptRank,
      });

      await refreshUser();

      if (data.hasHandleChanges) {
        setToastMessage('🔄 Syncing platforms...');
        setTimeout(() => {
          setToastMessage('✨ Profile saved & platforms synced successfully!');
          setTimeout(() => setToastMessage(null), 4000);
        }, 1500);
      } else {
        setToastMessage('✨ Profile saved successfully!');
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (err: any) {
      console.error('[Save Error]:', err);
      setToastMessage(`❌ Save failed: ${err.message}`);
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-onyx text-white flex items-center justify-center shadow-md">
          <UserCircle2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-onyx">Profile & Academic Settings</h1>
          <p className="text-sm text-onyx/70 mt-0.5">Customize your personal info, academic department, and synced CP handles.</p>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-onyx text-white text-xs font-extrabold shadow-xl border border-tomato-jam/40 animate-in slide-in-from-bottom-3 duration-300">
          <span className="text-lg">{toastMessage.includes('✨') ? '✨' : toastMessage.includes('❌') ? '❌' : '🎉'}</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">

        {/* Profile Picture (PFP URL Only) & Personal Identity */}
        <div className="rounded-3xl bg-white border border-onyx/12 p-4 sm:p-6 md:p-8 shadow-sm">
          <h2 className="text-lg font-black text-onyx flex items-center gap-2 mb-6">
            <ImageIcon className="w-5 h-5 text-tomato-jam" />
            Profile Picture & Identity
          </h2>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-6">
            <div className="shrink-0">
              <img
                src={dpUrl.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt="Profile Preview"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                }}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-golden-sand/30 shadow-lg"
              />
            </div>

            <div className="flex-1 w-full space-y-4">
              <div>
                <label className="block text-xs font-bold text-onyx uppercase tracking-wider mb-2">
                  Profile Picture URL (PFP)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={dpUrl}
                    onChange={(e) => setDpUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-4 py-3 rounded-xl bg-[#FFF1D6] border border-onyx/10 text-sm font-medium text-onyx focus:outline-none focus:ring-2 focus:ring-tomato-jam/50 transition-shadow placeholder:text-onyx/40"
                  />
                </div>
                <p className="text-xs text-onyx/60 mt-1">Provide a direct public image URL for your avatar.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold text-onyx uppercase tracking-wider mb-2">Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#FFF1D6] border border-onyx/10 text-sm font-medium text-onyx focus:outline-none focus:ring-2 focus:ring-tomato-jam/50 transition-shadow"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-onyx uppercase tracking-wider mb-2">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#FFF1D6] border border-onyx/10 text-sm font-medium text-onyx focus:outline-none focus:ring-2 focus:ring-tomato-jam/50 transition-shadow"
                    placeholder="your_username"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Details Section (Prisma: Student.department, graduationYear, rollNumber) */}
        <div className="rounded-3xl bg-white border border-onyx/12 p-4 sm:p-6 md:p-8 shadow-sm">
          <h2 className="text-lg font-black text-onyx flex items-center gap-2 mb-6">
            <GraduationCap className="w-5 h-5 text-tomato-jam" />
            Academic & College Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            <div>
              <label className="block text-xs font-bold text-onyx uppercase tracking-wider mb-2">
                College Roll Number
              </label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="e.g. 10800121001"
                className="w-full px-4 py-3 rounded-xl bg-[#FFF1D6] border border-onyx/10 text-sm font-medium text-onyx focus:outline-none focus:ring-2 focus:ring-tomato-jam/50 transition-shadow placeholder:text-onyx/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-onyx uppercase tracking-wider mb-2">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#FFF1D6] border border-onyx/10 text-sm font-medium text-onyx focus:outline-none focus:ring-2 focus:ring-tomato-jam/50 transition-shadow"
              >
                <option value="AEIE">Applied Electronics & Instrumentation Engineering</option>
                <option value="CE">Civil Engineering</option>
                <option value="CSBS">Computer Science & Business Systems (CSBS)</option>
                <option value="CSE">Computer Science & Engineering</option>
                <option value="CSE-AIML">Computer Science and Engineering (AIML)</option>
                <option value="CSE-AIDS">Computer Science and Engineering (AIDS)</option>
                <option value="CSE-CyberSecurity">Computer Science and Engineering (Cyber Security)</option>
                <option value="CSE-DataScience">Computer Science and Engineering (Data Science)</option>
                <option value="CSE-IoT">Computer Science and Engineering (IoT)</option>
                <option value="ECE">Electronics & Communication Engineering</option>
                <option value="EE">Electrical Engineering</option>
                <option value="IT">Information Technology</option>
                <option value="ME">Mechanical Engineering</option>
                <option value="BTech-ECE">B.Tech in Electrical & Computer Engineering</option>
                <option value="CSIT">Computer Science and Information Technology</option>
                <option value="MCA-BCA">Computer Application (MCA & BCA)</option>
                <option value="BCA">Bachelor of Computer Application (BCA)</option>
                <option value="BME">Bio Medical Engineering (BME)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-onyx uppercase tracking-wider mb-2">
                Graduation Year
              </label>
              <select
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#FFF1D6] border border-onyx/10 text-sm font-medium text-onyx focus:outline-none focus:ring-2 focus:ring-tomato-jam/50 transition-shadow"
              >
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
                <option value="2029">2029</option>
                <option value="2030">2030</option>
              </select>
            </div>
          </div>
        </div>

        {/* Social Links & Platform Handles Section */}
        <div className="rounded-3xl bg-white border border-onyx/12 p-4 sm:p-6 md:p-8 shadow-sm">
          <h2 className="text-lg font-black text-onyx flex items-center gap-2 mb-6">
            <Code2 className="w-5 h-5 text-pine-teal" />
            Social Profiles & Coding Handles
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* GitHub */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-onyx uppercase tracking-wider">
                <Globe className="w-4 h-4 text-onyx" /> GitHub Username
              </label>
              <input
                type="text"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="e.g. octocat"
                className="w-full px-4 py-2.5 rounded-xl bg-[#FFF1D6] border border-onyx/10 text-sm text-onyx focus:outline-none focus:ring-2 focus:ring-onyx/30 placeholder:text-onyx/30"
              />
            </div>

            {/* LinkedIn */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-onyx uppercase tracking-wider">
                <Briefcase className="w-4 h-4 text-[#0A66C2]" /> LinkedIn Username
              </label>
              <input
                type="text"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="e.g. satyaki-das"
                className="w-full px-4 py-2.5 rounded-xl bg-[#FFF1D6] border border-onyx/10 text-sm text-onyx focus:outline-none focus:ring-2 focus:ring-onyx/30 placeholder:text-onyx/30"
              />
            </div>

            {STANDARD_PLATFORMS.map((plat) =>
              plat === 'Codeforces' ? (
                // Codeforces: editable input + Verify button (ownership required)
                <div key={plat} className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-onyx uppercase tracking-wider">
                    <span className="font-extrabold text-sm text-tomato-jam">C</span>{' '}
                    Codeforces Handle
                  </label>

                  {cfVerifiedHandle && platformHandles['Codeforces'] === cfVerifiedHandle ? (
                    // ── Verified state: locked field + Re-verify option ──
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            readOnly
                            value={cfVerifiedHandle}
                            className="w-full px-4 py-2.5 pr-10 rounded-xl border border-emerald-400/50 bg-emerald-50/40 text-sm text-emerald-900 font-semibold cursor-default select-none"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setCfVerifiedHandle(null);
                            setCfPendingHandle(platformHandles['Codeforces'] || '');
                          }}
                          className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-onyx/60 bg-onyx/6 hover:bg-onyx/10 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Change
                        </button>
                      </div>
                      <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Ownership verified — linked as @{cfVerifiedHandle}
                      </p>
                    </div>
                  ) : (
                    // ── Unverified / editing state: editable input + Verify button ──
                    <div className="space-y-1.5">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={cfPendingHandle}
                          onChange={(e) => {
                            setCfPendingHandle(e.target.value);
                            // Clear verified status if user edits the handle
                            if (cfVerifiedHandle) setCfVerifiedHandle(null);
                          }}
                          placeholder="e.g. tourist"
                          className="flex-1 px-4 py-2.5 rounded-xl bg-[#FFF1D6] border border-onyx/10 text-sm text-onyx focus:outline-none focus:ring-2 focus:ring-tomato-jam/50 placeholder:text-onyx/30"
                        />
                        <button
                          type="button"
                          disabled={!cfPendingHandle.trim()}
                          onClick={() => setIsCfVerifyModalOpen(true)}
                          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-tomato-jam bg-tomato-jam/10 hover:bg-tomato-jam/20 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          Verify &amp; Link
                        </button>
                      </div>
                      {cfPendingHandle.trim() && (
                        <p className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          Handle must be verified before saving
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div key={plat} className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-onyx uppercase tracking-wider">
                    <span className={`font-extrabold text-sm ${plat === 'LeetCode' ? 'text-golden-sand' : 'text-pine-teal'}`}>
                      {plat.charAt(0)}
                    </span>{' '}
                    {plat} Username / Handle
                  </label>
                  <input
                    type="text"
                    value={platformHandles[plat] || ''}
                    onChange={(e) => setPlatformHandles({ ...platformHandles, [plat]: e.target.value })}
                    placeholder="Enter handle"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FFF1D6] border border-onyx/10 text-sm text-onyx focus:outline-none focus:ring-2 focus:ring-onyx/30 placeholder:text-onyx/30"
                  />
                </div>
              )
            )}
          </div>
        </div>

        {/* Bio / Description Section */}
        <div className="rounded-3xl bg-white border border-onyx/12 p-4 sm:p-6 md:p-8 shadow-sm">
          <h2 className="text-lg font-black text-onyx flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-golden-sand" />
            About You
          </h2>

          <div>
            <label className="block text-xs font-bold text-onyx uppercase tracking-wider mb-2">Short Bio / Description</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-[#FFF1D6] border border-onyx/10 text-sm font-medium text-onyx focus:outline-none focus:ring-2 focus:ring-tomato-jam/50 transition-shadow resize-none"
              placeholder="Tell us about your competitive programming goals and interests..."
            />
            <div className="flex justify-end mt-2">
              <span className="text-[10px] font-bold text-onyx/50">{bio.length} / 160 chars</span>
            </div>
          </div>
        </div>

        {/* Save Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-onyx/10">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-tomato-jam text-white text-sm font-black shadow-md hover:bg-[#E8890C] transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving & Syncing...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>

      </form>

      {/* CONNECT NEW PLATFORM MODAL (non-Codeforces) */}
      {isPlatformModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="connect-platform-title"
          onClick={() => setIsPlatformModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 backdrop-blur-xl p-3 sm:p-4 md:p-6 animate-in fade-in duration-200"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-3xl bg-white shadow-2xl p-6 sm:p-8 relative custom-scrollbar will-change-transform"
          >
            <button
              onClick={() => setIsPlatformModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 id="connect-platform-title" className="text-xl font-black text-slate-900 mb-1.5">
              Connect Coding Platform
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Sync your problem-solving statistics and automatic department multipliers.
            </p>

            <form onSubmit={handleAddPlatform} className="space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-wider">
                  Platform Name
                </label>
                <select
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-tomato-jam transition-shadow"
                >
                  <option value="Codeforces">Codeforces (requires verification)</option>
                  <option value="LeetCode">LeetCode</option>
                  <option value="CodeChef">CodeChef</option>
                  <option value="GFG">GeeksforGeeks</option>
                </select>
              </div>

              {platformName !== 'Codeforces' && (
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-wider">
                    Handle / Username
                  </label>
                  <input
                    type="text"
                    required
                    value={platformHandle}
                    onChange={(e) => setPlatformHandle(e.target.value)}
                    placeholder="e.g. tourist"
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-tomato-jam transition-shadow placeholder:text-slate-400"
                  />
                </div>
              )}

              {platformName === 'Codeforces' && (
                <div className="p-4 rounded-2xl bg-tomato-jam/8 border border-tomato-jam/20 text-xs text-onyx/80 font-medium flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-tomato-jam mt-0.5" />
                  <span>
                    Codeforces accounts require <strong>ownership verification</strong>. Clicking continue will open the verification flow where you'll set your Codeforces First Name to a generated code.
                  </span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-tomato-jam text-white font-extrabold text-sm shadow-md hover:bg-[#D93D42] transition-colors cursor-pointer"
              >
                {platformName === 'Codeforces' ? 'Continue to Verification →' : 'Add to Profiles'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CODEFORCES OWNERSHIP VERIFICATION MODAL */}
      <CodeforcesVerificationModal
        isOpen={isCfVerifyModalOpen}
        onClose={() => setIsCfVerifyModalOpen(false)}
        initialHandle={cfPendingHandle || platformHandles['Codeforces'] || ''}
        onSuccess={handleCfVerificationSuccess}
      />
    </div>
  );
}
