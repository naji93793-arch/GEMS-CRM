/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Client, User } from './types';

/// حسابات المشرفين والمدراء المعتمدين للنظام
export const USERS: User[] = [
  { username: 'saad_gems', name: 'سعد أبو جبل', email: 'saadabugabl@gmail.com', role: 'admin' },
  { username: 'naji_gems', name: 'ناجي بن محمد (الإدارة)', email: 'naji93793@gmail.com', role: 'admin' },
  { username: 'naji_sales', name: 'ناجي بن محمد (مبيعات)', email: 'naji93793@gmail.com', role: 'employee' },
  { username: 'noha_sales', name: 'نهى هشام', email: 'nohahesham1990@gmail.com', role: 'employee' },
  { username: 'meera_sales', name: 'ميرا السنفوري', email: 'meeraelasanhory@icloud.com', role: 'employee' },
  { username: 'alaa_sales', name: 'آلاء خالد مكي', email: 'alaakhaledmekky61@gmail.com', role: 'employee' }
];

// كلمات المرور الافتراضية المؤمنة لليوزرز الأساسيين
export const USER_PASSWORDS: Record<string, string> = {
  'saad_gems': '11223344',
  'naji_gems': '11223344',
  'naji_sales': '11223344',
  'saadabugabl@gmail.com': '11223344',
  'naji93793@gmail.com': '11223344',
  'noha_sales': '11223344',
  'nohahesham1990@gmail.com': '11223344',
  'admin': '11223344',
  'meera_sales': '12341234',
  'meeraelasanhory@icloud.com': '12341234',
  'alaa_sales': '112341234',
  'alaakhaledmekky61@gmail.com': '112341234'
};

// قائمة إيميلات الموظفين والمسؤولين المعتمدين والمسموح لهم بالتسجيل وإنشاء كلمة المرور
export const AUTHORIZED_EMAILS = [
  'saadabugabl@gmail.com',
  'naji93793@gmail.com',
  'nohahesham1990@gmail.com',
  'meeraelasanhory@icloud.com',
  'rehamhesham995@gmail.com',
  'ebiedayad1@gmail.com',
  'alaakhaledmekky61@gmail.com'
];

// البيانات الأولية الفارغة لبدء ملفات العملاء الفعليين
export const INITIAL_CLIENTS: Client[] = [];
