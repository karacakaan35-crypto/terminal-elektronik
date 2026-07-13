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

## PIN Korumalı Yayın

Production build alıp sadece `dist/` klasörünü PIN ile servis eder:

```bash
npm run build
npm run serve:pin
```

Tarayıcıda açılacak adres:

```text
http://127.0.0.1:4174
```

Varsayılan PIN:

```text
1559
```

PIN'i değiştirmek için:

```bash
FIXBOARD_PIN=2468 npm run serve:pin
```

## Kalıcı Web Yayını

Kalıcı statik yayın paketi için:

```bash
npm run build:sites
```

Bu sürüm bağlantı açıldığında doğrudan teşhis motorunu, PDF raporunu ve hızlı Astra yanıtlarını sunar. Derin Gemma4 modu yerel Ollama bağlantısı gerektirdiği için yalnız servis bilgisayarından sunulan sürümde etkinleşir.

## Yerel AI / Ollama

Astra iki çalışma modu sunar:

- `Hızlı Yanıt`: Günlük ve sık saha sorularını cihaz üzerinde anında yanıtlar.
- `Derin / gemma4`: PIN korumalı sunucu üzerinden yerel Ollama modelini akışlı olarak kullanır; yanıt kullanıcı tarafından durdurulabilir.

Model kapalıysa Derin mod devre dışı kalır. Aktif teşhis, işlem geçmişi ve teknisyen notları tarayıcıda taslak olarak saklanır.

Varsayılan model:

```text
gemma4
```

Farklı model kullanmak için:

```bash
FIXBOARD_AI_MODEL=gemma4:12b npm run serve:pin
```

Ollama farklı adreste çalışıyorsa:

```bash
OLLAMA_URL=http://127.0.0.1:11434 FIXBOARD_AI_MODEL=gemma4 npm run serve:pin
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

Tunnel kullanırken dışarıya Ollama portunu değil, PIN server portunu açın:

```bash
npm run tunnel
```

Komutun verdiği `https://...trycloudflare.com` linki Android telefonda hücresel veriyle açılabilir. Tünel kararlılığı için HTTP/2 kullanılır. Mac açık kalmalı; `npm run serve:pin`, Ollama ve tunnel terminali çalıştığı sürece erişim devam eder.

Android Chrome menüsündeki `Ana ekrana ekle` seçeneğiyle uygulama kurulabilir. Bir kez çevrimiçi açılan karar ağacı ve aktif teşhis taslağı bağlantı kesildiğinde de kullanılabilir; Derin Gemma4 modu için Mac bağlantısı gerekir.

## Doğrulama

```bash
npm run validate:data
npm test
npm run lint
npm run build
```
