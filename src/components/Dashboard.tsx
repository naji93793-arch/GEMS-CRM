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
    const leadsCount = filteredClients.filter(c => c.status === 'العملاء المحتملون').length;
    const activePipeline = filteredClients.filter(c => ['الفرص', 'المؤهلون', 'تقديم العرض', 'التفاوض'].includes(c.status)).length;
    const done = filteredClients.filter(c => c.status === 'نفذ').length;
    const notDone = filteredClients.filter(c => c.status === 'لم يتم التنفيذ').length;

    // المتابعة القادمة العاجلة (التي موعدها خلال الأيام القادمة)
    const urgentFollowups = filteredClients.filter(c => {
      if (c.status === 'نفذ' || c.status === 'لم يتم التنفيذ' || !c.nextFollowup) return false;
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
      leadsCount,
      activePipeline,
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
    const rawUsers = localStorage.getItem('gems_crm_users_db');
    const allUsers: User[] = rawUsers ? JSON.parse(rawUsers) : USERS;
    const isNajiCurrentUser = user.email.toLowerCase() === 'naji93793@gmail.com' || user.username.toLowerCase().includes('naji');
    return allUsers.filter(u => {
      const isNajiAcc = u.email.toLowerCase() === 'naji93793@gmail.com' || u.username.toLowerCase().includes('naji');
      return u.role === 'employee' && (isNajiCurrentUser || !isNajiAcc);
    });
  }, [user]);

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

      {/* الكروت الخمسة الرئيسية للتحليلات السريعة (KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* كرت إجمالي العملاء */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-1 w-full bg-slate-400 group-hover:bg-red-500 transition-colors"></div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">إجمالي المحفظة Portfolio</span>
              <span className="text-2xl font-black text-slate-800">{stats.total}</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
            <span>مسجلين بالكامل</span>
            <span className="text-green-500 font-bold">+100%</span>
          </div>
        </div>

        {/* كرت العملاء المحتملين */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-red-500 hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">العملاء المحتملون Leads</span>
              <span className="text-2xl font-black text-slate-800">{stats.leadsCount}</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-red-50 text-red-605 flex items-center justify-center">
              <ClipboardList className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{stats.total > 0 ? Math.round((stats.leadsCount / stats.total) * 100) : 0}% من المحفظة</span>
            <span className="text-red-500 font-bold">جديد</span>
          </div>
        </div>

        {/* كرت الصفقات الجارية */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-blue-500 hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">الصفقات الجارية Pipeline</span>
              <span className="text-2xl font-black text-slate-800 text-blue-600">{stats.activePipeline}</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ClipboardList className="w-4.5 h-4.5 animate-pulse" />
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{stats.total > 0 ? Math.round((stats.activePipeline / stats.total) * 100) : 0}% قيد التفاوض والعمل</span>
            <span className="text-blue-500 font-bold">نشط</span>
          </div>
        </div>

        {/* كرت تم التنفيذ */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-green-500 hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">الصفقات الناجحة Won</span>
              <span className="text-2xl font-black text-emerald-600">{stats.done}</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0}% صفقات رابحة</span>
            <span className="text-emerald-500 font-bold">ناجح وكامل</span>
          </div>
        </div>

        {/* كرت لم يتم التنفيذ */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-slate-400 hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">الصفقات المغلقة Lost</span>
              <span className="text-2xl font-black text-slate-500">{stats.notDone}</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center">
              <XCircle className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{stats.total > 0 ? Math.round((stats.notDone / stats.total) * 100) : 0}% غير منفذة</span>
            <span className="text-slate-400 font-bold">مغلق</span>
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
              const empPending = empClients.filter(c => c.status !== 'نفذ' && c.status !== 'لم يتم التنفيذ').length;
              
              return (
                <div key={emp.email} className="bg-slate-50 p-4 border border-slate-150 rounded-xl relative overflow-hidden flex flex-col justify-between">
                  <div className="flex items-center gap-2.5 mb-2">
                    {emp.avatar ? (
                      <img 
                        src={emp.avatar} 
                        alt={emp.name} 
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-[10px] border border-red-100 uppercase flex-shrink-0">
                        {emp.name.substring(0, 2)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <span className="block font-bold text-xs text-slate-800 truncate leading-tight">{emp.name}</span>
                      <span className="block text-[9px] text-slate-450 truncate mt-0.5">{emp.email}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-center border-t border-slate-200/60 pt-2.5">
                    <div>
                      <span className="block text-[9px] text-slate-400">منفذ</span>
                      <span className="text-xs font-black text-emerald-600">{empDone}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-400">تحت العمل</span>
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
