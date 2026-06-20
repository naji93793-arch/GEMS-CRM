/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Client, User } from '../types';
import { USERS } from '../mockData';
import { 
  Building2, Phone, MapPin, Calendar, Star, HelpCircle, Search, 
  ChevronRight, PlusCircle, PenSquare, ArrowLeftRight, Trash2, Check,
  AlertTriangle, PhoneCall, CheckCircle2, MessageSquare, AlertCircle, Printer, FileText
} from 'lucide-react';
import { GemsLogoSVG } from './Login';


interface PipelineProps {
  user: User;
  clients: Client[];
  onUpdateClient: (updatedClient: Client) => void;
  onNavigateToAdd: () => void;
  onDeleteClient: (id: string) => void;
}

export default function Pipeline({ user, clients, onUpdateClient, onNavigateToAdd, onDeleteClient }: PipelineProps) {
  // الحالات والبحث والفلاتر
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmirate, setSelectedEmirate] = useState('all');
  const [selectedInterest, setSelectedInterest] = useState('all');
  const [selectedOwnerEmail, setSelectedOwnerEmail] = useState('all');

  // حالة طباعة وتحميل قائمة معينة كـ PDF
  const [printStage, setPrintStage] = useState<'العملاء المحتملون' | 'الفرص' | 'المؤهلون' | 'تقديم العرض' | 'التفاوض' | 'نفذ' | 'لم يتم التنفيذ' | null>(null);

  // العميل المختار للتعديل التفصيلي
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [showReasonField, setShowReasonField] = useState(false);

  // تصفية البيانات مع مراعاة أمان الأسطر (Row-Level Security) والفلاتر المطبقة
  const processedClients = useMemo(() => {
    return clients.filter(client => {
      // 1. فحص الأمان: الموظف يرى فقط عملائه، المشرف يرى الكل
      const matchesSecurity = user.role === 'admin' || client.ownerEmail === user.email;
      if (!matchesSecurity) return false;

      // 2. البحث النصي مرن (الاسم، الشركة، رقم الهاتف، أو الـ ID)
      const matchesSearch = 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm);

      // 3. فلتر الإمارة
      const normalizedSel = selectedEmirate.trim().toLowerCase();
      const matchesEmirate = 
        normalizedSel === 'all' || 
        normalizedSel === '' || 
        normalizedSel === 'الكل' || 
        (client.emirate && client.emirate.toLowerCase().includes(normalizedSel));

      // 4. فلتر درجة الاهتمام
      const matchesInterest = selectedInterest === 'all' || client.interestLevel === selectedInterest;

      // 5. فلتر المشرف للموظف المسؤول
      const matchesOwner = user.role !== 'admin' || selectedOwnerEmail === 'all' || client.ownerEmail === selectedOwnerEmail;

      return matchesSearch && matchesEmirate && matchesInterest && matchesOwner;
    });
  }, [clients, user, searchTerm, selectedEmirate, selectedInterest, selectedOwnerEmail]);

  // تقسيم العملاء إلى الأعمدة السبعة الخاصة بالـ Pipeline
  const columns = useMemo(() => {
    return {
      'العملاء المحتملون': processedClients.filter(c => c.status === 'العملاء المحتملون'),
      'الفرص': processedClients.filter(c => c.status === 'الفرص'),
      'المؤهلون': processedClients.filter(c => c.status === 'المؤهلون'),
      'تقديم العرض': processedClients.filter(c => c.status === 'تقديم العرض'),
      'التفاوض': processedClients.filter(c => c.status === 'التفاوض'),
      'نفذ': processedClients.filter(c => c.status === 'نفذ'),
      'لم يتم التنفيذ': processedClients.filter(c => c.status === 'لم يتم التنفيذ'),
    };
  }, [processedClients]);

  // الـ Emirates الفريدة المتاحة للفلترة
  const emiratesList = useMemo(() => {
    return Array.from(new Set(clients.map(c => c.emirate))).filter(Boolean);
  }, [clients]);

  // مسؤولي المبيعات المتاحين لفلتر المشرف
  const salespeopleList = useMemo(() => {
    const rawUsers = localStorage.getItem('gems_crm_users_db');
    const allUsers: User[] = rawUsers ? JSON.parse(rawUsers) : USERS;
    const isNajiCurrentUser = user.email.toLowerCase() === 'naji93793@gmail.com' || user.username.toLowerCase().includes('naji');
    return allUsers.filter(u => {
      const isNajiAcc = u.email.toLowerCase() === 'naji93793@gmail.com' || u.username.toLowerCase().includes('naji');
      return u.role === 'employee' && (isNajiCurrentUser || !isNajiAcc);
    });
  }, [user]);

  // بدء التعديل السريع لكرت عميل
  const handleOpenEdit = (client: Client) => {
    setEditingClient({ ...client });
    setShowReasonField(client.status === 'لم يتم التنفيذ');
  };

  // حفظ التعديلات وحفظها بالحالة الشاملة بالتطبيق
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    // التحقق من اكتمال البيانات الأساسية كأول حركة تفصيلية
    if (!editingClient.phone || editingClient.phone.trim() === '') {
      alert('تنبيه: يرجى كتابة رقم هاتف العميل للتواصل والمتابعة.');
      return;
    }
    if (!editingClient.emirate || editingClient.emirate.trim() === '') {
      alert('تنبيه: يرجى تحديد إمارة العميل الجغرافية لتصنيف الصفقات.');
      return;
    }

    // التحقق من الحقول
    if (editingClient.status === 'لم يتم التنفيذ' && !editingClient.notDoneReason?.trim()) {
      alert('الرجاء تعبئة سبب عدم التنفيذ للشفافية وتحديث التقارير.');
      return;
    }

    onUpdateClient(editingClient);
    setEditingClient(null);
  };

  // نقل سريع للعميل بين المراحل مباشرة من شاشة الكرت
  const handleQuickStatusMove = (client: Client, newStatus: 'العملاء المحتملون' | 'الفرص' | 'المؤهلون' | 'تقديم العرض' | 'التفاوض' | 'نفذ' | 'لم يتم التنفيذ') => {
    // التحقق من استكمال البيانات المسبقة كأول حركة نقل
    if (!client.phone || client.phone.trim() === '' || !client.emirate || client.emirate.trim() === '') {
      alert('تنبيه: يتوجب عليك استكمال بيانات هذا العميل أولاً (رقم الهاتف، الإمارة، وملاحظات المتابعة القادمة) لإتمام أول حركة نقل وتحديث حالته بنجاح!');
      handleOpenEdit(client);
      return;
    }

    const updated = { ...client, status: newStatus };
    if (newStatus === 'لم يتم التنفيذ') {
      // إجبار إعطاء سبب بفتحه في نافذة التعديل التفصيلية لضمان عدم وجود Placeholders مجهولة
      handleOpenEdit(client);
    } else {
      onUpdateClient(updated);
    }
  };

  return (
    <div className="space-y-6 font-sans pb-8" dir="rtl">
      
      {/* شريط الإجراءات والبحث المتقدم */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-850">لوحة المبيعات التفاعلية "Pipeline"</h2>
            <p className="text-slate-400 text-xs">رتب العملاء، عدل الإفادات والتواريخ، وحرك صفقاتك بسلاسة بأسلوب محفظة GEMS الذكية.</p>
          </div>
          <button
            onClick={onNavigateToAdd}
            className="px-5 py-2.5 bg-red-650 hover:bg-red-750 text-white text-xs font-bold rounded-xl shadow-md transition duration-155 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إضافة عميل جديد للمحفظة</span>
          </button>
        </div>

        {/* فلاتر معقدة وسريعة متجاوبة مع الهاتف والتابلت واللابتوب */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
          
          {/* محرك البحث الذكي السريع */}
          <div className="relative">
            <span className="absolute right-3 top-3.5 text-slate-450">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث بالاسم، الشركة، رقم الهاتف..."
              className="w-full text-right pr-9 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
            />
          </div>

          {/* تصفية حسب الإمارة */}
          <div className="relative">
            <input
              type="text"
              list="filter-emirates-suggestions"
              value={selectedEmirate === 'all' ? '' : selectedEmirate}
              onChange={(e) => setSelectedEmirate(e.target.value || 'all')}
              placeholder="فلترة بالإمارة (اكتب أو اختر)..."
              className="w-full text-right px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white placeholder:text-slate-400"
            />
            <datalist id="filter-emirates-suggestions">
              <option value="الكل" />
              {emiratesList.map(em => (
                <option key={em} value={em} />
              ))}
              <option value="دبي" />
              <option value="أبوظبي" />
              <option value="الشارقة" />
              <option value="عجمان" />
              <option value="رأس الخيمة" />
              <option value="الفجيرة" />
              <option value="أم القيوين" />
            </datalist>
          </div>

          {/* تصفية حسب المبيعات والجدية */}
          <select
            value={selectedInterest}
            onChange={(e) => setSelectedInterest(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-600 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white cursor-pointer"
          >
            <option value="all">كل درجات الاهتمام</option>
            <option value="عالي">اهتمام عالي ⭐⭐⭐</option>
            <option value="متوسط">اهتمام متوسط ⭐⭐</option>
            <option value="منخفض">اهتمام منخفض ⭐</option>
          </select>

          {/* تصفية الموظفين للمشرف فقط */}
          {user.role === 'admin' ? (
            <select
              value={selectedOwnerEmail}
              onChange={(e) => setSelectedOwnerEmail(e.target.value)}
              className="bg-red-50/50 border border-red-150 text-xs text-red-800 rounded-xl px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white cursor-pointer"
            >
              <option value="all">تقارير كل الموظفين (المشرف)</option>
              {salespeopleList.map(sp => (
                <option key={sp.email} value={sp.email}>{sp.name}</option>
              ))}
            </select>
          ) : (
            <div className="bg-slate-100 border border-slate-200 text-xs text-slate-550 rounded-xl px-3 py-2.5 font-bold text-center truncate flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              <span>نظام حماية البيانات والخصوصية RLS نشط</span>
            </div>
          )}

        </div>

      </div>

      {/* لوحات الـ Pipeline (3 أعمدة عريضة متجاوبة) */}
      {/* مصفوفة المراحل السبعة - مسار المبيعات التفاعلي (CRM Kanban Board) */}
      <p className="text-[11px] text-slate-400 -mt-2">← تصفح المراحل بسحب الشاشة أفقياً يميناً ويساراً للتنقل الكامل ومتابعة نمو الصفقات</p>
      
      <div className="flex gap-4 overflow-x-auto pb-6 pt-1 select-none scrollbar-thin max-w-full">
        {(['العملاء المحتملون', 'الفرص', 'المؤهلون', 'تقديم العرض', 'التفاوض', 'نفذ', 'لم يتم التنفيذ'] as const).map(stageKey => {
          let badgeColor = '';
          let dotColor = '';
          let stageTitle = '';

          if (stageKey === 'العملاء المحتملون') {
            stageTitle = '1. العملاء المحتملون (Leads)';
            dotColor = 'bg-red-500';
            badgeColor = 'bg-red-50 text-red-700 border border-red-200/50';
          } else if (stageKey === 'الفرص') {
            stageTitle = '2. الفرص (Opportunities)';
            dotColor = 'bg-blue-500';
            badgeColor = 'bg-blue-50 text-blue-700 border border-blue-200/50';
          } else if (stageKey === 'المؤهلون') {
            stageTitle = '3. المؤهلون (Qualified)';
            dotColor = 'bg-amber-500';
            badgeColor = 'bg-amber-50 text-amber-700 border border-amber-200/50';
          } else if (stageKey === 'تقديم العرض') {
            stageTitle = '4. تقديم العرض (Proposition)';
            dotColor = 'bg-indigo-500';
            badgeColor = 'bg-indigo-50 text-indigo-700 border border-indigo-200/50';
          } else if (stageKey === 'التفاوض') {
            stageTitle = '5. التفاوض (Negotiation)';
            dotColor = 'bg-purple-500';
            badgeColor = 'bg-purple-50 text-purple-700 border border-purple-200/50';
          } else if (stageKey === 'نفذ') {
            stageTitle = '6. تم البيع والتعاقد (Won)';
            dotColor = 'bg-emerald-500 animate-pulse';
            badgeColor = 'bg-emerald-50 text-emerald-700 border border-emerald-200/50';
          } else {
            stageTitle = '7. الصفقات الملغاة (Lost)';
            dotColor = 'bg-slate-400';
            badgeColor = 'bg-slate-50 text-slate-600 border border-slate-200';
          }

          const stageClients = columns[stageKey] || [];

          return (
            <div 
              key={stageKey}
              className="w-[285px] md:w-[320px] flex-shrink-0 bg-slate-50 p-4 border border-gray-200 shadow-sm rounded-xl flex flex-col min-h-[500px]"
            >
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-200">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor}`}></div>
                  <h3 className="font-extrabold text-slate-800 text-[11px] truncate" title={stageTitle}>{stageTitle}</h3>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => setPrintStage(stageKey)}
                    className="p-1 bg-white hover:bg-slate-150 text-slate-500 hover:text-red-600 border border-slate-200 rounded-lg cursor-pointer transition flex items-center justify-center"
                    title={`طباعة تقرير ${stageTitle} كـ PDF`}
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${badgeColor}`}>
                    {stageClients.length} عميل
                  </span>
                </div>
              </div>

              <div className="space-y-3 flex-grow overflow-y-auto max-h-[600px] scrollbar-thin">
                {stageClients.map(client => (
                  <ClientCard 
                    key={client.id} 
                    client={client} 
                    onEdit={handleOpenEdit} 
                    onStatusMove={handleQuickStatusMove}
                    onDelete={onDeleteClient}
                  />
                ))}
                {stageClients.length === 0 && <EmptyColumnState />}
              </div>
            </div>
          );
        })}
      </div>

      {/* نافذة التعديل السريع المنبثقة (Edit Client Modal) */}
      {editingClient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto text-right font-sans">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
            
            {/* رأس النافذة */}
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-md inline-block mb-1">
                  تحديث ملف المبيعات والأمان
                </span>
                <h3 className="text-base font-extrabold text-slate-800">بيانات العميل: {editingClient.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingClient(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-650 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* النموذج الداخلي */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 flex-grow">
              
              {(!editingClient.phone || editingClient.phone.trim() === '' || !editingClient.emirate || editingClient.emirate.trim() === '') && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3.5 text-xs font-bold leading-relaxed flex items-center gap-2">
                  <span className="text-base bounce-animation">⚠️</span>
                  <span>تنبيه: هذا العميل يحتاج لاستكمال البيانات التفصيلية (رقم الهاتف، إمارة العميل، وتواريخ المتابعة) لإتمام أول حركة ومتابعة حالته بنجاح!</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 text-[11px] font-bold mb-1">اسم العميل بالكامل</label>
                  <input
                    type="text"
                    value={editingClient.name}
                    onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                    className="w-full text-right px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-[11px] font-bold mb-1">اسم الشركة التجارية</label>
                  <input
                    type="text"
                    value={editingClient.company}
                    onChange={(e) => setEditingClient({ ...editingClient, company: e.target.value })}
                    className="w-full text-right px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-600 text-[11px] font-bold mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={editingClient.phone}
                    onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                    className="w-full ltr-input text-right px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-[11px] font-bold mb-1">الإمارة الجغرافية</label>
                  <input
                    type="text"
                    list="edit-emirates-suggestions"
                    value={editingClient.emirate}
                    onChange={(e) => setEditingClient({ ...editingClient, emirate: e.target.value })}
                    placeholder="اكتب الإمارة أو اختر..."
                    className="w-full text-right px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                  <datalist id="edit-emirates-suggestions">
                    <option value="دبي" />
                    <option value="أبوظبي" />
                    <option value="الشارقة" />
                    <option value="عجمان" />
                    <option value="رأس الخيمة" />
                    <option value="الفجيرة" />
                    <option value="أم القيوين" />
                  </datalist>
                </div>
                <div>
                  <label className="block text-slate-600 text-[11px] font-bold mb-1">درجة اهتمام العميل</label>
                  <select
                    value={editingClient.interestLevel}
                    onChange={(e) => setEditingClient({ ...editingClient, interestLevel: e.target.value as any })}
                    className="w-full text-right px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
                  >
                    <option value="عالي">اهتمام عالي ⭐⭐⭐</option>
                    <option value="متوسط">اهتمام متوسط ⭐⭐</option>
                    <option value="منخفض">اهتمام منخفض ⭐</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 text-[11px] font-bold mb-1">إفادة العميل (Client Feedback)</label>
                  <textarea
                    rows={2}
                    value={editingClient.clientFeedback}
                    onChange={(e) => setEditingClient({ ...editingClient, clientFeedback: e.target.value })}
                    placeholder="ما الذي أفاده العميل خلال زيارته أو المكالمة الأخيرة؟"
                    className="w-full text-right px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  ></textarea>
                </div>
                <div>
                  <label className="block text-slate-600 text-[11px] font-bold mb-1">إفادة الشريك / الإجراء المتخذ</label>
                  <textarea
                    rows={2}
                    value={editingClient.partnerFeedback}
                    onChange={(e) => setEditingClient({ ...editingClient, partnerFeedback: e.target.value })}
                    placeholder="ما الإجراء التالي الذي ستتخذه كرجل مبيعات لدى GEMS؟"
                    className="w-full text-right px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  ></textarea>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-600 text-[11px] font-bold mb-1">عدد مرات التواصل</label>
                  <input
                    type="number"
                    min={0}
                    value={editingClient.contactCount}
                    onChange={(e) => setEditingClient({ ...editingClient, contactCount: parseInt(e.target.value) || 0 })}
                    className="w-full text-right px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-[11px] font-bold mb-1">تاريخ آخر تواصل</label>
                  <input
                    type="date"
                    value={editingClient.lastContact}
                    onChange={(e) => setEditingClient({ ...editingClient, lastContact: e.target.value })}
                    className="w-full text-right px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-[11px] font-bold mb-1">تاريخ المتابعة القادمة</label>
                  <input
                    type="date"
                    value={editingClient.nextFollowup}
                    onChange={(e) => setEditingClient({ ...editingClient, nextFollowup: e.target.value })}
                    className="w-full text-right px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
              </div>

              {/* مرحلة الصفقة مع إضافة سبب عدم التنفيذ */}
              <div className="border-t border-slate-100 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 text-[11px] font-bold mb-1">المرحلة الحالية للصفقة</label>
                    <select
                      value={editingClient.status}
                      onChange={(e) => {
                        const nextStatus = e.target.value as any;
                        setShowReasonField(nextStatus === 'لم يتم التنفيذ');
                        setEditingClient({ 
                          ...editingClient, 
                          status: nextStatus,
                          notDoneReason: nextStatus === 'لم يتم التنفيذ' ? editingClient.notDoneReason || '' : ''
                        });
                      }}
                      className="w-full text-right px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
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

                  {showReasonField && (
                    <div>
                      <label className="block text-red-600 text-[11px] font-bold mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>سبب عدم التنفيذ (إلزامي للتقارير)</span>
                      </label>
                      <input
                        type="text"
                        value={editingClient.notDoneReason || ''}
                        onChange={(e) => setEditingClient({ ...editingClient, notDoneReason: e.target.value })}
                        placeholder="مثال: رفض الإدارة للميزانية، اهتمام غير حقيقي"
                        className="w-full text-right px-3 py-2 bg-red-50/40 border border-red-200 text-red-950 font-medium rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* أزرار الحفظ السريعة وسحب البيانات لـ Google Sheets */}
              <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold rounded-xl text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md shadow-red-600/10 cursor-pointer"
                >
                  حفظ التعديلات وتحديث لقاعدة البيانات
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* نافذة معاينة وطباعة تقارير المخزن الرسمية PDF */}
      {printStage && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto font-sans no-print text-right" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-5xl w-full p-8 flex flex-col my-8">
            
            {/* أزرار التشغيل العلوية */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-6 border-b border-slate-200 gap-4 no-print">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-650 animate-ping"></span>
                  <span>معاينة المستند الرسمي وتجهيز ملف الـ PDF</span>
                </h3>
                <p className="text-slate-400 text-[10px] mt-0.5">
                  سيتم تطبيق القالب الرسمي لشركة GEMS تلقائياً عند النقر على إصدار PDF.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-750 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-600/10 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>إصدار وحفظ كـ PDF</span>
                </button>
                <button
                  onClick={() => setPrintStage(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition"
                >
                  إلغاء وإغلاق
                </button>
              </div>
            </div>

            {/* المستند الرسمي القابل للطباعة والمطابقة */}
            <div id="printable-area" className="flex-grow p-8 border border-slate-300 bg-white rounded-xl relative text-slate-900 shadow-inner">
              
              {/* العلامة المائية الرسمية الفخمة */}
              <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center pointer-events-none select-none overflow-hidden">
                <div className="scale-150">
                  <GemsLogoSVG className="w-[450px] h-[450px]" />
                </div>
              </div>

              {/* ورقة التقرير */}
              <div className="relative z-10 space-y-6">
                
                {/* رأس الورقة الرسمية */}
                <div className="flex justify-between items-start pb-4 border-b-2 border-red-600">
                  <div className="flex items-center gap-4">
                    <GemsLogoSVG className="w-14 h-14" />
                    <div>
                      <h1 className="text-lg font-black text-red-600">مجموعة شركات GEMS للحلول المتكاملة</h1>
                      <p className="text-[10px] text-slate-500 font-bold">إدارة علاقات العملاء الرقمية ومتابعة المشاريع (GEMS CRM)</p>
                    </div>
                  </div>
                  <div className="text-left font-mono text-[9px] text-slate-400 leading-normal">
                    <p>المصدر المرجعي: BOOK1_3_DB</p>
                    <p>تاريخ الاستخراج: {new Date().toLocaleDateString('ar-AE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p>رقم المطابقة الرقمية: CRM-RPT-{(Math.random() * 100000).toFixed(0)}</p>
                  </div>
                </div>

                {/* شارة المستند وحالته */}
                <div className="text-center py-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <h2 className="text-base font-black text-slate-800">
                    {printStage === 'العملاء المحتملون' && 'تقرير العملاء وفئة الاهتمام الأولية (Leads)'}
                    {printStage === 'الفرص' && 'تقرير الفرص البيعية المؤكدة (Opportunities)'}
                    {printStage === 'المؤهلون' && 'تقرير العملاء المؤهلين مالياً وتمويلياً (Qualified)'}
                    {printStage === 'تقديم العرض' && 'تقرير عروض الأسعار والمواصفات المقترحة (Proposition)'}
                    {printStage === 'التفاوض' && 'سجل المفاوضات ومراجعة العقود والميزانيات (Negotiation)'}
                    {printStage === 'نفذ' && 'كشف الصفقات والتعاقدات البيعية الناجحة'}
                    {printStage === 'لم يتم التنفيذ' && 'سجل العملاء المرفوضين (حالة عدم التنفيذ والإلغاء)'}
                  </h2>
                  <p className="text-[10px] text-slate-455">
                    الجهة المصدرة: <strong>لوحة تحكم {user.name} ({user.email})</strong> — نظام مراجعة أداء المبيعات
                  </p>
                </div>

                {/* جدول البيانات الرئيسي */}
                <div className="overflow-x-auto border border-slate-300 rounded-xl">
                  <table className="w-full text-right text-[11px] border-collapse">
                    <thead className="bg-[#f8fafc] border-b border-slate-300 text-slate-700 font-bold">
                      <tr>
                        <th className="px-4 py-3 border-l border-slate-200">العميل والمؤسسة</th>
                        <th className="px-4 py-3 border-l border-slate-200">الهاتف</th>
                        <th className="px-4 py-3 border-l border-slate-200">الإمارة</th>
                        <th className="px-4 py-3 border-l border-slate-200 text-center">التاريخ ومعدل الاتصالات</th>
                        <th className="px-4 py-3 border-l border-slate-200 text-center">أهمية العميل</th>
                        <th className="px-4 py-3 border-l border-slate-200">آخر إفادة متابعة مع الشركاء</th>
                        {printStage === 'لم يتم التنفيذ' && <th className="px-4 py-3 text-red-650 bg-red-50/20 font-black">سبب عدم التنفيذ</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {processedClients.filter(c => c.status === printStage).length === 0 ? (
                        <tr>
                          <td colSpan={printStage === 'لم يتم التنفيذ' ? 7 : 6} className="text-center py-8 text-slate-400">
                            لا يوجد حالياً أية عملاء مسجلين بهذه القائمة يتطابقون مع الفلاتر المحددة.
                          </td>
                        </tr>
                      ) : (
                        processedClients.filter(c => c.status === printStage).map(c => (
                          <tr key={c.id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 border-l border-slate-200">
                              <div className="font-extrabold text-slate-800">{c.name}</div>
                              <div className="text-[9px] text-slate-400 italic font-medium">{c.company}</div>
                            </td>
                            <td className="px-4 py-3 border-l border-slate-200 font-mono text-slate-650">{c.phone}</td>
                            <td className="px-4 py-3 border-l border-slate-200 font-bold">{c.emirate}</td>
                            <td className="px-4 py-3 border-l border-slate-200 text-center">
                              <div className="font-mono text-[10px]">{c.addDate}</div>
                              <div className="text-[9px] text-slate-455 mt-0.5">عدد مرات الاتصال: {c.contactCount}</div>
                            </td>
                            <td className="px-4 py-3 border-l border-slate-200 text-center font-bold text-amber-500">
                              {c.interestLevel === 'عالي' ? '⭐⭐⭐' : c.interestLevel === 'متوسط' ? '⭐⭐' : '⭐'}
                            </td>
                            <td className="px-4 py-3 border-l border-slate-200 leading-normal text-slate-600 max-w-xs">
                              <div><strong className="text-slate-800">إفادة العميل:</strong> {c.clientFeedback || 'لا يوجد'}</div>
                              <div className="mt-1"><strong className="text-slate-800">إفادة الشريك:</strong> {c.partnerFeedback || 'لا يوجد'}</div>
                            </td>
                            {printStage === 'لم يتم التنفيذ' && (
                              <td className="px-4 py-3 text-red-700 bg-red-50/10 font-bold border-r border-red-200">
                                {c.notDoneReason || 'مرفوض وغير محدد من الموظف'}
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ملخص إحصائي بأسفل المستند للمطابقة */}
                <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl flex justify-between items-center text-[10px] font-bold text-slate-600">
                  <span>إجمالي السجلات المصدرة: <strong className="text-slate-800 underline">{processedClients.filter(c => c.status === printStage).length} عميل مبيعات</strong></span>
                  <span>أمان المستند ورقابة الحساب: <strong className="text-emerald-700">مضمونة (SECURE_RLS)</strong></span>
                </div>

                {/* التوقيعات والاعتمادات الرسمية لشركة GEMS */}
                <div className="grid grid-cols-2 gap-8 pt-8 text-[11px] font-bold">
                  <div className="border border-dashed border-slate-350 p-4 rounded-xl text-center h-28 flex flex-col justify-between">
                    <span>إعداد مسؤول محفظة العملاء والتوقيع:</span>
                    <span className="font-mono text-[9px] text-slate-400">{user.name} ({user.email})</span>
                  </div>
                  <div className="border border-dashed border-slate-350 p-4 rounded-xl text-center h-28 flex flex-col justify-between">
                    <span>مراجعة قسم الرقابة وتدقيق الحسابات المعتمد:</span>
                    <span className="text-[9px] text-slate-450">مجموعة GEMS للمطابقة والتقارير والتدقيق</span>
                  </div>
                </div>

                {/* تذييل المستند السري */}
                <div className="text-center text-[9px] text-slate-400 pt-4 border-t border-slate-200 leading-normal">
                  هذا التقرير سري وخاص كلياً بشركة GEMS وموظفيها، وتطبق عليه سياسة أمن المعلومات ونظام GEMS CRM المدمج.
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

/* ------------------------------------- */
/*  مكون كرت العميل الفردي (Client Card)  */
/* ------------------------------------- */
interface ClientCardProps {
  key?: string;
  client: Client;
  onEdit: (client: Client) => void;
  onStatusMove: (client: Client, next: 'العملاء المحتملون' | 'الفرص' | 'المؤهلون' | 'تقديم العرض' | 'التفاوض' | 'نفذ' | 'لم يتم التنفيذ') => void;
  onDelete: (id: string) => void;
}

function ClientCard({ client, onEdit, onStatusMove, onDelete }: ClientCardProps) {
  const getInterestStars = (level: string) => {
    if (level === 'عالي') return '⭐⭐⭐';
    if (level === 'متوسط') return '⭐⭐';
    return '⭐';
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'العملاء المحتملون': return 'bg-red-50 text-red-700 border-red-200';
      case 'الفرص': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'المؤهلون': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'تقديم العرض': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'التفاوض': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'نفذ': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const isUrgent = useMemo(() => {
    if (client.status === 'نفذ' || client.status === 'لم يتم التنفيذ' || !client.nextFollowup) return false;
    const diff = new Date(client.nextFollowup).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days <= 3;
  }, [client]);

  return (
    <div className="bg-white p-4 border border-slate-200 rounded-xl hover:shadow-md hover:border-slate-350 transition-all duration-150 space-y-3 relative group">
      
      {/* سطر الـ ID والإجراءات ودرجة الجدية */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded-md">
          {client.id}
        </span>
        <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition">
          <span className="text-xs">{getInterestStars(client.interestLevel)}</span>
          <button
            onClick={() => onDelete(client.id)}
            title="حذف العميل"
            className="p-1 hover:text-red-650 text-slate-300 rounded hover:bg-slate-50 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* اسم العميل والشركة مع الصورة الشخصية للعميل */}
      <div className="flex items-start gap-2.5">
        {client.avatar ? (
          <img 
            src={client.avatar} 
            alt={client.name} 
            className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-slate-50 flex-shrink-0"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-black text-[11px] border border-red-100 uppercase flex-shrink-0">
            {client.name.substring(0, 2)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h4 className="font-extrabold text-slate-800 text-sm leading-snug truncate">{client.name}</h4>
          <div className="flex items-center gap-1 text-slate-450 text-xs mt-0.5">
            <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate block">{client.company}</span>
          </div>
        </div>
      </div>

      {/* تفاصيل الإقامة والهاتف والمسؤول */}
      <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-slate-150 pt-2 text-slate-500">
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-red-500" />
          <span>{client.emirate}</span>
        </div>
        <div className="flex items-center gap-1">
          <Phone className="w-3 h-3 text-slate-400" />
          <span className="truncate">{client.phone}</span>
        </div>
      </div>

      {/* إفادة العميل المختصرة */}
      {client.clientFeedback && (
        <p className="text-[10px] text-slate-600 bg-slate-50 p-2 rounded-lg line-clamp-2 border border-slate-150">
          <strong className="text-slate-800 block mb-0.5 text-[9px]">إفادة العميل المباشرة:</strong>
          {client.clientFeedback}
        </p>
      )}

      {/* المتابعة والشريك والمسؤول */}
      <div className="bg-slate-50/50 p-2 rounded-lg text-[10px] space-y-1 border border-slate-150">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">آخر اتصال ({client.contactCount || 0} مرات):</span>
          <span className="font-sans font-bold text-slate-650">{client.lastContact}</span>
        </div>
        {client.status !== 'نفذ' && client.status !== 'لم يتم التنفيذ' && (
          <div className="flex items-center justify-between border-t border-slate-150 pt-1">
            <span className="text-slate-400">المتابعة القادمة:</span>
            <span className={`font-sans font-bold flex items-center gap-1 ${isUrgent ? 'text-red-650 animate-pulse' : 'text-blue-600'}`}>
              <Calendar className="w-3 h-3" />
              {client.nextFollowup}
            </span>
          </div>
        )}
        {client.status === 'لم يتم التنفيذ' && client.notDoneReason && (
          <div className="flex items-center justify-between border-t border-red-100 pt-1 text-red-700 bg-red-50/40 p-1 rounded">
            <span>السبب:</span>
            <span className="font-bold truncate max-w-[120px]">{client.notDoneReason}</span>
          </div>
        )}
      </div>


      {/* تحريك المراحل وتحديث الكرت */}
      <div className="flex gap-2 pt-2 border-t border-slate-150 items-center justify-between">
        <button
          onClick={() => onEdit(client)}
          className="flex-grow py-1.5 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 text-slate-600 font-bold text-[10px] rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
        >
          <PenSquare className="w-3 h-3" />
          <span>تفاصيل وتعديل</span>
        </button>

        {/* نقل المرحلة السريعة */}
        <div className="flex items-center">
          <select
            value={client.status}
            onChange={(e) => onStatusMove(client, e.target.value as any)}
            className="text-[10px] font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 px-2 py-1.5 rounded-lg border border-slate-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-red-500"
            title="تحديث مرحلة الـ CRM"
          >
            <option value="العملاء المحتملون">1. عميل محتمل</option>
            <option value="الفرص">2. فرصة بيع</option>
            <option value="المؤهلون">3. مؤهل مالي</option>
            <option value="تقديم العرض">4. تقديم عرض</option>
            <option value="التفاوض">5. التفاوض</option>
            <option value="نفذ">6. بيع ناجح (Won)</option>
            <option value="لم يتم التنفيذ">7. ملغاة (Lost)</option>
          </select>
        </div>
      </div>

    </div>
  );
}

/* ------------------------------------- */
/* مكون الحالة الفارغة للوحة             */
/* ------------------------------------- */
function EmptyColumnState() {
  return (
    <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400 space-y-1 bg-white">
      <HelpCircle className="w-8 h-8 mx-auto stroke-1.5 text-slate-300" />
      <span className="block text-[11px] font-bold">لا يوجد عملاء حالياً</span>
      <span className="block text-[9px] text-slate-450 leading-normal">قم بتغيير الفلاتر أو سجل عميل جديد لتتبع عملائك ومبيعاتك.</span>
    </div>
  );
}
