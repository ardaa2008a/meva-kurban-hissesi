# Deployment Rehberi

## Vercel'e Deploy Etme

### 1. GitHub Repository Hazırlanması

```bash
git add .
git commit -m "Add Meva Kurban Hissesi System"
git push origin main
```

### 2. Vercel'de Proje Oluşturma

1. https://vercel.com adresine git
2. GitHub hesabınla giriş yap
3. "Add New..." → "Project" tıkla
4. `ardaa2008a/meva-kurban-hissesi` reposunu seç
5. "Import" tıkla

### 3. Environment Variables Ekleme

Proje ayarlarında şu değişkenleri ekle:

```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key-here
```

Supabase'den kopyala:
1. Supabase.com → Projeniz → Settings → API
2. Project URL (NEXT_PUBLIC_SUPABASE_URL)
3. anon public (NEXT_PUBLIC_SUPABASE_ANON_KEY)

### 4. Deploy Etme

1. "Deploy" tıkla
2. Bekle (2-3 dakika)
3. Deployment URL kopyala (örn: https://meva-kurban-hissesi.vercel.app)

## Supabase Database Kurulumu

### 1. Supabase Project Oluşturma

1. https://supabase.com adresine git
2. GitHub hesabınla giriş yap
3. "New Project" tıkla
4. İsim: "meva-kurban-hissesi"
5. Region: Istanbul (Türkiye)
6. "Create New Project" tıkla

### 2. SQL Schema Oluşturma

1. SQL Editor'e git
2. "New Query" tıkla
3. Aşağıdaki SQL'i yapıştır
4. "RUN" tıkla

```sql
-- Drop existing tables if they exist
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS records CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert 15 test users
INSERT INTO users (username, password) VALUES
('user1', 'meva123'),
('user2', 'meva123'),
('user3', 'meva123'),
('user4', 'meva123'),
('user5', 'meva123'),
('user6', 'meva123'),
('user7', 'meva123'),
('user8', 'meva123'),
('user9', 'meva123'),
('user10', 'meva123'),
('user11', 'meva123'),
('user12', 'meva123'),
('user13', 'meva123'),
('user14', 'meva123'),
('user15', 'meva123');

-- Records table
CREATE TABLE records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  hisse_sayisi INTEGER DEFAULT 1,
  odeme_durumu TEXT DEFAULT 'Ödenmedi',
  odeme_sekli TEXT DEFAULT 'Nakit',
  ilgilenen_kisi TEXT,
  kaydı_ekleyen TEXT NOT NULL,
  not TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  FOREIGN KEY (kaydı_ekleyen) REFERENCES users(username)
);

-- Audit logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID REFERENCES records(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  changed_by TEXT,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_records_name ON records(name);
CREATE INDEX idx_records_phone ON records(phone);
CREATE INDEX idx_records_deleted ON records(deleted_at);
CREATE INDEX idx_records_kaydı_ekleyen ON records(kaydı_ekleyen);
CREATE INDEX idx_audit_record ON audit_logs(record_id);
CREATE INDEX idx_audit_changed_by ON audit_logs(changed_by);

-- Enable RLS if needed (optional for development)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies (optional for development)
CREATE POLICY "Enable all for authenticated users" ON users FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON records FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON audit_logs FOR ALL USING (true);
```

### 3. API Keys Kopyalama

1. Settings → API tıkla
2. "Project URL" kopyala
3. "anon public" kopyala

Bu değerleri Vercel'in environment variables'ına ekle.

## Veriler Yedekleme

### Supabase Automated Backups

1. Settings → Backups
2. "Automated Backups" aktif
3. Otomatik yedekleme ayarla

### Manuel Backup

```bash
# CSV olarak export
1. Table Editor → records
2. "Download" → "CSV"

# Database dump
1. Settings → Backups
2. "Request Download"
```

## Troubleshooting

### Veritabanında bağlantı hatası

```
Error: connect ECONNREFUSED
```

**Çözüm:**
- Supabase'de database aktif mı?
- Environment variables doğru mu?
- `.env.local` dosyası var mı?

### 404 Sayfası bulunamıyor

**Çözüm:**
- Vercel URL'ni kontrol et
- GitHub push yaptın mı?
- Build log'da hata var mı?

### Veriler gösterilmiyor

**Çözüm:**
- Supabase SQL çalıştırıldı mı?
- Users tablosunda veri var mı?
- Row Level Security (RLS) açık mı?

## Güvenlik Ayarları

### Supabase Row Level Security (RLS)

Üretim için RLS etkinleştir:

```sql
-- Users tablosu için policy
CREATE POLICY "Users can read all users"
ON users FOR SELECT USING (true);

CREATE POLICY "Only system can insert"
ON users FOR INSERT WITH CHECK (false);

-- Records tablosu
CREATE POLICY "Users can read all records"
ON records FOR SELECT USING (true);

CREATE POLICY "Users can insert their own records"
ON records FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update all records"
ON records FOR UPDATE USING (true);

CREATE POLICY "Users can delete records"
ON records FOR DELETE USING (true);
```

## Sürekli Deployment

Vercel otomatik deploy eder:
- `main` branchı'na push yaptığında
- Deployment → Logs sekmesinde takip et

## Domain Konfigürasyonu

Vercel'de custom domain ekle:
1. Settings → Domains
2. "Add" tıkla
3. Domain adınızı gir
4. DNS ayarlarını takip et

## Performans Optimizasyonu

- Supabase'de indeksler oluştur
- Redis caching (isteğe bağlı)
- CDN kullan (Vercel otomatik sağlıyor)

## İstatistikler

- Vercel Analytics
- Supabase Usage
- Error tracking

Hepsi dashboard'da görülebilir!
