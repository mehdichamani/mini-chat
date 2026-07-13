<div dir="rtl">

# 💬 Mini Chat — سیستم چت یکبار مصرف

یک سیستم چت سبک و بلادرنگ با ظاهر تلگرام. ادمین می‌تواند همزمان با چند نفر گفتگو کند؛ هر مهمان با یک **کد دعوت ۶ رقمی** و **رمز عبور** وارد می‌شود.

</div>

---

<div dir="rtl">

## 🖼️ معماری

```
مهمان ──► صفحه ورود (کد + رمز) ──► صفحه چت
                                        ▲
                                        │ Socket.io
                                        ▼
                                    سرور Node.js
                                        │
ادمین ──────────────────────────► پنل مدیریت (sidebar + چت)
```

</div>

---

<div dir="rtl">

## 📋 پیش‌نیازها

| ابزار | نسخه |
|-------|------|
| **Node.js** | v18 یا بالاتر |
| **npm** | v8 یا بالاتر |

</div>

---

<div dir="rtl">

## ⚙️ نصب و راه‌اندازی

</div>

```bash
# ۱. دریافت کد
git clone <repo-url>
cd mini-chat

# ۲. نصب وابستگی‌ها
npm install

# ۳. تنظیم فایل محیطی
cp .env.example .env
# سپس .env را ویرایش کنید

# ۴. اجرا
npm start

# یا با hot-reload
npm run dev
```

<div dir="rtl">

مرورگر را باز کنید:

| آدرس | توضیح |
|------|--------|
| `http://localhost:3000/` | صفحه ورود مهمان |
| `http://localhost:3000/admin` | پنل ادمین |

</div>

---

<div dir="rtl">

## 🔧 تنظیمات (`.env`)

</div>

```env
PORT=3000
ADMIN_PASSWORD=admin123
ADMIN_TOKEN_SECRET=mini-chat-secret-2024
MAX_FILE_SIZE_MB=100
```

| متغیر | پیش‌فرض | توضیح |
|-------|---------|--------|
| `PORT` | `3000` | پورت سرور |
| `ADMIN_PASSWORD` | `admin123` | **قبل از استفاده تغییر دهید** |
| `MAX_FILE_SIZE_MB` | `100` | حداکثر حجم فایل (مگابایت) |

---

<div dir="rtl">

## 🚀 نحوه استفاده

### ادمین
1. وارد `/admin` شوید و رمز ادمین را وارد کنید
2. روی **«ایجاد گفتگوی جدید»** کلیک کنید
3. نام مهمان را وارد کنید → کد دعوت و رمز تولید می‌شود
4. اطلاعات را برای مهمان ارسال کنید
5. منتظر بمانید تا مهمان آنلاین شود (نشانگر سبز)

### مهمان
1. آدرس سایت را باز کند
2. **کد دعوت ۶ رقمی** و رمز را وارد کند
3. وارد صفحه چت می‌شود

</div>

---

<div dir="rtl">

## ✨ قابلیت‌ها

| قابلیت | جزئیات |
|--------|---------|
| 💬 چند گفتگو همزمان | ادمین sidebar با لیست همه مکالمات |
| 🔢 کد دعوت ۶ رقمی | عددی، تصادفی، یکتا |
| 📎 آپلود فایل | هر فرمتی، تا ۱۰۰ مگابایت |
| 🖼️ نمایش تصویر | کلیک برای lightbox |
| 🎬 پخش ویدیو/صدا | مستقیم در چت |
| ⌨️ نشانگر تایپ | بلادرنگ برای هر دو طرف |
| 🔔 اعلان مرورگر | پیام جدید در پس‌زمینه |
| 🖱️ Drag & Drop | رها کردن فایل روی صفحه |
| 📋 Paste تصویر | Ctrl+V برای آپلود مستقیم |
| 🔍 جستجو | در لیست مکالمات ادمین |
| 📱 واکنش‌گرا | موبایل و دسکتاپ |

</div>

---

<div dir="rtl">

## 🛠️ تکنولوژی‌ها

</div>

| Layer | Tech |
|-------|------|
| **Backend** | Node.js + Express |
| **Real-time** | Socket.io (WebSocket) |
| **File Upload** | Multer |
| **Frontend** | HTML5 + CSS3 + Vanilla JS |
| **Design** | Telegram Dark Theme |

---

<div dir="rtl">

## 📁 ساختار پروژه

</div>

