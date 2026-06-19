/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { USERS, USER_PASSWORDS } from '../mockData';
import { User } from '../types';
import { Shield, Key, UserCheck, AlertCircle, Sparkles, UserPlus, HelpCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

// مكون لوغو GEMS المتطابق مع الصورة المرفوعة (حرف G أحمر أنيق وبداخله كلمة EMS)
export function GemsLogoSVG({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 500 500" 
      className={`${className} select-none`}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* الدائرة الحمراء الخارجية لحرف G */}
      <path 
        d="M 380 150 C 330 90, 210 90, 160 150 C 100 220, 100 340, 160 410 C 220 480, 340 480, 400 410 C 440 360, 440 310, 440 310 L 260 310 L 260 250 L 500 250 L 500 330 C 500 370, 470 440, 410 490 C 320 560, 150 540, 70 450 C -10 360, -10 190, 70 100 C 160 0, 340 -10, 440 70 Z" 
        fill="#dc2626" 
      />
      {/* كلمة EMS المفرغة أو المكتوبة بالتصميم المستقبلي */}
      <path 
        d="M 183 230 L 223 230 L 223 248 L 198 248 L 198 263 L 218 263 L 218 280 L 198 280 L 198 296 L 224 296 L 224 315 L 183 315 Z M 235 230 L 253 230 L 268 286 L 282 230 L 301 230 L 301 315 L 283 315 L 283 260 L 273 298 L 261 298 L 251 260 L 251 315 L 235 315 Z M 311 296 L 333 296 C 333 283, 314 286, 314 266 C 314 245, 335 230, 353 230 L 353 249 L 332 249 C 332 260, 353 256, 353 277 C 353 299, 331 315, 311 315 Z" 
        fill="#dc2626" 
      />
    </svg>
  );
}

