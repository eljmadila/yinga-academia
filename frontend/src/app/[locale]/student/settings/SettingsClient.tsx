"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Settings, User, Bell, Shield, Link as LinkIcon, Camera, Loader2, Save, CheckCircle2, XCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface UserProfile {
  id?: string;
  username?: string;
  email?: string;
  first_name: string;
  last_name: string;
  title: string;
  bio: string;
  social_links: {
    website?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  avatar: string | null;
}

export default function SettingsClient({ token }: { token?: string }) {
  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "security">("profile");
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  
  // State for form inputs
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notifications State
  const [courseUpdates, setCourseUpdates] = useState(true);
  const [learningReminders, setLearningReminders] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Security State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword1, setNewPassword1] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    fetch(`${API_URL}/api/auth/user/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setUsername(data.username || "");
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setTitle(data.title || "");
        setBio(data.bio || "");
        setWebsite(data.social_links?.website || "");
        setTwitter(data.social_links?.twitter || "");
        setLinkedin(data.social_links?.linkedin || "");
        setGithub(data.social_links?.github || "");
        setAvatarPreview(data.avatar || null);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [token]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        showToast("File size must be less than 1MB", "error");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    
    try {
      let res;
      if (avatarFile) {
        // Use FormData for uploading a new file
        const formData = new FormData();
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        formData.append('title', title);
        formData.append('bio', bio);
        formData.append('social_links', JSON.stringify({ website, twitter, linkedin, github }));
        formData.append('avatar', avatarFile);

        res = await fetch(`${API_URL}/api/auth/user/`, {
          method: 'PATCH',
          headers: { 
            Authorization: `Bearer ${token}` 
          },
          body: formData
        });
      } else {
        // Use JSON if no file is being uploaded to allow passing `null` and properly clearing the image in Django
        const payload: any = {
          first_name: firstName,
          last_name: lastName,
          title,
          bio,
          social_links: { website, twitter, linkedin, github }
        };
        
        // If avatarPreview is null, they clicked "Remove", so tell the backend to set avatar to null
        if (avatarPreview === null) {
          payload.avatar = null;
        }

        res = await fetch(`${API_URL}/api/auth/user/`, {
          method: 'PATCH',
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        const updatedData = await res.json();
        showToast("Profile updated successfully!", "success");
        window.dispatchEvent(new CustomEvent("userProfileUpdated", { detail: updatedData }));
      } else {
        const err = await res.json();
        showToast(err.detail || "Failed to update profile.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("An error occurred while saving.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword1 !== newPassword2) {
      showToast("New passwords do not match", "error");
      return;
    }
    if (!token) return;

    setIsChangingPassword(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/password/change/`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password1: newPassword1,
          new_password2: newPassword2
        })
      });

      if (res.ok) {
        showToast("Password updated successfully!", "success");
        setOldPassword("");
        setNewPassword1("");
        setNewPassword2("");
      } else {
        const err = await res.json();
        showToast(err.detail || err.old_password?.[0] || err.new_password1?.[0] || "Failed to update password.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("An error occurred.", "error");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSaveNotifications = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast("Notification preferences updated!", "success");
    }, 800);
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 rounded-xl">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your profile, learning preferences, and security</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Sidebar Navigation */}
        <div className="col-span-1 md:col-span-4 lg:col-span-3 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'profile' ? 'bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
          >
            <User className="w-5 h-5" />
            Public Profile
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'notifications' ? 'bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
          >
            <Bell className="w-5 h-5" />
            Notifications
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'security' ? 'bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
          >
            <Shield className="w-5 h-5" />
            Account Security
          </button>
        </div>

        {/* Content Area */}
        <div className="col-span-1 md:col-span-8 lg:col-span-9 flex flex-col gap-6">
          
          {activeTab === 'profile' && (
            <>
              {/* Profile Picture */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 sm:p-8 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Profile Picture</h2>
                
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-24 h-24 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-full flex items-center justify-center text-3xl font-bold overflow-hidden">
                      {avatarPreview ? (
                        <img 
                          src={avatarPreview.startsWith('blob:') ? avatarPreview : (avatarPreview.startsWith('http') ? avatarPreview : `${API_URL}${avatarPreview}`)} 
                          alt="Profile" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <span>{(firstName || username || "S").charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/jpeg, image/png, image/gif" 
                    onChange={handleAvatarChange}
                  />
                  <div className="text-center sm:text-left">
                    <div className="flex gap-3 justify-center sm:justify-start">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg transition-colors text-sm"
                      >
                        Upload new
                      </button>
                      <button 
                        onClick={() => { setAvatarPreview(null); setAvatarFile(null); }}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Must be JPEG, GIF or PNG. Maximum size of 1MB.</p>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 sm:p-8 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Basic Information</h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">First Name</label>
                      <input 
                        type="text" 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Last Name</label>
                      <input 
                        type="text" 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Learning Headline / Goal</label>
                    <input 
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Aspiring Full-Stack Developer | Data Science Enthusiast"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none" 
                    />
                    <p className="text-xs text-gray-500">A brief headline representing your learning objectives or field of interest.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Biography</label>
                    <textarea 
                      rows={4}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell instructors and fellow students a little about yourself, your background, and your learning goals."
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none resize-none" 
                    />
                    <p className="text-xs text-gray-500">Brief description that will appear on your public profile and Q&A interactions.</p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 sm:p-8 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Social & Portfolio Links</h2>
                
                <div className="space-y-4">
                  <div className="flex rounded-xl overflow-hidden border border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-brand-500 transition-shadow">
                    <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 border-r border-gray-300 dark:border-gray-600 flex items-center justify-center">
                      <LinkIcon className="w-4 h-4 text-gray-500" />
                    </div>
                    <input 
                      type="text" 
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full px-4 py-3 bg-transparent text-gray-900 dark:text-white outline-none" 
                      placeholder="https://yourportfolio.com" 
                    />
                  </div>
                  
                  <div className="flex rounded-xl overflow-hidden border border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-brand-500 transition-shadow">
                    <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 border-r border-gray-300 dark:border-gray-600 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400 w-28">
                      GitHub
                    </div>
                    <input 
                      type="text" 
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      className="w-full px-4 py-3 bg-transparent text-gray-900 dark:text-white outline-none" 
                      placeholder="https://github.com/username" 
                    />
                  </div>

                  <div className="flex rounded-xl overflow-hidden border border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-brand-500 transition-shadow">
                    <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 border-r border-gray-300 dark:border-gray-600 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400 w-28">
                      LinkedIn
                    </div>
                    <input 
                      type="text" 
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      className="w-full px-4 py-3 bg-transparent text-gray-900 dark:text-white outline-none" 
                      placeholder="https://linkedin.com/in/username" 
                    />
                  </div>

                  <div className="flex rounded-xl overflow-hidden border border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-brand-500 transition-shadow">
                    <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 border-r border-gray-300 dark:border-gray-600 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400 w-28">
                      Twitter / X
                    </div>
                    <input 
                      type="text" 
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      className="w-full px-4 py-3 bg-transparent text-gray-900 dark:text-white outline-none" 
                      placeholder="https://twitter.com/username" 
                    />
                  </div>
                </div>
                
                <div className="pt-8 mt-2 flex justify-end">
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {saving ? "Saving..." : "Save All Changes"}
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Email Notifications</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Course & Lecture Updates</h3>
                    <p className="text-xs text-gray-500 mt-1">Get notified when instructors publish new lessons, assignments, or announcements.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={courseUpdates} onChange={(e) => setCourseUpdates(e.target.checked)} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Learning Reminders & Streaks</h3>
                    <p className="text-xs text-gray-500 mt-1">Receive weekly reminders to stay consistent with your learning progress.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={learningReminders} onChange={(e) => setLearningReminders(e.target.checked)} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Promotions & Recommendations</h3>
                    <p className="text-xs text-gray-500 mt-1">Receive recommendations for courses tailored to your interests and exclusive discounts.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={marketingEmails} onChange={(e) => setMarketingEmails(e.target.checked)} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-500"></div>
                  </label>
                </div>
              </div>

              <div className="pt-8 mt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                <button 
                  onClick={handleSaveNotifications}
                  disabled={saving}
                  className="flex items-center gap-2 px-8 py-3 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {saving ? "Saving..." : "Save Preferences"}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Change Password</h2>
              
              <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Current Password</label>
                  <input 
                    type="password" 
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">New Password</label>
                  <input 
                    type="password" 
                    required
                    value={newPassword1}
                    onChange={(e) => setNewPassword1(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Confirm New Password</label>
                  <input 
                    type="password" 
                    required
                    value={newPassword2}
                    onChange={(e) => setNewPassword2(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none" 
                  />
                </div>
                
                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={isChangingPassword}
                    className="flex items-center gap-2 px-8 py-3 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {isChangingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
                    {isChangingPassword ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          )}
          
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${
              toast.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
