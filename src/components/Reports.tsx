/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { User } from '../types';
import { BarChart3, ExternalLink, Activity, Target, Landmark, Percent } from 'lucide-react';

interface ReportsProps {
  user: User;
}

export default function Reports({ user }: ReportsProps) {
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [isApplied, setIsApplied] = useState<boolean>(false);

  // الرابط التجريبي لـ Looker Studio مع بارامتر الإيميل الافتراضي
  const dynamicExampleUrl = `https://lookerstudio.google.com/embed/reporting/YOUR-REPORT-ID/page/GEMS?email=${encodeURIComponent(user.email)}`;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (embedUrl.trim()) {
      setIsApplied(true);
    }
  };

  const handleClear = () => {
    setEmbedUrl('');
    setIsApplied(false);
  };

  return (
    <div className="space-y-6 font-sans pb-8 text-right" dir="rtl">
      {/* هيدر التقرير المبسط والجميل */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-red-650 text-red-650" />
            <span>لوحة تحليلات وتقارير GEMS</span>
          </h2>
          <p className="text-slate-450 text-xs mt-1">
            تابع أداء فريق مبيعات GEMS وارفق لوحتك التفاعلية من Looker Studio لمراقبة نمو الصفقات والاتصالات.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-450 text-xs">الحساب الحالي:</span>
          <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">
            {user.email}
          </span>
        </div>
      </div>

      {/* لوحة تحليلات Looker Studio - صندوق التضمين */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/80 space-y-4">
        <div>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider block">
            🔗 ربط وتضمين لوحة Looker Studio مخصصة لقسم المبيعات
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            الصق رابط مشاركة تقرير Looker Studio المتاح لديك لتضمينه فوراً داخل حسابك بأمان وسهولة.
          </p>
        </div>

        <form onSubmit={handleApply} className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            value={embedUrl}
            onChange={(e) => setEmbedUrl(e.target.value)}
            placeholder="مثال: https://lookerstudio.google.com/embed/reporting/..."
            className="flex-grow text-left ltr-input bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!embedUrl.trim()}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition cursor-pointer disabled:opacity-40"
            >
              ربط التقرير الآن
            </button>
            {isApplied && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                إلغاء التضمين
              </button>
            )}
          </div>
        </form>

        <div className="text-[10px] text-slate-450 bg-slate-50 p-2.5 rounded-lg border border-slate-200/50 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <span>الرابط المهيأ ديناميكياً لتمرير إيميل العضو الحالي هو:</span>
          <code className="bg-white border text-left text-slate-600 ltr-input px-2 py-1 rounded text-[9px] font-mono break-all max-w-full md:max-w-md truncate">
            {dynamicExampleUrl}
          </code>
        </div>
      </div>

      {/* منطقة الاستعراض والتفاعل */}
      {isApplied ? (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 mb-4">
            <span className="flex items-center gap-1.5 ">
              <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span>لوحة Looker المربوطة حياً</span>
            </span>
            <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px]">
              نشط الآن
            </span>
          </div>
          <div className="w-full h-[650px] overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <iframe
              src={embedUrl}
              className="w-full h-full border-0 rounded-xl"
              allowFullScreen
              sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              title="Looker Studio Report"
            ></iframe>
          </div>
        </div>
      ) : (
        /* واجهة إحصائيات بديلة وبسيطة تعزز تجربة ومظهر لوحة التقارير بشكل متقن بدلاً من الفراغ */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/80 flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">معدل تحويل الصفقات</span>
                <span className="text-2xl font-black text-slate-800 mt-1 block">78.5%</span>
              </div>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="text-[10px] text-slate-450 leading-relaxed border-t border-slate-50 pt-2">
              نسب الصفقات الناجحة والعملاء المحمولين إلى مرحلة الاتفاق النهائي لدى الشركة خلال هذا الشهر.
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/80 flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">أهداف التنسيق والمتابعات</span>
                <span className="text-2xl font-black text-slate-800 mt-1 block">94%</span>
              </div>
              <div className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-100">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="text-[10px] text-slate-450 leading-relaxed border-t border-slate-50 pt-2">
              مدى التزام فريق العمل بإتمام الاتصالات المجدولة، وتحديث بيانات العملاء في غضون أول 24 ساعة.
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/80 flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">محفز الإيرادات المتوقع</span>
                <span className="text-2xl font-black text-slate-800 mt-1 block">GEMS Pro</span>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                <Landmark className="w-4 h-4" />
              </div>
            </div>
            <div className="text-[10px] text-slate-450 leading-relaxed border-t border-slate-50 pt-2">
              تحديث الصفقات ودمج تقارير المبيعات يعطي إحصاءً مستقراً وتنبؤاً دقيقاً وموثوقاً للأرباح والمداخيل.
            </div>
          </div>

          <div className="md:col-span-3 bg-red-50/40 p-6 rounded-xl border border-red-100 flex flex-col items-center justify-center text-center space-y-2 py-10">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <p className="text-xs font-black text-slate-800">تنبيه المعاينة للوحة التفاعلية</p>
            <p className="text-[11px] text-slate-500 max-w-md leading-relaxed">
              أنت تستعرض لوحة التقارير والمؤشرات الكلاسيكية البسيطة. يمكنك تضمين تقرير Looker Studio التفاعلي والخاص بشركتكم في أي وقت عبر إرفاق الرابط في نموذج الربط أعلاه بمجرد الانتهاء من تصميمه في جوجل.
            </p>
          </div>

        </div>
      )}
    </div>
  );
}
