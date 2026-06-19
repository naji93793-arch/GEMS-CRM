/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User } from '../types';
import { LayoutDashboard, ClipboardList, UserPlus, BarChart3, LogOut, Menu, X, ShieldAlert, Award } from 'lucide-react';
import { useState } from 'react';
import { GemsLogoSVG } from './Login';

interface SidebarProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ user, activeTab, setActiveTab, onLogout }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // فحص حركي لبريد المستخدم وإذا كان مسجلاً كمدير من قبل المشرف
  const storedAdminsRaw = localStorage.getItem('gems_crm_admin_emails');
  const adminEmailsList: string[] = storedAdminsRaw 
    ? JSON.parse(storedAdminsRaw) 
    : ['naji93793@gmail.com', 'admin@gems.com'];
  
  const isAuthorizedAdmin = user.role === 'admin' || adminEmailsList.includes(user.email.toLowerCase());

  const menuItems = [
    { id: 'dashboard', name: 'الرئيسية "Dashboard"', icon: LayoutDashboard },
    { id: 'pipeline', name: 'إدارة العملاء "Pipeline"', icon: ClipboardList },
    { id: 'add-client', name: 'إضافة عميل جديد', icon: UserPlus },
    { id: 'reports', name: 'تقارير الأداء ولوحة Looker', icon: BarChart3 },
    ...(isAuthorizedAdmin ? [{ id: 'admin-panel', name: 'إدارة النظام و الحسابات', icon: ShieldAlert }] : [])
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileOpen(false);
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col justify-between bg-slate-900 text-white font-sans">
      <div>
        {/* قسم الشعار الرسمي والهوية الحقيقية لشركة GEMS */}
        <div className="p-5 flex items-center gap-3 border-b border-slate-800">
          <div className="relative flex-shrink-0">
            {/* الشعار الرسمي المتطابق مع العلامة التجارية */}
            <div className="w-12 h-12 bg-white/5 hover:bg-white/10 p-1 rounded-xl flex items-center justify-center border border-slate-700/40 transition">
              <GemsLogoSVG className="w-10 h-10" />
            </div>
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-extrabold text-xl tracking-tight leading-none">GEMS</span>
            <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-0.5">Customer CRM</span>
          </div>
        </div>

        {/* معلومات المستخدم الحالي وصلاحياته */}
        <div className="px-4 py-2 mt-4">
          <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
            <div className="w-10 h-10 rounded-full bg-slate-500 border-2 border-red-500 flex items-center justify-center text-xs font-bold text-white uppercase">
              {user.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-white truncate">{user.name}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest truncate">{user.role === 'admin' ? 'Administrator' : 'Sales Representative'}</span>
            </div>
          </div>
        </div>

        {/* قائمة التنقل الرئيسية لنظام GEMS */}
        <nav className="flex-1 px-2 mt-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full text-right flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Icon className="w-5 h-5 opacity-80" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* زر تسجيل الخروج وحقوق التطوير المعتمدة */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        <button
          onClick={onLogout}
          className="w-full px-4 py-2 text-xs font-semibold text-slate-400 border border-slate-700 rounded hover:text-white hover:border-white hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out خروج</span>
        </button>
        <div className="text-center text-[10px] text-slate-400 border-t border-slate-800/60 pt-3">
          <span>تم التطوير بواسطة </span>
          <strong className="text-red-500 font-black block text-xs mt-0.5 tracking-wide">mohamed atef naji</strong>
        </div>
      </div>
    </div>
  );

  return (
    <div className="font-sans" dir="rtl">
      {/* شريط الموبايل العلوي */}
      <div className="lg:hidden bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-black text-lg">
            G
          </div>
          <span className="font-extrabold text-sm tracking-wide text-white">GEMS CRM</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* القائمة الجانبية للشاشات الكبيرة */}
      <aside className="hidden lg:block fixed top-0 bottom-0 right-0 w-64 border-l border-slate-800 z-30">
        <SidebarContent />
      </aside>

      {/* القائمة الجانبية المنسدلة للموبايل */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* خلفية معتمة مغلقة للقائمة */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setMobileOpen(false)}></div>
          
          <div className="relative w-64 h-full bg-slate-900 text-white z-50">
            <SidebarContent />
          </div>
        </div>
      )}
    </div>
  );
}
