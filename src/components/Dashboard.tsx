/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Client, User } from '../types';
import { USERS } from '../mockData';
import { 
  Users, ClipboardList, CheckCircle2, XCircle, AlertCircle, 
  MapPin, PhoneCall, Calendar, UserX, Star, HelpCircle, Filter 
} from 'lucide-react';
import { useState, useMemo } from 'react';

interface DashboardProps {
  user: User;
  clients: Client[];
}

export default function Dashboard({ user, clients }: DashboardProps) {
  // للآدمن، يمكن تصفية لوحة التحكم لموظف معين أو استعراض الكل
  const [selectedEmployeeEmail, setSelectedEmployeeEmail] = useState<string>('all');

  // تصفية العملاء بناءً على صلاحية المستخدم وفلتر الآدمن
  const filteredClients = useMemo(() => {
    if (user.role === 'employee') {
      // الموظف العادي يرى فقط عملائه مصفين بناءً على بريد المسؤول
      return clients.filter(c => c.ownerEmail === user.email);
    } else {
      // المشرف يرى الكل، أو موظفاً محدداً بناءً على خيار التصفية
      if (selectedEmployeeEmail === 'all') {
        return clients;
      }
      return clients.filter(c => c.ownerEmail === selectedEmployeeEmail);
    }
  }, [user, clients, selectedEmployeeEmail]);

  // الحسابات والإحصائيات
  const stats = useMemo(() => {
    const total = filteredClients.length;
    const followUp = filteredClients.filter(c => c.status === 'متابعة').length;
    const done = filteredClients.filter(c => c.status === 'نفذ').length;
    const notDone = filteredClients.filter(c => c.status === 'لم يتم التنفيذ').length;

    // المتابعة القادمة العاجلة (التي موعدها خلال الأيام القادمة)
    const urgentFollowups = filteredClients.filter(c => {
      if (c.status !== 'متابعة' || !c.nextFollowup) return false;
      const today = new Date();
      const followupDate = new Date(c.nextFollowup);
      const diffTime = followupDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= -5 && diffDays <= 7; // الأيام القريبة الماضية والمقبلة
    }).length;

    // توزيع العملاء حسب الإمارات
    const emirateCount: Record<string, number> = {};
    filteredClients.forEach(c => {
      const em = c.emirate || 'أخرى';
      emirateCount[em] = (emirateCount[em] || 0) + 1;
    });

    const emirateStats = Object.entries(emirateCount).map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    })).sort((a, b) => b.count - a.count);

    // توزيع درجات الاهتمام
    const highInterest = filteredClients.filter(c => c.interestLevel === 'عالي').length;
    const medInterest = filteredClients.filter(c => c.interestLevel === 'متوسط').length;
    const lowInterest = filteredClients.filter(c => c.interestLevel === 'منخفض').length;

    // متوسط عدد مرات التواصل
    const totalContacts = filteredClients.reduce((acc, c) => acc + (c.contactCount || 0), 0);
    const avgContacts = total > 0 ? (totalContacts / total).toFixed(1) : '0';

    return {
      total,
      followUp,
      done,
      notDone,
      urgentFollowups,
      emirateStats,
      avgContacts,
      interest: {
        high: total > 0 ? Math.round((highInterest / total) * 100) : 0,
        medium: total > 0 ? Math.round((medInterest / total) * 100) : 0,
        low: total > 0 ? Math.round((lowInterest / total) * 100) : 0
      }
    };
  }, [filteredClients]);

  // الموظفون الخمسة لغايات فلتر المشرف
  const employeesOnly = useMemo(() => {
    return USERS.filter(u => u.role === 'employee');
  }, []);

  return (
    <div className="space-y-6 font-sans pb-8" dir="rtl">
      
      {/* هيدر الترحيب والتصفية الإضافية للمشرف */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">
            لوحة قياس الأداء {user.role === 'admin' && 'العامة'}
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            {user.role === 'admin' 
              ? 'متابعة مؤشرات الأداء، إنتاجية الموظفين والتوزيع الجغرافي للعملاء.' 
              : `أهلاً بك ${user.name}. تظهر لك إحصائيات عملائه المسؤول عنهم فقط.`}
          </p>
        </div>

        {/* عرض الفلتر الإضافي الخاص بـ المشرف Admin حصراً */}
        {user.role === 'admin' && (
          <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <span className="text-slate-600 text-xs font-bold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-red-600" />
              <span>تصفية حسب مسؤول المبيعات:</span>
            </span>
            <select
              value={selectedEmployeeEmail}
              onChange={(e) => setSelectedEmployeeEmail(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">الشركة بالكامل (جميع الموظفين)</option>
              {employeesOnly.map((emp) => (
                <option key={emp.email} value={emp.email}>
                  {emp.name} ({emp.email})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* الكروت الأربعة الرئيسية للتحليلات السريعة (KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* كرت إجمالي العملاء */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-1 w-full bg-slate-400 group-hover:bg-red-500 transition-colors"></div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Total Leads إجمالي المحفظة</span>
              <span className="text-3xl font-black text-slate-800">{stats.total}</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>مسجلين تحت الإدارة والمتابعة</span>
            <span className="text-green-500 font-bold">+12% ↑</span>
          </div>
        </div>

        {/* كرت عملاء قيد المتابعة - مع الفوكس هيدر الأحمر من التصميم */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-red-500 hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Active Deals المتابعة النشطة</span>
              <span className="text-3xl font-black text-slate-800 text-slate-800">{stats.followUp}</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{stats.total > 0 ? Math.round((stats.followUp / stats.total) * 100) : 0}% من الإجمالي</span>
            <span className="text-red-500 font-bold">Focus Needed</span>
          </div>
        </div>

        {/* كرت تم التنفيذ */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-green-500 hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Closure Rate صفقات ناجحة "نفذ"</span>
              <span className="text-3xl font-black text-slate-800 text-slate-800">{stats.done}</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0}% صفقات رابحة</span>
            <span className="text-emerald-500 font-bold">Avg. 14 days</span>
          </div>
        </div>

        {/* كرت لم يتم التنفيذ */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-slate-400 hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Closed Deals غير منفذة</span>
              <span className="text-3xl font-black text-slate-800 text-slate-800">{stats.notDone}</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{stats.total > 0 ? Math.round((stats.notDone / stats.total) * 100) : 0}% من المحفظة</span>
            <span className="text-slate-400 font-bold">Inactive</span>
          </div>
        </div>
      </div>

      {/* قسم التحليلات المعمقة والتوزيع الجغرافي */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* التوزيع الجغرافي حسب إمارات الدولة */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-7">
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-slate-800 text-sm">التوزيع الجغرافي للعملاء بالدولة (الإمارات)</h3>
          </div>

          {stats.emirateStats.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">لا توجد بيانات عملاء كافية للحساب حالياً.</div>
          ) : (
            <div className="space-y-4">
              {stats.emirateStats.map((em) => (
                <div key={em.name}>
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="font-bold text-slate-700">{em.name}</span>
                    <span className="text-slate-500">{em.count} عملاء ({em.percentage}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-600 rounded-full transition-all duration-500"
                      style={{ width: `${em.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* كروت دائرية مخصصة لدرجات الاهتمام واحتكاك العملاء */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-800 text-sm">مستويات اهتمام العميل وجاهزيته للشراء</h3>
            </div>

            <div className="space-y-4">
              {/* عالي */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                    اهتمام مرتفع جداً (جاهز للتعاقد)
                  </span>
                  <span className="font-bold text-slate-800">{stats.interest.high}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500" style={{ width: `${stats.interest.high}%` }}></div>
                </div>
              </div>

              {/* متوسط */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                    اهتمام متوسط (بانتظار التفاوض)
                  </span>
                  <span className="font-bold text-slate-800">{stats.interest.medium}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${stats.interest.medium}%` }}></div>
                </div>
              </div>

              {/* منخفض */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span>
                    اهتمام منخفض (متابعة بعيدة)
                  </span>
                  <span className="font-bold text-slate-800">{stats.interest.low}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-400" style={{ width: `${stats.interest.low}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-center">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="block text-[10px] text-slate-400 font-semibold mb-1">متوسط مرات التواصل</span>
              <span className="text-xl font-bold text-slate-800 flex items-center justify-center gap-1">
                <PhoneCall className="w-4 h-4 text-slate-500" />
                {stats.avgContacts}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="block text-[10px] text-slate-400 font-semibold mb-1">متابعات مستعجلة</span>
              <span className="text-xl font-bold text-blue-600 flex items-center justify-center gap-1">
                <Calendar className="w-4 h-4 text-blue-500" />
                {stats.urgentFollowups}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* لمحة سريعة عن إنتاجية مسؤولي المبيعات (يظهر فقط للمشرف بالكامل) */}
      {user.role === 'admin' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-slate-800 text-sm mb-4">أداء موظفي المبيعات ومسؤولي العملاء المباشرين:</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {employeesOnly.map((emp) => {
              const empClients = clients.filter(c => c.ownerEmail === emp.email);
              const empDone = empClients.filter(c => c.status === 'نفذ').length;
              const empPending = empClients.filter(c => c.status === 'متابعة').length;
              
              return (
                <div key={emp.email} className="bg-slate-50 p-4 border border-slate-150 rounded-xl relative overflow-hidden">
                  <span className="block font-bold text-xs text-slate-800 truncate mb-1">{emp.name}</span>
                  <span className="block text-[9px] text-slate-400 truncate mb-3">{emp.email}</span>
                  
                  <div className="grid grid-cols-2 gap-2 text-center border-t border-slate-200/60 pt-2.5">
                    <div>
                      <span className="block text-[9px] text-slate-400">منفذ</span>
                      <span className="text-xs font-black text-emerald-600">{empDone}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-400">متابعة</span>
                      <span className="text-xs font-black text-blue-600">{empPending}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
