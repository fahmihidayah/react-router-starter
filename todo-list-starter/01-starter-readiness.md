# Todo: Kesiapan Starter Project

Dokumen ini berisi fitur dan penguatan yang perlu ditambahkan sebelum project dipublikasikan atau
digunakan sebagai starter. Kerjakan berdasarkan prioritas, bukan hanya urutan tampilan.

## Ringkasan progres

| Prioritas | Selesai | Total area | Progres |
| --- | ---: | ---: | ---: |
| P0 — Wajib sebelum ekstraksi | 6 | 6 | 100% |
| P1 — Wajib untuk production-ready | 0 | 10 | 0% |
| P2 — Opsional dan penyempurnaan | 0 | 4 | 0% |
| **Keseluruhan** | **6** | **20** | **30%** |

Area yang sudah selesai dan diverifikasi:

- [x] Rate limiting Redis yang dapat diaktifkan atau dinonaktifkan melalui environment.
- [x] Alur perubahan email dengan re-authentication dan verifikasi dua alamat.
- [x] Security headers serta konfigurasi trusted proxy.
- [x] Permission enforcement pada loader, action, dan API terlindungi.
- [x] Proteksi endpoint sensitif dengan audit akses `/api` yang terdokumentasi dan teruji.
- [x] Bootstrap admin berbasis environment tanpa kredensial bawaan, terpisah dari seed sistem dan
      demo data.

Verifikasi terakhir: `pnpm typecheck`, 359 test, dan `pnpm build` berhasil. `pnpm check` bersih untuk
seluruh file yang diubah pada pekerjaan ini; masih ada 8 temuan format/urutan import yang sudah ada
sebelumnya pada `app/features/observability/*` dan `app/features/email/email-delivery.server.ts`
(bersihkan dengan `pnpm check:fix`).

## P0 — Wajib sebelum ekstraksi

### 1. Proteksi endpoint sensitif

- [x] Audit seluruh route `/api` dan tetapkan akses public, authenticated, admin, atau permission-based.
- [x] Lindungi endpoint test email agar hanya tersedia untuk admin atau hanya pada development.
- [x] Batasi daftar dan detail user untuk admin atau permission yang sesuai.
- [x] Hapus atau lindungi endpoint test/debug yang tidak diperlukan di production.
- [x] Tambahkan test untuk respons 401, 403, dan akses yang diizinkan.

Kriteria selesai: tidak ada endpoint sensitif yang hanya bergantung pada UI tersembunyi atau login
umum; seluruh aturan akses diuji pada server.

Catatan implementasi: hasil audit per route didokumentasikan di `docs/api-access-control.md` dan
setiap route `/api` menyatakan tingkat aksesnya melalui `export const middleware`. Ditambahkan
`requireApiRole()` dan `requireApiAdmin()` yang mengembalikan JSON `401`/`403`, dipakai oleh
`POST /api/send/email` bersama gerbang `EMAIL_TEST_ENDPOINT_ENABLED` sehingga endpoint tersebut
tertutup pada production secara default dan selalu membutuhkan admin. Route `/api/users`,
`/api/users/:id`, dan `/api/users/me` memakai `requireApiAuth` plus `enforceRoutePermissions`
(`users.read` atau `account.read`), dan detail user yang tidak ada kini mengembalikan `404`.
Endpoint debug `app/routes/api/test.tsx` dihapus. Respons `/api/users/me` dan `/api/users/:id`
dikembalikan sebagai `Response` eksplisit agar sesuai kontrak resource route. Test baru:
`app/features/users/middlewares/api-auth.middleware.test.ts` (401, 403 tanpa role, 403 role salah,
admin diizinkan), `app/features/email/test-email-api.test.ts` (gerbang development dan urutan guard
admin), dan `app/features/email/config.server.test.ts`.

Referensi awal:

- `app/routes/api/send.email.tsx`
- `app/routes/api/users.tsx`
- `app/routes/api/users.$id.tsx`
- `docs/api-access-control.md` (pengganti `app/routes/api/test.tsx` yang dihapus)


### 2. Enforcement permission

