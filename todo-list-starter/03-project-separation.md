# Todo: Pemisahan Starter Core, Modul Opsional, dan Domain

Tujuan pemisahan adalah agar project baru dapat memakai fondasi umum tanpa harus menghapus fitur
Learning Tracker secara manual. Pemisahan dilakukan bertahap agar aplikasi yang sedang berjalan tetap
dapat diuji pada setiap langkah.

## Target pembagian

### Starter core

- Runtime React Router, React, TypeScript, Vite, Tailwind, dan UI primitives.
- Database connection, migration convention, transaction helper, dan health check.
- Auth dasar, user settings, middleware, RBAC/permission enforcement, dan audit infrastructure.
- Email abstraction, app config, i18n, logging, error handling, testing, dan deployment baseline.

### Modul opsional

- Admin panel.
- Posts, categories, dan rich-text editor.
- Google OAuth, reCAPTCHA, GTM, RabbitMQ, S3-compatible storage, serta audit viewer.
- 2FA/passkey, organizations/teams, billing, webhook, dan scheduler bila kelak ditambahkan.

### Domain Learning Tracker

- Learners dan learner groups/members.
- Goals, activities, Pomodoro, schedules, learning plans, dan learning templates.
- Reports, domain-specific audit extensions, landing-page copy, dan permission domain.

## Fase 1 — Inventaris dependency

- [ ] Buat daftar route, schema, feature, component, message key, env, script, dan migration.
- [ ] Tandai setiap item sebagai `core`, `optional`, `learning-tracker`, atau `shared-to-split`.
- [ ] Petakan import lintas feature dan circular dependency.
- [ ] Petakan foreign key dari core ke domain dan domain ke core.
- [ ] Identifikasi string branding serta copy domain di infrastructure.

Kriteria selesai: setiap feature dan schema memiliki pemilik lapisan yang jelas.

## Fase 2 — Buat app config dan extension points

- [ ] Buat konfigurasi branding, URL, locale, support contact, dan metadata.
- [ ] Buat feature flags bertipe dengan default minimal yang aman.
- [ ] Buat registry untuk navigation, permissions, email templates, dan admin collections.
- [ ] Pastikan domain dapat menambah registry tanpa core mengimpor feature domain.
- [ ] Tambahkan validasi agar registry key tidak duplikat.

Kriteria selesai: core tidak mengetahui nama atau route Learning Tracker.

## Fase 3 — Stabilkan public API setiap feature

- [ ] Definisikan barrel public untuk components, queries, services, types, dan schema yang diperlukan.
- [ ] Hilangkan deep import lintas feature.
- [ ] Pisahkan kontrak interface dari implementasi provider email, storage, analytics, dan queue.
- [ ] Tambahkan aturan dependency atau lint check untuk mencegah core mengimpor domain.
- [ ] Dokumentasikan extension point yang resmi.

Kriteria selesai: dependency mengikuti `core <- optional/domain`, bukan arah sebaliknya.

## Fase 4 — Ekstrak starter core

- [ ] Pindahkan auth, users, roles, permissions, audit infrastructure, email, media abstraction, dan UI
      shared ke boundary core yang disepakati.
- [ ] Pertahankan pola `schemas -> queries -> services -> actions/loaders -> routes`.
- [ ] Pisahkan migration core dari migration domain atau sediakan generator schema gabungan.
- [ ] Jadikan public/auth/app shell generik dan dapat dikonfigurasi.
- [ ] Pastikan core dapat typecheck dan dites tanpa feature Learning Tracker.

Kriteria selesai: varian core-only dapat build dan menjalankan auth serta settings tanpa schema domain.

## Fase 5 — Paketkan modul opsional

- [ ] Jadikan admin panel dapat diaktifkan tanpa posts/categories.
- [ ] Jadikan posts/categories/editor satu modul content yang dapat dihapus bersih.
- [ ] Buat adapter opsional untuk Google OAuth, reCAPTCHA, GTM, RabbitMQ, dan S3.
- [ ] Pastikan modul nonaktif tidak membutuhkan environment variable atau membuat route kosong.
- [ ] Tambahkan contract test untuk setiap kombinasi modul yang didukung.

Kriteria selesai: modul dapat ditambah/dihapus melalui konfigurasi atau generator yang terdokumentasi.

## Fase 6 — Isolasi domain Learning Tracker

- [ ] Kelompokkan schema, route, service, message, permission, seed, dan navigation milik domain.
- [ ] Ganti import internal core dengan public API core.
- [ ] Pastikan ownership/membership rule tetap berada di service/query domain.
- [ ] Pisahkan seed tags/demo dan data domain dari seed role/permission core.
- [ ] Tambahkan smoke test aplikasi Learning Tracker setelah ekstraksi.

Kriteria selesai: domain dapat dipasang di atas core tanpa mengubah file internal core.

## Fase 7 — Generator dan preset

- [ ] Sediakan preset `minimal`, `standard`, dan `full`.
- [ ] Tanyakan nama app, package name, domain, locale, database, email, storage, serta modul.
- [ ] Hasilkan `.env.example`, app config, metadata, dan dokumentasi sesuai pilihan.
- [ ] Jangan menghasilkan kredensial default atau placeholder yang tampak valid untuk production.
- [ ] Jalankan generator di temporary directory dalam test CI.

Kriteria selesai: setiap preset lulus install, migration generation/check, typecheck, test, dan build.

## Fase 8 — Dokumentasi dan release

- [ ] Tulis quick start untuk core-only dan full example.
- [ ] Tulis panduan menambah feature, schema, permission, provider, route, dan translation.
- [ ] Dokumentasikan upgrade path dan migration compatibility.
- [ ] Tambahkan changelog, versioning, license, security policy, serta support policy.
- [ ] Buat checklist release yang menjalankan seluruh quality gate.

Kriteria selesai: developer baru dapat membuat project dan menambah satu feature tanpa membaca kode
Learning Tracker.

## Struktur target konseptual

```text
app/
  core/
    auth/
    users/
    authorization/
    audit/
    email/
    media/
    config/
  modules/
    admin/
    content/
  features/
    learners/
    goals/
    activities/
    schedules/
    learning-templates/
    reports/
```

Struktur ini merupakan arah konseptual, bukan instruksi untuk memindahkan semua file sekaligus.
Nama akhir harus diputuskan setelah inventaris dependency selesai.

## Definition of done keseluruhan

- [ ] Starter core tidak memiliki copy, permission, schema, atau navigation Learning Tracker.
- [ ] Core-only, setiap preset, dan aplikasi Learning Tracker lulus quality gate.
- [ ] Modul dapat dinonaktifkan tanpa mengedit banyak file secara manual.
- [ ] Upgrade core tidak memerlukan perubahan langsung pada internal domain.
- [ ] Dokumentasi dan generator menghasilkan konfigurasi aman tanpa secret.

