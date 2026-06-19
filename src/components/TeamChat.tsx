/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { 
  Send, Search, Users, Trash2, Calendar, Smile, ThumbsUp, Tag, 
  AlertCircle, Image as ImageIcon, X, UserCheck, CheckCheck, 
  Sparkles, Paperclip, MessageSquare 
} from 'lucide-react';

interface ChatMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  senderUsername: string;
  senderRole: 'admin' | 'employee';
  text: string;
  timestamp: string;
  timeMs: number;
  badge?: 'مهم' | 'استفسار' | 'متابعة عاجلة' | 'مغلق' | 'عام';
  likes: string[];
  recipientEmail?: string; // 'all' or teammate email
  recipientName?: string;  // Name of the targeted member
  image?: string;          // base64 image data URL
}

interface TeamChatProps {
  user: User;
}

const AVATAR_COLORS: Record<string, string> = {
  'saadabugabl@gmail.com': 'bg-emerald-650 bg-emerald-600',
  'meeraelasanhory@icloud.com': 'bg-purple-650 bg-purple-600',
  'rehamhesham995@gmail.com': 'bg-pink-650 bg-pink-600',
  'ebiedayad1@gmail.com': 'bg-blue-650 bg-blue-600',
  'naji93793@gmail.com': 'bg-indigo-650 bg-indigo-600',
};

const getAvatarColor = (email: string) => {
  return AVATAR_COLORS[email.toLowerCase()] || 'bg-slate-600';
};