```
mini-chat/
├── server.js          ← بک‌اند اصلی (Express + Socket.io + Multer)
├── package.json
├── .env               ← تنظیمات (در git ذخیره نمی‌شود)
├── .gitignore
├── uploads/           ← فایل‌های آپلود‌شده (خودکار ساخته می‌شود)
└── public/
    ├── index.html     ← صفحه ورود مهمان
    ├── chat.html      ← صفحه چت مهمان
    ├── admin.html     ← پنل ادمین
    ├── style.css      ← طراحی تلگرام‌وار
    └── app.js         ← توابع مشترک فرانت‌اند
```

---

<div dir="rtl">

## ⚠️ نکات مهم

- ذخیره‌سازی **In-Memory** است — با ری‌استارت سرور پیام‌ها پاک می‌شوند
- برای محیط production، رمز ادمین را در `.env` تغییر دهید
- پوشه `uploads/` به‌صورت خودکار ساخته می‌شود

</div>

---
---

# 💬 Mini Chat — Disposable Chat System

A lightweight, real-time chat system with a Telegram-like dark UI. The admin can chat with multiple guests simultaneously. Each guest joins via a **6-digit invite code** and **password**.

---

## 🖼️ Architecture

```
Guest ──► Login Page (code + password) ──► Chat Page
                                               ▲
                                               │ Socket.io
                                               ▼
                                          Node.js Server
                                               │
Admin ──────────────────────────► Admin Panel (sidebar + chat view)
```

---

## 📋 Prerequisites

| Tool | Version |
|------|---------|
| **Node.js** | v18 or higher |
| **npm** | v8 or higher |

---

## ⚙️ Installation & Setup

```bash
# 1. Clone the repo
git clone <repo-url>
cd mini-chat

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your settings

# 4. Start server
npm start

# Or with hot-reload
npm run dev
```

Open in browser:

| URL | Description |
|-----|-------------|
| `http://localhost:3000/` | Guest login page |
| `http://localhost:3000/admin` | Admin panel |

---

## 🔧 Configuration (`.env`)

```env
PORT=3000
ADMIN_PASSWORD=admin123
ADMIN_TOKEN_SECRET=mini-chat-secret-2024
MAX_FILE_SIZE_MB=100
```

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `ADMIN_PASSWORD` | `admin123` | **Change before production use** |
| `MAX_FILE_SIZE_MB` | `100` | Maximum file upload size (MB) |

---

## 🚀 How It Works

### Admin Flow
1. Go to `/admin` and enter the admin password
2. Click **"New Chat"** to create a room
3. Enter guest name → invite code & password are generated
4. Share the credentials with your guest
5. Wait for the guest to connect (green online indicator)

### Guest Flow
1. Open the site URL
2. Enter the **6-digit invite code** and password
3. Start chatting

---

## ✨ Features

| Feature | Details |
|---------|---------|
| 💬 Multi-chat | Admin manages all conversations from a sidebar |
| 🔢 Invite codes | 6-digit numeric, random, unique per session |
| 📎 File upload | Any format, up to 100 MB |
| 🖼️ Image viewer | Click to open in lightbox |
| 🎬 Video/Audio | Inline media playback |
| ⌨️ Typing indicator | Real-time for both sides |
| 🔔 Browser notifications | New message alerts in background |
| 🖱️ Drag & Drop | Drop files directly onto the chat |
| 📋 Clipboard paste | Ctrl+V to paste images directly |
| 🔍 Search | Filter conversations in admin sidebar |
| 📱 Responsive | Works on mobile and desktop |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js + Express |
| **Real-time** | Socket.io (WebSocket) |
| **File Upload** | Multer |
| **Frontend** | HTML5 + CSS3 + Vanilla JS |
| **Design** | Telegram-inspired dark theme |

---

## 📁 Project Structure

```
mini-chat/
├── server.js          ← Main backend (Express + Socket.io + Multer)
├── package.json
├── .env               ← Config (not committed to git)
├── .gitignore
├── uploads/           ← Uploaded files (auto-created)
└── public/
    ├── index.html     ← Guest login page
    ├── chat.html      ← Guest chat page
    ├── admin.html     ← Admin panel
    ├── style.css      ← Telegram-style dark theme
    └── app.js         ← Shared frontend utilities
```

---

## ⚠️ Important Notes

- Storage is **In-Memory** — messages are lost on server restart
- Change the admin password in `.env` before deploying
- The `uploads/` directory is created automatically on first run
- For production, consider adding HTTPS and a reverse proxy (nginx)

---

## 📄 License

MIT