- [x] Buat middleware/helper `requirePermission()` dan `requireAnyPermission()`.
- [x] Gunakan permission pada loader, action, dan API yang melakukan operasi terlindungi.
- [x] Pastikan permission tidak hanya digunakan untuk menyembunyikan tombol.
- [x] Tambahkan test untuk user tanpa role, role tanpa permission, dan permission yang valid.

Catatan implementasi: guard dijalankan di server sebelum loader/action. Route dengan beberapa mutasi
memetakan field `intent` ke permission yang spesifik. Route admin tetap memiliki batas role admin,
route Track App tetap memiliki batas role user, dan permission menjadi lapisan otorisasi operasi;
pemeriksaan ownership pada service tetap berlaku setelahnya.

Kriteria selesai: permission registry menjadi sumber otorisasi aktif, sementara pemeriksaan role hanya
digunakan untuk aturan yang memang berbasis role.

### 3. Bootstrap admin dan seed yang aman

- [x] Hapus email dan password admin yang hard-coded dari `seeds/index.ts`.
- [x] Pisahkan seed sistem, demo data, dan bootstrap admin.
- [x] Ambil kredensial bootstrap dari environment atau command interaktif.
- [x] Tolak password default pada environment production.
- [x] Dokumentasikan rotasi password setelah bootstrap.

Kriteria selesai: repository tidak berisi kredensial login yang dapat digunakan dan seed production
tidak otomatis membuat akun dengan password yang diketahui publik.

Catatan implementasi: constant `ADMIN_EMAIL`/`ADMIN_PASSWORD` dihapus. Seed dipecah menjadi
`seeds/system.ts` (role dan sinkronisasi permission registry, aman untuk production),
`seeds/demo.ts` (tag contoh untuk lokal), dan `seeds/admin.ts` (satu akun admin dari kredensial
lingkungan). `seeds/index.ts` hanya menjadi dispatcher target `system`, `demo`, `local`, dan `admin`
dengan command `pnpm db:seed`, `pnpm db:seed:demo`, `pnpm db:seed:local`, dan
`pnpm db:bootstrap-admin`; `pnpm db:fresh`, `pnpm db:reset`, dan `pnpm db:setup` diselaraskan.
`seeds/lib/credentials.ts` mewajibkan `ADMIN_EMAIL` dan `ADMIN_PASSWORD`, menolak password default yang
sebelumnya ada di repository, mewajibkan minimal 12 karakter pada
`NODE_ENV=production` (8 karakter di luar production), menolak password yang memuat local part email
di production, dan tidak pernah menuliskan nilai kredensial ke pesan error atau log. Prosedur rotasi
password dan target seed didokumentasikan di `seeds/README.md` dan dirujuk dari `README.md`,
`scripts/README.md`, serta `.env.example`. Test baru:
`seeds/lib/credentials.test.ts`.

### 4. Rate limiting dan perlindungan abuse

- [x] Pilih storage rate limit yang sesuai untuk single-instance dan multi-instance deployment.
- [x] Terapkan limit pada login, register, forgot/reset password, dan resend verification.
- [x] Terapkan limit pada OAuth start, upload media, dan pengiriman email.
- [x] Gunakan kombinasi IP, akun, serta target email dengan data yang diminimalkan.
- [x] Tambahkan respons `429`, header retry, logging aman, dan test.

Catatan implementasi: bucket disimpan di Redis dengan increment dan expiry atomik. Identifier
IP/user/email di-hash dengan HMAC sebelum menjadi key Redis. Fitur dapat diaktifkan atau dimatikan
melalui `RATE_LIMIT_ENABLED`; konfigurasi Redis dan trusted proxy berada di `.env.example`.

Kriteria selesai: operasi mahal dan endpoint autentikasi memiliki batas yang dapat dikonfigurasi dan
tidak dapat dilewati hanya dengan mengganti target email.

### 5. Alur perubahan email yang aman

- [x] Jangan memperbarui email secara langsung melalui query user biasa.
- [x] Minta re-authentication untuk perubahan email.
- [x] Kirim verifikasi ke alamat baru sebelum menjadikannya alamat utama.
- [x] Minta konfirmasi alamat lama sebelum mengirim verifikasi ke alamat baru.
- [x] Tentukan perilaku akun OAuth yang tidak memiliki password lokal.
- [x] Tambahkan test untuk password salah, email yang sama, rate limit, dan permintaan berhasil;
      validitas/kedaluwarsa serta konflik email ditangani oleh token Better Auth yang teruji upstream.

