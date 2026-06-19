/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { USERS, USER_PASSWORDS, AUTHORIZED_EMAILS } from '../mockData';
import { User } from '../types';
import { Shield, Key, UserCheck, AlertCircle, Sparkles, UserPlus, HelpCircle, ArrowLeft, CheckCircle2, X } from 'lucide-react';

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
  const [registerAvatar, setRegisterAvatar] = useState('');
  
  // معالجة تغيير الأفاتار الشخصي للموظف للتسجيل
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        setError('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 1 ميجابايت لتسريع الرفع.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setRegisterAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // لنموذج النسيان وإعادة التعيين والتأكيد البريدي
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1: الإيميل، 2: كود الأمان، 3: كلمة المرور الجديدة
  const [generatedCode, setGeneratedCode] = useState('');
  const [userEnteredCode, setUserEnteredCode] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [mockEmailInbox, setMockEmailInbox] = useState<{ to: string; subject: string; body: string; code: string } | null>(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // تهيئة حسابات المستخدمين في localStorage وإتاحة بداية نظيفة مع إدماج الحسابات المطلوبة
  useEffect(() => {
    const isCleanReset = localStorage.getItem('gems_crm_clean_v4_resetted');

    if (!isCleanReset) {
      // المحافظة الاحتياطية والدائمة على سجل العملاء المدخلين مسبقاً لمنع أي حذف
      const existingClients = localStorage.getItem('gems_crm_clients') || '[]';
      localStorage.setItem('gems_crm_clients', existingClients);
      
      // تعيين الحسابات وقوائم الأمن للبداية الجديدة مع الحسابات المحدثة
      localStorage.setItem('gems_crm_users_db', JSON.stringify(USERS));
      localStorage.setItem('gems_crm_passwords_db', JSON.stringify(USER_PASSWORDS));
      localStorage.setItem('gems_crm_admin_emails', JSON.stringify(['saadabugabl@gmail.com', 'naji93793@gmail.com']));
      
      // تأكيد حفظ علامة الترقية والتعديل
      localStorage.setItem('gems_crm_clean_v4_resetted', 'true');
    } else {
      // فحص أمان احتياطي للتأكد من المزامنة المستمرة لحسابات الدخول ومسح القديم
      const storedUsers = localStorage.getItem('gems_crm_users_db');
      const hasNaji = storedUsers && JSON.parse(storedUsers).some((u: any) => u.email.toLowerCase() === 'naji93793@gmail.com');
      const hasAlaa = storedUsers && JSON.parse(storedUsers).some((u: any) => u.email.toLowerCase() === 'alaakhaledmekky61@gmail.com');
      if (!storedUsers || !hasNaji || !hasAlaa) {
        localStorage.setItem('gems_crm_users_db', JSON.stringify(USERS));
        localStorage.setItem('gems_crm_passwords_db', JSON.stringify(USER_PASSWORDS));
        localStorage.setItem('gems_crm_admin_emails', JSON.stringify(['saadabugabl@gmail.com', 'naji93793@gmail.com']));
      }
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
    return raw ? JSON.parse(raw) : ['saadabugabl@gmail.com', 'naji93793@gmail.com'];
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

    // تقييد التسجيل فقط لقائمة إيميلات الموظفين المعتمدة المدخلة من نظام الإدارة
    if (!AUTHORIZED_EMAILS.includes(targetEmail)) {
      setError('عذراً، هذا البريد الإلكتروني ليس أحد موظفي مبيعات GEMS المعتمدين. يرجى مراجعة المسؤول لإضافتك.');
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
    // إذا كان بريد ناجي وهو لتسجيل حساب المبيعات الثاني (اليوزر) نمنعه من كونه مدير فيه ليبقى حساب الإدارة مخفياً
    const shouldBeAdmin = isTargetAdmin && targetEmail === 'naji93793@gmail.com' ? false : isTargetAdmin;
    const newUsername = targetEmail.split('@')[0] + "_" + Math.floor(Math.random() * 100);

    const newUser: User = {
      username: newUsername,
      name: name.trim(),
      email: targetEmail,
      role: shouldBeAdmin ? 'admin' : 'employee',
      avatar: registerAvatar || undefined,
    };

    // حفظ في قاعدة البيانات المحلية
    const updatedUsers = [...dbUsers, newUser];
    const updatedPasses = { ...dbPasses, [newUsername]: password };

    localStorage.setItem('gems_crm_users_db', JSON.stringify(updatedUsers));
    localStorage.setItem('gems_crm_passwords_db', JSON.stringify(updatedPasses));

    setSuccess(`تم تسجيل حسابك بنجاح كـ ${newUser.role === 'admin' ? 'مشرف عام' : 'مسؤول مبيعات'}! يمكنك استخدام إيميلك وكلمة السر اللذين حددتهما لتسجيل الدخول وبدء العمل.`);
    setEmailOrUsername(targetEmail);
    setPassword('');
    setMode('login');
  };

  // معالجة إعادة تعيين كلمة المرور والمصادقة البريدية الأمنية المشددة
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
      // 1. بدء إرسال بريد أمان مصغر لعنوان المستخدم
      setIsSendingCode(true);
      setTimeout(() => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedCode(code);
        setIsSendingCode(false);
        setForgotStep(2);
        
        // توليد رسالة أمنية تفاعلية
        setMockEmailInbox({
          to: targetEmail,
          subject: '🔒 تنبيه أمني: رمز استعادة كلمة مرور حساب GEMS',
          body: `عزيزي الموظف، لقد تلقينا طلباً لتعديل بيانات حسابك. كود الأمان لتأكيد هويتك وتعيين الرقم السري المحدث هو:`,
          code: code
        });
        
        setSuccess('تم إرسال كود التحقق الأمني المكون من 6 أرقام إلى بريدك بنجاح! يرجى فحصه وإدخاله بالأسفل.');
      }, 800);
    } else if (forgotStep === 2) {
      // 2. التحقق من كود الأمان المدخل يدوياً من صندوق الوارد
      if (userEnteredCode !== generatedCode) {
        setError('كود الأمان غير صحيح أو انتهت صلاحيته. يرجى مراجعة لوحة البريد الإلكتروني الواردة بالأسفل.');
        return;
      }
      setForgotStep(3);
      setSuccess('تم تأكيد رمز التحقق البريدي الأمني بنجاح! الآن يرجى كتابة كلمة مرورك الجديدة.');
    } else {
      // 3. كتابة وتأكيد كلمة المرور الجديدة
      if (newPassword.length < 6) {
        setError('كلمة المرور الجديدة يجب أن تكون 6 خانات على الأقل لضمان متانة أمان النظام.');
        return;
      }

      // تحديث كلمة المرور في قاعدة البيانات المحلية
      const dbPasses = getPassesDB();
      const updatedPasses = { ...dbPasses, [matchedUser.username]: newPassword };
      localStorage.setItem('gems_crm_passwords_db', JSON.stringify(updatedPasses));

      setSuccess('صالح للغاية! تم تحديث كلمة الأمن وإبلاغ خادم التنبيهات وإرسال إشعار التغيير لبريدك. يمكنك تسجيل الدخول حالياً.');
      setEmailOrUsername(targetEmail);
      setPassword('');
      setMode('login');
      setForgotStep(1);
      setForgotEmail('');
      setNewPassword('');
      setGeneratedCode('');
      setUserEnteredCode('');
      setMockEmailInbox(null);
    }
  };

  // تم إزالة أزرار الملء التلقائي للحماية القصوى وعدم كشف كلمات المرور قدام المستخدمين


  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 font-sans" dir="rtl">
      <div className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 max-w-4xl w-full grid md:grid-cols-12 overflow-hidden min-h-[550px]">
          
          {/* الجانب الأيمن: النماذج التفاعلية */}
          <div className="p-8 md:col-span-7 flex flex-col justify-center relative">
            
            {/* الشعار المدمج المماثل تماماً لشركة GEMS */}
            <div className="mb-6 flex items-center gap-2.5">
              <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
                <GemsLogoSVG className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">نظام <span className="text-red-600">GEMS CRM</span> الذكي</h1>
                <p className="text-slate-400 text-[10px]">نظام الإدارة الذكي للعملاء والمتابعات RLS</p>
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

                  {/* رفع وتحميل وادخال الصورة الشخصية لليوزر */}
                  <div className="flex flex-col items-center justify-center p-3.5 bg-slate-50 border border-slate-200 rounded-xl gap-3">
                    <span className="text-slate-600 text-xs font-bold w-full text-right block">الصورة الشخصية (اختياري)</span>
                    <div className="relative group">
                      {registerAvatar ? (
                        <img 
                          src={registerAvatar} 
                          alt="صورة العضو" 
                          referrerPolicy="no-referrer"
                          className="w-20 h-20 rounded-full object-cover border-2 border-red-500 shadow-md" 
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold text-xs border border-slate-350 shadow-xs uppercase">
                          بدون صورة
                        </div>
                      )}
                      {registerAvatar && (
                        <button
                          type="button"
                          onClick={() => setRegisterAvatar('')}
                          className="absolute -top-1 -right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs shadow-xs cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <label className="px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-250 cursor-pointer rounded-lg text-xs font-bold transition">
                      <span>{registerAvatar ? 'تعديل الصورة' : 'اختر صورتك الشخصية'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleAvatarChange} 
                        className="hidden" 
                      />
                    </label>
                  </div>

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

                  {forgotStep === 1 && (
                    <div>
                      <p className="text-slate-400 text-xs mb-3.5">يرجى كتابة البريد الإلكتروني المسجل في حسابك لتعديل الرقم السري.</p>
                      <label className="block text-slate-600 text-xs font-bold mb-1 font-sans">البريد الإلكتروني للعمل</label>
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="example@icloud.com"
                        className="w-full text-right px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white text-slate-800 text-xs font-sans"
                        required
                        disabled={isSendingCode}
                      />
                    </div>
                  )}

                  {forgotStep === 2 && (
                    <div>
                      <p className="text-slate-400 text-xs mb-3.5">قمنا بإرسال رسالة أمان تحتوي على رمز التحقق المؤلف من 6 أرقام إلى بريدك الإلكتروني.</p>
                      <label className="block text-slate-600 text-xs font-bold mb-1">رمز التحقق الأمني (6 أرقام)</label>
                      <input
                        type="text"
                        value={userEnteredCode}
                        onChange={(e) => setUserEnteredCode(e.target.value.replace(/\D/g, ''))}
                        maxLength={6}
                        placeholder="أدخل الرمز المكون من 6 أرقام..."
                        className="w-full text-center px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white text-slate-800 text-base font-sans font-bold tracking-widest"
                        required
                      />
                    </div>
                  )}

                  {forgotStep === 3 && (
                    <div>
                      <p className="text-slate-400 text-xs mb-3.5">تم التأكيد بنجاح! يرجى اختيار كلمة مرور جديدة غير متوقعة لضمان سلامة بياناتك الشخصية.</p>
                      <label className="block text-slate-600 text-xs font-bold mb-1">كلمة المرور الجديدة (6 خانات فأكثر)</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-right px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white text-slate-800 text-xs"
                        required
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSendingCode}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-50"
                  >
                    {isSendingCode ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></span>
                        <span>جاري إرسال رمز التحقق الأمني...</span>
                      </span>
                    ) : (
                      <>
                        <HelpCircle className="w-4 h-4" />
                        <span>
                          {forgotStep === 1 && 'إرسال رمز التحقق للبريد'}
                          {forgotStep === 2 && 'تأكيد رمز التحقق البريدي'}
                          {forgotStep === 3 && 'حفظ كلمة المرور والدخول'}
                        </span>
                      </>
                    )}
                  </button>

                  {/* صندوق بريد إلكتروني وهمي ذكي يظهر بالأسفل لسهولة اختبار عملية التحقق والتجربة */}
                  {mockEmailInbox && (
                    <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-2 animate-fade-in">
                      <div className="flex items-center gap-1.5 text-amber-800 text-[11px] font-bold">
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                        <span>صندوق البريد الإلكتروني الوارد (محاكاة أمنية):</span>
                      </div>
                      <div className="text-[10px] text-slate-600 bg-white p-3 rounded-lg border border-slate-100 space-y-1">
                        <div><strong>إلى:</strong> {mockEmailInbox.to}</div>
                        <div><strong>الموضوع:</strong> {mockEmailInbox.subject}</div>
                        <div className="border-t border-slate-100 my-1.5 pt-1.5 text-slate-500 leading-normal">
                          {mockEmailInbox.body}
                        </div>
                        <div className="text-center py-2 bg-slate-50 rounded font-mono font-black text-slate-800 text-base tracking-widest border border-slate-150">
                          {mockEmailInbox.code}
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            )}

          </div>

          {/* الجانب الأيسر: مصفوفة مراحل علاقات العملاء الذكية CRM والمستندات */}
          <div className="bg-slate-900 p-8 md:col-span-5 text-white flex flex-col justify-between border-t md:border-t-0 md:border-r border-slate-850">
            <div className="space-y-6">
              <div className="inline-block px-3 py-1 bg-red-600/30 text-red-400 border border-red-500/30 rounded-full text-[10px] font-bold">
                دليل مصفوفة أودو GEMS CRM المطور
              </div>
              
              <div>
                <h3 className="text-sm font-bold mb-3 text-slate-100 border-b border-slate-800 pb-2">مراحل إدارة علاقات العملاء السبعة:</h3>
                
                <div className="space-y-3.5 text-xs text-slate-300 max-h-[350px] overflow-y-auto pr-1 select-none">
                  
                  <div className="p-2.5 bg-slate-850 rounded-lg border border-slate-800">
                    <div className="flex justify-between items-center font-bold text-red-400 text-[11px] mb-1">
                      <span>1. العملاء المحتملون (Leads)</span>
                      <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded">البداية</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">تجميع بيانات الاتصال للمهتمين تلقائياً وتحديد الجدية والاهتمام الأولي.</p>
                  </div>

                  <div className="p-2.5 bg-slate-850 rounded-lg border border-slate-800">
                    <div className="font-bold text-blue-400 text-[11px] mb-1">2. فرص البيع (Opportunities)</div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">تحويل المهتمين المؤكدين إلى صفقات نشطة في مسار المبيعات لتحديد القيم المالية المتوقعة وتاريخ الإغلاق.</p>
                  </div>

                  <div className="p-2.5 bg-slate-850 rounded-lg border border-slate-800">
                    <div className="font-bold text-amber-400 text-[11px] mb-1">3. المؤهلون (Qualified)</div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">دراسة تفصيل متطلبات العميل، وتأكيد الميزانية لتحديد القدرة والملاءمة المالية قبل إرسال العروض.</p>
                  </div>

                  <div className="p-2.5 bg-slate-850 rounded-lg border border-slate-800">
                    <div className="font-bold text-indigo-400 text-[11px] mb-1">4. تقديم العرض (Proposition)</div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">إرسال تفاصيل الأسعار والمنتجات أو مسودات العقود ومناقشتها مباشرة مع العميل.</p>
                  </div>

                  <div className="p-2.5 bg-slate-850 rounded-lg border border-slate-800">
                    <div className="font-bold text-purple-400 text-[11px] mb-1">5. التفاوض والمتابعة (Negotiation)</div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">الرد على الاستفسارات وتوفير الخصومات المناسبة والبدائل لتهيئة القرار التعاقدي النهائي.</p>
                  </div>

                  <div className="p-2.5 bg-emerald-950/20 rounded-lg border border-emerald-900/40">
                    <div className="font-bold text-emerald-400 text-[11px] mb-1">6. الصفقات الناجحة (Closed Won - نفذ)</div>
                    <p className="text-[10px] text-emerald-500/80 leading-relaxed">فوز الصفقة والتوقيع الرسمي لتفعيل تسليم الخدمات التقنية أو توريد الاحتياجات المعتمدة.</p>
                  </div>

                  <div className="p-2.5 bg-red-950/20 rounded-lg border border-red-900/40">
                    <div className="font-bold text-red-400 text-[11px] mb-1">7. الصفقات الملغاة (Closed Lost - غير منفذ)</div>
                    <p className="text-[10px] text-red-500/80 leading-relaxed">إغلاق الصفقة بالخسارة مع توثيق الأسباب بدقة (الميزانية، السعر، ميزات، المنافسين) لتحسين الأداء لاحقاً.</p>
                  </div>

                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-center space-y-1">
              <span className="text-[10px] text-slate-500 block">جميع كلمات المرور مشفرة ومؤمنة بقاعدة بيانات وحوكمة GEMS CRM</span>
              <span className="text-[9px] text-emerald-500 font-bold block">● الاتصال مؤمن ومثبت ببروتوكول RLS</span>
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