export default function TeamChat({ user }: TeamChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedBadge, setSelectedBadge] = useState<'مهم' | 'استفسار' | 'متابعة عاجلة' | 'مغلق' | 'عام'>('عام');
  const [selectedRecipient, setSelectedRecipient] = useState<string>('all'); // 'all' or email
  const [attachedImage, setAttachedImage] = useState<string>(''); // base64 string for chat image
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all'); // all, important, queries, mine, directed_to_me
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // تحميل وإعداد الدردشة
  useEffect(() => {
    loadMessages();
    
    // مزامنة تلقائية للدردشة والمشاركات كل ثانيتين لمنح العميل انطباع السرعة والدردشة الحية
    const interval = setInterval(() => {
      loadMessages();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // تمرير تلقائي دائم لأسفل التغذية والدردشة
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = () => {
    const raw = localStorage.getItem('gems_crm_team_chat');
    if (raw) {
      setMessages(JSON.parse(raw));
    } else {
      // رسائل ترحيبية وتوضيحية تأسيسية للنظام
      const initialMsgs: ChatMessage[] = [
        {
          id: 'init_1',
          senderName: 'سعد أبو جبل',
          senderEmail: 'saadabugabl@gmail.com',
          senderUsername: 'saad_gems',
          senderRole: 'admin',
          text: 'أهلاً بفريق العمل في نظام GEMS CRM المطور! مرحباً بكم في ساحة التنسيق السريع والدردشة النشطة المصممة بأسلوب الواتس اب.',
          timestamp: '10:00 ص',
          timeMs: Date.now() - 3600000 * 2,
          badge: 'عام',
          likes: [],
          recipientEmail: 'all',
          recipientName: 'الجميع'
        },
        {
          id: 'init_2',
          senderName: 'سعد أبو جبل',
          senderEmail: 'saadabugabl@gmail.com',
          senderUsername: 'saad_gems',
          senderRole: 'admin',
          text: 'يرجى من جميع موظفي المبيعات إضافة ومتابعة تواصلات العملاء مباشرة وتحديد مواعيد الاتصالات وتكثيف جهود المتابعة اليومية.',
          timestamp: '10:05 ص',
          timeMs: Date.now() - 3600000,
          badge: 'مهم',
          likes: [],
          recipientEmail: 'all',
          recipientName: 'الجميع'
        }
      ];
      localStorage.setItem('gems_crm_team_chat', JSON.stringify(initialMsgs));
      setMessages(initialMsgs);
    }
  };

  // معالجة اختيار ملف وصورة
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 2 ميجابايت.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAttachedImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // إرسال رسالة جديدة
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !attachedImage) return;

    const today = new Date();
    const timeStr = today.toLocaleTimeString('ar-AE', { hour: '2-digit', minute: '2-digit', hour12: true });

    // جلب قائمة زملائنا لمعالجة اسم المستهدف الموجه له
    const teammates = getOnlineTeammates();
    const targetedTeammate = teammates.find(t => t.email.toLowerCase() === selectedRecipient.toLowerCase());

    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      senderName: user.name,
      senderEmail: user.email,
      senderUsername: user.username,
      senderRole: user.role,
      text: inputText.trim(),
      timestamp: timeStr,
      timeMs: Date.now(),
      badge: selectedBadge !== 'عام' ? selectedBadge : undefined,
      likes: [],
      recipientEmail: selectedRecipient,
      recipientName: selectedRecipient === 'all' ? 'الجميع' : (targetedTeammate?.name || selectedRecipient),
      image: attachedImage || undefined
    };

    const updated = [...messages, newMsg];
    localStorage.setItem('gems_crm_team_chat', JSON.stringify(updated));
    setMessages(updated);
    setInputText('');
    setAttachedImage('');
    setSelectedBadge('عام');
    setSelectedRecipient('all');

    // تصفير مدخل الملف لتسهيل الرفع اللاحق
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // مسح كامل الدردشة (للصلاحيات الاستثنائية سعد أو ناجي الإدارة)
  const handleClearChat = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في تنظيف ومسح سجل دردشة فريق العمل بأكمله؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      const initialMsgs: ChatMessage[] = [
        {
          id: 'init_clear',
          senderName: user.name,
          senderEmail: user.email,
          senderUsername: user.username,
          senderRole: user.role,
          text: 'تم تنظيف سجل غرفة العمليات وبدء سجل دردشة وتنسيق جديد ومحدد للشركة.',
          timestamp: new Date().toLocaleTimeString('ar-AE', { hour: '2-digit', minute: '2-digit' }),
          timeMs: Date.now(),
          badge: 'عام',
          likes: [],
          recipientEmail: 'all',
          recipientName: 'الجميع'
        }
      ];
      localStorage.setItem('gems_crm_team_chat', JSON.stringify(initialMsgs));
      setMessages(initialMsgs);
    }
  };

  // تفعيل وإلغاء الإعجاب بالرسالة
  const handleToggleLike = (msgId: string) => {
    const updated = messages.map(msg => {
      if (msg.id === msgId) {
        const hasLiked = msg.likes.includes(user.email);
        const newLikes = hasLiked 
          ? msg.likes.filter(em => em !== user.email)
          : [...msg.likes, user.email];
        return { ...msg, likes: newLikes };
      }
      return msg;
    });
    localStorage.setItem('gems_crm_team_chat', JSON.stringify(updated));
    setMessages(updated);
  };

  // جلب كافة الموظفين المتواجدين (من localStorage مع إخفاء ناجي التام عن أي واجهة لغير ناجي)
  const getOnlineTeammates = () => {
    const rawUsers = localStorage.getItem('gems_crm_users_db');
    const dbUsers: User[] = rawUsers ? JSON.parse(rawUsers) : [];
    
    const isNajiLogged = user.email.toLowerCase() === 'naji93793@gmail.com';
    
    // تصفية ناجي من القائمة تماماً لغير ناجي، وجعل حساب سعد هو البارز كإدارة وحيد للجميع
    return dbUsers.filter(u => {
      const isNajiAcc = u.username === 'naji_gems' || u.username === 'naji_sales' || u.email.toLowerCase() === 'naji93793@gmail.com';
      return !isNajiAcc || isNajiLogged;
    });
  };

  // تصفية الرسائل النشطة بناء على البحث وفلاتر العرض المتعددة
  const filteredMessages = messages.filter(msg => {
    // 1. فلتر البحث النصي في محتوى الرسالة أو اسم المرسل أو الموجه له
    const matchesSearch = 
      msg.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
      msg.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (msg.recipientName && msg.recipientName.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    // 2. فلاتر التبويبات العلوية
    if (activeFilter === 'important') return msg.badge === 'مهم' || msg.badge === 'متابعة عاجلة';
    if (activeFilter === 'queries') return msg.badge === 'استفسار';
    if (activeFilter === 'mine') return msg.senderEmail.toLowerCase() === user.email.toLowerCase();
    if (activeFilter === 'directed_to_me') {
      return msg.recipientEmail && msg.recipientEmail.toLowerCase() === user.email.toLowerCase();
    }

    return true;
  });

  const isNajiActive = user.email.toLowerCase() === 'naji93793@gmail.com';
  const isSaadActive = user.email.toLowerCase() === 'saadabugabl@gmail.com';
  const canClearAll = isSaadActive || isNajiActive;

  return (
    <div className="space-y-6 font-sans pb-8 text-right" dir="rtl">
      {/* هيدر ترحيبي برأسية الدردشة المشتركة */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-red-650 text-red-600" />
            <h2 className="text-2xl font-black text-slate-800">
              رادار تواصل وتنسيق المبيعات اللحظي
            </h2>
          </div>
          <p className="text-slate-450 text-xs mt-1">
            غرفة محادثة موحدة ومشفرة تتيح توجيه المراسلات لشخص محدد، إرسال الصور والمستندات بستايل الواتس اب بالكامل.
          </p>
        </div>
        {canClearAll && (
          <button
            onClick={handleClearChat}
            className="px-3.5 py-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 border border-slate-250 hover:border-red-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Trash2 className="w-4 h-4" />
            <span>تنظيف السجل بالكامل</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* صندوق الدردشة الأساسي (9 أعمدة) */}
        <div className="lg:col-span-9 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[700px]">
          
          {/* ترويسة وبحث وفلاتر */}
          <div className="p-4 border-b border-slate-150 bg-slate-50 space-y-3">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-black text-slate-700">غرفة تنسيق صفقات ومتابعات GEMS</span>
                <span className="text-[10px] text-slate-400 bg-slate-200 px-2.5 py-0.5 rounded-full font-bold">
                  {filteredMessages.length} رسالة نشطة
                </span>
              </div>
              
              {/* شريط البحث */}
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="ابحث بالنص، المرسل، أو المستهدف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-right bg-white border border-slate-200 rounded-xl pl-3 pr-8 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white text-slate-800"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
              </div>
            </div>

            {/* الفلاتر الجانبية السريعة */}
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold border transition ${
                  activeFilter === 'all'
                    ? 'bg-red-600 border-red-600 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setActiveFilter('important')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold border transition ${
                  activeFilter === 'important'
                    ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                ⚠️ البلاغات العاجلة والهامة
              </button>
              <button
                onClick={() => setActiveFilter('queries')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold border transition ${
                  activeFilter === 'queries'
                    ? 'bg-blue-650 border-blue-650 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                ❓ استفسارات المبيعات
              </button>
              <button
                onClick={() => setActiveFilter('directed_to_me')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold border transition ${
                  activeFilter === 'directed_to_me'
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                🎯 رسائل موجهة لي شخصياً
              </button>
              <button
                onClick={() => setActiveFilter('mine')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold border transition ${
                  activeFilter === 'mine'
                    ? 'bg-slate-700 border-slate-700 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                رسائلي أنا
              </button>
            </div>
          </div>

          {/* تيار الرسائل المستمر - خلفية بستايل الواتس اب الراقي */}
          <div 
            className="flex-grow overflow-y-auto p-4 bg-[#efeae2] space-y-4 relative"
            style={{ 
              backgroundImage: 'radial-gradient(#dfdcd6 1px, transparent 1px)', 
              backgroundSize: '16px 16px' 
            }}
          >
            {filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2 py-12">
                <MessageSquare className="w-12 h-12 stroke-1 opacity-60 text-slate-600" />
                <p className="text-xs font-bold">لا توجد محادثات أو صفقات معروضة حالياً.</p>
                <p className="text-[10px] text-slate-400">استخدم حقل الكتابة لإطلاق رسالة أو التنبيه بصورة لعميل معين.</p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isMe = msg.senderEmail.toLowerCase() === user.email.toLowerCase();
                const hasLiked = msg.likes.includes(user.email);
                
                // إخفاء ناجي التام عن المبيعات
                const isNajiAcc = msg.senderUsername === 'naji_gems' || msg.senderEmail.toLowerCase() === 'naji93793@gmail.com';
                const displayName = (!isNajiActive && isNajiAcc) ? 'مشرف إدارة GEMS' : msg.senderName;
                const displayRole = (!isNajiActive && isNajiAcc) ? 'admin' : msg.senderRole;
                const displayAvatarEmail = (!isNajiActive && isNajiAcc) ? 'saadabugabl@gmail.com' : msg.senderEmail;

                // هل الرسالة موجهة؟
                const isTargetedToMe = msg.recipientEmail && msg.recipientEmail.toLowerCase() === user.email.toLowerCase();
                const isToAll = !msg.recipientEmail || msg.recipientEmail === 'all';

                return (
                  <div 
                    key={msg.id} 
                    className={`flex items-start gap-2.5 transition-all duration-200 ${
                      isMe ? 'flex-row' : 'flex-row-reverse'
                    }`}
                  >
                    {/* لوحة الآفاتار الأنيقة أو صورة اليوزر إذا كانت مخزنة في قاعدة البيانات */}
                    <div className="shrink-0">
                      {(() => {
                        // محاولة جلب صورة العضو
                        const rawDb = localStorage.getItem('gems_crm_users_db');
                        const dbUsersList: User[] = rawDb ? JSON.parse(rawDb) : [];
                        const correspondingUser = dbUsersList.find(u => u.email.toLowerCase() === displayAvatarEmail.toLowerCase());
                        
                        if (correspondingUser?.avatar) {
                          return (
                            <img 
                              src={correspondingUser.avatar} 
                              alt={displayName} 
                              referrerPolicy="no-referrer"
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-xs" 
                            />
                          );
                        }
                        
                        return (
                          <div className={`w-9 h-9 rounded-full ${getAvatarColor(displayAvatarEmail)} text-white flex items-center justify-center font-bold text-xs shadow-xs`}>
                            {displayName.substring(0, 2).toUpperCase()}
                          </div>
                        );
                      })()}
                    </div>

                    {/* فقاعة الرسالة (WhatsApp Layout Structure) */}
                    <div className={`max-w-[70%] space-y-1 ${isMe ? 'text-right' : 'text-left'}`}>
                      
                      {/* اسم المرسل والوقيت */}
                      <div className="flex items-center gap-1.5 px-1 text-[10px] text-slate-500">
                        <span className="font-extrabold text-slate-700">{displayName}</span>
                        {displayRole === 'admin' && (
                          <span className="bg-red-50 text-red-600 px-1 py-0.2 text-[8px] font-black rounded border border-red-200">
                            مشرف
                          </span>
                        )}
                        <span>•</span>
                        <span className="font-sans text-[9px]">{msg.timestamp}</span>
                      </div>

                      {/* متن الفقاعة الفعلي والواتسابي */}
                      <div className={`p-3 rounded-2xl relative shadow-sm text-xs leading-relaxed border ${
                        isMe 
                          ? 'bg-[#d9fdd3] border-[#c0ebd0] text-slate-850 rounded-tr-none' 
                          : isTargetedToMe
                            ? 'bg-amber-50 border-amber-250 text-slate-900 rounded-tl-none animate-pulse'
                            : 'bg-white border-slate-200 text-slate-850 rounded-tl-none'
                      }`}>
                        
                        {/* الإشارة الموجهة لشخص محدد / المنشن */}
                        {!isToAll && (
                          <div className={`flex items-center gap-1 text-[10px] font-bold mb-2 pb-1 border-b border-dashed ${
                            isMe ? 'text-emerald-700 border-emerald-250' : 'text-amber-700 border-amber-200'
                          }`}>
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-black">
                              🎯 {isTargetedToMe ? 'إليك أنت' : `موجهة لـ: ${msg.recipientName}`}
                            </span>
                          </div>
                        )}

                        {/* الشارات العادية (مهم، استفسار إلخ) */}
                        {msg.badge && (
                          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black mb-2 block w-fit ${
                            msg.badge === 'مهم' || msg.badge === 'متابعة عاجلة'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200/50'
                              : 'bg-blue-50 text-blue-700 border border-blue-200/50'
                          }`}>
                            <span>{msg.badge === 'متابعة عاجلة' ? '🚨 متابعة عاجلة' : msg.badge}</span>
                          </div>
                        )}

                        {/* صورة مرفقة بداخل الفقاعة مثل واتساب تماماً */}
                        {msg.image && (
                          <div className="mb-2.5 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                            <img 
                              src={msg.image} 
                              alt="مرفق محادثة" 
                              referrerPolicy="no-referrer"
                              className="max-h-[220px] w-full object-cover hover:scale-105 transition duration-300"
                              onClick={() => {
                                const win = window.open();
                                if (win) {
                                  win.document.write(`<img src="${msg.image}" style="max-width:100%; max-height:100vh; display:block; margin:auto;" />`);
                                }
                              }}
                            />
                          </div>
                        )}

                        {/* نص الرسالة */}
                        <p className="whitespace-pre-line select-text text-slate-850 text-xs font-medium pb-1 leading-relaxed">
                          {msg.text}
                        </p>

                        {/* العلامات الثنائية الزرقاء في أسفل يمين الإرسال لجمالية الـ UX للواتساب */}
                        <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 mt-1 select-none font-sans">
                          <span>{msg.timestamp}</span>
                          {isMe && <CheckCheck className="w-3.5 h-3.5 text-blue-500 block" />}
                        </div>
                      </div>

                      {/* سطر التفاعلات البسيطة (الإعجابات) */}
                      <div className="flex items-center gap-2 px-1 text-[10px] text-slate-500">
                        <button
                          onClick={() => handleToggleLike(msg.id)}
                          className={`flex items-center gap-1 hover:text-red-500 transition cursor-pointer font-bold ${
                            hasLiked ? 'text-red-600' : 'text-slate-450'
                          }`}
                        >
                          <ThumbsUp className={`w-3 h-3 ${hasLiked ? 'fill-current' : ''}`} />
                          <span>{msg.likes.length > 0 ? `${msg.likes.length} إعجاب` : 'أعجبني'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* تذييل كتابة المراسلة والصورة وتحديد المستهدف بالكامل */}
          <div className="p-4 border-t border-slate-150 bg-white">
            <form onSubmit={handleSendMessage} className="space-y-4">
              
              {/* شريط الإعدادات المتقدمة: استهداف مستخدم محدد + شارة الرسالة */}
              <div className="flex flex-col md:flex-row md:items-center gap-4 border-b border-slate-100 pb-3">
                
                {/* تحديد المستهدف (إلى شخص محدد أو الكل) */}
                <div className="flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span className="text-[10px] font-extrabold text-slate-500 flex-shrink-0">توجيه الرسالة إلى:</span>
                  <select
                    value={selectedRecipient}
                    onChange={(e) => setSelectedRecipient(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">📢 إرسال للكل (عام في الغرفة)</option>
                    {getOnlineTeammates()
                      .filter(t => t.email.toLowerCase() !== user.email.toLowerCase())
                      .map(t => (
                        <option key={t.email} value={t.email}>
                          👤 {t.name} ({t.role === 'admin' ? 'مشرف' : 'مبيعات'})
                        </option>
                      ))}
                  </select>
                </div>

                {/* شارة الرسالة */}
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                  <span className="text-[10px] font-extrabold text-slate-500 flex-shrink-0">إشارة هامة:</span>
                  <div className="flex gap-1 overflow-x-auto no-scrollbar">
                    {(['عام', 'مهم', 'استفسار', 'متابعة عاجلة'] as const).map(badgeType => (
                      <button
                        key={badgeType}
                        type="button"
                        onClick={() => setSelectedBadge(badgeType)}
                        className={`px-2 py-0.5 rounded text-[10px] font-black border transition cursor-pointer ${
                          selectedBadge === badgeType
                            ? 'bg-red-50 border-red-300 text-red-700'
                            : 'bg-white border-transparent text-slate-450 hover:bg-slate-50'
                        }`}
                      >
                        {badgeType === 'عام' && 'تواصل عادي'}
                        {badgeType === 'مهم' && '⚠️ هام'}
                        {badgeType === 'استفسار' && '❓ استفسار'}
                        {badgeType === 'متابعة عاجلة' && '🚨 متابعة'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* رفع صورة كـ Attachment */}
                <div className="flex items-center gap-1.5 mr-auto">
                  <input 
                    type="file" 
                    id="chat_file_upload"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-250 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition ${
                      attachedImage ? 'bg-emerald-550 bg-emerald-50 text-emerald-700 border-emerald-300' : ''
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-red-500" />
                    <span>{attachedImage ? 'أرفقت صورة ✓' : 'إرفاق صورة عميل'}</span>
                  </button>
                </div>
              </div>

              {/* معاينة الصورة المرفقة قبل الإرسال مع كرت الإلغاء */}
              {attachedImage && (
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img 
                      src={attachedImage} 
                      alt="معاينة" 
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 object-cover rounded-lg border" 
                    />
                    <div>
                      <span className="text-[10px] font-black block text-slate-800">الصورة جاهزة للإرفاق</span>
                      <span className="text-[9px] text-slate-400 block">سيتم إدراجها ضمن رسالة الواتس اب المنشورة</span>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      setAttachedImage('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="p-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-full transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* حقل ومدخل الكتابة المباشر */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={attachedImage ? "أضف بضع كلمات لوصف الصورة (اختياري)..." : "اكتب رسالة واتس اب، حدد جهة الاتصال أو المتابعة وأطلق..."}
                  className="w-full text-right bg-slate-50 border border-slate-200 focus:border-red-550 rounded-xl px-4 py-3 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:bg-white transition"
                  maxLength={500}
                />
                <button
                  type="submit"
                  className="p-3 bg-red-650 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow transition duration-150 flex items-center justify-center cursor-pointer shrink-0"
                  title="إرسال"
                >
                  <Send className="w-4 h-4 transform rotate-180" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* الموظفين والمسؤولين المتواجدين (3 أعمدة إحصائية متقنة) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-xs font-black text-slate-800 border-b border-slate-150 pb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-500" />
              <span>فريق مبيعات GEMS المعتمد</span>
            </h3>

            {/* قائمة كروت الموظفين الإحصائية الفورية */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {getOnlineTeammates().map(member => (
                <div 
                  key={member.username} 
                  className="flex items-center gap-2.5 p-2 bg-slate-50/50 hover:bg-slate-50 rounded-xl border border-slate-150 transition"
                >
                  {member.avatar ? (
                    <img 
                      src={member.avatar} 
                      alt={member.name} 
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover border" 
                    />
                  ) : (
                    <div className={`w-8 h-8 rounded-full ${getAvatarColor(member.email)} text-white flex items-center justify-center text-[10px] font-black uppercase`}>
                      {member.name.substring(0, 2)}
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-black text-slate-800 truncate">{member.name}</span>
                    <span className="text-[9px] text-slate-450 truncate uppercase tracking-widest leading-none mt-1">
                      {member.role === 'admin' ? 'Supervisor مشرف' : 'Sales Representative'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* صندوق للمعلومات والتنبيهات الأمنية */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/50 flex gap-2 items-start mt-4">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1 text-amber-800">
                <span className="text-[10px] font-black block">قنوات المتابعة الآمنة:</span>
                <span className="text-[9px] leading-relaxed block text-amber-700">
                  جميع المحادثات والملحوظات بداخل هذه الغرفة تحفظ محلياً بشكل دائم وتتم مزامنتها كأصول تابعة لقسم المبيعات في شركة GEMS.
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