Catatan implementasi: akun Google-only perlu membuat password melalui Forgot password sebelum dapat
mengubah email. Email lama tetap aktif sampai dua tahap verifikasi selesai.

Kriteria selesai: alamat login tidak berubah sebelum kepemilikan alamat baru diverifikasi.

### 6. Security headers dan konfigurasi proxy

- [x] Tambahkan Content Security Policy yang kompatibel dengan reCAPTCHA, GTM, dan asset aplikasi.
- [x] Tambahkan HSTS untuk production, frame protection, `Referrer-Policy`, dan
      `Permissions-Policy`.
- [x] Pastikan cookie auth memakai konfigurasi secure/same-site yang benar untuk environment.
- [x] Dokumentasikan trusted proxy dan forwarded headers; origin/canonical host tetap berasal dari
      `BETTER_AUTH_URL`.
- [x] Tambahkan test header untuk production dan development.

Kriteria selesai: seluruh respons aplikasi memperoleh header keamanan terpusat tanpa mematahkan
login, OAuth, reCAPTCHA, analytics, atau upload.

## P1 — Wajib untuk starter production-ready

### 7. Validasi environment terpusat

- [ ] Buat schema Zod untuk seluruh environment variable server dan public.
- [ ] Validasi relasi antarvariabel, misalnya provider email, S3, Google OAuth, dan RabbitMQ.
- [ ] Hentikan startup lebih awal dengan pesan aman ketika konfigurasi wajib tidak valid.
- [ ] Gunakan objek config bertipe dan kurangi pembacaan `process.env` yang tersebar.
- [ ] Selaraskan `.env.example`, Docker, worker, dokumentasi, dan test.

### 8. Session dan device management

- [ ] Tampilkan daftar sesi aktif dengan waktu, perangkat, dan lokasi kasar bila sesuai kebijakan.
- [ ] Tambahkan revoke satu sesi dan logout semua perangkat.
- [ ] Tambahkan opsi revoke sesi lain setelah mengganti password.
- [ ] Minta re-authentication untuk tindakan sensitif.
- [ ] Uji agar user hanya dapat mengelola sesinya sendiri.

### 9. Observability

- [ ] Gunakan structured logging konsisten dengan request/correlation ID.
- [ ] Integrasikan error tracking dan pastikan PII/secret disaring.
- [ ] Tambahkan metrics dasar untuk request, database, email, queue, dan upload.
- [ ] Tambahkan tracing untuk alur yang melewati aplikasi, queue, dan worker.
- [ ] Dokumentasikan alert minimum dan cara menelusuri insiden.

### 10. Liveness dan readiness

- [ ] Pisahkan endpoint liveness dari readiness.
- [ ] Periksa koneksi database pada readiness.
- [ ] Periksa RabbitMQ dan storage jika fiturnya aktif.
- [ ] Pastikan kegagalan dependency menghasilkan status non-200 tanpa membocorkan secret.
- [ ] Arahkan Docker healthcheck ke endpoint yang tepat.

### 11. End-to-end testing

- [ ] Tambahkan konfigurasi Playwright dan script `test:e2e`.
- [ ] Uji register, verifikasi email, login, logout, dan forgot/reset password.
- [ ] Uji pemisahan akses public, user, admin, dan permission.
- [ ] Uji perubahan profil, password, email, dan penghapusan akun.
- [ ] Sediakan database dan email transport yang terisolasi untuk E2E.

### 12. Quality gate CI

- [ ] Jalankan install dengan lockfile, Biome, typecheck, unit test, E2E, dan build.
- [ ] Jalankan pemeriksaan migration/schema sebelum publish image.
- [ ] Publikasikan image hanya jika seluruh quality gate lulus.
- [ ] Simpan laporan test/coverage tanpa memasukkan secret.
- [ ] Tambahkan strategi cache dan concurrency cancellation.

