/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef } from 'react';
import { useUser } from '@/components/providers/UserProvider';
import { Camera, Save, Globe, Briefcase, Code2, Sparkles, UserCircle2 } from 'lucide-react';

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
    codeforces: user.platforms?.find(p => p.platform === 'Codeforces')?.handle || 'codeforces_handle',
    leetcode: user.platforms?.find(p => p.platform === 'LeetCode')?.handle || 'leetcode_handle',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ 
      name,
      username,
      bio,
      avatar: dpUrl || user.avatar 
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
          <h2 className="text-lg font-black text-onyx flex items-center gap-2 mb-6">
            <Code2 className="w-5 h-5 text-pine-teal" />
            Social Profiles & Handles
          </h2>
          
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

            {/* Codeforces */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-onyx uppercase tracking-wider">
                <span className="text-tomato-jam font-extrabold text-sm">C</span> Codeforces Handle
              </label>
              <input 
                type="text"
                value={socials.codeforces}
                onChange={(e) => setSocials({...socials, codeforces: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FFF1D6] border border-onyx/10 text-sm text-onyx focus:outline-none focus:ring-2 focus:ring-onyx/30"
              />
            </div>

            {/* LeetCode */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-onyx uppercase tracking-wider">
                <span className="text-golden-sand font-extrabold text-sm">L</span> LeetCode Handle
              </label>
              <input 
                type="text"
                value={socials.leetcode}
                onChange={(e) => setSocials({...socials, leetcode: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FFF1D6] border border-onyx/10 text-sm text-onyx focus:outline-none focus:ring-2 focus:ring-onyx/30"
              />
            </div>
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
    </div>
  );
}
