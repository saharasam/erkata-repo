import React, { useState, useRef } from 'react';
import { User, Bell, Shield, Mail, Lock, Phone, Globe, Camera, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useModal } from '../contexts/ModalContext';
import { motion } from 'framer-motion';
import api, { getAssetUrl, setAccessToken } from '../utils/api';

interface SettingsViewProps {
  role: 'agent' | 'operator' | 'admin' | 'customer' | 'super_admin' | 'financial_operator';
}

const SettingsView: React.FC<SettingsViewProps> = ({ role }) => {
  const { user, updateUser } = useAuth();
  const { showConfirm, showAlert } = useModal();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile');

  // ── Profile form state ──────────────────────────────────
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // ── Avatar state ────────────────────────────────────────
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Password form state ─────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // ── Notifications mock state ────────────────────────────
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // ── Avatar helpers ──────────────────────────────────────
  const avatarSrc = user?.avatarUrl ? getAssetUrl(user.avatarUrl) : null;

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side type guard
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      showAlert({ title: 'Invalid File', message: 'Only JPEG and PNG images are supported.', type: 'error' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showAlert({ title: 'File Too Large', message: 'Avatar must be smaller than 5 MB.', type: 'error' });
      return;
    }

    setIsUploadingAvatar(true);
    try {
      // 1. Upload the file
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await api.post<{ url: string }>('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // 2. Persist the URL on the profile
      const avatarRes = await api.patch<{ avatarUrl: string }>('/users/me/avatar', {
        avatarUrl: uploadRes.data.url,
      });

      updateUser({ avatarUrl: avatarRes.data.avatarUrl });
      showAlert({ title: 'Avatar Updated', message: 'Your profile picture has been updated.', type: 'success' });
    } catch {
      showAlert({ title: 'Upload Failed', message: 'Could not upload avatar. Please try again.', type: 'error' });
    } finally {
      setIsUploadingAvatar(false);
      // Reset input so the same file can be re-selected after an error
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteAvatar = async () => {
    const confirmed = await showConfirm({
      title: 'Remove Avatar',
      message: 'Are you sure you want to remove your profile picture? This cannot be undone.',
      confirmText: 'Remove',
      type: 'warning',
    });
    if (!confirmed) return;

    setIsUploadingAvatar(true);
    try {
      await api.patch('/users/me/avatar', { avatarUrl: null });
      updateUser({ avatarUrl: null });
      showAlert({ title: 'Avatar Removed', message: 'Your profile picture has been cleared.', type: 'success' });
    } catch {
      showAlert({ title: 'Error', message: 'Could not remove avatar. Please try again.', type: 'error' });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // ── Profile save ────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      showAlert({ title: 'Validation Error', message: 'Full name cannot be empty.', type: 'error' });
      return;
    }

    const confirmed = await showConfirm({
      title: 'Save Changes',
      message: 'Are you sure you want to update your profile settings?',
      confirmText: 'Save Changes',
      type: 'info',
    });
    if (!confirmed) return;

    setIsSavingProfile(true);
    try {
      const payload: Record<string, string> = {};
      if (fullName.trim() !== user?.fullName) payload.fullName = fullName.trim();
      if (phone.trim() !== user?.phone) payload.phone = phone.trim();

      if (Object.keys(payload).length === 0) {
        showAlert({ title: 'No Changes', message: 'No changes were detected.', type: 'info' });
        return;
      }

      const res = await api.patch<{ fullName: string; phone: string }>('/users/me', payload);
      updateUser({ fullName: res.data.fullName, phone: res.data.phone });
      showAlert({ title: 'Profile Updated', message: 'Your profile has been successfully saved.', type: 'success' });
    } catch {
      // Global error interceptor handles display
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ── Password change ─────────────────────────────────────
  const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

  const handleChangePassword = async () => {
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }
    if (!complexityRegex.test(newPassword)) {
      setPasswordError(
        'New password must be 8+ characters and include uppercase, number, and special character.',
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    const confirmed = await showConfirm({
      title: 'Update Password',
      message: 'Are you sure you want to change your password?',
      confirmText: 'Update Now',
      type: 'warning',
    });
    if (!confirmed) return;

    setIsChangingPassword(true);
    try {
      const res = await api.patch<{ accessToken: string }>('/users/me/password', {
        currentPassword,
        newPassword,
      });
      // Immediately rotate the in-memory access token so the stale JWT is discarded
      if (res.data.accessToken) {
        setAccessToken(res.data.accessToken);
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showAlert({
        title: 'Password Changed',
        message: 'Your password has been updated successfully.',
        type: 'success',
      });
    } catch {
      // Global error interceptor handles display
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Settings</h1>
        <p className="text-slate-500 font-medium">Manage your account preferences and security configuration.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-2 shrink-0">
          {[
            { id: 'profile', label: 'Profile Settings', icon: User },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'security', label: 'Security', icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-bold ${
                activeTab === tab.id
                  ? 'bg-white text-erkata-primary shadow-sm ring-1 ring-slate-100'
                  : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-erkata-primary' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8"
          >
            {/* ── Profile Tab ── */}
            {activeTab === 'profile' && (
              <div className="space-y-8">
                {/* Avatar Section */}
                <div className="flex items-center gap-6 pb-8 border-b border-slate-100">
                  <div className="relative w-24 h-24 shrink-0">
                    {isUploadingAvatar ? (
                      <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-erkata-primary/30 border-t-erkata-primary rounded-full animate-spin" />
                      </div>
                    ) : avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt="Profile avatar"
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-400 border-4 border-white shadow-sm">
                        {user?.fullName?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{user?.fullName}</h3>
                    <p className="text-sm text-slate-500 mb-3">{user?.email}</p>
                    <div className="flex gap-2 flex-wrap">
                      {/* Hidden file input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png"
                        className="hidden"
                        onChange={handleAvatarSelect}
                        disabled={isUploadingAvatar}
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                      >
                        <Camera className="w-3 h-3" />
                        Change Avatar
                      </button>
                      {user?.avatarUrl && (
                        <button
                          onClick={handleDeleteAvatar}
                          disabled={isUploadingAvatar}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-erkata-primary/20 focus:border-erkata-primary transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={user?.email || ''}
                        readOnly
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-400 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">Email cannot be changed here.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+251 911 234 567"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-erkata-primary/20 focus:border-erkata-primary transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Language</label>
                    <div className="relative">
                      <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-erkata-primary/20 focus:border-erkata-primary transition-all appearance-none">
                        <option>English</option>
                        <option>Amharic</option>
                        <option>Oromiffa</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="flex items-center gap-2 bg-erkata-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-erkata-primary/30 hover:bg-erkata-secondary transition-colors disabled:opacity-60"
                  >
                    {isSavingProfile && (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    {isSavingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {/* ── Notifications Tab ── */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">Alert Preferences</h3>
                  <p className="text-sm text-slate-500">Choose how you want to be notified about important updates.</p>
                </div>
                <div className="space-y-4">
                  {[
                    { key: 'email', title: 'Email Notifications', desc: 'Receive daily summaries and critical alerts via email.' },
                    { key: 'push', title: 'Push Notifications', desc: 'Get real-time updates on your browser or device.' },
                    { key: 'sms', title: 'SMS Alerts', desc: 'Receive urgent messages via text message.' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <h4 className="font-bold text-slate-700 text-sm">{item.title}</h4>
                        <p className="text-xs text-slate-500">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => toggleNotification(item.key as any)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${notifications[item.key as keyof typeof notifications] ? 'bg-erkata-primary' : 'bg-slate-300'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${notifications[item.key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => showAlert({ title: 'Notifications Updated', message: 'Your notification preferences have been saved.', type: 'success' })}
                    className="bg-erkata-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-erkata-primary/30 hover:bg-erkata-secondary transition-colors"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* ── Security Tab ── */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">Security & Login</h3>
                  <p className="text-sm text-slate-500">Change your password. Your current password is required to confirm any change.</p>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 text-amber-800">
                  <Shield className="w-5 h-5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">Two-Factor Authentication</h4>
                    <p className="text-xs opacity-80 mt-1">We recommend enabling 2FA for additional account security.</p>
                  </div>
                  <button
                    onClick={() => showAlert({ title: '2FA Setup', message: 'This feature will be available shortly.', type: 'info' })}
                    className="ml-auto text-xs font-bold underline"
                  >
                    Enable
                  </button>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Current Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => { setCurrentPassword(e.target.value); setPasswordError(''); }}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-erkata-primary/20 focus:border-erkata-primary transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => { setNewPassword(e.target.value); setPasswordError(''); }}
                        placeholder="New password"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-erkata-primary/20 focus:border-erkata-primary transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(''); }}
                        placeholder="Confirm new password"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-erkata-primary/20 focus:border-erkata-primary transition-all"
                      />
                    </div>
                  </div>
                  {passwordError && (
                    <p className="text-xs font-semibold text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                      {passwordError}
                    </p>
                  )}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleChangePassword}
                    disabled={isChangingPassword}
                    className="flex items-center gap-2 bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-slate-800/20 hover:bg-slate-700 transition-colors disabled:opacity-60"
                  >
                    {isChangingPassword && (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    {isChangingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
