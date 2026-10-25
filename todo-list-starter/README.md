# Starter Project Progress Tracker

Direktori ini melacak pekerjaan untuk mengubah Learning Tracker menjadi starter project yang aman,
generik, dan mudah digunakan kembali. Checklist di bawah diperbarui setelah item pada dokumen terkait
selesai dan sudah diverifikasi.

## Status

- `[ ]` belum dikerjakan
- `[-]` sedang dikerjakan
- `[x]` selesai dan sudah diverifikasi
- `[!]` diblokir; jelaskan alasannya tepat di bawah item

## Ringkasan progres

| Area | Dokumen | Status | Selesai |
| --- | --- | --- | --- |
| Kesiapan starter | [01-starter-readiness.md](./01-starter-readiness.md) | P0 selesai | 6/20 |
| Audit log | [02-audit-log.md](./02-audit-log.md) | Belum dimulai | 0/8 fase |
| Pemisahan project | [03-project-separation.md](./03-project-separation.md) | Belum dimulai | 0/8 fase |

Seluruh area P0 pada `01-starter-readiness.md` sudah selesai dan diverifikasi; pekerjaan berikutnya
dimulai dari item P1.

## Urutan yang disarankan

1. Selesaikan seluruh item P0 di `01-starter-readiness.md`.
2. Tetapkan konfigurasi dan branding terpusat.
3. Kerjakan perluasan audit log karena perubahan ini menyentuh operasi sensitif.
4. Pisahkan starter core, modul opsional, dan domain Learning Tracker.
5. Tambahkan quality gate CI dan E2E sebelum starter diberi versi pertama.

## Aturan pembaruan

- Satu checkbox hanya boleh ditandai selesai setelah kriteria selesai pada item tersebut terpenuhi.
- Tambahkan catatan keputusan atau tautan pull request di bawah item jika implementasinya tidak sederhana.
- Jika scope berubah, perbarui dokumen ini dan dokumen detail terkait dalam perubahan yang sama.
- Jangan memasukkan secret, token, alamat email produksi, atau password ke dokumen tracking.

