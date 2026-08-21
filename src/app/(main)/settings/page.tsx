/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@/components/providers/UserProvider';
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
} from 'lucide-react';

const STANDARD_PLATFORMS = ['LeetCode', 'Codeforces', 'GFG', 'CodeChef'] as const;

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
    GFG: '',
    CodeChef: '',
  });

  const initialHandlesRef = useRef<Record<string, string>>({
    LeetCode: '',
    Codeforces: '',
    GFG: '',
    CodeChef: '',
  });
  const initialNameRef = useRef<string>(user.name);
  const initialDpUrlRef = useRef<string>(user.avatar);
  const initialDeptRef = useRef<string>(user.department || 'CSE');
  const initialGradYearRef = useRef<string>(String(user.graduationYear || 2026));
  const initialRollRef = useRef<string>(user.rollNumber || '');
  const initialGithubRef = useRef<string>(user.github || '');
  const initialLinkedinRef = useRef<string>(user.linkedin || '');

  const [isSaving, setIsSaving] = useState(false);
  const [isPlatformModalOpen, setIsPlatformModalOpen] = useState(false);
  const [platformName, setPlatformName] = useState('Codeforces');
  const [platformHandle, setPlatformHandle] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
            GFG: s.gfg || '',
            CodeChef: s.codechef || '',
          };
          setPlatformHandles(handles);
          initialHandlesRef.current = handles;

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

    setPlatformHandles((prev) => ({ ...prev, [platformName]: platformHandle.trim() }));
    setIsPlatformModalOpen(false);
    setPlatformHandle('');
    setToastMessage(`Added ${platformName} (@${platformHandle.trim()}) to list.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const currentHandles = {
      LeetCode: platformHandles['LeetCode'] || '',
      Codeforces: platformHandles['Codeforces'] || '',
      GFG: platformHandles['GFG'] || '',
      CodeChef: platformHandles['CodeChef'] || '',
    };

    const initial = initialHandlesRef.current;
    const hasHandleChanges =
      currentHandles.LeetCode.trim() !== (initial.LeetCode || '').trim() ||
      currentHandles.Codeforces.trim() !== (initial.Codeforces || '').trim() ||
      currentHandles.GFG.trim() !== (initial.GFG || '').trim() ||
      currentHandles.CodeChef.trim() !== (initial.CodeChef || '').trim();

    const hasAcademicChanges =
      department !== initialDeptRef.current ||
      graduationYear !== initialGradYearRef.current ||
      rollNumber.trim() !== initialRollRef.current.trim() ||
      github.trim() !== initialGithubRef.current.trim() ||
      linkedin.trim() !== initialLinkedinRef.current.trim();

    const hasProfileChanges =
      name !== initialNameRef.current || dpUrl !== initialDpUrlRef.current;

    // Do NOT trigger endpoint if no changes are done
    if (!hasHandleChanges && !hasProfileChanges && !hasAcademicChanges) {
      setToastMessage('No changes detected in platform handles or profile.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/student/handles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leetcode: currentHandles.LeetCode,
          codeforces: currentHandles.Codeforces,
          gfg: currentHandles.GFG,
          codechef: currentHandles.CodeChef,
          name,
          avatar: dpUrl.trim() || null,
          department,
          graduationYear: Number(graduationYear),
          rollNumber: rollNumber.trim(),
          github: github.trim() || null,
          linkedin: linkedin.trim() || null,
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
          platform: 'GFG' as const,
          handle: currentHandles.GFG,
          rating: 0,
          solvedCount: data.stats?.gfgScore ?? getExisting('GFG')?.solvedCount ?? 0,
          weight: 0.8,
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

      setToastMessage(
        data.hasHandleChanges
          ? 'Platform handles updated & stats fetched successfully!'
          : 'Profile and academic settings saved successfully!'
      );
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.error('[Save Error]:', err);
      setToastMessage(`Save failed: ${err.message}`);
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
        <div className="p-4 rounded-2xl bg-white border border-onyx/12 text-onyx font-bold text-sm shadow-md flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-tomato-jam" />
          <span>{toastMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">

        {/* Profile Picture (PFP URL Only) & Personal Identity */}
        <div className="rounded-3xl bg-white border border-onyx/12 p-6 sm:p-8 shadow-sm">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <div className="rounded-3xl bg-white border border-onyx/12 p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-black text-onyx flex items-center gap-2 mb-6">
            <GraduationCap className="w-5 h-5 text-tomato-jam" />
            Academic & College Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
                <option value="CSE">CSE (Computer Science)</option>
                <option value="IT">IT (Information Technology)</option>
                <option value="ECE">ECE (Electronics & Communication)</option>
                <option value="AI&DS">AI & DS (Artificial Intelligence)</option>
                <option value="EE">EE (Electrical Engineering)</option>
                <option value="ME">ME (Mechanical Engineering)</option>
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
        <div className="rounded-3xl bg-white border border-onyx/12 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-onyx flex items-center gap-2">
              <Code2 className="w-5 h-5 text-pine-teal" />
              Social Profiles & Coding Handles
            </h2>
            <button
              type="button"
              onClick={() => setIsPlatformModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-golden-sand/20 text-tomato-jam text-xs font-bold hover:bg-golden-sand/30 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add platform
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {STANDARD_PLATFORMS.map((plat) => (
              <div key={plat} className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-onyx uppercase tracking-wider">
                  <span className={`font-extrabold text-sm ${plat === 'Codeforces' ? 'text-tomato-jam' : plat === 'LeetCode' ? 'text-golden-sand' : 'text-pine-teal'}`}>
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
            ))}
          </div>
        </div>

        {/* Bio / Description Section */}
        <div className="rounded-3xl bg-white border border-onyx/12 p-6 sm:p-8 shadow-sm">
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

      {/* CONNECT NEW PLATFORM MODAL */}
      {isPlatformModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-[2rem] bg-white shadow-2xl p-8 relative will-change-transform">
            <button
              onClick={() => setIsPlatformModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-black text-slate-900 mb-1.5">
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
                  <option value="Codeforces">Codeforces</option>
                  <option value="LeetCode">LeetCode</option>
                  <option value="CodeChef">CodeChef</option>
                  <option value="GFG">GeeksforGeeks</option>
                </select>
              </div>

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

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-tomato-jam text-white font-extrabold text-sm shadow-md hover:bg-[#E8890C] transition-colors cursor-pointer"
              >
                Add to Profiles
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
