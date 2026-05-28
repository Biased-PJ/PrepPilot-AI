'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';
import { Bell, Lock, User, Globe, Zap, ShieldAlert } from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [theme, setTheme] = useState('dark');

  const settingsSections = [
    {
      title: 'Profile Settings',
      icon: User,
      items: [
        { label: 'Full Name', type: 'text', value: 'Demo User', editable: true },
        { label: 'Email', type: 'email', value: user?.email || '', editable: false },
        { label: 'Username', type: 'text', value: '@demo_user', editable: true },
      ],
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        {
          label: 'Email Notifications',
          type: 'toggle',
          value: emailNotifications,
          onChange: setEmailNotifications,
          description: 'Receive emails about your progress and recommendations',
        },
        {
          label: 'Push Notifications',
          type: 'toggle',
          value: pushNotifications,
          onChange: setPushNotifications,
          description: 'Get browser notifications for contests and challenges',
        },
      ],
    },
    {
      title: 'Appearance',
      icon: Globe,
      items: [
        {
          label: 'Dark Mode',
          type: 'toggle',
          value: darkMode,
          onChange: setDarkMode,
          description: 'Use dark theme for the application',
        },
      ],
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-2xl"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-bold mb-2">Settings</h1>
        <p className="text-slate-400">Manage your account and preferences</p>
      </motion.div>

      {/* Settings Sections */}
      {settingsSections.map((section, sectionIdx) => {
        const Icon = section.icon;
        return (
          <motion.div
            key={sectionIdx}
            variants={itemVariants}
            className="bg-slate-800/30 border border-slate-700/50 rounded-lg overflow-hidden"
          >
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-b border-slate-700/50 px-6 py-4">
              <div className="flex items-center gap-3">
                <Icon className="w-6 h-6 text-orange-500" />
                <h2 className="text-lg font-semibold">{section.title}</h2>
              </div>
            </div>

            <div className="divide-y divide-slate-700/50">
              {section.items.map((item, itemIdx) => (
                <div key={itemIdx} className="p-6 hover:bg-slate-700/10 transition-all">
                  {item.type === 'text' || item.type === 'email' ? (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        {item.label}
                      </label>
                      <Input
                        type={item.type as 'text' | 'email'}
                        value={item.value as string}
                        disabled={'editable' in item ? !item.editable : false}
                        className="bg-slate-700/50 border-slate-600 disabled:opacity-50"
                      />
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium mb-1">{item.label}</div>
                        {'description' in item && item.description && (
                          <p className="text-sm text-slate-400">{item.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => 'onChange' in item && item.onChange?.(!item.value)}
                        className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full transition-colors ${
                          item.value ? 'bg-orange-500' : 'bg-slate-600'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            item.value ? 'translate-x-7' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}

      {/* Privacy Section */}
      <motion.div
        variants={itemVariants}
        className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6"
      >
        <div className="flex items-start gap-4">
          <Lock className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-2">Privacy & Security</h2>
            <p className="text-slate-400 text-sm mb-4">
              Manage your password, two-factor authentication, and data privacy settings
            </p>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Lock className="w-4 h-4 mr-2" />
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <ShieldAlert className="w-4 h-4 mr-2" />
                Enable Two-Factor Authentication
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Data & Export */}
      <motion.div
        variants={itemVariants}
        className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6"
      >
        <div className="flex items-start gap-4">
          <Zap className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-2">Data & Export</h2>
            <p className="text-slate-400 text-sm mb-4">
              Download your data or delete your account
            </p>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Download My Data
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-400 hover:bg-red-500/10 hover:text-red-300"
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        variants={itemVariants}
        className="bg-red-500/10 border border-red-500/30 rounded-lg p-6"
      >
        <h2 className="text-lg font-semibold text-red-400 mb-4">Sign Out</h2>
        <p className="text-slate-400 text-sm mb-4">Sign out from all devices</p>
        <Button
          onClick={logout}
          className="w-full bg-red-500 hover:bg-red-600 text-white"
        >
          Sign Out
        </Button>
      </motion.div>

      {/* Support */}
      <motion.div
        variants={itemVariants}
        className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6 text-center"
      >
        <p className="text-slate-400 mb-4">Need help? Contact us at support@prepp-pilot.com</p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" size="sm">
            Documentation
          </Button>
          <Button variant="outline" size="sm">
            Report Issue
          </Button>
          <Button variant="outline" size="sm">
            Chat Support
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
