# 🐢 TurtlSip Link Builder

## 🛠️ Tech Stack
* **Frontend**: React.js, Vite, Lucide-React.
* **Backend**: Node.js, Express.
* **ORM & Database**: Prisma ORM dengan PostgreSQL.
* **Typography**: Plus Jakarta Sans.

---

## 📂 Folder Structure
* `/Assets`: Berisi logo dan aset visual brand.
* `/turtlsip-builder`: Folder utama untuk kode sumber Frontend (React).
* `/turtlsip-builder/server`: Folder utama untuk kode sumber Backend (Express & Prisma).

---

## 🚀 Getting Started

### Environment Variables
Buat file `.env` di dalam folder `turtlsip-builder/server/` dan tambahkan baris ini:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/turtlsip_db?schema=public"


### 🚀 Installation & Running

Untuk menjalankan ekosistem **TurtlSip** secara lokal, buka tiga terminal terpisah dan jalankan perintah berikut sesuai dengan urutan perannya:

| Terminal | Perintah | Port | Peran Utama |
| :--- | :--- | :--- | :--- |
| **Terminal 1** | `npm run dev` (di root) | `:5173` | **Frontend**: Editor UI TurtlSip |
| **Terminal 2** | `npm run dev` (di folder `server`) | `:3001` | **Backend**: Jembatan API ke Database |
| **Terminal 3** | `npx prisma studio` (di folder `server`) | `:5555` | **DB Viewer**: Monitoring data secara visual |

> **Pro-Tip**: Pastikan **Terminal 2** sudah berjalan stabil sebelum Anda mulai mengedit di **Terminal 1**, agar fitur *Auto-Save* tidak mengalami kegagalan koneksi.