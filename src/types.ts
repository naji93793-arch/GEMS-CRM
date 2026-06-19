/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Client {
  id: string; // معرف العميل
  name: string; // اسم العميل
  company: string; // اسم الشركة
  phone: string; // رقم التليفون
  emirate: string; // الإمارة
  clientFeedback: string; // إفادة العميل
  partnerFeedback: string; // إفادة الشريك
  status: 'متابعة' | 'نفذ' | 'لم يتم التنفيذ'; // الحالة
  addDate: string; // تاريخ إضافة العميل
  lastContact: string; // آخر تواصل
  nextFollowup: string; // موعد المتابعة القادمة
  interestLevel: 'عالي' | 'متوسط' | 'منخفض'; // درجة اهتمام العميل
  contactCount: number; // عدد مرات التواصل
  notDoneReason?: string; // سبب عدم التنفيذ
  owner: string; // المسؤول عن العميل
  ownerEmail: string; // بريد المسؤول
}

export interface User {
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
}
