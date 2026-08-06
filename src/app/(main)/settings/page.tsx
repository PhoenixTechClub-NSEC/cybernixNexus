/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef } from 'react';
import { useUser } from '@/components/providers/UserProvider';
import { Camera, Save, Globe, Briefcase, Code2, Sparkles, UserCircle2, X, CheckCircle2, Plus } from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUser } = useUser();
  const [dpUrl, setDpUrl] = useState(user.avatar);
  const [bio, setBio] = useState(user.bio || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username || user.name.toLowerCase().replace(/\s+/g, '_'));

  const [socials, setSocials] = useState({
    github: `https://github.com/${user.username || 'username'}`,
    linkedin: `https://linkedin.com/in/${user.username || 'username'}`,
  });

  const [platformHandles, setPlatformHandles] = useState<Record<string, string>>(
    (user.platforms || []).reduce((acc: any, p: any) => ({ ...acc, [p.platform]: p.handle }), {})
  );

  const [isPlatformModalOpen, setIsPlatformModalOpen] = useState(false);
  const [platformName, setPlatformName] = useState('Codeforces');
  const [platformHandle, setPlatformHandle] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAddPlatform = (e: React.FormEvent) => {
    e.preventDefault();
    if (!platformHandle.trim()) return;

    const existingPlatform = user.platforms?.find((p: any) => p.platform === platformName);
    let newPlatforms = [];
    if (existingPlatform) {
      newPlatforms = (user.platforms || []).map((p: any) => 
        p.platform === platformName ? { ...p, handle: platformHandle.trim() } : p
      );
    } else {
      newPlatforms = [
        ...(user.platforms || []),
        {
          platform: platformName as any,
          handle: platformHandle.trim(),
          rating: 0,
          solvedCount: 0,
          weight: 1.0,
        }
      ];
    }
    
    updateUser({ platforms: newPlatforms });
    // Update local platform handles state so the input fields reflect it immediately
    setPlatformHandles(prev => ({ ...prev, [platformName]: platformHandle.trim() }));
    setIsPlatformModalOpen(false);
    setPlatformHandle('');
    setToastMessage(`Added ${platformName} (@${platformHandle.trim()}) successfully!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedPlatforms = (user.platforms || []).map((p: any) => ({
      ...p,
      handle: platformHandles[p.platform] || p.handle
    }));
    updateUser({ 
      name,
      username,
      bio,
      avatar: dpUrl || user.avatar,
      platforms: updatedPlatforms
    });
    alert('Settings saved successfully!');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDpUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-onyx text-white flex items-center justify-center shadow-md">
          <UserCircle2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-onyx">Profile Settings</h1>
          <p className="text-sm text-onyx/70 mt-0.5">Customize how you appear on the leaderboard and editorials.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Profile Picture Section */}
        <div className="rounded-3xl bg-white border border-onyx/12 p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-black text-onyx flex items-center gap-2 mb-6">
            <Camera className="w-5 h-5 text-tomato-jam" />
            Profile Picture
          </h2>
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
            <div className="relative group shrink-0">
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                className="hidden" 
              />
              <img 
                src={dpUrl} 
                alt="Profile Preview" 
                className="w-32 h-32 rounded-full object-cover ring-4 ring-golden-sand/30 shadow-lg group-hover:ring-tomato-jam transition-colors"
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2.5 rounded-full bg-onyx text-white hover:bg-tomato-jam transition-colors shadow-lg cursor-pointer"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 w-full space-y-4">
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
              <p className="text-xs text-onyx/60 leading-relaxed">
                Click the camera icon on your profile picture to upload a new image. Max display size is 128x128px.
              </p>
            </div>
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
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-[#FFF1D6] border border-onyx/10 text-sm font-medium text-onyx focus:outline-none focus:ring-2 focus:ring-tomato-jam/50 transition-shadow resize-none"
              placeholder="Tell us about your coding journey..."
            />
            <div className="flex justify-end mt-2">
              <span className="text-[10px] font-bold text-onyx/50">{bio.length} / 160 chars</span>
            </div>
          </div>
        </div>

        {/* Social Links Section */}
        <div className="rounded-3xl bg-white border border-onyx/12 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-onyx flex items-center gap-2">
              <Code2 className="w-5 h-5 text-pine-teal" />
              Social Profiles & Handles
            </h2>
            <button
              type="button"
              onClick={() => setIsPlatformModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-golden-sand/20 text-tomato-jam text-xs font-bold hover:bg-golden-sand/30 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add new profile
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* GitHub */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-onyx uppercase tracking-wider">
                <Globe className="w-4 h-4 text-onyx" /> GitHub URL
              </label>
              <input 
                type="url"
                value={socials.github}
                onChange={(e) => setSocials({...socials, github: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FFF1D6] border border-onyx/10 text-sm text-onyx focus:outline-none focus:ring-2 focus:ring-onyx/30"
              />
            </div>

            {/* LinkedIn */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-onyx uppercase tracking-wider">
                <Briefcase className="w-4 h-4 text-[#0A66C2]" /> LinkedIn URL
              </label>
              <input 
                type="url"
                value={socials.linkedin}
                onChange={(e) => setSocials({...socials, linkedin: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FFF1D6] border border-onyx/10 text-sm text-onyx focus:outline-none focus:ring-2 focus:ring-onyx/30"
              />
            </div>

            {(user.platforms || []).map((plat: any) => (
              <div key={plat.platform} className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-onyx uppercase tracking-wider">
                  <span className={`font-extrabold text-sm ${plat.platform === 'Codeforces' ? 'text-tomato-jam' : plat.platform === 'LeetCode' ? 'text-golden-sand' : 'text-pine-teal'}`}>
                    {plat.platform.charAt(0)}
                  </span>{' '}
                  {plat.platform} Handle
                </label>
                <input 
                  type="text"
                  value={platformHandles[plat.platform] || ''}
                  onChange={(e) => setPlatformHandles({...platformHandles, [plat.platform]: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FFF1D6] border border-onyx/10 text-sm text-onyx focus:outline-none focus:ring-2 focus:ring-onyx/30"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Save Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-onyx/10">
          <button 
            type="button" 
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-onyx/70 hover:bg-onyx/5 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-tomato-jam text-white text-sm font-black shadow-md hover:bg-[#E8890C] transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save Profile
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
              Connect CP Platform
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
                  <option value="AtCoder">AtCoder</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-wider">
                  Username / Handle
                </label>
                <input
                  type="text"
                  value={platformHandle}
                  onChange={(e) => setPlatformHandle(e.target.value)}
                  placeholder={`e.g. ${user.username}`}
                  required
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-tomato-jam transition-shadow"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsPlatformModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-tomato-jam hover:bg-[#E8890C] text-white font-bold text-sm shadow-md shadow-tomato-jam/20 transition-colors cursor-pointer"
                >
                  Connect &amp; Verify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl bg-slate-900 text-white text-sm font-extrabold shadow-2xl border border-white/10 will-change-transform">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