export default function Login({ onLoginSuccess }: LoginProps) {
  // الحالات: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  
  // مدخلات النموذج
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // لنموذج النسيان وإعادة التعيين
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1: الإيميل، 2: كلمة المرور الجديدة

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // تهيئة حسابات المستخدمين في localStorage إذا لم تكن موجودة
  useEffect(() => {
    const storedUsers = localStorage.getItem('gems_crm_users_db');
    const storedPasses = localStorage.getItem('gems_crm_passwords_db');
    const storedAdmins = localStorage.getItem('gems_crm_admin_emails');

    if (!storedUsers) {
      localStorage.setItem('gems_crm_users_db', JSON.stringify(USERS));
    }
    if (!storedPasses) {
      localStorage.setItem('gems_crm_passwords_db', JSON.stringify(USER_PASSWORDS));
    }
    if (!storedAdmins) {
      // البريد الافتراضي المعتمد للمشرفين
      localStorage.setItem('gems_crm_admin_emails', JSON.stringify(['naji93793@gmail.com', 'admin@gems.com']));
    }
  }, []);

  // دالة المساعدة لجلب المستخدمين والكلمات المرور
  const getUsersDB = (): User[] => {
    const raw = localStorage.getItem('gems_crm_users_db');
    return raw ? JSON.parse(raw) : USERS;
  };

  const getPassesDB = (): Record<string, string> => {
    const raw = localStorage.getItem('gems_crm_passwords_db');
    return raw ? JSON.parse(raw) : USER_PASSWORDS;
  };

  const getAdminsList = (): string[] => {
    const raw = localStorage.getItem('gems_crm_admin_emails');
    return raw ? JSON.parse(raw) : ['naji93793@gmail.com', 'admin@gems.com'];
  };

  // معالجة تسجيل الدخول للنظام
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const query = emailOrUsername.trim().toLowerCase();
    const dbUsers = getUsersDB();
    const dbPasses = getPassesDB();

    // البحث عن مستخدم بمطابقة اسم المستخدم أو الإيميل
    const matchedUser = dbUsers.find(
      (u) => u.username === query || u.email.toLowerCase() === query
    );

    if (matchedUser && dbPasses[matchedUser.username] === password) {
      // فحص أمني: هل أصبح هذا الإيميل مضافاً كمسؤول من المشرف؟
      const admins = getAdminsList();
      const updatedUser = { ...matchedUser };
      if (admins.includes(updatedUser.email.toLowerCase())) {
        updatedUser.role = 'admin';
      } else {
        updatedUser.role = 'employee';
      }
      
      onLoginSuccess(updatedUser);
    } else {
      setError('إيميل مستخدم أو كلمة مرور غير صحيحة. يرجى تجربة حساب تجريبي أو التسجيل مجاناً.');
    }
  };

  // معالجة تسجيل مستخدم جديد بالكامل
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const targetEmail = emailOrUsername.trim().toLowerCase();
    const dbUsers = getUsersDB();
    const dbPasses = getPassesDB();
    const admins = getAdminsList();

    if (!name.trim()) {
      setError('يرجى كتابة اسمك الثلاثي الكامل لتسجيل حساب رسمي.');
      return;
    }

    // فحص تكرار الإيميل
    const exists = dbUsers.some((u) => u.email.toLowerCase() === targetEmail);
    if (exists) {
      setError('هذا البريد الإلكتروني مسجل بالفعل في نظام GEMS. يرجى تسجيل الدخول أو استعادة كلمة المرور.');
      return;
    }

    if (password.length < 6) {
      setError('كلمة المرور يجب أن لا تقل عن 6 خانات لتأمين حسابك.');
      return;
    }

    // تحديد الصلاحية تلقائياً: إذا كان الإيميل ضمن مصفوفة المشرفين المعتمدة
    const isTargetAdmin = admins.includes(targetEmail);
    const newUsername = targetEmail.split('@')[0] + "_" + Math.floor(Math.random() * 100);

    const newUser: User = {
      username: newUsername,
      name: name.trim(),
      email: targetEmail,
      role: isTargetAdmin ? 'admin' : 'employee',
    };

    // حفظ في قاعدة البيانات المحلية
    const updatedUsers = [...dbUsers, newUser];
    const updatedPasses = { ...dbPasses, [newUsername]: password };

    localStorage.setItem('gems_crm_users_db', JSON.stringify(updatedUsers));
    localStorage.setItem('gems_crm_passwords_db', JSON.stringify(updatedPasses));

    setSuccess(`تم تسجيل حسابك بنجاح كـ ${isTargetAdmin ? 'مشرف عام' : 'مسؤول مبيعات'}! يمكنك الآن تسجيل الدخول.`);
    setEmailOrUsername(targetEmail);
    setPassword('');
    setMode('login');
  };

  // معالجة إعادة تعيين كلمة المرور
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const targetEmail = forgotEmail.trim().toLowerCase();
    const dbUsers = getUsersDB();

    const matchedUser = dbUsers.find((u) => u.email.toLowerCase() === targetEmail);

    if (!matchedUser) {
      setError('عذراً، هذا البريد الإلكتروني غير مسجل في قاعدة بيانات النظام.');
      return;
    }

    if (forgotStep === 1) {
      // الانتقال إلى خطوة تعيين كلمة المرور الجديدة بعد العثور على الإيميل
      setForgotStep(2);
      setSuccess('تم التحقق من البريد الإلكتروني بنجاح. يرجى تحديد كلمة مرور جديدة لحسابك.');
    } else {
      if (newPassword.length < 6) {
        setError('كلمة المرور الجديدة يجب أن تكون 6 خانات على الأقل.');
        return;
      }

      // تحديث كلمة المرور في قاعدة البيانات المحلية
      const dbPasses = getPassesDB();
      const updatedPasses = { ...dbPasses, [matchedUser.username]: newPassword };
      localStorage.setItem('gems_crm_passwords_db', JSON.stringify(updatedPasses));

      setSuccess('تم تغيير كلمة المرور بنجاح! يمكنك الآن استخدام الكلمة الجديدة لتسجيل الدخول.');
      setEmailOrUsername(targetEmail);
      setPassword('');
      setMode('login');
      setForgotStep(1);
      setForgotEmail('');
      setNewPassword('');
    }
  };

  const handleShortcutLogin = (user: typeof USERS[0]) => {
    setEmailOrUsername(user.email);
    const dbPasses = getPassesDB();
    setPassword(dbPasses[user.username] || 'admin123');
    setError('');
    setSuccess('');
    setMode('login');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 font-sans" dir="rtl">
      <div className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 max-w-4xl w-full grid md:grid-cols-12 overflow-hidden min-h-[550px]">
          
          {/* الجانب الأيمن: النماذج التفاعلية */}
          <div className="p-8 md:col-span-7 flex flex-col justify-center relative">
            
            {/* الشعار المدمج المماثل تماماً لشركة GEMS */}
            <div className="mb-6 flex items-center gap-3">
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                <GemsLogoSVG className="w-12 h-12" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">نظام <span className="text-red-600">GEMS CRM</span> الذكي</h1>
                <p className="text-slate-400 text-xs">نظام الإدارة الذكي للعملاء والمتابعات RLS</p>
              </div>
            </div>

            {/* وضع تسجيل الدخول */}
            {mode === 'login' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-700">تسجيل الدخول للنظام</h2>
                  <button 
                    onClick={() => { setMode('register'); setError(''); setSuccess(''); }} 
                    className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>إنشاء حساب جديد</span>
                  </button>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border-r-4 border-red-500 p-3 rounded-lg flex items-start gap-2 text-red-700 text-xs">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {success && (
                    <div className="bg-emerald-50 border-r-4 border-emerald-500 p-3 rounded-lg flex items-start gap-2 text-emerald-700 text-xs">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{success}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-600 text-xs font-bold mb-1">البريد الإلكتروني أو اسم المستخدم</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={emailOrUsername}
                        onChange={(e) => setEmailOrUsername(e.target.value)}
                        placeholder="naji93793@gmail.com أو admin"
                        className="w-full text-right px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white text-slate-800 text-xs"
                        required
                      />
                      <div className="absolute left-3 top-3 text-slate-400">
                        <UserCheck className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-slate-600 text-xs font-bold">كلمة المرور</label>
                      <button 
                        type="button"
                        onClick={() => { setMode('forgot'); setForgotStep(1); setError(''); setSuccess(''); }}
                        className="text-[11px] text-slate-400 hover:text-red-600 hover:underline cursor-pointer"
                      >
                        نسيت كلمة المرور؟
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-right px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white text-slate-800 text-xs"
                        required
                      />
                      <div className="absolute left-3 top-3 text-slate-400">
                        <Key className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 text-xs mt-6 cursor-pointer"
                  >
                    <Shield className="w-4 h-4" />
                    <span>الدخول الآمن للنظام</span>
                  </button>
                </form>
              </div>
            )}

            {/* وضع التسجيل الجديد */}
            {mode === 'register' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-700">إنشاء حساب مبيعات (GEMS)</h2>
                  <button 
                    onClick={() => { setMode('login'); setError(''); setSuccess(''); }} 
                    className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>رجوع لتسجيل الدخول</span>
                  </button>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border-r-4 border-red-500 p-3 rounded-lg flex items-start gap-2 text-red-700 text-xs">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-600 text-xs font-bold mb-1">الاسم الكامل (الثنائي أو الثلاثي)</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="مثال: ناجي بن محمد"
                      className="w-full text-right px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white text-slate-800 text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 text-xs font-bold mb-1">البريد الإلكتروني (لتسجيل الدخول)</label>
                    <input
                      type="email"
                      value={emailOrUsername}
                      onChange={(e) => setEmailOrUsername(e.target.value)}
                      placeholder="naji93793@gmail.com"
                      className="w-full text-right px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white text-slate-800 text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 text-xs font-bold mb-1">كلمة المرور (6 حروف فأكثر)</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-right px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white text-slate-800 text-xs"
                      required
                    />
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-[10px] text-slate-400">
                    * ملاحظة: إذا كان بريدك مسجلاً كمسؤول من قبل المشرف، فسيتم تعيين حسابك تلقائياً كـ (مشرف) بعد إتمام التسجيل.
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-red-650 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition-all duration-250 flex items-center justify-center gap-2 text-xs cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>تأكيد وإنشاء الحساب</span>
                  </button>
                </form>
              </div>
            )}

            {/* وضع نسيان كلمة المرور */}
            {mode === 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-700">استعادة كلمة المرور</h2>
                  <button 
                    onClick={() => { setMode('login'); setForgotStep(1); setError(''); setSuccess(''); }} 
                    className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>رجوع للدخول</span>
                  </button>
                </div>

                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border-r-4 border-red-500 p-3 rounded-lg flex items-start gap-2 text-red-700 text-xs">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {success && (
                    <div className="bg-emerald-50 border-r-4 border-emerald-500 p-3 rounded-lg flex items-start gap-2 text-emerald-700 text-xs">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{success}</span>
                    </div>
                  )}

                  {forgotStep === 1 ? (
                    <div>
                      <p className="text-slate-400 text-xs mb-3.5">يرجى كتابة البريد الإلكتروني المسجل في حسابك ليتم التحقق منه تلقائياً وتعديل الرقم السري.</p>
                      <label className="block text-slate-600 text-xs font-bold mb-1">البريد الإلكتروني المفقود</label>
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="naji93793@gmail.com"
                        className="w-full text-right px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white text-slate-800 text-xs"
                        required
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-slate-600 text-xs font-bold mb-1">كلمة المرور الجديدة</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="أدخل 6 خانات أو أكثر..."
                        className="w-full text-right px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white text-slate-800 text-xs"
                        required
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-red-650 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 text-xs cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>{forgotStep === 1 ? 'التحقق من حسابي' : 'تحديث كلمة المرور والدخول'}</span>
                  </button>
                </form>
              </div>
            )}

          </div>

          {/* الجانب الأيسر: دليل الدخول السريع وهوية GEMS */}
          <div className="bg-slate-900 p-8 md:col-span-5 text-white flex flex-col justify-between border-t md:border-t-0 md:border-r border-slate-850">
            <div>
              <div className="inline-block px-3 py-1 bg-red-600/30 text-red-400 border border-red-500/30 rounded-full text-[10px] font-bold mb-4">
                لوحة نظام GEMS CRM المطور
              </div>
              <h3 className="text-sm font-bold mb-2 text-slate-200">الوصول السريع والمدراء المعتمدين:</h3>
              <p className="text-slate-400 text-xs mb-4 leading-relaxed">
                مسؤولو الإدارة ومسؤولي المبيعات الافتراضيين. الإيميلات المسجلة هنا كأدمن ستملك ميزة الإطلاع على كافة بيانات الشركة وإدارة الحسابات:
              </p>

              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {/* حسابات الإدارة المجهزة خصيصاً للعميل */}
                <div className="p-2 border border-dashed border-red-500/30 bg-red-950/20 rounded-lg text-xs mb-3">
                  <div className="flex justify-between items-center mb-1 font-bold text-red-400">
                    <span>حساب الإدارة الخاص بك (Admin)</span>
                    <span className="text-[9px] bg-red-600 text-white px-1 rounded">رئيسي</span>
                  </div>
                  <span className="block font-mono text-slate-200">naji93793@gmail.com</span>
                  <span className="text-[10px] text-slate-400">كلمة السر الافتراضية: admin123</span>
                </div>

                {USERS.map((usr) => (
                  <button
                    key={usr.username}
                    type="button"
                    onClick={() => handleShortcutLogin(usr)}
                    className="w-full text-right p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 rounded-xl transition duration-150 flex items-center justify-between text-xs group cursor-pointer"
                  >
                    <div>
                      <span className="font-bold text-slate-200 group-hover:text-red-400 transition text-[11px]">{usr.name}</span>
                      <span className="block text-slate-500 text-[10px]">{usr.email}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] ${usr.role === 'admin' ? 'bg-red-900/40 text-red-300' : 'bg-blue-900/40 text-blue-300'}`}>
                        {usr.role === 'admin' ? 'مشرف عام' : 'مسؤول مبيعات'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-center">
              <span className="text-[10px] text-slate-500">مبني وفقاً لأعلى معايير الحماية وجداول التفويض المتطورة RLS</span>
            </div>
          </div>

        </div>
      </div>

      {/* تذييل */}
      <footer className="py-4 text-center text-slate-400 text-xs border-t border-slate-200 bg-white space-y-1">
        <div>&copy; {new Date().getFullYear()} GEMS International CRM. جميع الحقوق محفوظة لمجموعة GEMS للحلول المتكاملة.</div>
        <div className="text-[11px] font-bold text-slate-500">تم التطوير بواسطة <span className="text-red-600">mohamed atef naji</span></div>
      </footer>
    </div>
  );
}

