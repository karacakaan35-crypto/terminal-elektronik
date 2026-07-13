function hasAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword))
}

function formatCandidate(candidate) {
  if (!candidate) {
    return 'Henüz güçlü aday oluşmadı.'
  }

  return `${candidate.label} şu an yaklaşık %${candidate.probability} görünüyor.`
}

function contextLine({ selectedProfile, currentNode, candidates }) {
  const profile = selectedProfile?.name || 'seçili cihaz yok'
  const step = currentNode?.title || 'başlangıç'
  return `Aktif bağlam: ${profile} / ${step}. En güçlü aday: ${formatCandidate(candidates?.[0])}`
}

export const assistantGreeting =
  'Buradayım. Arıza tarafında ölçüm sırası çıkarabilirim; istersen günlük bir şey de sorabilirsin.'

export const assistantQuickPrompts = [
  'Adaptör boşta sağlam ama cihaz çalışmıyor',
  'Hayat nasıl gidiyor?',
  'Türk kahvesi nasıl yapılır?',
  '3162 dahili çalışmıyor ne olabilir?',
  'Fotosel hizalama hatası nasıl anlaşılır?',
  'PoE kamera ağda görünmüyor',
  'Kartta 5V var ama MCU çalışmıyor',
  'Bugün çok yoruldum ne önerirsin?',
]

function extractSimpleMath(text) {
  const match = text.match(/(-?\d+(?:[.,]\d+)?)\s*([+\-*/x×÷])\s*(-?\d+(?:[.,]\d+)?)/)

  if (!match) {
    return null
  }

  const left = Number(match[1].replace(',', '.'))
  const operator = match[2]
  const right = Number(match[3].replace(',', '.'))

  if (!Number.isFinite(left) || !Number.isFinite(right)) {
    return null
  }

  if ((operator === '/' || operator === '÷') && right === 0) {
    return 'Sıfıra bölme yapılamaz.'
  }

  const result = {
    '+': left + right,
    '-': left - right,
    '*': left * right,
    x: left * right,
    '×': left * right,
    '/': left / right,
    '÷': left / right,
  }[operator]

  return `${match[1]} ${operator} ${match[3]} = ${Number(result.toFixed(4))}`
}

