/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User } from '../types';
import { BarChart3, HelpCircle, Shield, Sparkles, ExternalLink, RefreshCw, Layers } from 'lucide-react';
import { useState } from 'react';

interface ReportsProps {
  user: User;
}

export default function Reports({ user }: ReportsProps) {
  // لرابط التضمين الاحترافي (المستخدم يستطيع كتابته وتحديثه مباشرة لتجربته حياً!)
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [useRawSandbox, setUseRawSandbox] = useState<boolean>(false);

  // الرابط الافتراضي كمثال ناصع وموضح لـ Looker Studio مع تفعيل باراميتر البريد لتمريره للـ RLS
  const exampleLookerUrl = `https://lookerstudio.google.com/embed/reporting/YOUR-REPORT-UUID-HERE/page/YOUR-PAGE-ID?params=${encodeURIComponent(
    JSON.stringify({ "ds0.salesperson_email": user.email })
  )}`;

  const handleApplyUrl = () => {
    if (embedUrl.trim()) {
      setUseRawSandbox(true);
    }
  };

  const handleResetUrl = () => {
    setEmbedUrl('');
    setUseRawSandbox(false);
  };

  return (
    <div className="space-y-6 font-sans pb-8 text-right" dir="rtl">
      
      {/* هيدر التقرير الشامل والمؤشرات */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">تقارير وتحليلات شركة GEMS التفاعلية</h2>
          <p className="text-slate-400 text-xs mt-1">
            تحليلات متكاملة لتفقد تفوق المبيعات ومتابعة العملاء بدمج أداة Looker Studio ومجموعات الإحصائيات المتقدمة.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-600 text-xs font-semibold">المستخدم النشط للفلتر الأمني:</span>
          <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-150">
            {user.email}
          </span>
        </div>
      </div>

      {/* قسم الإرشادات التقنية - شرح وافي لكيفية تفعيل الـ Row-Level Security (RLS) */}
      <div className="bg-slate-800 text-slate-100 p-6 rounded-xl shadow-md border border-slate-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl"></div>
        
        <div className="relative space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-600/20 text-red-400 border border-red-500/30 rounded-xl">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-white">دليل حوكمة البيانات وأمان التقارير (Looker Studio RLS)</h3>
          </div>

          <p className="text-slate-300 text-xs leading-relaxed max-w-4xl">
            يتطلب نظام GEMS حماية معلومات العملاء وحوكمتها بالكامل. عند استخدام Looker Studio لمجموعة <strong className="text-red-400">GEMS</strong>، يتم تطبيق مرشحات الأمان على مستوى الصف <strong className="text-white">(Row-Level Security)</strong> لتصفية البيانات ديناميكياً بحيث يرى كل موظف مبيعات بيانات عملائه فقط، بينما يرى مشرف النظام التقارير الشاملة لجميع المحافظ.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t border-slate-800 text-xs text-slate-300">
            <div className="space-y-2">
              <h4 className="font-bold text-red-400 flex items-center gap-1.5 mb-1 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block"></span>
                الطريقة 1: التمرير المباشر عبر المعلمات (URL Parameters)
              </h4>
              <p className="leading-relaxed">
                نقوم بتشفير إيميل الموظف المفتوح حالياً وتمريره كمعلمة داخل رابط Looker Studio iframe كمرحلة أولى.
                يقوم التقرير باستقبال المتغير وتصفيته مباشرة:
              </p>
              <div className="bg-slate-950 p-3 rounded-xl font-mono text-[10px] text-emerald-400 overflow-x-auto text-left ltr-input leading-normal">
                {`?params={"ds0.salesperson_email": "${user.email}"}`}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                الطريقة 2: فلاتر البريد الإلكتروني للمشاهد (Viewer Email Filter)
              </h4>
              <p className="leading-relaxed">
                في لوحة Looker Studio، نقوم بربط حقل <strong className="text-white">"بريد المسؤول"</strong> بفلتر البريد الإلكتروني للمستخدم المفتوح للتقرير من جوجل.
                عند فتح الموظف للتطبيق، سيقوم التقرير بمطابقة بريد حسابه النشط ديناميكياً وعرض أسطره المخصصة فقط بأمان تام.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* لوحة اختبار واستبدال الرابط */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
        <h3 className="font-bold text-sm text-slate-800 mb-3.5 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-red-650" />
          <span>تضمين رابط تقرير Looker Studio المخصص الخاص بك:</span>
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            value={embedUrl}
            onChange={(e) => setEmbedUrl(e.target.value)}
            placeholder="لصق كود أو رابط التضمين هنا (مثال: https://lookerstudio.google.com/embed/...)"
            className="flex-grow text-left ltr-input px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <div className="flex gap-2">
            <button
              onClick={handleApplyUrl}
              disabled={!embedUrl.trim()}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs disabled:opacity-40 transition cursor-pointer"
            >
              استعراض التقرير المرفق حياً
            </button>
            {useRawSandbox && (
              <button
                onClick={handleResetUrl}
                className="p-2.5 bg-slate-150 rounded-xl text-slate-505 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                title="إعادة تعيين للتقرير الافتراضي"
              >
                إعادة تعيين
              </button>
            )}
          </div>
        </div>
        <span className="text-[10px] text-slate-400 block mt-2">
          الرابط المهيأ ديناميكياً لتمرير إيميل العضو الحالي هو:
          <code className="bg-slate-50 p-1 rounded font-mono text-[9px] text-slate-600 block mt-1 overflow-x-auto text-left ltr-input">
            {exampleLookerUrl}
          </code>
        </span>
      </div>

      {/* منطقة التضمين التفاعلية المرنة (Responsive Looker Studio Embed) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
        <div className="p-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-slate-400" />
            <span>عرض حي ونشط للتقارير الاستراتيجية</span>
          </span>
          <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px]">
            {useRawSandbox ? 'رابط العميل المرفق' : 'محاكي التقارير الذكي'}
          </span>
        </div>

        {useRawSandbox ? (
          /* في حالة توفر كود التضمين للمستخدم، ندرج الإطار التفاعلي الفعلي المخصص */
          <div className="w-full h-[750px] overflow-hidden rounded-2xl border border-slate-100 relative bg-slate-50">
            <iframe
              src={embedUrl}
              className="w-full h-full border-0 rounded-2xl"
              allowFullScreen
              sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              title="Looker Studio Report Embed"
            ></iframe>
          </div>
        ) : (
          /* كرت معاينة محاكاة लुकير ستوديو بتصميم مبهر يعزز تجربة المنتج */
          <div className="w-full bg-slate-900 rounded-2xl p-8 text-center text-slate-200 border border-slate-800 space-y-6 select-none shadow-inner h-[600px] flex flex-col justify-center">
            
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center mx-auto animate-pulse">
                <BarChart3 className="w-8 h-8" />
              </div>
              
              <h4 className="text-lg font-bold text-white">محاكي تقارير مبيعات GEMS التفاعلية</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                هذا التبويب يحتوي على رابط Looker Studio iframe تفاعلي مرن. بمجرد أن تضع رابط لوحة التحكم الفعلية الخاصة بك في المربع أعلاه، ستظهر لوحتك في هذا الجزء بدقة وكفاءة.
              </p>

              <div className="grid grid-cols-3 gap-3 text-center border-t border-slate-800/80 pt-5">
                <div className="bg-slate-800/60 p-3 rounded-xl">
                  <span className="block text-[10px] text-red-400 font-bold">العرض</span>
                  <span className="text-sm font-bold text-white mt-1 block">100%</span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-xl">
                  <span className="block text-[10px] text-red-400 font-bold">الارتفاع</span>
                  <span className="text-sm font-bold text-white mt-1 block">750px</span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-xl">
                  <span className="block text-[10px] text-red-400 font-bold">التجاوب المزدوج</span>
                  <span className="text-sm font-bold text-white mt-1 block">كامل الاستجابة</span>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-500">
              مرحلة معاينة Looker Studio CRM - المطور لـ GEMS
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
