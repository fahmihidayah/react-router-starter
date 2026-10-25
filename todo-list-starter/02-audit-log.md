# Todo: Audit Log Production-Ready

Audit log saat ini hanya menyimpan `actorId`, `entityType`, `entityId`, dan `createdAt`. Service
`record()` juga belum dipanggil oleh operasi aplikasi. Target dokumen ini adalah membuat audit log
berguna untuk investigasi keamanan tanpa mengubahnya menjadi tempat penyimpanan data sensitif.

## Fase 1 — Tetapkan kebijakan

- [ ] Daftar event yang wajib diaudit: perubahan akun, email/password, session revoke, user/role/
      permission admin, media, konfigurasi, export, dan penghapusan data.
- [ ] Bedakan audit keamanan, audit administrasi, dan activity history domain.
- [ ] Tetapkan retention, akses pembaca, kebutuhan export, dan prosedur penghapusan/anonymization.
- [ ] Tentukan apakah audit harus immutable dan siapa yang dapat menghapusnya.

Kriteria selesai: ada keputusan tertulis tentang event, akses, retention, dan privasi.

## Fase 2 — Perluas schema

- [ ] Tambahkan `action` dengan vocabulary stabil, misalnya `user.role.updated`.
- [ ] Tambahkan `outcome`: `success`, `failure`, atau `denied`.
- [ ] Tambahkan `targetType` dan `targetId` atau dokumentasikan penggunaan field entity saat ini.
- [ ] Tambahkan `requestId`/`traceId` untuk korelasi.
- [ ] Tambahkan `metadata` JSONB nullable yang tervalidasi dan dibatasi ukurannya.
- [ ] Tambahkan actor nullable atau actor type untuk system/worker event.
- [ ] Pertimbangkan `ipHash` atau prefix IP, bukan raw IP, sesuai kebijakan privasi.
- [ ] Simpan user-agent yang dipotong/dinormalisasi hanya jika benar-benar dibutuhkan.
- [ ] Tambahkan index berdasarkan action, outcome, target, actor, request ID, dan waktu.

Kriteria selesai: migration PostgreSQL sudah dihasilkan, SQL sudah ditinjau, dan data lama tetap valid.

## Fase 3 — Sanitasi metadata

- [ ] Buat allowlist metadata per event; jangan menerima objek request mentah.
- [ ] Larang password, token, cookie, authorization header, captcha response, API key, dan isi email.
- [ ] Masking alamat email dan identifier sensitif bila nilai lengkap tidak diperlukan.
- [ ] Batasi kedalaman, jumlah key, panjang string, dan total ukuran JSON.
- [ ] Tambahkan test yang membuktikan secret dan payload sensitif tidak tersimpan.

Kriteria selesai: metadata hanya berisi field yang disetujui dan memiliki batas ukuran.

## Fase 4 — API service yang konsisten

- [ ] Ganti API `record()` dengan input bertipe yang memuat action, outcome, actor, target, dan context.
- [ ] Sediakan helper untuk success, failure, denied, system, dan worker event.
- [ ] Dukungan transaction-aware agar perubahan data dan audit penting dapat ditulis atomik.
- [ ] Tetapkan perilaku saat penulisan audit gagal; operasi kritis tidak boleh diam-diam dianggap sukses.
- [ ] Tambahkan correlation ID dari request hingga background worker.

Kriteria selesai: route dan service tidak menyusun row audit secara manual.

## Fase 5 — Integrasi operasi sensitif

- [ ] Registrasi, verifikasi email, login failure penting, forgot/reset password, dan account recovery.
- [ ] Perubahan profil/email/password, session revoke, dan penghapusan akun.
- [ ] Admin create/update/delete user serta perubahan role.
- [ ] Create/update/delete role dan assignment permission.
- [ ] Upload/update/delete media serta bulk delete.
- [ ] Export data dan perubahan konfigurasi aplikasi.
- [ ] Event worker: email delivered, exhausted retry, dan dead-lettered tanpa menyimpan konten email.

Kriteria selesai: seluruh event pada kebijakan Fase 1 memiliki titik integrasi dan test.

## Fase 6 — Query dan admin viewer

- [ ] Query terpaginated dengan filter waktu, actor, action, outcome, dan target.
- [ ] Permission khusus untuk membaca atau mengekspor audit log.
- [ ] Admin viewer read-only dengan detail metadata yang sudah disanitasi.
- [ ] Redact identifier berdasarkan role dan kebijakan privasi.
- [ ] Export dibatasi, dicatat sebagai audit event, dan tidak tersedia melalui URL publik permanen.

Kriteria selesai: audit dapat ditelusuri tanpa memberikan akses edit atau mengekspos PII berlebihan.

## Fase 7 — Retention dan integritas

- [ ] Buat job retention/archive dengan dry-run dan batas batch.
- [ ] Tentukan storage archive dan enkripsi bila retention panjang dibutuhkan.
- [ ] Pertimbangkan append-only database permission atau mekanisme tamper evidence.
- [ ] Monitor pertumbuhan tabel, kegagalan tulis, dan backlog archive.

Kriteria selesai: volume audit terkontrol dan perubahan tidak dapat dilakukan oleh user aplikasi biasa.

## Fase 8 — Verifikasi

- [ ] Unit test schema metadata dan sanitizer.
- [ ] Service test untuk success, failure, denied, system actor, dan transaction rollback.
- [ ] Integration test bahwa operasi sensitif menghasilkan tepat satu event yang benar.
- [ ] Authorization test untuk viewer dan export.
- [ ] Jalankan `pnpm check`, `pnpm typecheck`, test terkait, dan migration check.

## Referensi kode saat ini

- `app/features/audit-log/schemas/db/audit-logs.ts`
- `app/features/audit-log/services/audit-log.service.ts`
- `app/features/audit-log/queries/index.ts`