### 13. Deployment worker dan queue

- [ ] Tambahkan service email worker pada Docker Compose/deployment.
- [ ] Dokumentasikan RabbitMQ untuk local dan production.
- [ ] Tambahkan retry dengan exponential backoff dan batas percobaan.
- [ ] Tambahkan dead-letter queue serta prosedur replay.
- [ ] Pastikan job idempotent dan dapat dilacak dengan trace ID.
- [ ] Tambahkan graceful shutdown dan readiness worker.

### 14. Privacy, consent, dan lifecycle data

- [ ] Tambahkan Privacy Policy bilingual.
- [ ] Tambahkan consent untuk GTM/cookie dan jangan muat analytics sebelum consent bila diwajibkan.
- [ ] Catat versi Terms dan Privacy Policy yang disetujui user.
- [ ] Tambahkan export data akun.
- [ ] Tentukan retention serta penghapusan data, file media, log, dan backup.
- [ ] Dokumentasikan data yang dikirim ke Google, email provider, dan object storage.

### 15. Branding dan feature configuration

- [ ] Buat satu konfigurasi aplikasi untuk nama, URL, logo, warna, support email, dan metadata.
- [ ] Hilangkan string `Learning Tracker`/`Catat Progres` dari komponen infrastructure reusable.
- [ ] Buat feature flags bertipe untuk OAuth, captcha, email, analytics, queue, media, dan blog.
- [ ] Pastikan fitur yang dimatikan tidak meninggalkan tombol, route, atau konfigurasi wajib.
- [ ] Tambahkan test untuk kombinasi fitur utama.

### 16. Bootstrap/generator starter

- [ ] Buat command setup untuk nama aplikasi, domain, locale, dan branding.
- [ ] Izinkan pemilihan provider email, storage, OAuth, captcha, analytics, dan queue.
- [ ] Sediakan preset minimal dan full.
- [ ] Pastikan generator dapat dijalankan berulang tanpa merusak perubahan user.
- [ ] Tambahkan smoke test yang membuat project baru lalu menjalankan typecheck dan build.

## P2 — Modul opsional dan penyempurnaan

### 17. Autentikasi lanjutan

- [ ] Sediakan modul 2FA/TOTP dan recovery codes.
- [ ] Evaluasi passkeys dan magic link sebagai fitur opsional.
- [ ] Tambahkan UI untuk link/unlink akun sosial dengan perlindungan lockout.
- [ ] Tambahkan kebijakan account suspension/ban dan recovery admin.

### 18. SEO dan PWA

- [ ] Tambahkan `robots.txt`, sitemap, canonical URL, dan metadata Open Graph/Twitter.
- [ ] Tambahkan web manifest, icon set, dan theme color.
- [ ] Buat metadata default yang berasal dari app config.
- [ ] Pastikan route private tidak masuk indeks atau sitemap.

### 19. Governance dan maintenance

- [ ] Tambahkan LICENSE sesuai tujuan distribusi starter.
- [ ] Tambahkan CONTRIBUTING, SECURITY policy, changelog, dan release process.
- [ ] Konfigurasikan dependency updater dan security scanning.
- [ ] Tambahkan hooks/checks lokal yang ringan dan terdokumentasi.

### 20. Fitur umum opsional

- [ ] Definisikan modul onboarding dan first-run checklist.
- [ ] Definisikan notification preferences dan transactional notification abstraction.
- [ ] Definisikan feature flag provider, maintenance mode, webhook, dan scheduled jobs.
- [ ] Tambahkan API documentation bila starter ditujukan untuk API eksternal.
- [ ] Putuskan apakah dark mode, contact form server-side, dan newsletter sungguhan masuk starter.

## Definition of done keseluruhan

- [ ] Semua item P0 selesai.
- [ ] Semua item P1 yang diaktifkan starter selesai dan terdokumentasi.
- [ ] `pnpm check`, `pnpm typecheck`, `pnpm test`, E2E, dan `pnpm build` lulus.
- [ ] Project baru dapat dibuat tanpa string domain Learning Tracker atau kredensial bawaan.
- [ ] Instalasi minimal dapat dijalankan dari dokumentasi pada mesin bersih.