export function generateAssistantReply(message, context) {
  const text = message.toLocaleLowerCase('tr-TR')
  const prefix = contextLine(context)
  const historyCount = context.history?.length || 0
  const mathResult = extractSimpleMath(text)

  if (hasAny(text, ['merhaba', 'selam', 'günaydın', 'iyi akşamlar', 'naber', 'nasılsın', 'hayat nasıl', 'nasıl gidiyor'])) {
    return `Buradayım, sakin sakin devam. Senin tarafta işler nasıl? İstersen bir cihaz arızasına gireriz, istersen iki dakika gündelik takılırız.`
  }

  if (hasAny(text, ['sen kimsin', 'nesin', 'adın ne', 'astra kim'])) {
    return `Ben Astra; Terminal Elektronik içinde çalışan yerel/yarı yerel teknik destek asistanıyım. Önceliğim elektronik arıza teşhisi ama gündelik sorularda da kısa ve pratik yardımcı olurum. Hassas veya kesin uzmanlık isteyen konularda ölçerek/doğrulayarak ilerlemeyi öneririm.`
  }

  if (mathResult) {
    return `Hesap sonucu: ${mathResult}. İstersen bunu voltaj bölücü, akım, güç veya direnç hesabına da uygulayabilirim.`
  }

  if (hasAny(text, ['bugün çok yoruldum', 'yoruldum', 'moralim bozuk', 'kafam dolu', 'stres', 'bunaldım'])) {
    return `Biraz mola iyi gelir. 10 dakika ekranı bırak, su iç, sonra işi tek adıma indir: sadece bir ölçüm, sadece bir kablo kontrolü, sadece bir not. Zor günü komple çözmeye çalışma; sıradaki küçük doğru hamleyi seçelim.`
  }

  if (hasAny(text, ['ne yiyelim', 'ne yesem', 'yemek öner', 'acıktım', 'kahvaltı', 'öğle yemeği'])) {
    return `Pratik ve ağırlaştırmayan bir şey seç: tost/omlet, çorba, tavuklu salata ya da yoğurtlu bir tabak iyi gider. Servis başındaysan çok yağlı yemek konsantrasyonu düşürebilir; yanına su veya sade kahve daha iyi eşlik eder.`
  }

  if (hasAny(text, ['türk kahvesi', 'turk kahvesi', 'kahve nasıl yapılır', 'kahvesi nasıl yapılır'])) {
    return `Türk kahvesi için kişi başı 1 fincan soğuk su, 1 tatlı kaşığı ince çekilmiş Türk kahvesi ve isteğe göre şeker kullan. Hepsini cezvede karıştır, kısık ateşe al ve kaynatmadan köpük yükselene kadar bekle. Köpüğü fincana paylaştır, cezveyi kısa süre tekrar ateşe alıp kahveyi fincana dök. Bir dakika telvesinin çökmesini bekletirsen daha iyi içilir.`
  }

  if (hasAny(text, ['çay nasıl yapılır', 'çay demle', 'iyi çay', 'demli çay'])) {
    return `İyi çay için demliği ısıt, kişi başı yaklaşık 1 tatlı kaşığı çay koy, üzerine kaynar su ekle ve alt demliğe taze su koy. Kısık ateşte 12-15 dakika demle. Çayı kaynatmamaya çalış; kaynarsa tadı acılaşır.`
  }

  if (hasAny(text, ['kahve', 'çay', 'uykum var', 'enerjim yok'])) {
    return `Kahve iyi fikir olabilir ama önce su iç. Uykun çoksa kısa yürüyüş veya 10 dakikalık mola kahveden daha temiz toparlar. İnce lehim/enerjili ölçüm yapacaksan titreme yapacak kadar kafeine yüklenme.`
  }

  if (hasAny(text, ['hava nasıl', 'yağmur', 'şemsiye', 'dışarı çıkayım mı'])) {
    return `Canlı hava durumuna şu an doğrudan bakmıyorum. En doğrusu telefonundaki hava durumu uygulamasını kontrol etmek. Servise çıkacaksan yine de çantaya küçük şemsiye, powerbank ve yedek ölçü kablosu atmak iyi fikir.`
  }

  if (hasAny(text, ['plan yap', 'bugün ne yapayım', 'işleri sırala', 'işlerimi', 'nasıl planlayayım', 'öncelik', 'program yap'])) {
    return `Önceliği şöyle kur: önce acil/saha bekleyen işler, sonra hızlı bitecek ölçüm işleri, en sona belirsiz ve uzun arıza araştırmaları. Her cihaz için bir sonraki fiziksel aksiyonu yaz: ölç, sök, değiştir, ara, raporla. Böylece liste kafada değil masada durur.`
  }

  if (hasAny(text, ['adaptör', 'adapter', 'besleme', 'voltaj çök', 'yük altında', 'smps'])) {
    return `${prefix}\n\nAdaptör boşta normal ölçülüp cihazı çalıştırmıyorsa öncelik yük-altı testidir. Adaptörü cihaza bağlı bırak, okuyucu/kilit/röle aktifken panel girişinden voltaj ölç. 11.5V altına düşüyorsa adaptör akım veremiyor, kondansatör/ripple problemi var veya kablo/klemens temassız olabilir. DC jakı oynatınca panel resetliyorsa adaptörü sağlam kabul etme.`
  }

  if (hasAny(text, ['3162', 'dahili', 'telefon', 'pbx', 'çevir sesi', 'santral'])) {
    return `${prefix}\n\nTek bir dahili, mesela 3162 sorunluysa önce santral değil hat tarafını ele. Sıra şu olsun: sağlam telefonla çapraz test, priz/patch/Krone kontrolü, tip-ring süreklilik testi, kısa devre/nem ölçümü, sonra PBX port değişimli test. Hat voltajı çöküyorsa kısa/nem; hiç yoksa açık devre veya port; çevir sesi var ama arama yoksa yetki/yönlendirme ayarı daha olasıdır.`
  }

  if (hasAny(text, ['fotosel', 'photo', 'hizalama', 'ışın', 'bariyer', 'kapı kapanmıyor'])) {
    return `${prefix}\n\nFotosel arızasında sadece LED yanıyor diye geçme. Alıcı-verici hizasını, lens kirini, güneş yansımasını ve emniyet girişinin kartta aktif kalıp kalmadığını kontrol et. Bariyer kapanmıyorsa fotosel kontağını kart girişinde ölç; sahada sağlam görünen fotosel kablo/klemens yüzünden kartta sürekli açık algılanabilir.`
  }

  if (hasAny(text, ['poe', 'kamera', 'cctv', 'nvr', 'ip', 'ağda görünmüyor', 'görüntü yok', 'beyaz sis', 'buğu', 'gece görüntüsü'])) {
    return `${prefix}\n\nKamera tarafında sırayı güçten başlat: PoE port/enjektör, RJ45 krimp, kablo testi, switch PoE bütçesi. Kamera enerjili ama ağda yoksa IP/VLAN/NVR kanal eşleşmesine geç. Gece görüntüsü beyaz sis gibiyse IR yansıması, kubbe/lens kiri, buğu/nem, conta problemi ve kamera açısının duvara/metal yüzeye fazla yakın olması ilk kontrol olmalı.`
  }

  if (hasAny(text, ['ups', 'akü', 'şarj', 'yükte kapanıyor', 'inverter'])) {
    return `${prefix}\n\nUPS için boşta voltaj yanıltabilir. Aküyü yük altında test et, şarj voltajını 13.4-14.4V civarında doğrula, sonra 5V/3.3V rail ve giriş koruma hattına geç. Yük bağlanınca kapanıyorsa akü iç direnci, ESR yüksek kondansatör veya inverter/MOSFET sürücü hattı öne çıkar.`
  }

  if (hasAny(text, ['röle', 'relay', 'kontaktör', 'klik', 'no nc', 'com', 'bobin'])) {
    return `${prefix}\n\nRölede LED veya klik tek başına yeterli kanıt değil. Bobin gerilimini, sürücü transistörünü ve flyback diyodu ölç; sonra COM-NO/NC kontak sürekliliğini komut sırasında kontrol et. Klik var ama kilit/yük çalışmıyorsa kontak yanığı, yanlış NO/NC bağlantısı veya COM beslemesi eksik olabilir.`
  }

  if (hasAny(text, ['yangın', 'zone', 'siren', 'eol', 'nac', 'panel reset'])) {
    return `${prefix}\n\nYangın panelinde zone arızasında EOL direnciyle başla; açık/kısa ayrımını panelden değil hat uçlarından doğrula. Panel resetliyorsa AUX yükünü ayırıp akü ve şarj hattını ölç. Siren yoksa NAC/siren çıkışı, sigorta ve hat sonu denetimi ayrı kontrol edilmeli.`
  }

  if (hasAny(text, ['cacs', 'kart okuyucu', 'okuyucu', 'wiegand', 'rs485', 'kilit', 'kapı açmıyor'])) {
    return `${prefix}\n\nCACS için üç ayrı hat düşün: okuyucu beslemesi/verisi, kilit çıkışı ve panel beslemesi. Okuyucu LED var ama kart okumuyorsa D0/D1 veya RS485 aktivitesine bak. Yetki var ama kapı açmıyorsa röle COM-NO/NC ve kilit uçlarındaki gerçek voltajı ölç. Adaptör değişince düzeldiyse mutlaka eski adaptörü yük altında test et.`
  }

  if (hasAny(text, ['kayar kapı', 'otomatik kapı', 'radar', 'kapı yarıda', 'encoder', 'limit switch', 'limit'])) {
    return `${prefix}\n\nKayar kapıda önce mekanik yükü elektrikten ayır. Ray, teker, kayış ve kanat sürtünmesi normalse radar/fotosel/emniyet girişlerini kontrol et. Motor komutu var ama hareket yoksa sürücü çıkışı ve motor uçlarında gerçek voltaj/akım ölç; yarıda kalıyorsa limit, encoder ve öğrenme pozisyonu daha olasıdır.`
  }

  if (hasAny(text, ['uvis', 'araç altı', 'araç geçince', 'loop', 'tetik', 'aydınlatma barı', 'nvr kayıt'])) {
    return `${prefix}\n\nUVIS tarafında şikayeti üçe böl: tetik, görüntü, kayıt. Araç geçince kayıt başlamıyorsa loop/fotosel tetik girişini ve I/O kablosunu ölç. Görüntü yoksa kamera-switch-NVR hattını, karanlıksa LED bar/sürücü beslemesini kontrol et. Görüntü var ama kayıt yoksa NVR/PC servisleri, disk ve yazılım akışına geç.`
  }

  if (hasAny(text, ['mcu', 'mikrodenetleyici', 'kristal', 'clock', 'reset', 'boot', 'jtag', 'swd'])) {
    return `${prefix}\n\n5V/3.3V normal ama MCU çalışmıyorsa sırayı şöyle kur: reset pini seviyesini ölç, kristal/oscillator salınımını kontrol et, boot pinlerinin yanlış seviyede kalmadığını doğrula, sonra SWD/JTAG erişimi dene. Reset hattı sürekli düşükse supervisor, reset butonu, kısa devre kondansatör veya MCU hasarı öne çıkar.`
  }

  if (hasAny(text, ['eeprom', 'spi flash', 'flash', 'hafıza', 'firmware', 'yazılım bozuk'])) {
    return `${prefix}\n\nHafıza şüphesinde önce besleme ve hat seviyelerini doğrula: VCC, CS, CLK, MOSI/MISO. SPI Flash/EEPROM ısınıyor veya bus sürekli düşük kalıyorsa kısa ya da çip arızası olabilir. Besleme ve clock normal ama cihaz ayarları kayboluyorsa dump alıp sağlam firmware/veri ile karşılaştırmak gerekir.`
  }

  if (hasAny(text, ['motor', 'mosfet', 'sürücü', 'inverter', 'h köprü', 'h-bridge', 'ısınma'])) {
    return `${prefix}\n\nMotor/sürücü arızasında önce yükü ayırıp motoru ve mekanik sıkışmayı dışla. Sonra sürücü beslemesi, MOSFET kısa devresi, gate sinyali ve akım algılama direncini kontrol et. MOSFET ısınıyor veya sigorta atıyorsa motor hattında kısa, sürücü gate kaçağı ya da ters diyot/TVS arızası olabilir.`
  }

  if (hasAny(text, ['kısa devre', 'ısınan parça', 'termal', 'rail düşük', 'regülatör ısınıyor', 'diyot mod'])) {
    return `${prefix}\n\nKartta kısa devre ararken doğrudan parça sökmeye atlama. Enerjisiz direnç/diyot moduyla rail haritası çıkar, düşük ohm hattı belirle, akım sınırlı güç kaynağıyla düşük voltaj enjekte edip termal kamera/alkol buharı/parmakla güvenli ısı takibi yap. Regülatör ısınıyorsa regülatör mü arızalı, yoksa çıkış rail'i mi kısa bunu çıkışı ayırarak doğrula.`
  }

  if (hasAny(text, ['ne yapayım', 'takıldım', 'sıradaki', 'yardım', 'öner', 'kontrol'])) {
    const lastStep = context.history?.[historyCount - 1]
    const lastLine = lastStep ? `Son kayıt: ${lastStep.title} -> ${lastStep.answer}.` : 'Henüz ölçüm kaydı yok.'
    return `${prefix}\n\n${lastLine} Şu an en sağlıklı ilerleme: önce besleme/ölçüm güvenilirliğini doğrula, sonra kablo-klemens-temas ihtimalini dışla, en son kart üzeri komponent arızasına git. Ölçtüğün değeri yazarsan bir sonraki kontrolü daha net söyleyebilirim.`
  }

  return `${prefix}\n\nBunu genel arıza mantığıyla ele alalım: 1) Besleme doğru mu ve yük altında stabil mi? 2) Kablo/klemens/konnektör teması sağlam mı? 3) Giriş-çıkış sinyali kart üzerinde gerçekten görünüyor mu? 4) Bunlar normalse ilgili sürücü, regülatör, röle veya MCU çevresine geç. İstersen cihazı ve belirtiyi tek cümle yaz, daha hedefli cevap vereyim.`
}
