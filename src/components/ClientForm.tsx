/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Client, User } from '../types';
import { USERS } from '../mockData';
import { UserPlus, Sparkles, Phone, MapPin, Building2, Calendar, Star, HelpCircle, Save, CheckCircle2 } from 'lucide-react';

interface ClientFormProps {
  user: User;
  clients: Client[];
  onAddClient: (newClient: Client) => void;
  setActiveTab: (tab: string) => void;
}

export default function ClientForm({ user, clients, onAddClient, setActiveTab }: ClientFormProps) {
  // حالة الإرسال الناجح
  const [success, setSuccess] = useState(false);

  // توليد كود تلقائي للعميل الجديد بناءً على أعلى كود حالي
  const generateNewId = () => {
    try {
      const ids = clients.map(c => {
        const numPart = parseInt(c.id.replace('GEMS-', ''));
        return isNaN(numPart) ? 1000 : numPart;
      });
      const maxId = ids.length > 0 ? Math.max(...ids) : 1000;
      return `GEMS-${maxId + 1}`;
    } catch {
      return `GEMS-${Date.now().toString().slice(-4)}`;
    }
  };

  // الحالة للنموذج
  const [clientId, setClientId] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [emirate, setEmirate] = useState('دبي');
  const [clientFeedback, setClientFeedback] = useState('');
  const [partnerFeedback, setPartnerFeedback] = useState('');
  const [status, setStatus] = useState<'العملاء المحتملون' | 'الفرص' | 'المؤهلون' | 'تقديم العرض' | 'التفاوض' | 'نفذ' | 'لم يتم التنفيذ'>('العملاء المحتملون');
  const [nextFollowup, setNextFollowup] = useState('');
  const [interestLevel, setInterestLevel] = useState<'عالي' | 'متوسط' | 'منخفض'>('عالية');
  const [contactCount, setContactCount] = useState(1);
  const [notDoneReason, setNotDoneReason] = useState('');

  // تفاصيل المنشئ (لو كان المسؤول العادي يتم تعليمه عليه مباشرة، لو كان آدمن يتاح اختيار موظف آخر)
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerName, setOwnerName] = useState('');

  // تهيئة القيم الافتراضية
  useEffect(() => {
    setClientId(generateNewId());
    
    // تواريخ افتراضية مريحة
    const todayStr = new Date().toISOString().split('T')[0];
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];
    setNextFollowup(nextWeekStr);

    // تفاصيل مالك الصفقة الافتراضي
    if (user.role === 'employee') {
      setOwnerEmail(user.email);
      setOwnerName(user.name);
    } else {
      // للآدمن، يضع الحساب الخاص به كافتراضي أو يختار من الموظفين الخمسة الآخرين
      setOwnerEmail(user.email);
      setOwnerName(user.name);
    }
  }, [user, clients]);

  // تحديث اسم المالك بمجرد اختيار بريده للمشرف
  const handleOwnerEmailChange = (email: string) => {
    setOwnerEmail(email);
    const matched = USERS.find(u => u.email === email);
    if (matched) {
      setOwnerName(matched.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const todayStr = new Date().toISOString().split('T')[0];

    // التحقق من سبب عدم التنفيذ
    if (status === 'لم يتم التنفيذ' && !notDoneReason.trim()) {
      alert('يرجى كتابة سبب عدم التنفيذ للتوثيق الإداري.');
      return;
    }

    const newClient: Client = {
      id: clientId,
      name: name.trim(),
      company: company.trim(),
      phone: phone.trim(),
      emirate,
      clientFeedback: clientFeedback.trim(),
      partnerFeedback: partnerFeedback.trim(),
      status,
      addDate: todayStr,
      lastContact: todayStr,
      nextFollowup: (status !== 'نفذ' && status !== 'لم يتم التنفيذ') ? nextFollowup : '',
      interestLevel: interestLevel as any,
      contactCount,
      notDoneReason: status === 'لم يتم التنفيذ' ? notDoneReason.trim() : undefined,
      owner: ownerName,
      ownerEmail: ownerEmail
    };

    onAddClient(newClient);
    setSuccess(true);

    // إعادة ضبط الحقول للبداية استعداداً لإضافة أخرى
    setName('');
    setCompany('');
    setPhone('');
    setClientFeedback('');
    setPartnerFeedback('');
    setNotDoneReason('');
    
    // التمرير للأعلى لرؤية نجاح العملية
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // إخفاء كرت النجاح بعد فترة وتوجيه لصفحة الـ Pipeline لتسهيل تجربة المستخدم المباشرة
    setTimeout(() => {
      setSuccess(false);
      setActiveTab('pipeline');
    }, 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans pb-8 text-right" dir="rtl">
      
      {/* نجاح الإرسال */}
      {success && (
        <div className="bg-emerald-50 border-r-4 border-emerald-500 p-4 rounded-xl flex items-center gap-3 text-emerald-800 text-sm shadow-md animate-bounce">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          <div>
            <strong className="block font-bold">تم تسجيل العميل بنجاح!</strong>
            <span className="block text-xs mt-0.5">تم حفظ العميل في شيت البيانات وتحديث لوحة الـ Pipeline وإحصائيات لوحة التحكم. جاري التوجيه تلقائياً...</span>
          </div>
        </div>
      )}

      {/* نموذج الإضافة */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* رأس التبويب */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/65 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-605 bg-red-600 text-white flex items-center justify-center shadow-md">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">إضافة عميل جديد للمحفظة</h1>
              <p className="text-slate-400 text-xs">سجل بيانات عميل جديد بمواصفات مطابقة لشيت Excel الخاص بالشركة.</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-semibold select-none">
            <Sparkles className="w-3.5 h-3.5" />
            <span>تسجيل ذكي ومتكامل</span>
          </div>
        </div>

        {/* جسم الفورم */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* كود العميل (غير قابل للتعديل لضبط تناسق وتتابع معرف المعاملات) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-slate-500 text-xs font-semibold mb-1.5">معرف العميل (Client ID)</label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full text-right px-4 py-2.5 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold cursor-not-allowed"
                required
                readonly
              />
              <span className="text-[10px] text-slate-400 block mt-1">يولّد تلقائياً لضمان عدم وجود تكرار بالبيانات.</span>
            </div>

            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5">اسم العميل بالكامل *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: محمد بن راشد المكتوم"
                className="w-full text-right px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5">اسم الجهة أو الشركة *</label>
              <div className="relative">
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="شركة الخليج للتطوير العقاري"
                  className="w-full text-right px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                  required
                />
                <div className="absolute left-3 top-3.5 text-slate-450">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* معلومات التواصل والموقع والاستهداف */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5">رقم تليفون التواصل *</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="مثال: +971 50 123 4567"
                  className="w-full text-right px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white ltr-input"
                  required
                />
                <div className="absolute left-3 top-3.5 text-slate-450">
                  <Phone className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5">إمارة العميل *</label>
              <div className="relative">
                <select
                  value={emirate}
                  onChange={(e) => setEmirate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white cursor-pointer"
                >
                  <option value="دبي">دبي</option>
                  <option value="أبوظبي">أبوظبي</option>
                  <option value="الشارقة">الشارقة</option>
                  <option value="عجمان">عجمان</option>
                  <option value="رأس الخيمة">رأس الخيمة</option>
                  <option value="الفجيرة">الفجيرة</option>
                  <option value="أم القيوين">أم القيوين</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5">حالة ومرحلة الصفقة الحالية *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white cursor-pointer"
              >
                <option value="العملاء المحتملون">1. عميل محتمل (Lead)</option>
                <option value="الفرص">2. فرصة بيع (Opportunity)</option>
                <option value="المؤهلون">3. مؤهل تمويلي/مالي (Qualified)</option>
                <option value="تقديم العرض">4. تقديم عرض فني/مالي (Proposition)</option>
                <option value="التفاوض">5. التفاوض والمراجعة (Negotiation)</option>
                <option value="نفذ">6. نفذ وتم التعاقد (Closed Won)</option>
                <option value="لم يتم التنفيذ">7. لم يتم التنفيذ / ملغى (Closed Lost)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5">درجة اهتمام وجدّية العميل *</label>
              <select
                value={interestLevel}
                onChange={(e) => setInterestLevel(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white cursor-pointer"
              >
                <option value="عالي">اهتمام عالي (فرصة ساخنة)</option>
                <option value="متوسط">اهتمام متوسط (مستهلك محتمل)</option>
                <option value="منخفض">اهتمام منخفض (معاينة بعيدة)</option>
              </select>
            </div>
          </div>

          {/* تواصل وتواريخ المتابعة */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {status !== 'نفذ' && status !== 'لم يتم التنفيذ' && (
              <div>
                <label className="block text-slate-700 text-xs font-bold mb-1.5">موعد المتابعة والاتصال القادمة *</label>
                <div className="relative">
                  <input
                    type="date"
                    value={nextFollowup}
                    onChange={(e) => setNextFollowup(e.target.value)}
                    className="w-full text-right px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
              </div>
            )}

            {status === 'لم يتم التنفيذ' && (
              <div className="md:col-span-2">
                <label className="block text-red-650 text-xs font-bold mb-1.5 flex items-center gap-1">
                  <span>سبب عدم التنفيذ والغلق المالي *</span>
                </label>
                <input
                  type="text"
                  value={notDoneReason}
                  onChange={(e) => setNotDoneReason(e.target.value)}
                  placeholder="اكتب بوضوح: الميزانية لا تسمح، عدم الرد والانسحاب، الخيار للمنافس..."
                  className="w-full text-right px-4 py-2.5 bg-red-50/40 border border-red-200 rounded-xl text-xs font-bold text-red-950 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* إفادات العميل والزميل مبيعات */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5">إفادة العميل المباشرة والتعليق (Client Feedback) *</label>
              <textarea
                rows={3}
                value={clientFeedback}
                onChange={(e) => setClientFeedback(e.target.value)}
                placeholder="اكتب هنا تفاصيل رد العميل في آخر مكالمة وصوته وما يرغب به..."
                className="w-full text-right px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                required
              ></textarea>
            </div>

            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5">إفادة الشريك والإجراء المتخذ (Partner Feedback) *</label>
              <textarea
                rows={3}
                value={partnerFeedback}
                onChange={(e) => setPartnerFeedback(e.target.value)}
                placeholder="ما هو الإجراء الذي باشرته للتخديم عليه؟ هل أرسلت العرض المالي أم مصفوفة الخدمات؟"
                className="w-full text-right px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                required
              ></textarea>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* تحديد معلومات المسؤول عن العميل (Row-Level Security) */}
          <div className="bg-slate-50 p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-xs text-slate-800 mb-3.5">تفاصيل المسؤول والموظف المنشئ (CRM RLS Meta):</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* إذا كان المستخدم الحالي مشرفاً عاماً، يمكنه إسناد العميل لبريد أي موظف من الخمسة */}
              {user.role === 'admin' ? (
                <div>
                  <label className="block text-slate-700 text-xs font-bold mb-1.5">تخصيص الموظف المسؤول (خاص بالأدمن) *</label>
                  <select
                    value={ownerEmail}
                    onChange={(e) => handleOwnerEmailChange(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {USERS.map((usr) => (
                      <option key={usr.email} value={usr.email}>
                        {usr.name} ({usr.email}) - {usr.role === 'admin' ? 'إشراف' : 'مبيعات'}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-1.5">البريد الإلكتروني للوكيل المسؤول</label>
                  <input
                    type="text"
                    value={ownerEmail}
                    className="w-full text-right px-4 py-2.5 bg-slate-200 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold cursor-not-allowed"
                    required
                    readonly
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-450 text-xs font-semibold mb-1.5">الاسم الكامل للمسؤول</label>
                <input
                  type="text"
                  value={ownerName}
                  className="w-full text-right px-4 py-2.5 bg-slate-200 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold cursor-not-allowed"
                  required
                  readonly
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">
              هذه الحقول تستخدم لتأمين حوكمة البيانات. بمجرد إدراج العميل، لن يستطيع أي مسؤول مبيعات آخر الوصول لبياناته باستثناء المشرف العام لضمان حماية بيانات العملاء للشركة.
            </p>
          </div>

          {/* أزرار التشغيل وحفظ البيانات */}
          <div className="pt-4 flex items-center justify-end gap-3.5">
            <button
              type="button"
              onClick={() => setActiveTab('pipeline')}
              className="px-6 py-3 bg-slate-105 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold rounded-xl text-xs cursor-pointer"
            >
              إلغاء والعودة للـ Pipeline
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md shadow-red-650/15 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>تسجيل العميل وحفظ الصفقة</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
