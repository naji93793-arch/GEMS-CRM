/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Client, User } from './types';
import { INITIAL_CLIENTS } from './mockData';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Pipeline from './components/Pipeline';
import ClientForm from './components/ClientForm';
import Reports from './components/Reports';
import AdminPanel from './components/AdminPanel';
import TeamChat from './components/TeamChat';
import { Download, Laptop, FileDown, Calendar, AlertCircle } from 'lucide-react';

export default function App() {
  // حساب المستخدم الحالي
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // قائمة العملاء من التخزين المحلي أو النموذج الأولي الافتراضي
  const [clients, setClients] = useState<Client[]>([]);

  // التبويب النشط حالياً
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // تحميل البيانات المسبقة وبيئة الأمان عند الإقلاع
  useEffect(() => {
    // 1. فحص توفر مستخدم نشط في الجلسة للحفاظ على تسجيل الدخول
    const storedUser = localStorage.getItem('gems_crm_user');
    const storedAdmins = localStorage.getItem('gems_crm_admin_emails')
      ? JSON.parse(localStorage.getItem('gems_crm_admin_emails')!)
      : ['saadabugabl@gmail.com', 'naji93793@gmail.com'];

    if (storedUser) {
      try {
        const parsed: User = JSON.parse(storedUser);
        // مزامنة الصلاحية تفادياً لأي تغيير من لوحة التحكم للمدير
        if (storedAdmins.includes(parsed.email.toLowerCase())) {
          parsed.role = 'admin';
        } else {
          parsed.role = 'employee';
        }
        setCurrentUser(parsed);
      } catch {
        localStorage.removeItem('gems_crm_user');
      }
    }

    // 2. تحميل العملاء الحاليين
    const storedClients = localStorage.getItem('gems_crm_clients');
    if (storedClients) {
      try {
        setClients(JSON.parse(storedClients));
      } catch {
        setClients(INITIAL_CLIENTS);
        localStorage.setItem('gems_crm_clients', JSON.stringify(INITIAL_CLIENTS));
      }
    } else {
      setClients(INITIAL_CLIENTS);
      localStorage.setItem('gems_crm_clients', JSON.stringify(INITIAL_CLIENTS));
    }
  }, []);

  // التعامل مع نجاح الدخول والأمان
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('gems_crm_user', JSON.stringify(user));
  };

  // معالج تسجيل الخروج
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('gems_crm_user');
    setActiveTab('dashboard');
  };

  // إضافة عميل جديد لقاعدة البيانات وترتيبه
  const handleAddClient = (newClient: Client) => {
    const updated = [newClient, ...clients];
    setClients(updated);
    localStorage.setItem('gems_crm_clients', JSON.stringify(updated));
  };

  // تعديل وتحديث بيانات عميل حالي
  const handleUpdateClient = (updatedClient: Client) => {
    const updated = clients.map(c => c.id === updatedClient.id ? updatedClient : c);
    setClients(updated);
    localStorage.setItem('gems_crm_clients', JSON.stringify(updated));
  };

  // حذف عميل من المحفظة تماماً
  const handleDeleteClient = (id: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا العميل من نظام GEMS تماماً؟')) {
      const updated = clients.filter(c => c.id !== id);
      setClients(updated);
      localStorage.setItem('gems_crm_clients', JSON.stringify(updated));
    }
  };

  // تصدير وتحميل شيت البيانات الفعلي كـ ملف CSV متكامل يطابق أعمدة Excel
  const exportToExcelFormat = () => {
    try {
      // فقط البيانات التي يملك المستخدم صلاحية رؤيتها
      const allowedData = clients.filter(client => {
        return currentUser?.role === 'admin' || client.ownerEmail === currentUser?.email;
      });

      // صياغة السطر التعريفي للأعمدة باللغة العربية والانجليزية لمطابقة الشيت الأصلي تماماً
      const headers = [
        'معرف العميل (Client ID)',
        'اسم العميل (Client Name)',
        'اسم الشركة (Company Name)',
        'رقم التليفون (Phone)',
        'الإمارة (Emirate)',
        'إفادة العميل (Client Feedback)',
        'إفادة الشريك (Partner Feedback)',
        'الحالة (Status)',
        'تاريخ إضافة العميل (Add Date)',
        'آخر تواصل (Last Contact)',
        'موعد المتابعة القادمة (Next Followup)',
        'درجة اهتمام العميل (Interest Level)',
        'عدد مرات التواصل (Contact Count)',
        'سبب عدم التنفيذ (Not Done Reason)',
        'المسؤول عن العميل (Owner)',
        'بريد المسؤول (Owner Email)'
      ];

      const csvRows = [headers.join(',')];

      allowedData.forEach(c => {
        const values = [
          `"${c.id}"`,
          `"${c.name.replace(/"/g, '""')}"`,
          `"${c.company.replace(/"/g, '""')}"`,
          `"${c.phone}"`,
          `"${c.emirate}"`,
          `"${(c.clientFeedback || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
          `"${(c.partnerFeedback || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
          `"${c.status}"`,
          `"${c.addDate || ''}"`,
          `"${c.lastContact || ''}"`,
          `"${c.nextFollowup || ''}"`,
          `"${c.interestLevel || ''}"`,
          c.contactCount || 0,
          `"${(c.notDoneReason || '').replace(/"/g, '""')}"`,
          `"${c.owner}"`,
          `"${c.ownerEmail}"`
        ];
        csvRows.push(values.join(','));
      });

      const csvContent = '\ufeff' + csvRows.join('\n'); // استخدام BOM لضمان عرض الحروف العربية بشكل صحيح في Excel
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `GEMS_CRM_Data_Export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('خطأ في تصدير البيانات: ', err);
      alert('حدث خطأ أثناء محاولة تصدير ملف الإكسيل، يرجى المحاولة لاحقاً.');
    }
  };

  // إذا لم يسجل الدخول بعد
  if (!currentUser) {
    return <Login onLoginSuccess={handleLogin} />;
  }

  // عرض تبويب المحتوى النشط
  const renderActiveContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={currentUser} clients={clients} />;
      case 'pipeline':
        return (
          <Pipeline
            user={currentUser}
            clients={clients}
            onUpdateClient={handleUpdateClient}
            onNavigateToAdd={() => setActiveTab('add-client')}
            onDeleteClient={handleDeleteClient}
          />
        );
      case 'add-client':
        return (
          <ClientForm
            user={currentUser}
            clients={clients}
            onAddClient={handleAddClient}
            setActiveTab={setActiveTab}
          />
        );
      case 'reports':
        return <Reports user={currentUser} />;
      case 'admin-panel':
        return <AdminPanel user={currentUser} clients={clients} />;
      case 'team-chat':
        return <TeamChat user={currentUser} />;
      default:
        return <Dashboard user={currentUser} clients={clients} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col lg:flex-row-reverse" dir="rtl">
      
      {/* القائمة الجانبية الذكية للنظام */}
      <Sidebar
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onUserUpdate={(updated) => {
          setCurrentUser(updated);
          localStorage.setItem('gems_crm_user', JSON.stringify(updated));
        }}
      />

      {/* المحتوى الرئيسي */}
      <div className="flex-grow flex flex-col min-w-0">
        
        {/* شريط الإجراءات والبحث العلوي للشاشات الكبيرة */}
        <header className="bg-white border-b border-slate-150 h-16 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="text-[11px] bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded-md hidden md:inline-block">
              نظام GEMS الذكي
            </span>
            <span className="text-xs text-slate-505 dark:text-slate-450 hidden lg:inline-block">
              التوقيت المحلي: {new Date().toLocaleDateString('ar-AE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* زر تصدير الإكسيل السريع لمزامنة التعديلات مع الشيت الأصلي */}
            <button
              onClick={exportToExcelFormat}
              className="py-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition duration-150 flex items-center gap-2 shadow-xs cursor-pointer"
              title="تصدير شيت العملاء الحالي بما يطابق Book1_3.xlsx"
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden sm:inline">تحميل ملف البيانات Excel (CSV)</span>
            </button>
            
            <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>
            
            <div className="text-xs text-slate-500 font-medium">
              مرحباً، <strong className="text-slate-800">{currentUser.name}</strong>
            </div>
          </div>
        </header>

        {/* عرض المحتوى مع المحاذاة من اليمين للشاشات الكبيرة */}
        <main className="flex-grow p-4 lg:p-8 lg:mr-64 transition-all duration-200">
          {renderActiveContent()}
        </main>

        {/* سطر الحقوق في الأسفل */}
        <footer className="py-4 text-center text-slate-400 text-xs border-t border-slate-200 bg-white mr-0 lg:mr-64">
          &copy; {new Date().getFullYear()} GEMS International CRM والمستند الفعلي لملف Book1_3.xlsx. جميع الحقوق محفوظة.
        </footer>

      </div>
    </div>
  );
}
