/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User } from '../types';
import { LayoutDashboard, ClipboardList, UserPlus, BarChart3, LogOut, Menu, X, ShieldAlert, Settings, Key, Shield, Check, Mail, AlertTriangle, MessageSquare } from 'lucide-react';
import { GemsLogoSVG } from './Login';

interface SidebarProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onUserUpdate?: (user: User) => void;
}

export default function Sidebar({ user, activeTab, setActiveTab, onLogout, onUserUpdate }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // حالات المودال والتعديل الأمني
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const [editPassword, setEditPassword] = useState('');
  const [profileStep, setProfileStep] = useState(1); // 1: تعديل البيانات، 2: كود التحقق الأمني
  const [profileGeneratedCode, setProfileGeneratedCode] = useState('');
  const [profileUserEnteredCode, setProfileUserEnteredCode] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileEmailInbox, setProfileEmailInbox] = useState<{ to: string; code: string } | null>(null);

  // فحص حركي لبريد المستخدم وإذا كان مسجلاً كمدير من قبل المشرف
  const storedAdminsRaw = localStorage.getItem('gems_crm_admin_emails');
  const adminEmailsList: string[] = storedAdminsRaw 
    ? JSON.parse(storedAdminsRaw) 
    : ['saadabugabl@gmail.com', 'naji93793@gmail.com'];
  
  const isAuthorizedAdmin = user.role === 'admin' || adminEmailsList.includes(user.email.toLowerCase());

  // إخفاء خيار صندوق الإدارة إذا كان حساب ناجي للإدارة مخفياً
  const menuItems = [
    { id: 'dashboard', name: 'الرئيسية "Dashboard"', icon: LayoutDashboard },
    { id: 'pipeline', name: 'إدارة العملاء "Pipeline"', icon: ClipboardList },
    { id: 'add-client', name: 'إضافة عميل جديد', icon: UserPlus },
    { id: 'reports', name: 'تقارير الأداء ولوحة Looker', icon: BarChart3 },
    { id: 'team-chat', name: 'دردشة فريق العمل', icon: MessageSquare },
    ...(isAuthorizedAdmin ? [{ id: 'admin-panel', name: 'إدارة النظام و الحسابات', icon: ShieldAlert }] : [])
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileOpen(false);
  };

  // فتح وإعداد مودال البيانات
  const openProfileModal = () => {
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPassword('');
    setProfileStep(1);
    setProfileUserEnteredCode('');
    setProfileGeneratedCode('');
    setProfileError('');
    setProfileSuccess('');
    setProfileEmailInbox(null);
    setIsProfileModalOpen(true);
  };

  // معالجة إرسال كود التأكيد للبريد (الخطوة الأولى)
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!editName.trim()) {
      setProfileError('يرجى تعيين اسم ثلاثي صحيح.');
      return;
    }
    if (!editEmail.trim() || !editEmail.includes('@')) {
      setProfileError('يرجى كتابة بريد إلكتروني صحيح للعمل.');
      return;
    }

    // توليد كود الأمان ومحاكاة رسالة التحقق البريدي
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setProfileGeneratedCode(code);
    setProfileStep(2);
    setProfileEmailInbox({ to: editEmail.trim().toLowerCase(), code });
    setProfileSuccess('تم إرسال كود التأكيد المكون من 6 أرقام إلى بريدك الإلكتروني بنجاح!');
  };

  // معالجة الكود وتحديث البيانات فعلياً (الخطوة الثانية)
  const handleVerifyAndSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (profileUserEnteredCode !== profileGeneratedCode) {
      setProfileError('كود الأمان المدخل غير صحيح. يرجى مراجعة لوحة البريد الإلكتروني الافتراضية بالأسفل.');
      return;
    }

    // جلب وحفظ البيانات في النظام
    const usersRaw = localStorage.getItem('gems_crm_users_db');
    const passesRaw = localStorage.getItem('gems_crm_passwords_db');
    if (usersRaw) {
      const users: User[] = JSON.parse(usersRaw);
      const updatedUsers = users.map(u => {
        if (u.username === user.username) {
          return { ...u, name: editName.trim(), email: editEmail.trim().toLowerCase() };
        }
        return u;
      });
      localStorage.setItem('gems_crm_users_db', JSON.stringify(updatedUsers));
    }

    if (passesRaw && editPassword.trim()) {
      const passes = JSON.parse(passesRaw);
      passes[user.username] = editPassword.trim();
      localStorage.setItem('gems_crm_passwords_db', JSON.stringify(passes));
    }

    // تحديث حالة الأب
    onUserUpdate?.({
      ...user,
      name: editName.trim(),
      email: editEmail.trim().toLowerCase()
    });

    setProfileSuccess('تم تأكيد الهوية وتحديث البريد الإلكتروني والرقم السري بنظام GEMS بنجاح مذهل!');
    setTimeout(() => {
      setIsProfileModalOpen(false);
    }, 1500);
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

        {/* معلومات المستخدم الحالي وصلاحياته مع زر التعديل الأمني */}
        <div className="px-4 py-2 mt-4">
          <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-500 border-2 border-red-500 flex items-center justify-center text-xs font-bold text-white uppercase flex-shrink-0">
                {user.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0 flex-grow">
                <span className="text-sm font-medium text-white truncate">{user.name}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest truncate">{user.role === 'admin' ? 'Administrator' : 'Sales Representative'}</span>
              </div>
            </div>
            <button
              onClick={openProfileModal}
              className="w-full text-center py-1 bg-slate-800 hover:bg-red-650 hover:bg-red-650 text-slate-300 hover:text-white rounded border border-slate-600 hover:border-red-500 text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <Settings className="w-3 h-3" />
              <span>أمان وتحديث الحساب</span>
            </button>
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

      {/* مودال تعديل بيانات الحساب ببروتوكول الأمان البريدي */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden text-right leading-relaxed text-slate-800">
            <div className="px-6 py-4 border-b border-slate-150 flex items-center justify-between bg-slate-50">
              <button 
                onClick={() => setIsProfileModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-red-600" />
                <h3 className="font-black text-slate-850 text-sm">تعديل بيانات الحساب والأمان</h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {profileError && (
                <div className="bg-red-50 p-3 rounded-lg border-r-4 border-red-500 flex items-start gap-2 text-xs text-red-700">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}
              {profileSuccess && (
                <div className="bg-emerald-50 p-3 rounded-lg border-r-4 border-emerald-500 flex items-start gap-2 text-xs text-emerald-700">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {profileStep === 1 ? (
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div>
                    <label className="block text-slate-600 text-[11px] font-bold mb-1">الاسم الكامل</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full text-right px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 text-[11px] font-bold mb-1">البريد الإلكتروني للعمل (صلاحيات ومزامنة)</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full text-right px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800 font-sans"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 text-[11px] font-bold mb-1">تعديل كلمة المرور (اختياري، اتركه فارغاً للاحتفاظ بالقديمة)</label>
                    <input
                      type="password"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-right px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-red-650 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Mail className="w-4 h-4" />
                    <span>تأكيد الإيميل وإرسال كود الأمان</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyAndSave} className="space-y-4">
                  <p className="text-[11px] text-slate-550 leading-relaxed">
                    تم إرسال كود التحقق الأمني إلى البريد الجديد/الحالي لتأكيد ملكيتك. يرجى إدخاله في الحقل أدناه لإكمال المزامنة.
                  </p>
                  <div>
                    <label className="block text-slate-600 text-center text-xs font-extrabold mb-1">رمز التحقق الأمني (6 خانات)</label>
                    <input
                      type="text"
                      value={profileUserEnteredCode}
                      onChange={(e) => setProfileUserEnteredCode(e.target.value.replace(/\D/g, ''))}
                      maxLength={6}
                      placeholder="أدخل الرمز المكون من 6 أرقام..."
                      className="w-full text-center px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-base font-sans font-bold tracking-widest text-slate-800"
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setProfileStep(1)}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                    >
                      تعديل البيانات
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                    >
                      موافقة وتحديث الحساب
                    </button>
                  </div>

                  {/* لوحة البريد الإلكتروني الواردة لمحاكاة استشعار وتلقي الكود لنجاح الاختبار الفوري وبدون تعقيدات */}
                  {profileEmailInbox && (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-1 my-2">
                      <div className="text-[10px] text-amber-800 font-black flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
                        <span>صندوق البريد الإلكتروني (Security Notification):</span>
                      </div>
                      <div className="p-2.5 bg-white rounded border border-slate-100 text-[10px] text-slate-600 space-y-1">
                        <div><strong>المستلم:</strong> {profileEmailInbox.to}</div>
                        <div><strong>رمز التحقق الأمني الجديد:</strong></div>
                        <div className="text-center py-1.5 font-mono font-black text-sm bg-slate-50 text-slate-800 rounded tracking-widest border">
                          {profileEmailInbox.code}
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
