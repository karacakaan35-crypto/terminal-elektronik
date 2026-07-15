# Terminal Elektronik

Elektronik kart ve saha cihazları için tarayıcı tabanlı arıza teşhis / karar ağacı uygulaması.

## Geliştirme

```bash
npm install
npm run dev
```

LAN'daki telefon/tabletlerden erişmek için:

```bash
npm run dev:lan
```

## Yerel Servis Sunucusu

Production build alıp uygulamayı yerel Astra/Gemma bağlantısıyla doğrudan servis eder:

```bash
npm run build
npm run serve:local
```

Tarayıcıda açılacak adres:

```text
http://127.0.0.1:4174
```

## Kalıcı Web Yayını

Kalıcı statik yayın paketi için:

```bash
npm run build:sites
```

Bu sürüm bağlantı açıldığında doğrudan teşhis motorunu, PDF raporunu, hızlı Astra yanıtlarını ve Google AI Studio API ile çalışan derin Astra yanıtlarını sunar. API anahtarı yalnızca Sites sunucu ortamında tutulur ve tarayıcıya gönderilmez.

## Saha Araçları ve Anlaşılır Arıza Dili

Tanı veri seti v4.2; multimetre, kontrol kalemi, bilgisayar, 802.3af/at/bt PoE test cihazı, sağlam RJ45/RJ11 deneme kablosu ve uygun sağlam adaptörle uygulanabilecek saha akışına göre hazırlanmıştır. Arıza adayları “kablo kopuk olabilir”, “RJ11/RJ45 ucu kötü çakılmış olabilir”, “klemens gevşek veya oksitli olabilir” ve “besleme hattında kısa devre olabilir” gibi anlaşılır teknik dille gösterilir.

PoE kamera akışı test cihazındaki PSE/PD yönünü, anlaşma sonrası 44–57V genel kontrol aralığını, PoE sınıfını ve kısa sağlam Ethernet kablosuyla karşılaştırmayı birlikte kullanır. Voltajın tek başına kablo kalitesini veya switch güç bütçesini kanıtlamadığı uygulamada açıkça belirtilir.

Kontrol kalemi yalnızca ön kontrol içindir; enerjinin kesildiğini tek başına kanıtlamaz. Gerilim yokluğu uygun multimetreyle doğrulanır. Şebeke, yangın güvenliği ve hareketli mekanizma adımlarındaki güvenlik durdurmaları korunur.

## Tanı Verisi ve Doğruluk

Veri seti 10 cihaz profili, 277 karar/sonuç düğümü, 83 arıza sınıfı ve 24 teknik kaynak içerir. Her adım kaynak seviyesini (`üretici bilgisi`, `standart bilgisi`, `ölçüm rehberi` veya `genel servis kontrolü`) ve ölçüm eşiğinin modele göre mi genel kontrol mü olduğunu gösterir.

Başlangıç servis ağırlıkları gerçek saha arıza oranı değildir. Toplamı 100'e normalize edilmiş, kapatılmış iş emri verisiyle henüz kalibre edilmemiş öncelik puanlarıdır. Model etiketi ve üretici servis kılavuzu her zaman uygulamadaki genel eşikten önce gelir.

## Google AI Studio ile Astra

Codex Sites üzerindeki Astra iki çalışma modu sunar:

- `Hızlı Yanıt`: Günlük ve sık saha sorularını cihaz üzerinde anında yanıtlar.
- `Derin / Gemini 3.1 Flash-Lite`: Sites Worker üzerinden Google AI Studio API'yi kullanır.

Sites ortamında kullanılan değerler:

```text
GEMINI_MODEL=gemini-3.1-flash-lite
GEMINI_API_KEY=your-key
```

Aktif teşhis, işlem geçmişi ve teknisyen notları tarayıcıda taslak olarak saklanır. Derin yanıtlar servis bilgisayarı kapalıyken de çalışır; Google AI Studio kullanım sınırları geçerlidir.

## Yerel AI / Ollama

Servis bilgisayarında `npm run serve:local` ile açılan sürüm iki çalışma modu sunar:

- `Hızlı Yanıt`: Günlük ve sık saha sorularını cihaz üzerinde anında yanıtlar.
- `Derin / gemma4`: yerel servis sunucusu üzerinden Ollama modelini akışlı olarak kullanır; yanıt kullanıcı tarafından durdurulabilir.

Model kapalıysa Derin mod devre dışı kalır. Aktif teşhis, işlem geçmişi ve teknisyen notları tarayıcıda taslak olarak saklanır.

Varsayılan model:

```text
gemma4
```

Farklı model kullanmak için:

```bash
FIXBOARD_AI_MODEL=gemma4:12b npm run serve:local
```

Ollama farklı adreste çalışıyorsa:

```bash
OLLAMA_URL=http://127.0.0.1:11434 FIXBOARD_AI_MODEL=gemma4 npm run serve:local
```

Gemma 4 modelini Ollama'ya indirmek için:

```bash
npm run ollama:pull:gemma4
npm run ollama:list
```

Ollama sunucusunu elle başlatmak gerekirse:

```bash
npm run ollama:serve
```

Tunnel kullanırken dışarıya Ollama portunu değil, uygulama sunucusu portunu açın:

```bash
npm run tunnel
```

Komutun verdiği `https://...trycloudflare.com` linki Android telefonda hücresel veriyle açılabilir. Tünel kararlılığı için HTTP/2 kullanılır. Mac açık kalmalı; `npm run serve:local`, Ollama ve tunnel terminali çalıştığı sürece erişim devam eder.

Android Chrome menüsündeki `Ana ekrana ekle` seçeneğiyle uygulama kurulabilir. Bir kez çevrimiçi açılan karar ağacı ve aktif teşhis taslağı bağlantı kesildiğinde de kullanılabilir; Derin Gemma4 modu için Mac bağlantısı gerekir.

## Doğrulama

```bash
npm run validate:data
npm test
npm run lint
npm run build
```
