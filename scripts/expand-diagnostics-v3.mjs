import { readFileSync, writeFileSync } from 'node:fs'

const dataUrl = new URL('../src/data/diagnostics.json', import.meta.url)
const data = JSON.parse(readFileSync(dataUrl, 'utf8'))

function compact(value) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined))
}

function symptom({ id, device, category, title, prompt, options, optionBadge = 'BELIRTI', sourceIds = [] }) {
  return { id, type: 'symptom', device, category, title, prompt, optionBadge, options, sourceIds }
}

function question(config) {
  return compact({
    id: config.id,
    type: config.type || 'question_boolean',
    device: config.device,
    category: config.category,
    title: config.title,
    prompt: config.prompt,
    yesLabel: config.yesLabel,
    noLabel: config.noLabel,
    unknownLabel: config.unknownLabel || 'Kontrol edemiyorum',
    nextYes: config.nextYes,
    nextNo: config.nextNo,
    nextUnknown: config.nextUnknown,
    scoreYes: config.scoreYes || {},
    scoreNo: config.scoreNo || {},
    scoreUnknown: config.scoreUnknown || {},
    danger: config.danger,
    meterMode: config.meterMode,
    powerState: config.powerState,
    probeBlack: config.probeBlack,
    probeRed: config.probeRed,
    testSteps: config.testSteps || [],
    stopConditions: config.stopConditions || [],
    sourceIds: config.sourceIds || [],
  })
}

function measurement(config) {
  return {
    id: config.id,
    type: 'measurement',
    device: config.device,
    category: config.category,
    title: config.title,
    prompt: config.prompt,
    unit: config.unit,
    meterMode: config.meterMode,
    powerState: config.powerState,
    probeBlack: config.probeBlack,
    probeRed: config.probeRed,
    expected: config.expected,
    danger: config.danger || 'low',
    hint: config.hint,
    testSteps: config.testSteps || [],
    stopConditions: config.stopConditions || [],
    rules: config.rules,
    fallbackNext: config.fallbackNext,
    sourceIds: config.sourceIds || [],
  }
}

function result(config) {
  return {
    id: config.id,
    type: 'result',
    device: config.device,
    category: config.category,
    title: config.title,
    summary: config.summary,
    severity: config.severity || 'warning',
    components: config.components,
    repair: config.repair,
    verification: config.verification,
    sourceIds: config.sourceIds || [],
  }
}

data.version = '4.1.0'
data.fieldMode = {
  enabled: true,
  tools: [
    'Multimetre',
    'Kontrol kalemi (yalnız ön kontrol)',
    'Bilgisayar / servis yazılımı',
    'Sağlam Ethernet / RJ45 deneme kablosu',
    'Sağlam RJ11 telefon kablosu ve analog telefon',
    'Sağlam DC adaptör ve deneme kablosu',
  ],
  note: 'Kontrol kalemi tek başına enerjinin kesildiğini kanıtlamaz. Gerilim yokluğu uygun multimetreyle doğrulanmalıdır.',
}
data.diagnosticMethodology = {
  evidencePolicy: 'Başlangıç puanları kalibre edilmiş arıza olasılığı değil, normalize edilmiş servis önceliğidir; canlı kanıt yalnız göreli sıralamayı günceller.',
  measurementPolicy: 'Üretici model etiketi ve servis kılavuzu, uygulamadaki genel aralıklardan önce gelir.',
  isolationPolicy: 'Sağlam kablo, adaptör, port veya cihazla karşılaştırma yapılmadan kart değişimi önerilmez.',
  safetyPolicy: 'Şebeke, hareketli mekanizma ve yangın güvenliği devrelerinde yalnız yetkili teknisyen ve uygun kategori ölçü aletiyle işlem yapılır.',
}

data.sourceCatalog = {
  apc_ups: {
    publisher: 'APC by Schneider Electric',
    title: 'Smart-UPS basic troubleshooting steps',
    url: 'https://www.apc.com/ca/en/faqs/FAQ000266148/',
  },
  keysight_power: {
    publisher: 'Keysight Technologies',
    title: 'Accurate DC-to-DC converter testing under load',
    url: 'https://www.keysight.com/content/keysight/zz/en/use-cases/perform-accurate-dc-to-dc-converters-testing.html',
  },
  fluke_dc_supply: {
    publisher: 'Fluke',
    title: 'Troubleshoot DC power supplies with a multimeter and oscilloscope',
    url: 'https://www.fluke.com/en-us/learn/blog/predictive-maintenance/beyond-the-multimeter-part-5',
  },
  ti_power_transient: {
    publisher: 'Texas Instruments',
    title: 'Output capacitor effects on load transient performance',
    url: 'https://www.ti.com/document-viewer/lit/html/SSZTAL7/GUID-3EDE487C-5BCB-45E3-8940-52FAA90331EA',
  },
  nice_mlbar: {
    publisher: 'Nice',
    title: 'M-Bar and L-Bar road barrier diagnostics and flash codes',
    url: 'https://www.niceforyou.com/uk/professional-area/videos-faq/road-barriers/m-bar-l-bar',
  },
  ctec_fire: {
    publisher: 'C-TEC',
    title: 'FP conventional fire panel technical data and fault indications',
    url: 'https://c-tec.com/product/conventional-fire-systems/fpmfp-1-28-zone-fire-panels/ff386-2-fp-6-zone-conventional-fire-alarm-panel/',
  },
  axis_network: {
    publisher: 'Axis Communications',
    title: 'Network connection troubleshooting guide',
    url: 'https://help.axis.com/en-US/troubleshooting-network',
  },
  axis_image: {
    publisher: 'Axis Communications',
    title: 'Image quality and IR reflection troubleshooting guide',
    url: 'https://help.axis.com/en-us/troubleshooting-image-quality',
  },
  hid_signo: {
    publisher: 'HID Global',
    title: 'HID Signo reader installation guide',
    url: 'https://www.hidglobal.com/ja/media/436',
  },
  paxton_net2: {
    publisher: 'Paxton Access',
    title: 'Net2 access control application notes and troubleshooting',
    url: 'https://www.paxton-access.com/us/install-paxton/resources/application-notes/',
  },
  cisco_fxs: {
    publisher: 'Cisco',
    title: 'Troubleshoot and monitor analog FXS/FXO ports',
    url: 'https://www.cisco.com/c/en/us/support/docs/voice/analog-signaling-e-m-did-fxs-fxo/214636-troubleshoot-and-monitor-analog-ports.html',
  },
  cisco_fxs_voltage: {
    publisher: 'Cisco',
    title: 'Ringing and idle voltages on FXS interfaces',
    url: 'https://www.cisco.com/c/en/us/support/docs/voice/analog-signaling-e-m-did-fxs-fxo/28280-ring-idle-voltages-fxs.html',
  },
  dormakaba_sliding: {
    publisher: 'dormakaba',
    title: 'Automatic sliding door activation and safety checks',
    url: 'https://www.dormakaba.com/gb-en/services-and-support/maintenance-and-service/occupier-safety-checks/sliding-doors',
  },
  geze_sliding: {
    publisher: 'GEZE',
    title: 'Automatic sliding door errors and troubleshooting resources',
    url: 'https://www.geze.com/en/products-solutions/sliding_doors/automatic_sliding_doors/slimdrive/slimdrive_slt_fr/p_89301',
  },
  yuasa_vrla: {
    publisher: 'GS Yuasa',
    title: 'SWL series AGM VRLA technical data sheet',
    url: 'https://www.gs-yuasa.eu/uk/datasheet/index/download/?sku=SWL3300-12%2FI%2FFR%2FBulk',
  },
  nice_mlbar_manual: {
    publisher: 'Nice',
    title: 'M/L-Bar electromechanical barrier instruction manual',
    url: 'https://www.niceforyou.com/sites/default/files/upload/manuals/IS0647A03EN.pdf',
  },
  notifier_nfs_supra: {
    publisher: 'Notifier by Honeywell',
    title: 'NFS Supra conventional fire panel installation manual',
    url: 'https://www.notifier.es/documentacion/notifier/manuales/HLSI-MN-025-I_NFS%20Supra%20Series.pdf',
  },
  notifier_eol_legacy: {
    publisher: 'Notifier by Honeywell',
    title: 'AFP-300/AFP-400 installation manual — model-specific EOL values',
    url: 'https://www.notifier.es/documentacion/notifier/manualesobs/50253SP.pdf',
  },
  axis_poe_power: {
    publisher: 'Axis Communications',
    title: 'Typical and maximum power consumption in Axis cameras',
    url: 'https://whitepapers.axis.com/en-us/typical-and-maximum-power-consumption-in-axis-cameras',
  },
  sia_osdp_checklist: {
    publisher: 'Security Industry Association',
    title: 'OSDP implementation checklist',
    url: 'https://www.securityindustry.org/2026/02/10/implementing-osdp-access-control-follow-this-simple-checklist/',
  },
  hikvision_uvss: {
    publisher: 'Hikvision',
    title: 'Portable Under Vehicle Surveillance System user manual',
    url: 'https://us-legacy.hikvision.com/en/system/files_force/um_mv_uvss_111717na_0.pdf?download=1',
  },
  dormakaba_esa100: {
    publisher: 'dormakaba',
    title: 'ESA100 automatic sliding door owner and safety manual',
    url: 'https://my.dormakaba.com/medias/DL0741-010-ESA100-OWN.pdf?context=bWFzdGVyfGltYWdlc3wxNjMyOTJ8YXBwbGljYXRpb24vcGRmfGltYWdlcy9oNWUvaDM4Lzg5ODg1NzAzMjA5MjYucGRmfGM5N2MwM2M2YjcxNDMyNjk2MTdlNTJjYzM1M2ZlYTQ3ZDY5ZTVmYjI3OGExMWVkN2MwMDU3ZDI0NThjNjI1Y2Q',
  },
  ti_rs485: {
    publisher: 'Texas Instruments',
    title: 'The RS-485 Design Guide',
    url: 'https://www.ti.com/lit/an/slla272d/slla272d.pdf',
  },
  microchip_poe: {
    publisher: 'Microchip Technology',
    title: 'Power over Ethernet standards overview',
    url: 'https://developerhelp.microchip.com/xwiki/bin/view/applications/ethernet/poe/standards/',
  },
}

const sourceMetadata = {
  apc_ups: ['manufacturer', 'UPS belirti ve temel sorun giderme akışı'],
  keysight_power: ['engineering-guide', 'Yük altında besleme ve DC/DC doğrulama yöntemi'],
  fluke_dc_supply: ['engineering-guide', 'Multimetre ve osiloskopla güç kaynağı ölçümü'],
  ti_power_transient: ['engineering-guide', 'Yük geçişi, çıkış kondansatörü ve transient davranışı'],
  nice_mlbar: ['manufacturer', 'Nice M/L-Bar hata kodları ve saha teşhisi'],
  nice_mlbar_manual: ['manufacturer', 'Nice M/L-Bar girişler, öğrenme, encoder ve emniyet zinciri'],
  ctec_fire: ['manufacturer', 'C-TEC FP/CFP panel besleme ve 6.8 kΩ EOL değerleri'],
  notifier_nfs_supra: ['manufacturer', 'Notifier NFS Supra 4.7 kΩ EOL ve zone bağlantısı'],
  notifier_eol_legacy: ['manufacturer', 'Notifier model/modül bazlı 2.2/4.7/47 kΩ EOL farklılıkları'],
  axis_network: ['manufacturer', 'IP kamera ağ yolu ve bağlantı sorun giderme'],
  axis_image: ['manufacturer', 'Kamera görüntü ve IR yansıma sorun giderme'],
  axis_poe_power: ['manufacturer', 'PoE güç bütçesi, tipik/maksimum tüketim ve kablo kaybı'],
  hid_signo: ['manufacturer', 'HID Signo okuyucu kablolama ve ilk çalışma kontrolü'],
  paxton_net2: ['manufacturer', 'Net2 erişim kontrol uygulama ve sorun giderme notları'],
  sia_osdp_checklist: ['standards-body', 'OSDP RS-485 kablo, adres, güç, Secure Channel ve devreye alma'],
  hikvision_uvss: ['manufacturer', 'UVSS bileşen, ağ, kamera ve kontrol sistemi işletimi'],
  cisco_fxs: ['manufacturer', 'FXS/FXO port işlevi ve analog port sorun giderme'],
  cisco_fxs_voltage: ['manufacturer', 'FXS idle ve ringing gerilimleri'],
  dormakaba_sliding: ['manufacturer', 'Otomatik kayar kapı aktivasyon ve emniyet testi'],
  dormakaba_esa100: ['manufacturer', 'ESA100 günlük sensör ve güvenli kapanma testi'],
  geze_sliding: ['manufacturer', 'GEZE kayar kapı ürün ve servis referansı'],
  yuasa_vrla: ['manufacturer', '12V VRLA float/boost gerilimi, sıcaklık ve yük özellikleri'],
  ti_rs485: ['engineering-guide', 'RS-485 diferansiyel sürücü ve alıcı eşikleri, kablo ve sonlandırma'],
  microchip_poe: ['engineering-guide', 'IEEE 802.3af/at/bt PSE voltaj ve güç sınıfları'],
}

for (const [sourceId, source] of Object.entries(data.sourceCatalog)) {
  const [sourceType, scope] = sourceMetadata[sourceId] || ['manufacturer', 'Üretici teknik referansı']
  Object.assign(source, { sourceType, scope, retrievedAt: '2026-07-15' })
}

const profileSources = {
  ups: ['apc_ups', 'yuasa_vrla', 'keysight_power', 'ti_power_transient'],
  barrier: ['nice_mlbar', 'nice_mlbar_manual', 'fluke_dc_supply'],
  fire_panel: ['ctec_fire', 'notifier_nfs_supra', 'notifier_eol_legacy', 'fluke_dc_supply'],
  cctv: ['axis_network', 'axis_image', 'axis_poe_power', 'microchip_poe', 'keysight_power'],
  access: ['hid_signo', 'paxton_net2', 'sia_osdp_checklist', 'ti_rs485', 'keysight_power'],
  uvis: ['hikvision_uvss', 'axis_network', 'axis_image', 'keysight_power'],
  pbx: ['cisco_fxs', 'cisco_fxs_voltage'],
  sliding: ['dormakaba_sliding', 'dormakaba_esa100', 'geze_sliding'],
  support: ['keysight_power', 'fluke_dc_supply', 'ti_power_transient'],
  general: ['ti_power_transient', 'fluke_dc_supply', 'keysight_power'],
}

Object.assign(data.faultCatalog, {
  battery_connection_fault: { label: 'Akü klemensi, kablo pabucu veya seri bağlantı temassız', componentGroup: 'Akü bağlantıları', risk: 'warning' },
  ups_overload: { label: 'UPS kapasitesi aşılmış veya bağlı yükte ani akım/kısa devre var', componentGroup: 'UPS çıkış yükü', risk: 'critical' },
  ups_transfer_fault: { label: 'Şebeke-akü transfer rölesi, AVR veya transfer algılama arızası', componentGroup: 'UPS transfer katı', risk: 'critical' },
  ups_inverter_fault: { label: 'İnverter MOSFET, trafo veya çıkış geri besleme arızası', componentGroup: 'UPS inverter katı', risk: 'critical' },
  bluebus_fault: { label: 'Nice BlueBUS cihaz listesi, saha cihazı veya öğrenme uyuşmazlığı', componentGroup: 'BlueBUS emniyet ağı', risk: 'warning' },
  stop_input_fault: { label: 'STOP/acil durdurma girişi aktif, açık devre veya kararsız', componentGroup: 'Bariyer STOP girişi', risk: 'critical' },
  barrier_encoder_fault: { label: 'Bariyer enkoder, limit veya konum öğrenme arızası', componentGroup: 'Bariyer konum geri bildirimi', risk: 'warning' },
  barrier_mechanical_fault: { label: 'Bariyer yay dengesi, redüktör veya kol mekanik sıkışması', componentGroup: 'Bariyer mekanik sistem', risk: 'warning' },
  barrier_mains_fault: { label: 'Bariyer şebeke, sigorta veya kart yardımcı besleme arızası', componentGroup: 'Bariyer ana besleme', risk: 'critical' },
  fire_eol_mismatch: { label: 'Zone EOL değeri/model modülü yanlış veya tolerans dışında', componentGroup: 'Yangın zone sonlandırma', risk: 'warning' },
  fire_earth_fault: { label: 'Zone, siren veya AUX hattında toprağa kaçak', componentGroup: 'Yangın saha kablolaması', risk: 'critical' },
  fire_aux_overload: { label: 'Panel AUX çıkışında aşırı yük veya saha kısa devresi', componentGroup: 'Yangın paneli AUX', risk: 'critical' },
  fire_field_device_fault: { label: 'Dedektör, buton, siren veya saha modülü arızası', componentGroup: 'Yangın saha cihazları', risk: 'warning' },
  cctv_cable_fault: { label: 'RJ45/BNC kablo, krimp, çift sırası veya saha ekinde arıza', componentGroup: 'CCTV saha kablosu', risk: 'warning' },
  cctv_poe_budget_fault: { label: 'PoE sınıfı, port güç limiti veya switch toplam bütçesi yetersiz', componentGroup: 'PoE güç bütçesi', risk: 'warning' },
  cctv_network_config: { label: 'IP, VLAN, DHCP, ağ geçidi veya erişim kuralı hatası', componentGroup: 'CCTV ağ yapılandırması', risk: 'info' },
  cctv_stream_fault: { label: 'Kamera stream, codec, firmware veya NVR kanal uyumsuzluğu', componentGroup: 'CCTV video akışı', risk: 'info' },
  cctv_image_optics: { label: 'Dome/lens kirli, IR yansıması, nem veya optik hizalama sorunu', componentGroup: 'Kamera optik ve muhafaza', risk: 'info' },
  cctv_storage_fault: { label: 'NVR disk, SD kart veya kayıt kotası/yazma arızası', componentGroup: 'CCTV kayıt depolama', risk: 'warning' },
  access_psu_ripple: { label: 'CACS beslemesinde ripple, transient düşüm veya akım limiti', componentGroup: 'CACS güç kalitesi', risk: 'warning' },
  access_reader_power: { label: 'Okuyucu 5/12V besleme, GND dönüşü veya kablo düşümü arızası', componentGroup: 'CACS okuyucu beslemesi', risk: 'warning' },
  access_credential_config: { label: 'Kart yetkisi, site kodu, format veya zaman profili hatası', componentGroup: 'CACS yetkilendirme', risk: 'info' },
  access_lock_mechanical: { label: 'Kilit mekanizması, kapı baskısı veya kablo voltaj düşümü arızası', componentGroup: 'CACS kilit ve kapı', risk: 'warning' },
  access_door_input_fault: { label: 'Kapı kontağı, REX, acil açma veya giriş denetim arızası', componentGroup: 'CACS kapı girişleri', risk: 'warning' },
  access_rs485_fault: { label: 'RS485 polarite, terminasyon, adres veya ortak referans arızası', componentGroup: 'CACS kontrolör veri yolu', risk: 'warning' },
  uvis_illumination_fault: { label: 'UVIS aydınlatma barı, segment sürücüsü veya senkron arızası', componentGroup: 'UVIS aydınlatma', risk: 'warning' },
  uvis_storage_fault: { label: 'UVIS kayıt diski, yazma izni veya depolama doluluk arızası', componentGroup: 'UVIS depolama', risk: 'warning' },
  uvis_calibration_fault: { label: 'UVIS kamera geometrisi, stitching veya referans kalibrasyon arızası', componentGroup: 'UVIS kalibrasyon', risk: 'info' },
  pbx_cabling_fault: { label: 'PBX patch panel, Krone, priz veya iki telli dahili kablo arızası', componentGroup: 'PBX saha kablosu', risk: 'warning' },
  pbx_handset_fault: { label: 'Analog telefon, ahize kordonu, zil devresi veya REN uyumsuzluğu', componentGroup: 'PBX uç cihaz', risk: 'info' },
  pbx_ring_fault: { label: 'FXS ring üretimi, ring frekansı veya zil yükü arızası', componentGroup: 'PBX zil sinyali', risk: 'warning' },
  pbx_audio_fault: { label: 'Tek yönlü ses, empedans, uzun hat veya EMI kaynaklı ses yolu arızası', componentGroup: 'PBX analog ses yolu', risk: 'warning' },
  pbx_dtmf_fault: { label: 'DTMF üretimi/algılama veya arama planı uyumsuzluğu', componentGroup: 'PBX rakam sinyalleşmesi', risk: 'info' },
  pbx_trunk_fault: { label: 'PBX dış hat/trunk, operatör hattı veya yönlendirme arızası', componentGroup: 'PBX trunk', risk: 'warning' },
  sliding_safety_fault: { label: 'Kayar kapı güvenlik sensörü veya test izleme arızası', componentGroup: 'Kayar kapı emniyet alanı', risk: 'critical' },
  sliding_encoder_fault: { label: 'Kayar kapı enkoder, sıfır noktası veya öğrenme turu arızası', componentGroup: 'Kayar kapı konum geri bildirimi', risk: 'warning' },
  sliding_lock_fault: { label: 'Kayar kapı elektromekanik kilit veya kilit durum girişi arızası', componentGroup: 'Kayar kapı kilidi', risk: 'warning' },
  sliding_battery_fault: { label: 'Kayar kapı acil güç/USV aküsü veya şarj modülü arızası', componentGroup: 'Kayar kapı acil güç', risk: 'warning' },
  support_psu_sag: { label: 'Yardımcı besleme yük altında voltaj düşürüyor veya akım limitine giriyor', componentGroup: 'Yardımcı besleme yük testi', risk: 'warning' },
  support_psu_ripple: { label: 'Yardımcı besleme ripple/gürültü veya transient tepki arızası', componentGroup: 'Yardımcı besleme güç kalitesi', risk: 'warning' },
  support_connector_fault: { label: 'DC jak, klemens, kablo veya lehim bağlantısında temassızlık', componentGroup: 'Yardımcı bağlantılar', risk: 'warning' },
  support_load_short: { label: 'Bağlı cihazda aşırı akım veya kısa devre yükü', componentGroup: 'Yardımcı besleme yükü', risk: 'critical' },
  general_reset_fault: { label: 'Reset supervisor, PGOOD veya açılış sıralaması arızası', componentGroup: 'Kart reset ve sıralama', risk: 'warning' },
  general_clock_fault: { label: 'Kristal, osilatör veya clock dağıtım arızası', componentGroup: 'Kart clock hattı', risk: 'warning' },
  general_memory_fault: { label: 'EEPROM/SPI Flash besleme, veri yolu veya bellek arızası', componentGroup: 'Kart kalıcı bellek', risk: 'warning' },
  general_firmware_fault: { label: 'Firmware bütünlüğü, boot yapılandırması veya çevre birimi başlatma arızası', componentGroup: 'Kart firmware', risk: 'info' },
  general_thermal_fault: { label: 'Isıya bağlı lehim, yarıiletken veya bağlantı arızası', componentGroup: 'Kart termal/kararsız arıza', risk: 'warning' },
})

const priorScores = {
  ups: { battery_degraded: 24, battery_connection_fault: 8, charger_fault: 14, input_protection_fault: 10, ups_overload: 12, ups_transfer_fault: 8, ups_inverter_fault: 10, capacitor_esr: 8, mcu_boot: 6 },
  barrier: { photo_sensor: 18, bluebus_fault: 12, stop_input_fault: 8, barrier_encoder_fault: 10, barrier_mechanical_fault: 14, remote_receiver: 10, motor_output: 12, relay_driver: 7, barrier_mains_fault: 5, mcu_boot: 4 },
  fire_panel: { zone_loop_fault: 20, fire_eol_mismatch: 10, fire_earth_fault: 8, panel_battery_fault: 12, charger_fault: 8, fire_aux_overload: 8, siren_output_fault: 12, fire_field_device_fault: 10, mcu_boot: 7, input_protection_fault: 5 },
  cctv: { cctv_cable_fault: 20, poe_power_fault: 14, cctv_poe_budget_fault: 8, cctv_network_config: 14, cctv_stream_fault: 10, ir_led_fault: 10, cctv_image_optics: 8, cctv_storage_fault: 6, rail_short: 5, mcu_boot: 5 },
  access: { access_psu_sag: 14, access_psu_ripple: 7, access_reader_power: 10, reader_bus_fault: 16, access_credential_config: 12, lock_output_fault: 14, access_lock_mechanical: 8, access_door_input_fault: 6, access_rs485_fault: 8, mcu_boot: 5 },
  uvis: { uvis_control_power: 10, uvis_trigger_fault: 16, uvis_illumination_fault: 14, uvis_network_fault: 14, video_link_fault: 10, uvis_storage_fault: 10, uvis_software_fault: 16, uvis_calibration_fault: 10 },
  pbx: { pbx_cabling_fault: 24, pbx_port_fault: 16, pbx_handset_fault: 14, pbx_ring_fault: 10, pbx_audio_fault: 8, pbx_dtmf_fault: 6, pbx_config_fault: 10, pbx_trunk_fault: 7, pbx_power_fault: 5 },
  sliding: { sliding_sensor_fault: 18, sliding_safety_fault: 14, sliding_mechanical_fault: 18, sliding_encoder_fault: 12, sliding_drive_fault: 14, sliding_lock_fault: 8, sliding_battery_fault: 6, input_protection_fault: 5, mcu_boot: 5 },
  support: { support_psu_fault: 22, support_psu_sag: 18, support_psu_ripple: 12, support_connector_fault: 12, support_load_short: 10, support_relay_fault: 14, relay_driver: 7, input_protection_fault: 5 },
  general: { general_visual_damage: 16, input_protection_fault: 10, general_regulator_fault: 16, rail_short: 12, capacitor_esr: 8, general_reset_fault: 8, general_clock_fault: 8, general_memory_fault: 8, general_firmware_fault: 7, general_thermal_fault: 7 },
}

const priorBasis = {
  battery_degraded: 'Akü açık devre voltajı normal görünse bile yük/self-test altında kapasite kaybedebilir.',
  photo_sensor: 'Emniyet ışını, hizalama ve kirlenme bariyer hareketini doğrudan engeller.',
  zone_loop_fault: 'Konvansiyonel panelde zone açık/kısa arızaları ilk saha ayrımıdır.',
  cctv_cable_fault: 'PoE ve veri aynı bakır çiftleri kullandığından krimp/çift arızası sık ortak nedendir.',
  access_psu_sag: 'Okuyucu ve kilit akımı başladığında boşta sağlam görünen adaptör çökebilir.',
  uvis_trigger_fault: 'Araç geçiş tetiklemesi yoksa görüntü ve kayıt zinciri başlatılamaz.',
  pbx_cabling_fault: 'Tek dahili arızalarında porttan sonraki patch panel ve iki telli hat önceliklidir.',
  sliding_sensor_fault: 'Aktivasyon sensörü hataları kapının hiç açılmamasına veya açık kalmasına yol açar.',
  support_psu_fault: 'Nominal DC seviye ve polarite ilk doğrulanacak besleme koşuludur.',
  general_visual_damage: 'Oksit, çatlak lehim ve yanık izleri enerji vermeden önce yakalanabilir.',
}

data.faultPriorScores = priorScores

const nodes = {}

nodes.ups_symptom = symptom({
  id: 'ups_symptom', device: 'ups', category: 'UPS Triage', title: 'UPS Belirti Sınıflandırması',
  prompt: 'Arızayı enerji yolu, akü davranışı ve yük koşuluna göre sınıflandırın.', sourceIds: ['apc_ups'],
  options: [
    { label: 'Cihaz hiç açılmıyor', description: 'Giriş koruma, şebeke ve yardımcı beslemelerden başlanır.', next: 'ups_input_fuse', scoreDelta: { input_protection_fault: 28, mcu_boot: 8 } },
    { label: 'Akü şarj etmiyor / akü uyarısı var', description: 'Açık devre voltajı, bağlantı ve yük testi ayrı değerlendirilir.', next: 'ups_battery_voltage', scoreDelta: { battery_degraded: 22, charger_fault: 18, battery_connection_fault: 10 } },
    { label: 'Yük bağlanınca kapanıyor veya overload veriyor', description: 'Önce harici yük izole edilir, ardından akü ve inverter sınanır.', next: 'ups_load_isolation', scoreDelta: { ups_overload: 28, battery_degraded: 16, capacitor_esr: 10 } },
    { label: 'Sigorta attırıyor / girişte kısa devre var', description: 'Enerji vermeden giriş koruma ve anahtarlama katı kontrol edilir.', next: 'ups_input_fuse', scoreDelta: { input_protection_fault: 30, ups_inverter_fault: 18 } },
    { label: 'Çıkış kararsız, transferde kesiliyor veya cihaz resetliyor', description: 'Şebeke ve akü modu karşılaştırılarak transfer/inverter ayrılır.', next: 'ups_output_quality', scoreDelta: { ups_transfer_fault: 22, ups_inverter_fault: 18, capacitor_esr: 14 } },
  ],
})

nodes.ups_battery_voltage = measurement({
  id: 'ups_battery_voltage', device: 'ups', category: 'Akü Sağlığı', title: '12V VRLA Dinlenme Voltajı',
  prompt: '12V akü bloğunu şarj ve yükten ayırdıktan sonra dinlenmiş açık devre voltajını ölçün.',
  unit: 'V', meterMode: 'DC Voltage', powerState: 'UPS kapalı, şebeke ayrılmış, akü en az 10 dakika dinlenmiş',
  probeBlack: 'Akü - kutbu', probeRed: 'Akü + kutbu', expected: { min: 12.4, max: 13.1 }, danger: 'medium',
  hint: 'Bu aralık yalnız 12V VRLA blok içindir. Seri akü grubunda her bloğu ayrı ölçün.',
  testSteps: ['Şişme, kaçak, oksit ve gevşek pabuç kontrolü yapın.', 'Seri gruptaki blokları aynı koşulda tek tek kaydedin.', 'Bloklar arası belirgin fark varsa bağlantı ve hücre arızasını ayırın.'],
  stopConditions: ['Akü şişmiş, ısınmış veya elektrolit sızdırıyor', 'Kutuplarda erime ya da ark izi var'], sourceIds: ['apc_ups'],
  rules: [
    { when: { operator: '<', value: 10.5 }, label: '12V blokta hücre arızası/deep discharge şüphesi', next: 'ups_result_battery_degraded', scoreDelta: { battery_degraded: 48 } },
    { when: { operator: 'between', min: 10.5, max: 12.39 }, label: 'Akü düşük şarjlı; kapasite testi gerekli', next: 'ups_battery_load_test', scoreDelta: { battery_degraded: 28, charger_fault: 14 } },
    { when: { operator: 'between', min: 12.4, max: 13.1 }, label: 'Dinlenme voltajı uygun; yük kapasitesi henüz doğrulanmadı', next: 'ups_battery_load_test', scoreDelta: { battery_degraded: -6 } },
    { when: { operator: '>', value: 13.2 }, label: 'Dinlenme voltajı beklenenden yüksek; ölçüm/şarj koşulunu doğrulayın', next: 'ups_charge_voltage', scoreDelta: { charger_fault: 20 } },
  ], fallbackNext: 'ups_battery_load_test',
})

nodes.ups_battery_load_test = question({
  id: 'ups_battery_load_test', device: 'ups', category: 'Akü Sağlığı', title: 'Akü Yük / Self-Test Davranışı',
  prompt: 'Akü, UPS self-testinde veya kontrollü kısa süreli yükte hızla çöküyor ya da akü testi başarısız oluyor mu?',
  yesLabel: 'Evet, hızla çöküyor', noLabel: 'Hayır, yükü taşıyor', unknownLabel: 'Yük testi yapamıyorum',
  nextYes: 'ups_result_battery_degraded', nextNo: 'ups_charge_voltage', nextUnknown: 'ups_charge_voltage',
  scoreYes: { battery_degraded: 44, battery_connection_fault: 12 }, scoreNo: { battery_degraded: -18 }, scoreUnknown: { battery_degraded: 8 },
  danger: 'medium', testSteps: ['UPS üreticisinin self-testini çalıştırın.', 'Test boyunca her 12V bloğun voltajını MIN/MAX ile izleyin.', 'Aynı gruptaki blokların çökme hızını karşılaştırın.'],
  stopConditions: ['Akü veya kablo hızla ısınıyor', 'Yanık kokusu, duman ya da ark oluşuyor'], sourceIds: ['apc_ups', 'keysight_power'],
})

nodes.ups_load_isolation = question({
  id: 'ups_load_isolation', device: 'ups', category: 'Yük İzolasyonu', title: 'Harici Yük İzolasyon Testi',
  prompt: 'Tüm çıkış yükleri ayrıldığında UPS self-testini tamamlıyor ve kapanmadan çalışıyor mu?',
  yesLabel: 'Yüksüz çalışıyor', noLabel: 'Yüksüz de kapanıyor', unknownLabel: 'Yükleri ayıramıyorum',
  nextYes: 'ups_result_overload', nextNo: 'ups_battery_voltage', nextUnknown: 'ups_battery_voltage',
  scoreYes: { ups_overload: 46, ups_inverter_fault: -12 }, scoreNo: { battery_degraded: 18, ups_inverter_fault: 16 }, scoreUnknown: { ups_overload: 8 },
  testSteps: ['Tüm tüketicileri fiziksel olarak UPS çıkışından ayırın.', 'UPS’i yüksüz başlatıp self-test ve aküye geçişi gözleyin.', 'Yükleri tek tek ekleyerek arızayı geri üreten cihazı belirleyin.'], sourceIds: ['apc_ups'],
})

nodes.ups_output_quality = question({
  id: 'ups_output_quality', device: 'ups', category: 'Transfer ve Çıkış', title: 'Şebeke / Akü Modu Karşılaştırması',
  prompt: 'Kararsızlık yalnız akü modunda veya şebekeden aküye geçiş anında mı oluşuyor?',
  yesLabel: 'Yalnız akü/transfer anında', noLabel: 'Her iki modda da', unknownLabel: 'Karşılaştıramıyorum',
  nextYes: 'ups_transfer_event', nextNo: 'ups_result_output_filter', nextUnknown: 'ups_result_scope_required',
  scoreYes: { ups_transfer_fault: 28, ups_inverter_fault: 24 }, scoreNo: { capacitor_esr: 22, charger_fault: 8 }, scoreUnknown: { ups_transfer_fault: 8 },
  testSteps: ['Aynı küçük test yüküyle şebeke ve akü modunu ayrı gözleyin.', 'Çıkış MIN/MAX değerini ve reset anını kaydedin.', 'Transfer anındaki röle sesi ve ekran durumunu not edin.'], sourceIds: ['apc_ups', 'keysight_power'],
})

nodes.ups_transfer_event = question({
  id: 'ups_transfer_event', device: 'ups', category: 'Transfer ve Çıkış', title: 'Transfer Rölesi / Durum Geçişi',
  prompt: 'Şebeke kesildiğinde transfer rölesi ve durum göstergesi normal biçimde akü moduna geçiyor mu?',
  yesLabel: 'Transfer gerçekleşiyor', noLabel: 'Transfer yok/gecikmeli', unknownLabel: 'Güvenli test yapamıyorum',
  nextYes: 'ups_inverter_output_voltage', nextNo: 'ups_result_transfer', nextUnknown: 'ups_result_scope_required',
  scoreYes: { ups_transfer_fault: -12, ups_inverter_fault: 18 }, scoreNo: { ups_transfer_fault: 44, relay_driver: 12 }, scoreUnknown: { ups_transfer_fault: 8 },
  danger: 'high', stopConditions: ['Açık şebeke bağlantısı veya korumasız bara var', 'Transfer sırasında ark, duman veya sert mekanik titreşim oluşuyor'], sourceIds: ['apc_ups'],
})

nodes.ups_inverter_output_voltage = measurement({
  id: 'ups_inverter_output_voltage', device: 'ups', category: 'İnverter Çıkışı', title: 'Akü Modu AC Çıkış Voltajı',
  prompt: 'Küçük ve bilinen sağlam bir test yükü bağlıyken akü modundaki AC çıkışı True-RMS ölçün.',
  unit: 'V', meterMode: 'AC Voltage', powerState: 'Akü modu, kontrollü test yükü bağlı', probeBlack: 'UPS çıkış N', probeRed: 'UPS çıkış L',
  expected: { min: 200, max: 250 }, danger: 'high', hint: 'Etiket değeri ve çıkış dalga şekli her zaman önceliklidir; kare/modifiye sinüste uygun True-RMS cihaz kullanın.',
  testSteps: ['Ölçü aleti ve probların şebeke kategorisini doğrulayın.', 'Önce yüksüz, sonra küçük test yüküyle ölçün.', 'Voltaj düşümüyle yük akımı veya ses değişimini birlikte kaydedin.'],
  stopConditions: ['Korumasız canlı terminale erişim gerekiyor', 'Çıkışta anormal ısınma, koku veya ark var'], sourceIds: ['apc_ups', 'keysight_power'],
  rules: [
    { when: { operator: '<', value: 180 }, label: 'İnverter çıkışı düşük/yok', next: 'ups_result_inverter', scoreDelta: { ups_inverter_fault: 46, ups_transfer_fault: 12 } },
    { when: { operator: 'between', min: 200, max: 250 }, label: 'Akü modu RMS çıkışı uygun', next: 'ups_result_output_verify', scoreDelta: { ups_inverter_fault: -12 } },
    { when: { operator: '>', value: 260 }, label: 'İnverter çıkışı tehlikeli yüksek', next: 'ups_result_inverter', scoreDelta: { ups_inverter_fault: 46 } },
  ], fallbackNext: 'ups_result_output_filter',
})

nodes.ups_result_battery_degraded = result({
  id: 'ups_result_battery_degraded', device: 'ups', category: 'Akü Sağlığı', title: 'Akü Kapasitesi / Hücre Arızası', severity: 'warning',
  summary: 'Akü açık devrede kabul edilebilir görünse bile yük altında kapasiteyi koruyamıyor veya bloklar dengesiz davranıyor.',
  components: ['12V VRLA bloklar', 'Seri bağlantı pabuçları', 'Akü kablosu ve sigortası'],
  repair: 'Akü grubunu aynı tip, kapasite ve yaşta eşlenmiş bloklarla değiştirin; oksitli/ısınmış bağlantıları yenileyin.',
  verification: 'Tam şarj sonrası self-test geçmeli, bloklar arası voltaj farkı küçük kalmalı ve nominal yükte kapanma olmamalı.', sourceIds: ['apc_ups'],
})
nodes.ups_result_overload = result({
  id: 'ups_result_overload', device: 'ups', category: 'Yük İzolasyonu', title: 'Harici Yük / Kapasite Aşımı', severity: 'critical',
  summary: 'UPS yüksüz çalışıyor; kapanma bağlı cihazın ani akımı, kısa devresi veya UPS kapasitesinin aşılmasıyla ilişkili.',
  components: ['Bağlı tüketiciler', 'Çıkış priz/kablo grubu', 'UPS VA/W kapasitesi'],
  repair: 'Yükleri tek tek izole edin, arızalı tüketiciyi ayırın ve toplam gerçek gücü UPS etiket kapasitesinin altında tutun.',
  verification: 'UPS seçilen yük kombinasyonuyla self-test ve akü geçişini alarmsız tamamlamalı.', sourceIds: ['apc_ups'],
})
nodes.ups_result_transfer = result({
  id: 'ups_result_transfer', device: 'ups', category: 'Transfer ve Çıkış', title: 'Transfer / AVR Katı Arızası', severity: 'critical',
  summary: 'Şebeke durumu değiştiğinde röle, AVR veya transfer algılama zinciri akü moduna güvenilir geçmiyor.',
  components: ['Transfer rölesi ve kontakları', 'Röle sürücü transistörü', 'Şebeke algılama/AVR devresi'],
  repair: 'Röle bobini ve kontak düşümünü, sürücüyü ve şebeke algılama bölücülerini servis şemasına göre test edin.',
  verification: 'Tekrarlı şebeke kesme/geri verme testlerinde çıkış kesintisi cihaz toleransı içinde kalmalı.', sourceIds: ['apc_ups'],
})
nodes.ups_result_inverter = result({
  id: 'ups_result_inverter', device: 'ups', category: 'İnverter Çıkışı', title: 'İnverter Güç Katı Arızası', severity: 'critical',
  summary: 'Akü modu çıkışı etiket aralığına ulaşmıyor veya tehlikeli yüksek; inverter ve geri besleme birlikte incelenmeli.',
  components: ['İnverter MOSFET/IGBT', 'Gate sürücü', 'Trafo/indüktör', 'Çıkış geri beslemesi'],
  repair: 'Enerjisiz kısa devre testi, gate sürüşü ve geri besleme hattını doğrulamadan güç yarıiletkenini değiştirmeyin.',
  verification: 'Yüksüz ve kontrollü yükte RMS çıkış, sıcaklık ve dalga şekli kararlı olmalı.', sourceIds: ['keysight_power'],
})
nodes.ups_result_output_filter = result({
  id: 'ups_result_output_filter', device: 'ups', category: 'Çıkış Kalitesi', title: 'Filtreleme / Güç Kalitesi Arızası', severity: 'warning',
  summary: 'Arıza iki çalışma modunda da görülüyor; çıkış filtreleri, DC bara ripple ve bağlantı direnci öncelikli.',
  components: ['DC bara elektrolitikleri', 'Çıkış LC filtresi', 'Klemens ve lehimler'],
  repair: 'Ripple ve transient tepkiyi osiloskopla ölçün; ESR/kapasite ve ısınan bağlantıları karşılaştırın.',
  verification: 'Yük adımında çıkış hızla toparlanmalı ve cihaz resetine yol açan dip/ripple görülmemeli.', sourceIds: ['keysight_power', 'ti_power_transient'],
})

nodes.barrier_symptom = symptom({
  id: 'barrier_symptom', device: 'barrier', category: 'Bariyer Triage', title: 'Bariyer Belirti Sınıflandırması',
  prompt: 'Komutun karta ulaşıp ulaşmadığını, emniyet kodunu ve mekanik davranışı ayırın.', sourceIds: ['nice_mlbar'],
  options: [
    { label: 'Komut geliyor ama bariyer hiç hareket etmiyor', description: 'PP/OK girişi ve flaş kodu üzerinden ilerler.', next: 'barrier_command_received', scoreDelta: { stop_input_fault: 14, motor_output: 18, bluebus_fault: 10 } },
    { label: 'Kumanda algılanmıyor', description: 'Kumanda pili, alıcı beslemesi, anten ve öğrenme hafızası ayrılır.', next: 'barrier_receiver_5v', scoreDelta: { remote_receiver: 36 } },
    { label: 'Fotosel/STOP hatası veya flaş kodu var', description: 'Nice flaş kodu ve emniyet girişleri üretici sırasıyla yorumlanır.', next: 'barrier_diagnostic_code_available', scoreDelta: { photo_sensor: 24, bluebus_fault: 18, stop_input_fault: 14 } },
    { label: 'Kol hareket ediyor, sonra duruyor veya geri dönüyor', description: 'Motor kuvveti, yay dengesi ve enkoder öğrenmesi kontrol edilir.', next: 'barrier_mechanical_balance', scoreDelta: { barrier_mechanical_fault: 26, barrier_encoder_fault: 18 } },
    { label: 'Kart enerjisiz / sigorta veya besleme sorunu var', description: 'Önce yardımcı besleme ve giriş koruma doğrulanır.', next: 'barrier_24v_input', scoreDelta: { barrier_mains_fault: 32, rail_short: 10 } },
  ],
})

nodes.barrier_command_received = question({
  id: 'barrier_command_received', device: 'barrier', category: 'Komut Girişi', title: 'PP / Aç-Kapat Komutu Karta Ulaşıyor mu?',
  prompt: 'Komut verildiğinde ilgili giriş LED’i veya Nice kontrol kartındaki OK göstergesi tepki veriyor mu?',
  yesLabel: 'Komut karta ulaşıyor', noLabel: 'Girişte tepki yok', unknownLabel: 'LED/giriş izlenemiyor',
  nextYes: 'barrier_diagnostic_code_available', nextNo: 'barrier_receiver_5v', nextUnknown: 'barrier_relay_output',
  scoreYes: { remote_receiver: -18, motor_output: 12 }, scoreNo: { remote_receiver: 34 }, scoreUnknown: { remote_receiver: 8 },
  testSteps: ['Kumanda yerine kartın kuru kontak/PP girişini kontrollü tetikleyin.', 'Giriş LED’i veya OK göstergesini gözleyin.', 'Kumanda ve kablolu buton sonucunu karşılaştırın.'], sourceIds: ['nice_mlbar'],
})

nodes.barrier_diagnostic_code_available = question({
  id: 'barrier_diagnostic_code_available', device: 'barrier', category: 'Üretici Diyagnostiği', title: 'Flaş / BlueBUS Kodunu Sayabiliyor musunuz?',
  prompt: 'Komut sonrası kısa flaşlar iki kez tekrarlanıyor mu ve tekrar grubundaki flaş sayısı belirlenebiliyor mu?',
  yesLabel: 'Kod sayılabiliyor', noLabel: 'Kod yok', unknownLabel: 'Model/kod belirsiz',
  nextYes: 'barrier_flash_code', nextNo: 'barrier_photo_input', nextUnknown: 'barrier_result_code_reference',
  scoreYes: { bluebus_fault: 10, photo_sensor: 10, stop_input_fault: 10 }, scoreNo: { motor_output: 10 }, scoreUnknown: { mcu_boot: 8 },
  testSteps: ['Bir komut verin ve flaş/BlueBUS LED’ini kesintisiz gözleyin.', 'Bir saniyelik arayla tekrarlanan kısa flaş grubunu sayın.', 'Model kılavuzundaki tabloyla eşleştirin.'], sourceIds: ['nice_mlbar'],
})

nodes.barrier_flash_code = symptom({
  id: 'barrier_flash_code', device: 'barrier', category: 'Nice Flaş Kodları', title: 'Nice M/L-Bar Flaş Kodunu Seçin', optionBadge: 'KOD',
  prompt: 'Bir saniye arayla tekrarlanan kısa flaş grubundaki sayıyı seçin.', sourceIds: ['nice_mlbar'],
  options: [
    { label: '1 flaş: BlueBUS sistem hatası', description: 'Öğrenilmiş cihaz listesi mevcut BlueBUS cihazlarıyla uyuşmuyor.', next: 'barrier_result_bluebus', scoreDelta: { bluebus_fault: 50 } },
    { label: '2 flaş: Fotosel aktif', description: 'Bir veya daha fazla fotosel harekete izin vermiyor.', next: 'barrier_photo_alignment', scoreDelta: { photo_sensor: 48 } },
    { label: '3 flaş: Motor kuvvet limiti', description: 'Kol daha yüksek mekanik dirençle karşılaşmış olabilir.', next: 'barrier_mechanical_balance', scoreDelta: { barrier_mechanical_fault: 42, barrier_encoder_fault: 10 } },
    { label: '4 flaş: STOP girişi aktif', description: 'STOP terminali başlangıçta veya hareket sırasında tetikleniyor.', next: 'barrier_stop_input', scoreDelta: { stop_input_fault: 50 } },
    { label: 'Başka kod / model farklı', description: 'Kod, cihazın tam model servis tablosundan doğrulanmalıdır.', next: 'barrier_result_code_reference', scoreDelta: { mcu_boot: 12 } },
    { label: 'Flaş yok', description: 'Komut, röle ve motor çıkışı doğrudan izole edilir.', next: 'barrier_relay_output', scoreDelta: { motor_output: 16, relay_driver: 12 } },
  ],
})

nodes.barrier_24v_input = measurement({
  id: 'barrier_24v_input', device: 'barrier', category: 'Kart Yardımcı Beslemesi', title: 'Bariyer Kartı 24V Yardımcı Hat',
  prompt: 'Kartın 24V aksesuar/lojik besleme test noktasını model şemasına göre ölçün; şebeke primerine girmeyin.',
  unit: 'V', meterMode: 'DC Voltage', powerState: 'Kart enerjili, mekanik alan emniyete alınmış', probeBlack: 'Kart 0V/GND', probeRed: '24V aksesuar veya servis test noktası',
  expected: { min: 20, max: 29 }, danger: 'medium', hint: '230V primer ölçümü yalnız yetkili teknisyen ve uygun CAT sınıfı cihazla yapılmalıdır.',
  testSteps: ['Kart modelini ve 24V test noktasını kılavuzdan doğrulayın.', 'Önce boşta, sonra fotosel/aksesuar bağlıyken MIN/MAX ölçün.', 'Klemens ve sigortada voltaj düşümünü karşılaştırın.'],
  stopConditions: ['Test noktası doğrulanamıyor', 'Korumasız şebeke terminaline yaklaşmak gerekiyor', 'Motor/kol alanı güvenli değil'], sourceIds: ['nice_mlbar', 'fluke_dc_supply'],
  rules: [
    { when: { operator: '<', value: 18 }, label: '24V yardımcı hat yok/düşük', next: 'barrier_result_input_supply', scoreDelta: { barrier_mains_fault: 40, rail_short: 16 } },
    { when: { operator: 'between', min: 20, max: 29 }, label: '24V yardımcı hat uygun', next: 'barrier_logic_5v', scoreDelta: { barrier_mains_fault: -10 } },
    { when: { operator: '>', value: 30 }, label: '24V yardımcı hat anormal yüksek', next: 'barrier_result_input_supply', scoreDelta: { barrier_mains_fault: 34, mcu_boot: 10 } },
  ], fallbackNext: 'barrier_logic_5v',
})

nodes.barrier_photo_input = question({
  id: 'barrier_photo_input', device: 'barrier', category: 'Emniyet Girişleri', title: 'Fotosel / Emniyet Girişi Durumu',
  prompt: 'Kart göstergesinde fotosel veya emniyet girişi hareket iznini kesiyor mu?',
  yesLabel: 'Emniyet girişi aktif', noLabel: 'Emniyet girişi normal', unknownLabel: 'Durum okunamıyor',
  nextYes: 'barrier_photo_alignment', nextNo: 'barrier_stop_input', nextUnknown: 'barrier_stop_input',
  scoreYes: { photo_sensor: 34, bluebus_fault: 10 }, scoreNo: { photo_sensor: -12 }, scoreUnknown: { photo_sensor: 8 },
  testSteps: ['Işın hattındaki engelleri kaldırın.', 'Verici/alıcı LED durumlarını karşılaştırın.', 'BlueBUS cihazı değiştiyse öğrenmeyi henüz başlatmayın; önce kablo ve cihazı doğrulayın.'], sourceIds: ['nice_mlbar'],
})

nodes.barrier_photo_alignment = question({
  id: 'barrier_photo_alignment', device: 'barrier', category: 'Fotosel İzolasyonu', title: 'Fotosel Işını ve Öğrenme Durumu',
  prompt: 'Lensler temiz, ışın açık, LED’ler kararlı ve BlueBUS cihaz öğrenmesi mevcut donanımla uyumlu mu?',
  yesLabel: 'Hepsi uygun', noLabel: 'Hizalama/LED/öğrenme hatalı', unknownLabel: 'Saha testi yapılamıyor',
  nextYes: 'barrier_stop_input', nextNo: 'barrier_result_photo_sensor', nextUnknown: 'barrier_result_photo_sensor',
  scoreYes: { photo_sensor: -18 }, scoreNo: { photo_sensor: 44, bluebus_fault: 14 }, scoreUnknown: { photo_sensor: 12 }, sourceIds: ['nice_mlbar'],
})

nodes.barrier_stop_input = question({
  id: 'barrier_stop_input', device: 'barrier', category: 'STOP Zinciri', title: 'STOP / Acil Durdurma Girişi',
  prompt: 'STOP terminali, acil buton ve seri güvenlik zinciri kılavuzdaki normal durumda mı; hareket sırasında kesiliyor mu?',
  yesLabel: 'STOP aktif/kararsız', noLabel: 'STOP zinciri normal', unknownLabel: 'Devreyi izole edemiyorum',
  nextYes: 'barrier_result_stop_input', nextNo: 'barrier_relay_output', nextUnknown: 'barrier_result_code_reference',
  scoreYes: { stop_input_fault: 46 }, scoreNo: { stop_input_fault: -16 }, scoreUnknown: { stop_input_fault: 10 },
  danger: 'medium', stopConditions: ['Emniyet girişini kalıcı köprülemek gerekiyor', 'Araç/yaya alanı kapatılamıyor'], sourceIds: ['nice_mlbar'],
})

nodes.barrier_mechanical_balance = question({
  id: 'barrier_mechanical_balance', device: 'barrier', category: 'Mekanik İzolasyon', title: 'Kol Serbest Hareket / Yay Dengesi',
  prompt: 'Enerji kesilip mekanizma manuel açıldığında kol takılmadan hareket ediyor ve yay dengesi modeli için kabul edilebilir mi?',
  yesLabel: 'Mekanik hareket serbest', noLabel: 'Sıkışma/dengesizlik var', unknownLabel: 'Manuel test güvenli değil',
  nextYes: 'barrier_encoder_learning', nextNo: 'barrier_result_mechanical', nextUnknown: 'barrier_result_motor_reference',
  scoreYes: { barrier_mechanical_fault: -18, barrier_encoder_fault: 12 }, scoreNo: { barrier_mechanical_fault: 48 }, scoreUnknown: { barrier_mechanical_fault: 10 },
  danger: 'high', testSteps: ['Şebekeyi ayırın ve istemsiz hareketi önleyin.', 'Üretici kilit açma prosedürüyle kolu serbest bırakın.', 'Ray, redüktör, yay ve durdurucuları zorlamadan kontrol edin.'],
  stopConditions: ['Yay/kol beklenmedik hareket ediyor', 'Mekanik kilit açma prosedürü bilinmiyor', 'Araç/yaya alanı güvenli değil'], sourceIds: ['nice_mlbar'],
})

nodes.barrier_encoder_learning = question({
  id: 'barrier_encoder_learning', device: 'barrier', category: 'Konum Öğrenme', title: 'Enkoder / Pozisyon Öğrenme Testi',
  prompt: 'Cihaz öğrenme turunu tamamlıyor ve açık/kapalı konumları hatasız kaydediyor mu?',
  yesLabel: 'Öğrenme tamamlanıyor', noLabel: 'Öğrenme/enkoder hatası', unknownLabel: 'Prosedür bilinmiyor',
  nextYes: 'barrier_relay_output', nextNo: 'barrier_result_encoder', nextUnknown: 'barrier_result_code_reference',
  scoreYes: { barrier_encoder_fault: -18 }, scoreNo: { barrier_encoder_fault: 46, mcu_boot: 10 }, scoreUnknown: { barrier_encoder_fault: 10 }, sourceIds: ['nice_mlbar'],
})

nodes.barrier_result_bluebus = result({
  id: 'barrier_result_bluebus', device: 'barrier', category: 'BlueBUS', title: 'BlueBUS Cihaz / Öğrenme Uyuşmazlığı',
  summary: 'Kartın gördüğü BlueBUS cihazları, daha önce öğrenilen listeyle eşleşmiyor veya saha cihazlarından biri cevap vermiyor.',
  components: ['BlueBUS fotoseller', 'İki telli BUS kablosu', 'Klemensler ve cihaz öğrenme kaydı'],
  repair: 'Cihazları tek tek izole edin, kablo/klemensleri düzeltin; donanım listesi kesinleştikten sonra cihaz öğrenmesini tekrarlayın.',
  verification: 'Bir flaş kodu kaybolmalı, tüm BlueBUS cihazları doğru görünmeli ve emniyet testi hareketi kesmelidir.', sourceIds: ['nice_mlbar'],
})
nodes.barrier_result_stop_input = result({
  id: 'barrier_result_stop_input', device: 'barrier', category: 'STOP Zinciri', title: 'STOP / Acil Durdurma Zinciri Aktif', severity: 'critical',
  summary: 'STOP terminali başlangıçta veya hareket sırasında güvenlik nedeniyle otomasyonu durduruyor.',
  components: ['Acil stop butonu', 'STOP terminali ve seri kontaklar', 'Kablo ekleri'],
  repair: 'Açık/kararsız kontağı bulun ve onarın; emniyet girişini kalıcı olarak köprülemeyin.',
  verification: 'Normal durumda STOP girişi kararlı olmalı, acil stop testi verildiğinde hareket güvenli biçimde durmalıdır.', sourceIds: ['nice_mlbar'],
})
nodes.barrier_result_encoder = result({
  id: 'barrier_result_encoder', device: 'barrier', category: 'Konum Öğrenme', title: 'Enkoder / Konum Öğrenme Arızası',
  summary: 'Mekanik hareket serbest ancak kart pozisyonu okuyamıyor veya öğrenme turunu tamamlayamıyor.',
  components: ['Mutlak/artan enkoder', 'Enkoder kablosu ve konnektörü', 'Limit/pozisyon hafızası'],
  repair: 'Enkoder besleme ve sinyalini, kablo sürekliliğini ve mekanik bağlantısını doğrulayın; sonra öğrenmeyi tekrarlayın.',
  verification: 'Öğrenme turu kesintisiz bitmeli ve her çevrimde konum sapmadan tekrar etmelidir.', sourceIds: ['nice_mlbar'],
})
nodes.barrier_result_mechanical = result({
  id: 'barrier_result_mechanical', device: 'barrier', category: 'Mekanik İzolasyon', title: 'Yay Dengesi / Redüktör / Kol Sıkışması',
  summary: 'Motor kuvvet limitini tetikleyen mekanik direnç veya yanlış yay dengesi bulundu.',
  components: ['Denge yayı', 'Redüktör ve rulmanlar', 'Kol bağlantısı ve mekanik stoplar'],
  repair: 'Üretici mekanik ayar prosedürüne göre sıkışmayı giderin ve yay dengesini kol uzunluğu/ağırlığına göre ayarlatın.',
  verification: 'Manuel hareket pürüzsüz olmalı; otomatik çevrim motor kuvvet alarmı vermeden tamamlanmalıdır.', sourceIds: ['nice_mlbar'],
})
nodes.barrier_result_code_reference = result({
  id: 'barrier_result_code_reference', device: 'barrier', category: 'Üretici Diyagnostiği', title: 'Model Servis Kodu Referansı Gerekli', severity: 'info',
  summary: 'Flaş/ekran kodu mevcut genel Nice M/L-Bar tablosuyla güvenilir eşleştirilemiyor.',
  components: ['Tam bariyer modeli', 'Kontrol kartı kodu/revizyonu', 'Flaş veya ekran hata kaydı'],
  repair: 'Etiket ve kart revizyonunu kaydedip ilgili üretici servis kılavuzundaki hata tablosunu kullanın.',
  verification: 'Kodun üretici tanımı, yapılan ölçüm ve onarım sonrası kaybolduğu rapora eklenmelidir.', sourceIds: ['nice_mlbar'],
})

nodes.fire_symptom = symptom({
  id: 'fire_symptom', device: 'fire_panel', category: 'Yangın Paneli Triage', title: 'Yangın Paneli Belirti Sınıflandırması',
  prompt: 'Panel göstergesindeki arıza sınıfını seçin; aktif yangın korumasını devre dışı bırakmadan ilerleyin.', sourceIds: ['ctec_fire'],
  options: [
    { label: 'Zone açık devre / kısa devre arızası', description: 'EOL değeri ve saha hattı yetkili test modunda ayrılır.', next: 'fire_impairment_confirm', scoreDelta: { zone_loop_fault: 30, fire_eol_mismatch: 16 } },
    { label: 'Siren devresi arızası / siren çalışmıyor', description: 'Yetkili alarm testi, çıkış, sigorta ve saha polaritesi sırasıyla kontrol edilir.', next: 'fire_siren_test_authorized', scoreDelta: { siren_output_fault: 34, fire_field_device_fault: 12 } },
    { label: 'Panel resetliyor / AUX gerilimi çöküyor', description: 'Saha yükü izole edilerek panel PSU ile AUX kısa devresi ayrılır.', next: 'fire_aux_isolation', scoreDelta: { fire_aux_overload: 28, mcu_boot: 16 } },
    { label: 'Akü / şarj / ana besleme arızası', description: 'Akü grubu, şarj seviyesi ve panel 24V hattı ayrı ölçülür.', next: 'fire_battery_voltage', scoreDelta: { panel_battery_fault: 26, charger_fault: 18 } },
    { label: 'Earth / toprak kaçağı arızası', description: 'Zone, siren ve AUX devreleri kontrollü izolasyonla daraltılır.', next: 'fire_earth_isolation', scoreDelta: { fire_earth_fault: 42 } },
  ],
})

nodes.fire_impairment_confirm = question({
  id: 'fire_impairment_confirm', device: 'fire_panel', category: 'Servis Güvenliği', title: 'Sistem Test Modu / Devre Dışı Kalma Kaydı',
  prompt: 'İlgili zone için yetkili test modu, bina sorumlusu bildirimi ve geçici koruma prosedürü uygulanmış mı?',
  yesLabel: 'Yetkili test koşulu hazır', noLabel: 'Hayır, sistem aktif hizmette', unknownLabel: 'Yetki belirsiz',
  nextYes: 'fire_eol_reference', nextNo: 'fire_result_authorization_required', nextUnknown: 'fire_result_authorization_required',
  scoreYes: {}, scoreNo: {}, scoreUnknown: {}, danger: 'high',
  stopConditions: ['Aktif alarm/yangın durumu var', 'Bina sorumlusu ve test kaydı yok', 'Devre dışı kalan alan için geçici koruma sağlanmadı'], sourceIds: ['ctec_fire'],
})

nodes.fire_eol_reference = symptom({
  id: 'fire_eol_reference', device: 'fire_panel', category: 'Zone Sonlandırma', title: 'Panelin Nominal EOL Değerini Seçin', optionBadge: 'EOL',
  prompt: 'EOL değeri panel modeli ve kılavuzundan doğrulanmalıdır; 2.2K ile 6.8K arasındaki her değer otomatik olarak normal değildir.', sourceIds: ['ctec_fire', 'notifier_nfs_supra', 'notifier_eol_legacy'],
  options: [
    { label: '2.2 kΩ direnç', description: 'Nominal değerin yaklaşık ±%10 bandı değerlendirilir.', next: 'fire_zone_resistance_22k', scoreDelta: { fire_eol_mismatch: 6 } },
    { label: '4.7 kΩ direnç', description: 'Nominal değerin yaklaşık ±%10 bandı değerlendirilir.', next: 'fire_zone_resistance_47k', scoreDelta: { fire_eol_mismatch: 6 } },
    { label: '6.8 kΩ direnç', description: 'C-TEC FP gibi 6K8 kullanan panel referansıdır.', next: 'fire_zone_resistance', scoreDelta: { fire_eol_mismatch: 6 } },
    { label: 'EOL modülü / değer farklı veya bilinmiyor', description: 'Üretici modülü direnç ölçümüyle yanlış yorumlanmamalıdır.', next: 'fire_result_eol_reference', scoreDelta: { fire_eol_mismatch: 12 } },
  ],
})

function fireEolMeasurement(id, title, expected, sourceIds = ['ctec_fire']) {
  const lowMismatchMax = Math.floor(expected.min - 1)
  const highMismatchMin = Math.ceil(expected.max + 1)

  return measurement({
    id, device: 'fire_panel', category: 'Zone Sonlandırma', title,
    prompt: 'Panel enerjisi ve zone devresi güvenli biçimde ayrılmışken saha hattını panel klemensinden ölçün.',
    unit: 'Ω', meterMode: 'Ohm', powerState: 'Panel test modunda, ilgili zone enerjisiz ve klemensinden ayrılmış',
    probeBlack: 'Zone - saha kablosu', probeRed: 'Zone + saha kablosu', expected, danger: 'medium',
    hint: 'Ölçülen değer seçilen EOL referansına göre yorumlanır; dedektör/modül tipi üretici kılavuzuyla doğrulanmalıdır.',
    testSteps: ['Zone kablosunu etiketleyip panelden ayırın.', 'Önce prob ve kablo sıfır direncini doğrulayın.', 'Hattı uçtan uca ve ara ekleri bölerek karşılaştırın.'],
    stopConditions: ['Aktif alarm veya tahliye durumu var', 'Zone devre dışı bırakma yetkisi yok', 'Hat üzerinde harici gerilim ölçülüyor'], sourceIds,
    rules: [
      { when: { operator: '<', value: 500 }, label: 'Zone kısa devreye yakın', next: 'fire_result_zone_short', scoreDelta: { zone_loop_fault: 46 } },
      { when: { operator: 'between', min: 500, max: lowMismatchMax }, label: 'EOL değeri düşük/uyumsuz', next: 'fire_result_eol_mismatch', scoreDelta: { fire_eol_mismatch: 40, zone_loop_fault: 12 } },
      { when: { operator: 'between', min: expected.min, max: expected.max }, label: 'Seçilen EOL değeri tolerans içinde', next: 'fire_zone_alarm_led', scoreDelta: { zone_loop_fault: -12, fire_eol_mismatch: -16 } },
      { when: { operator: 'between', min: highMismatchMin, max: 19999 }, label: 'EOL değeri yüksek/uyumsuz', next: 'fire_result_eol_mismatch', scoreDelta: { fire_eol_mismatch: 40, zone_loop_fault: 12 } },
      { when: { operator: '>=', value: 20000 }, label: 'Zone hattı açık devre', next: 'fire_result_zone_open', scoreDelta: { zone_loop_fault: 46 } },
    ], fallbackNext: 'fire_result_eol_mismatch',
  })
}

nodes.fire_zone_resistance_22k = fireEolMeasurement('fire_zone_resistance_22k', '2.2 kΩ Zone EOL Ölçümü', { min: 1980, max: 2420 })
nodes.fire_zone_resistance_47k = fireEolMeasurement('fire_zone_resistance_47k', '4.7 kΩ Zone EOL Ölçümü', { min: 4230, max: 5170 })
nodes.fire_zone_resistance = fireEolMeasurement('fire_zone_resistance', '6.8 kΩ Zone EOL Ölçümü', { min: 6120, max: 7480 })

nodes.fire_earth_isolation = question({
  id: 'fire_earth_isolation', device: 'fire_panel', category: 'Toprak Kaçağı', title: 'Saha Devresi İzolasyon Testi',
  prompt: 'Zone, siren ve AUX saha devreleri kılavuza uygun sırayla ayrıldığında earth fault göstergesi devrelerden biriyle kayboluyor mu?',
  yesLabel: 'Bir saha devresiyle kayboluyor', noLabel: 'Tüm devreler ayrıyken sürüyor', unknownLabel: 'İzolasyon yapılamıyor',
  nextYes: 'fire_result_earth_field', nextNo: 'fire_result_earth_panel', nextUnknown: 'fire_result_authorization_required',
  scoreYes: { fire_earth_fault: 48 }, scoreNo: { fire_earth_fault: 24, mcu_boot: 12 }, scoreUnknown: { fire_earth_fault: 10 },
  danger: 'high', testSteps: ['Her devreyi etiketleyin ve tek tek ayırın.', 'Her adımda fault göstergesinin stabil durumunu bekleyin.', 'Kaçağı bulunan hattı bölerek saha tarafında daraltın.'],
  stopConditions: ['Aktif alarm durumu var', 'Saha devrelerini ayırma yetkisi yok', 'Megger testi bağlı elektronik cihazlarla yapılacak'], sourceIds: ['ctec_fire'],
})

nodes.fire_aux_isolation = question({
  id: 'fire_aux_isolation', device: 'fire_panel', category: 'AUX Yük İzolasyonu', title: 'AUX / Saha Yükü Ayrıldığında Panel Stabil mi?',
  prompt: 'AUX çıkışı ve harici modüller kontrollü ayrıldığında panel reseti veya 24V çökmesi duruyor mu?',
  yesLabel: 'Saha yükü ayrılınca düzeliyor', noLabel: 'Panel hâlâ resetliyor', unknownLabel: 'Yükler ayrılamıyor',
  nextYes: 'fire_result_aux_overload', nextNo: 'fire_panel_24v', nextUnknown: 'fire_panel_24v',
  scoreYes: { fire_aux_overload: 46, rail_short: 16 }, scoreNo: { mcu_boot: 20, input_protection_fault: 12 }, scoreUnknown: { fire_aux_overload: 8 },
  danger: 'high', stopConditions: ['Aktif alarm/yangın durumu var', 'AUX cihazlarının işlevi ve geçici koruma planı bilinmiyor'], sourceIds: ['ctec_fire', 'fluke_dc_supply'],
})

nodes.fire_siren_test_authorized = question({
  id: 'fire_siren_test_authorized', device: 'fire_panel', category: 'Siren Servis Testi', title: 'Yetkili Alarm / Siren Testi Hazır mı?',
  prompt: 'Bina bilgilendirildi, test modu etkin ve siren çıkışını kısa süreli çalıştırma izni var mı?',
  yesLabel: 'Test koşulu hazır', noLabel: 'Test izni yok', unknownLabel: 'Yetki belirsiz',
  nextYes: 'fire_siren_voltage', nextNo: 'fire_result_authorization_required', nextUnknown: 'fire_result_authorization_required',
  scoreYes: {}, scoreNo: {}, scoreUnknown: {}, danger: 'high',
  stopConditions: ['Tahliye riski veya izinsiz alarm iletimi var', 'İtfaiye/merkez izleme bildirimi yapılmadı'], sourceIds: ['ctec_fire'],
})

nodes.fire_siren_voltage = measurement({
  id: 'fire_siren_voltage', device: 'fire_panel', category: 'Siren Çıkışı', title: 'Alarm Anında Siren Çıkış Voltajı',
  prompt: 'Yetkili alarm testi sırasında siren çıkışını panel klemensinde DC ölçün.',
  unit: 'V', meterMode: 'DC Voltage', powerState: 'Panel test modunda, alarm/siren çıkışı aktif', probeBlack: 'Siren -', probeRed: 'Siren +',
  expected: { min: 20, max: 29 }, danger: 'high', hint: 'Panel etiket değeri ve polarite şeması önceliklidir.',
  testSteps: ['Önce panel klemensinde yüksüz/hat bağlı durumunu kaydedin.', 'Alarm süresini kısa tutup MIN/MAX ölçün.', 'Hat sonunda polarite ve voltaj düşümünü karşılaştırın.'],
  stopConditions: ['Yetkili alarm testi yok', 'Siren hattında harici gerilim var', 'Çıkış kablosu ısınıyor veya sigorta tekrar açıyor'], sourceIds: ['ctec_fire'],
  rules: [
    { when: { operator: '<', value: 18 }, label: 'Siren çıkışı düşük/yok', next: 'fire_siren_fuse', scoreDelta: { siren_output_fault: 42 } },
    { when: { operator: 'between', min: 20, max: 29 }, label: 'Panel siren çıkışı uygun', next: 'fire_siren_field_check', scoreDelta: { siren_output_fault: -10, fire_field_device_fault: 18 } },
    { when: { operator: '>', value: 30 }, label: 'Siren çıkışı anormal yüksek', next: 'fire_result_siren_driver', scoreDelta: { siren_output_fault: 36 } },
  ], fallbackNext: 'fire_siren_fuse',
})

nodes.fire_siren_field_check = question({
  id: 'fire_siren_field_check', device: 'fire_panel', category: 'Siren Saha Hattı', title: 'Polarite / EOL / Hat Sonu Karşılaştırması',
  prompt: 'Panel çıkışı uygunken hat sonunda polarite, EOL ve voltaj seviyesi doğru mu; bilinen sağlam siren çalışıyor mu?',
  yesLabel: 'Hat sonu uygun, siren çalışmıyor', noLabel: 'Hat/polarite/EOL hatalı', unknownLabel: 'Hat sonuna erişilemiyor',
  nextYes: 'fire_result_field_device', nextNo: 'fire_result_siren_field_line', nextUnknown: 'fire_result_siren_field',
  scoreYes: { fire_field_device_fault: 44 }, scoreNo: { siren_output_fault: 20, fire_field_device_fault: 22 }, scoreUnknown: { fire_field_device_fault: 10 }, sourceIds: ['ctec_fire'],
})

nodes.fire_panel_24v = measurement({
  id: 'fire_panel_24v', device: 'fire_panel', category: 'Panel Beslemesi', title: 'Panel 24V Sistem Beslemesi',
  prompt: 'Panelin servis kılavuzunda belirtilen ana DC/AUX test noktasını yük altında ölçün.',
  unit: 'V', meterMode: 'DC Voltage', powerState: 'Panel enerjili, servis test koşulu', probeBlack: 'Panel 0V', probeRed: '24V/AUX test noktası',
  expected: { min: 21.5, max: 28.5 }, danger: 'high', hint: 'C-TEC FP iç beslemesi 27V nominaldir; kesin değer model kılavuzundan alınır.',
  testSteps: ['Şebeke, akü ve AUX durumunu ayrı not edin.', 'Reset anını MIN/MAX ile yakalayın.', 'AUX ayrılmış ve bağlı değerleri karşılaştırın.'],
  stopConditions: ['Şebeke primeri açıkta', 'Aktif alarm/yangın durumu var'], sourceIds: ['ctec_fire', 'fluke_dc_supply'],
  rules: [
    { when: { operator: '<', value: 20 }, label: 'Panel sistem beslemesi düşük', next: 'fire_result_panel_power', scoreDelta: { input_protection_fault: 30, fire_aux_overload: 16, panel_battery_fault: 12 } },
    { when: { operator: 'between', min: 21.5, max: 28.5 }, label: 'Panel DC beslemesi uygun', next: 'fire_result_panel_logic', scoreDelta: { input_protection_fault: -10 } },
    { when: { operator: '>', value: 28.5 }, label: 'Panel beslemesi/şarjı yüksek', next: 'fire_result_charger_high', scoreDelta: { charger_fault: 34, panel_battery_fault: 12 } },
  ], fallbackNext: 'fire_result_panel_logic',
})

nodes.fire_result_authorization_required = result({
  id: 'fire_result_authorization_required', device: 'fire_panel', category: 'Servis Güvenliği', title: 'Yetkili Test Prosedürü Gerekli', severity: 'critical',
  summary: 'Yangın koruma devresi aktif hizmetteyken izolasyon veya alarm testi güvenli ve yetkili biçimde yapılamıyor.',
  components: ['Bina yangın sorumlusu', 'Test/devre dışı kayıt prosedürü', 'Geçici koruma planı'],
  repair: 'Teknik ölçüme başlamadan sorumlu onayı, izleme merkezi bildirimi ve geçici koruma adımlarını tamamlayın.',
  verification: 'Servis başlangıç/bitiş saatleri, devre dışı kalan alanlar ve tüm zone/sirenlerin geri alındığı kayıt altına alınmalı.', sourceIds: ['ctec_fire'],
})
nodes.fire_result_eol_reference = result({
  id: 'fire_result_eol_reference', device: 'fire_panel', category: 'Zone Sonlandırma', title: 'EOL Model Referansı Gerekli', severity: 'info',
  summary: 'Zone sonlandırması direnç yerine üretici modülü kullanıyor olabilir veya nominal değer bilinmiyor.',
  components: ['Panel model etiketi', 'Zone kartı revizyonu', 'EOL direnç/modülü'],
  repair: 'Panel servis kılavuzundan doğru EOL tipini belirleyin; bilinmeyen modülü yalnız ohm değeriyle değerlendirmeyin.',
  verification: 'Doğru EOL takıldığında zone normal görünmeli ve uçtan sökme/kısa testleri doğru fault üretmelidir.', sourceIds: ['ctec_fire'],
})
nodes.fire_result_eol_mismatch = result({
  id: 'fire_result_eol_mismatch', device: 'fire_panel', category: 'Zone Sonlandırma', title: 'EOL Değeri Yanlış / Tolerans Dışında',
  summary: 'Hat kısa veya açık değil; ancak ölçülen sonlandırma seçilen panel referansıyla uyuşmuyor.',
  components: ['EOL direnci/modülü', 'Paralel kaçak yolları', 'Yanlış zone bağlantısı'],
  repair: 'Hat sonundaki EOL’yi model için doğru değer ve toleransla yenileyin; ara paralel direnç veya nem kaçağını giderin.',
  verification: 'Panel zone normal göstermeli; EOL sökülünce open, kısa edilince short fault doğru oluşmalıdır.', sourceIds: ['ctec_fire'],
})
nodes.fire_result_earth_field = result({
  id: 'fire_result_earth_field', device: 'fire_panel', category: 'Toprak Kaçağı', title: 'Saha Devresinde Toprağa Kaçak', severity: 'critical',
  summary: 'Earth fault belirli zone/siren/AUX devresi ayrıldığında kayboluyor; kaçak saha kablosu veya cihaz tarafında.',
  components: ['Saha kablosu', 'Nemli ek/klemens', 'Dedektör, siren veya modül gövdesi'],
  repair: 'Devreyi bölerek kaçağı daraltın; elektronik cihazlar ayrılmadan izolasyon test cihazı uygulamayın.',
  verification: 'Tüm devreler geri bağlandığında earth fault dönmemeli ve fonksiyon testleri geçmelidir.', sourceIds: ['ctec_fire'],
})
nodes.fire_result_earth_panel = result({
  id: 'fire_result_earth_panel', device: 'fire_panel', category: 'Toprak Kaçağı', title: 'Panel İçi Earth Fault / PSU İzolasyonu', severity: 'critical',
  summary: 'Tüm saha devreleri ayrıyken earth fault sürüyor; panel PSU, kart standoff veya iç kablolama incelenmeli.',
  components: ['Panel güç kaynağı', 'Kart-muhafaza izolasyonu', 'İç kablo demeti'],
  repair: 'Şebekeyi güvenli ayırıp panel içi kaçak ve montaj temaslarını yetkili servis prosedürüyle kontrol edin.',
  verification: 'Saha devreleri ayrıyken panel normal olmalı; devreler tek tek geri alındığında fault oluşmamalıdır.', sourceIds: ['ctec_fire'],
})
nodes.fire_result_aux_overload = result({
  id: 'fire_result_aux_overload', device: 'fire_panel', category: 'AUX Yük İzolasyonu', title: 'AUX Aşırı Yük / Saha Kısa Devresi', severity: 'critical',
  summary: 'AUX yükleri ayrılınca panel stabil oluyor; bağlı cihaz veya kablolama PSU’yu akım limitine sürüklüyor.',
  components: ['AUX saha kablosu', 'Harici modüller', 'AUX PTC/sigorta'],
  repair: 'Yükleri tek tek ekleyip arızalı modülü veya kısa hattı bulun; toplam akımı panel kapasitesine göre doğrulayın.',
  verification: 'Tüm gerekli yüklerle AUX voltajı kararlı kalmalı ve panel reset/fault üretmemelidir.', sourceIds: ['ctec_fire', 'fluke_dc_supply'],
})
nodes.fire_result_siren_field_line = result({
  id: 'fire_result_siren_field_line', device: 'fire_panel', category: 'Siren Saha Hattı', title: 'Siren Polarite / EOL / Kablo Arızası', severity: 'critical',
  summary: 'Panel çıkışı uygun fakat hat sonunda gerilim/polarite veya EOL doğru değil.',
  components: ['Siren kablosu', 'Hat sonu EOL', 'Ters polarite ve ek klemensleri'],
  repair: 'Hat sonu voltaj düşümünü bölgesel ölçün, polariteyi ve EOL yerini düzeltin.',
  verification: 'Alarm testinde tüm sirenler çalışmalı; normal durumda siren fault göstergesi sönmelidir.', sourceIds: ['ctec_fire'],
})
nodes.fire_result_panel_power = result({
  id: 'fire_result_panel_power', device: 'fire_panel', category: 'Panel Beslemesi', title: 'Panel PSU / DC Bara Düşük', severity: 'critical',
  summary: 'Saha yükü izole edilse de panel ana DC beslemesi üretici aralığının altında.',
  components: ['Şebeke sigortası ve trafo/SMPS', 'Doğrultucu ve filtre kondansatörleri', 'AUX/ana DC regülasyonu'],
  repair: 'Yetkili servis olarak şebeke girişini, sekonder DC’yi, ripple ve regülasyon geri beslemesini sırayla test edin.',
  verification: 'Şebeke ve akü koşullarında panel DC seviyesi kararlı kalmalı, reset veya PSU fault oluşmamalıdır.', sourceIds: ['ctec_fire', 'fluke_dc_supply'],
})

nodes.cctv_symptom = symptom({
  id: 'cctv_symptom', device: 'cctv', category: 'CCTV Triage', title: 'Kamera / CCTV Belirti Sınıflandırması',
  prompt: 'Güç, fiziksel link, IP erişimi, video stream ve görüntü kalitesini ayrı katmanlar olarak ele alın.', sourceIds: ['axis_network', 'axis_image'],
  options: [
    { label: 'Kamera hiç açılmıyor / güç belirtisi yok', description: '12V ve PoE besleme yöntemleri önce ayrılır.', next: 'cctv_power_method', scoreDelta: { poe_power_fault: 28, rail_short: 12 } },
    { label: 'PoE kamera switchte görünmüyor', description: 'PoE anlaşması, kablo ve güç bütçesi bilinen sağlam portla izole edilir.', next: 'cctv_poe_port_status', scoreDelta: { cctv_cable_fault: 24, poe_power_fault: 20, cctv_poe_budget_fault: 12 } },
    { label: 'Link var ama görüntü/NVR bağlantısı yok', description: 'IP keşfi ve doğrudan stream testi NVR’dan ayrılır.', next: 'cctv_link_activity', scoreDelta: { cctv_network_config: 24, cctv_stream_fault: 18 } },
    { label: 'Gece görüntüsü kötü / IR parlıyor veya çalışmıyor', description: 'Önce optik yansıma, sonra IR sürücü ve besleme test edilir.', next: 'cctv_ir_environment', scoreDelta: { cctv_image_optics: 24, ir_led_fault: 22 } },
    { label: 'Kamera aralıklı resetliyor / özellikle IR açılınca kapanıyor', description: 'Yük geçişi altında DC/PoE düşümü ve ripple araştırılır.', next: 'cctv_load_transition', scoreDelta: { poe_power_fault: 24, cctv_poe_budget_fault: 14, rail_short: 10 } },
    { label: 'Kayıt yok / disk veya SD karta yazmıyor', description: 'Canlı görüntü ile depolama zinciri birbirinden ayrılır.', next: 'cctv_storage_test', scoreDelta: { cctv_storage_fault: 34, cctv_stream_fault: 10 } },
  ],
})

nodes.cctv_power_method = symptom({
  id: 'cctv_power_method', device: 'cctv', category: 'Besleme Yöntemi', title: 'Kameranın Besleme Yöntemi', optionBadge: 'GUC',
  prompt: 'Yanlış nominal veya PoE sınıfı uygulamamak için kullanılan güç yöntemini seçin.', sourceIds: ['axis_network'],
  options: [
    { label: '12V DC adaptör', description: 'Kamera girişinde yük altında DC seviye ölçülür.', next: 'cctv_supply_voltage', scoreDelta: { poe_power_fault: 12 } },
    { label: '802.3af/at/bt PoE', description: 'Switch port anlaşması ve güç bütçesi kontrol edilir.', next: 'cctv_poe_port_status', scoreDelta: { poe_power_fault: 12, cctv_poe_budget_fault: 8 } },
    { label: 'Besleme tipi/nominali bilinmiyor', description: 'Etiket ve model kılavuzu olmadan enerji verilmez.', next: 'cctv_result_power_reference', scoreDelta: { poe_power_fault: 8 } },
  ],
})

nodes.cctv_poe_port_status = question({
  id: 'cctv_poe_port_status', device: 'cctv', category: 'PoE Anlaşması', title: 'PoE Port Sınıflandırması Kararlı mı?',
  prompt: 'Yönetilebilir switch veya PoE test cihazı kamerayı algılıyor, sınıflandırıyor ve portu açık tutuyor mu?',
  yesLabel: 'PoE aktif ve kararlı', noLabel: 'Port açılmıyor/kapanıyor', unknownLabel: 'PoE tester/switch verisi yok',
  nextYes: 'cctv_link_activity', nextNo: 'cctv_known_good_short_cable', nextUnknown: 'cctv_poe_voltage',
  scoreYes: { poe_power_fault: -14 }, scoreNo: { poe_power_fault: 30, cctv_cable_fault: 18, cctv_poe_budget_fault: 12 }, scoreUnknown: { poe_power_fault: 8 },
  testSteps: ['Switch olay/PoE durum sayfasını açın.', 'Port sınıfı, çekilen güç ve açılıp kapanma sayısını kaydedin.', 'Aynı portu bilinen sağlam PoE cihazla karşılaştırın.'], sourceIds: ['axis_network'],
})

nodes.cctv_known_good_short_cable = question({
  id: 'cctv_known_good_short_cable', device: 'cctv', category: 'Kablo İzolasyonu', title: 'Kısa Bilinen Sağlam Patch Kablo Testi',
  prompt: 'Kamera switch yanında kısa ve bilinen sağlam kablo/port ile çalışıyor mu?',
  yesLabel: 'Kısa kabloyla çalışıyor', noLabel: 'Kısa kabloyla da çalışmıyor', unknownLabel: 'A/B testi yapılamıyor',
  nextYes: 'cctv_result_cable', nextNo: 'cctv_poe_budget', nextUnknown: 'cctv_result_poe_source',
  scoreYes: { cctv_cable_fault: 48, poe_power_fault: -12 }, scoreNo: { cctv_cable_fault: -12, poe_power_fault: 18 }, scoreUnknown: { cctv_cable_fault: 10 },
  testSteps: ['Saha kablosunu her iki uçtan ayırın.', 'Kamerayı switch yanında kısa fabrika patch kabloyla deneyin.', 'Aynı switch portunda bilinen sağlam kamera sonucunu karşılaştırın.'], sourceIds: ['axis_network'],
})

nodes.cctv_poe_budget = question({
  id: 'cctv_poe_budget', device: 'cctv', category: 'PoE Güç Bütçesi', title: 'PoE Sınıfı ve Toplam Güç Bütçesi Yeterli mi?',
  prompt: 'Kamera veri sayfasındaki PoE sınıfı/maksimum güç, port limiti ve switch toplam bütçesiyle uyumlu mu?',
  yesLabel: 'Bütçe ve sınıf yeterli', noLabel: 'Limit/bütçe yetersiz', unknownLabel: 'Güç verisi bilinmiyor',
  nextYes: 'cctv_result_link_fault', nextNo: 'cctv_result_poe_budget', nextUnknown: 'cctv_result_power_reference',
  scoreYes: { cctv_poe_budget_fault: -16, mcu_boot: 12 }, scoreNo: { cctv_poe_budget_fault: 48 }, scoreUnknown: { cctv_poe_budget_fault: 10 }, sourceIds: ['axis_network'],
})

nodes.cctv_poe_voltage = measurement({
  id: 'cctv_poe_voltage', device: 'cctv', category: 'PoE Ölçümü', title: 'PoE Tester Hat Voltajı',
  prompt: 'Yalnız uygun PoE test cihazıyla aktif portun gerilimini okuyun; çıplak RJ45 pinlerine multimetre probu sokmayın.',
  unit: 'V', meterMode: 'DC Voltage', powerState: 'PoE tester PSE-PD arasında ve anlaşma aktif', probeBlack: 'PoE tester DC - göstergesi', probeRed: 'PoE tester DC + göstergesi',
  expected: { min: 44, max: 57 }, danger: 'medium', hint: 'Voltaj tek başına güç bütçesi veya sınıflandırmayı kanıtlamaz.',
  testSteps: ['Tester’ın 802.3af/at/bt desteğini doğrulayın.', 'Anlaşma sonrası voltaj ve sınıfı kaydedin.', 'Kamera açılışında minimum değeri izleyin.'],
  stopConditions: ['Çıplak RJ45 pinlerine prob uygulanacak', 'Pasif PoE polaritesi/modeli bilinmiyor'], sourceIds: ['axis_network'],
  rules: [
    { when: { operator: '<', value: 40 }, label: 'PoE anlaşması yok veya hat voltajı düşük', next: 'cctv_result_poe_source', scoreDelta: { poe_power_fault: 42, cctv_cable_fault: 12 } },
    { when: { operator: 'between', min: 44, max: 57 }, label: 'PoE gerilimi uygun; veri/link ayrıca doğrulanmalı', next: 'cctv_known_good_short_cable', scoreDelta: { poe_power_fault: -8 } },
    { when: { operator: '>', value: 58 }, label: 'PoE/pasif enjektör seviyesi modele göre doğrulanmalı', next: 'cctv_result_power_reference', scoreDelta: { poe_power_fault: 16 } },
  ], fallbackNext: 'cctv_known_good_short_cable',
})

nodes.cctv_link_activity = question({
  id: 'cctv_link_activity', device: 'cctv', category: 'Fiziksel Ağ', title: 'Ethernet Link Aktivitesi',
  prompt: 'Kamera ve switch portunda link kararlı mı; port sürekli up/down olmadan trafik görüyor mu?',
  yesLabel: 'Link kararlı', noLabel: 'Link yok/kararsız', unknownLabel: 'Port verisi okunamıyor',
  nextYes: 'cctv_ip_discovery', nextNo: 'cctv_known_good_short_cable', nextUnknown: 'cctv_ip_discovery',
  scoreYes: { cctv_cable_fault: -12, cctv_network_config: 14 }, scoreNo: { cctv_cable_fault: 36, poe_power_fault: 12 }, scoreUnknown: { cctv_network_config: 8 }, sourceIds: ['axis_network'],
})

nodes.cctv_ip_discovery = question({
  id: 'cctv_ip_discovery', device: 'cctv', category: 'IP Keşfi', title: 'MAC/IP Yardımcı Aracıyla Kamera Bulunuyor mu?',
  prompt: 'Kamera MAC adresiyle keşfediliyor ve istemci aynı subnetten ping/HTTPS erişimi sağlayabiliyor mu?',
  yesLabel: 'IP erişimi var', noLabel: 'Keşif/ping yok', unknownLabel: 'Ağ bilgisi yok',
  nextYes: 'cctv_stream_test', nextNo: 'cctv_result_network_config', nextUnknown: 'cctv_result_network_config',
  scoreYes: { cctv_network_config: -12, cctv_stream_fault: 14 }, scoreNo: { cctv_network_config: 42 }, scoreUnknown: { cctv_network_config: 12 },
  testSteps: ['Kameranın MAC adresini etiketinden kaydedin.', 'DHCP lease veya üretici keşif aracında arayın.', 'İstemci IP/subnet/VLAN bilgisini kamerayla karşılaştırın.'], sourceIds: ['axis_network'],
})

nodes.cctv_stream_test = question({
  id: 'cctv_stream_test', device: 'cctv', category: 'Video Akışı', title: 'Doğrudan Kamera Stream Testi',
  prompt: 'NVR devre dışıyken kameranın web arayüzü veya üretici aracı canlı görüntüyü açıyor mu?',
  yesLabel: 'Doğrudan stream çalışıyor', noLabel: 'Doğrudan stream de yok', unknownLabel: 'Kimlik bilgisi/araç yok',
  nextYes: 'cctv_result_config_or_sensor', nextNo: 'cctv_result_stream', nextUnknown: 'cctv_result_stream',
  scoreYes: { cctv_stream_fault: -12, cctv_network_config: 16 }, scoreNo: { cctv_stream_fault: 42, mcu_boot: 12 }, scoreUnknown: { cctv_stream_fault: 10 }, sourceIds: ['axis_network'],
})

nodes.cctv_ir_environment = question({
  id: 'cctv_ir_environment', device: 'cctv', category: 'Gece Görüntüsü', title: 'Dome / Lens / IR Yansıma Kontrolü',
  prompt: 'Dome temiz ve kuru mu; lens lastiği yerine oturuyor, yakın duvar/cam/örümcek ağı IR yansıması oluşturmuyor mu?',
  yesLabel: 'Optik ortam temiz', noLabel: 'Kir/nem/yansıma var', unknownLabel: 'Gece testi yapılamıyor',
  nextYes: 'cctv_ir_voltage', nextNo: 'cctv_result_optics', nextUnknown: 'cctv_ir_voltage',
  scoreYes: { cctv_image_optics: -14, ir_led_fault: 14 }, scoreNo: { cctv_image_optics: 48 }, scoreUnknown: { cctv_image_optics: 8 },
  testSteps: ['Dome dışını ve içini çizmeden temizleyin.', 'Lens çevresi lastik halkanın dome’a temasını doğrulayın.', 'Yakın yansıtıcı yüzeyleri ve harici ışıkları geçici maskeleyerek karşılaştırın.'], sourceIds: ['axis_image'],
})

nodes.cctv_load_transition = question({
  id: 'cctv_load_transition', device: 'cctv', category: 'Yük Geçişi', title: 'Reset IR / Isıtıcı / Motor Yüküyle Eşleşiyor mu?',
  prompt: 'Kamera reseti gece modu, IR LED, ısıtıcı veya PTZ hareketi gibi yüksek yük anında tekrarlanıyor mu?',
  yesLabel: 'Yük anında resetliyor', noLabel: 'Yükten bağımsız', unknownLabel: 'Korelasyon izlenemiyor',
  nextYes: 'cctv_loaded_supply_voltage', nextNo: 'cctv_link_activity', nextUnknown: 'cctv_loaded_supply_voltage',
  scoreYes: { poe_power_fault: 32, cctv_poe_budget_fault: 18 }, scoreNo: { cctv_network_config: 10, mcu_boot: 10 }, scoreUnknown: { poe_power_fault: 8 }, sourceIds: ['keysight_power'],
})

nodes.cctv_loaded_supply_voltage = measurement({
  id: 'cctv_loaded_supply_voltage', device: 'cctv', category: 'Yük Altı Besleme', title: 'IR/PTZ Aktifken 12V Giriş',
  prompt: '12V ile beslenen kamerada en yüksek yük anındaki minimum giriş voltajını ölçün.',
  unit: 'V', meterMode: 'DC Voltage', powerState: 'Kamera açık, IR/ısıtıcı/PTZ yükü aktif', probeBlack: 'Kamera GND', probeRed: 'Kamera 12V giriş',
  expected: { min: 11.4, max: 12.8 }, danger: 'low', hint: 'PoE kamerada bu testi çıplak RJ45 üzerinde yapmayın; PoE tester kullanın.',
  testSteps: ['DMM MIN/MAX modunu açın.', 'IR veya PTZ yükünü güvenli biçimde tetikleyin.', 'Reset anındaki minimum voltajı ve kablo ucundaki düşümü kaydedin.'], sourceIds: ['keysight_power'],
  rules: [
    { when: { operator: '<', value: 10.8 }, label: 'Yük altında ciddi besleme çökmesi', next: 'cctv_result_supply_sag', scoreDelta: { poe_power_fault: 44, cctv_poe_budget_fault: 16 } },
    { when: { operator: 'between', min: 11.4, max: 12.8 }, label: 'Yük altında 12V seviyesi uygun', next: 'cctv_link_activity', scoreDelta: { poe_power_fault: -12 } },
    { when: { operator: '>', value: 13.2 }, label: 'Kamera beslemesi yüksek', next: 'cctv_result_overvoltage', scoreDelta: { poe_power_fault: 30, mcu_boot: 12 } },
  ], fallbackNext: 'cctv_result_supply_sag',
})

nodes.cctv_storage_test = question({
  id: 'cctv_storage_test', device: 'cctv', category: 'Kayıt Depolama', title: 'Canlı Görüntü Var, Yazma Testi Başarısız mı?',
  prompt: 'Canlı stream çalışırken NVR/SD depolamada boş alan, sağlık ve kısa manuel kayıt yazma testi başarısız mı?',
  yesLabel: 'Yazma/sağlık hatası var', noLabel: 'Depolama sağlıklı', unknownLabel: 'Disk/SD bilgisi yok',
  nextYes: 'cctv_result_storage', nextNo: 'cctv_stream_test', nextUnknown: 'cctv_result_storage',
  scoreYes: { cctv_storage_fault: 48 }, scoreNo: { cctv_storage_fault: -16, cctv_stream_fault: 12 }, scoreUnknown: { cctv_storage_fault: 10 }, sourceIds: ['axis_network'],
})

nodes.cctv_result_power_reference = result({
  id: 'cctv_result_power_reference', device: 'cctv', category: 'Besleme Yöntemi', title: 'Kamera Güç Referansı Gerekli', severity: 'info',
  summary: 'Nominal DC giriş, polarite veya PoE standardı bilinmeden güvenli enerji testi yapılamaz.',
  components: ['Kamera model etiketi', 'Üretici veri sayfası', 'Adaptör/PoE enjektör etiketi'],
  repair: 'Model için doğru besleme yöntemini ve maksimum gücü doğrulayın; pasif PoE’yi 802.3 PoE ile karıştırmayın.',
  verification: 'Doğru kaynakla kamera açılmalı ve port güç sınıfı kararlı görünmelidir.', sourceIds: ['axis_network'],
})
nodes.cctv_result_cable = result({
  id: 'cctv_result_cable', device: 'cctv', category: 'Kablo İzolasyonu', title: 'Saha Kablosu / Krimp / Çift Arızası',
  summary: 'Kamera kısa sağlam kabloyla çalışıyor; arıza saha kablosu, ek, patch panel veya RJ45 uçta.',
  components: ['RJ45 krimp ve çift sırası', 'Patch panel/ek noktaları', 'Bakır kablo ve ekranlama'],
  repair: 'Kablo sertifikasyon/test cihazıyla çiftleri kontrol edin; hatalı ek ve konnektörleri yeniden sonlandırın.',
  verification: 'Saha hattında PoE anlaşması, link hızı ve paket kaybı kararlı olmalıdır.', sourceIds: ['axis_network'],
})
nodes.cctv_result_poe_budget = result({
  id: 'cctv_result_poe_budget', device: 'cctv', category: 'PoE Güç Bütçesi', title: 'PoE Sınıfı / Port Bütçesi Yetersiz',
  summary: 'Switch port limiti veya toplam PoE bütçesi kameranın maksimum yükünü karşılamıyor.',
  components: ['Switch PoE toplam bütçesi', 'Port başına güç limiti', 'Kamera PoE sınıfı'],
  repair: 'Port limitini doğru sınıfa ayarlayın, bütçeyi yeniden dağıtın veya uygun 802.3at/bt kaynak kullanın.',
  verification: 'IR/PTZ/ısıtıcı devredeyken port kapanmamalı ve çekilen güç bütçe içinde kalmalıdır.', sourceIds: ['axis_network'],
})
nodes.cctv_result_network_config = result({
  id: 'cctv_result_network_config', device: 'cctv', category: 'IP Keşfi', title: 'IP / VLAN / DHCP Yapılandırma Arızası', severity: 'info',
  summary: 'Fiziksel güç/link mevcut ancak kamera doğru ağda keşfedilemiyor veya erişilemiyor.',
  components: ['IP/subnet/gateway', 'VLAN ve switch port modu', 'DHCP lease ve erişim kuralları'],
  repair: 'MAC adresinden cihazı bulun, çakışan IP’yi giderin ve istemci-kamera VLAN/subnet yolunu doğrulayın.',
  verification: 'Kamera sabit veya rezervasyonlu IP ile ping/HTTPS erişimi vermeli ve yeniden başlatmada adresi korunmalıdır.', sourceIds: ['axis_network'],
})
nodes.cctv_result_stream = result({
  id: 'cctv_result_stream', device: 'cctv', category: 'Video Akışı', title: 'Kamera Stream / Codec / Firmware Arızası',
  summary: 'IP erişimi var fakat doğrudan canlı görüntü üretilemiyor.',
  components: ['Stream profili ve codec', 'Kamera firmware', 'Kullanıcı yetkisi ve eşzamanlı istemci limiti'],
  repair: 'Basit bir stream profiliyle test edin, yetki/istemci limitini kontrol edin ve onaylı firmware’e güncelleyin.',
  verification: 'Doğrudan stream kesintisiz çalışmalı; ardından NVR kanalına aynı profil eklenmelidir.', sourceIds: ['axis_network'],
})
nodes.cctv_result_optics = result({
  id: 'cctv_result_optics', device: 'cctv', category: 'Gece Görüntüsü', title: 'IR Yansıması / Dome / Nem Sorunu', severity: 'info',
  summary: 'Gece görüntü bozulması elektronik sürücüden önce optik yansıma veya muhafaza koşuluyla açıklanıyor.',
  components: ['Dome ve lens', 'Lens çevresi kauçuk halka', 'Nem, damla, toz ve yakın yansıtıcı yüzeyler'],
  repair: 'Dome’u uygun yöntemle temizleyip kurutun, lens halkasını oturtun ve IR’ı yansıtan yüzey/açıyı düzeltin.',
  verification: 'Gece modunda beyazlama/halo kaybolmalı, sahne ayrıntısı ve kontrast kararlı olmalıdır.', sourceIds: ['axis_image'],
})
nodes.cctv_result_supply_sag = result({
  id: 'cctv_result_supply_sag', device: 'cctv', category: 'Yük Altı Besleme', title: 'Kamera Beslemesi Yükte Çöküyor',
  summary: 'IR/PTZ/ısıtıcı akımı başladığında adaptör, PoE kaynağı veya uzun kablo voltajı koruyamıyor.',
  components: ['12V adaptör/PoE portu', 'Uzun saha kablosu', 'DC jak ve kamera giriş filtresi'],
  repair: 'Bilinen sağlam doğru kapasiteli kaynakla A/B test yapın; kablo düşümü ve konnektör direncini giderin.',
  verification: 'En yüksek yükte giriş voltajı kararlı kalmalı ve kamera yeniden başlamamalıdır.', sourceIds: ['keysight_power'],
})
nodes.cctv_result_storage = result({
  id: 'cctv_result_storage', device: 'cctv', category: 'Kayıt Depolama', title: 'Disk / SD Kart / Yazma Arızası',
  summary: 'Canlı görüntü zincirinden bağımsız olarak kayıt ortamı dolu, sağlıksız veya yazılamıyor.',
  components: ['NVR HDD/RAID', 'Kamera SD kartı', 'Dosya sistemi ve kayıt kotası'],
  repair: 'Sağlık/SMART ve yazma testini doğrulayın; uyumlu surveillance disk veya üretici onaylı SD kart kullanın.',
  verification: 'Manuel ve zamanlanmış kayıt oluşmalı, yeniden başlatma sonrası oynatılabilmelidir.', sourceIds: ['axis_network'],
})

nodes.access_symptom = symptom({
  id: 'access_symptom', device: 'access', category: 'CACS Triage', title: 'CACS / Erişim Kontrol Belirti Sınıflandırması',
  prompt: 'Güç, okuyucu protokolü, yetkilendirme, kilit çıkışı ve kapı girişlerini ayrı katmanlarda izole edin.', sourceIds: ['hid_signo', 'paxton_net2'],
  options: [
    { label: 'Adaptör değişince düzeldi / panel aralıklı resetliyor', description: 'Boşta voltaj yerine yük, temas ve ripple altında test edilir.', next: 'access_adapter_loaded_voltage', scoreDelta: { access_psu_sag: 30, access_psu_ripple: 18 } },
    { label: 'Okuyucu kartı görmüyor veya tepki vermiyor', description: 'Okuyucu güç belirtisi, nominal 5/12V ve Wiegand/OSDP ayrılır.', next: 'access_reader_status_led', scoreDelta: { access_reader_power: 22, reader_bus_fault: 24 } },
    { label: 'Kart okunuyor ama kapı açılmıyor', description: 'Olay kaydı/yetki ile röle-kilit çıkışı birbirinden ayrılır.', next: 'access_event_log', scoreDelta: { access_credential_config: 22, lock_output_fault: 24 } },
    { label: 'Kontrolör ağda / RS485 hattında görünmüyor', description: 'Ethernet erişimi, RS485 polarite/terminasyon ve kontrolör gücü kontrol edilir.', next: 'access_controller_network_or_bus', scoreDelta: { access_rs485_fault: 28, mcu_boot: 16 } },
    { label: 'Kapı açık alarmı, REX veya acil açma hatalı', description: 'Fiziksel giriş değişimi ile yazılım durumu karşılaştırılır.', next: 'access_door_inputs', scoreDelta: { access_door_input_fault: 36 } },
    { label: 'Kilit çekmiyor / zayıf çekiyor / takılı kalıyor', description: 'Komut anı voltajı, röle kontağı, kablo düşümü ve mekanik baskı ayrılır.', next: 'access_lock_voltage', scoreDelta: { lock_output_fault: 30, access_lock_mechanical: 18 } },
  ],
})

nodes.access_adapter_wiggle_reset = question({
  id: 'access_adapter_wiggle_reset', device: 'access', category: 'CACS Harici Besleme', title: 'Adaptör / Klemens Temas Testi',
  prompt: 'DC jak, kablo ve klemens kontrollü hareket ettirildiğinde panel reseti veya voltaj kesintisi tekrarlanıyor mu?',
  yesLabel: 'Temasla arıza tekrarlanıyor', noLabel: 'Temas testi normal', unknownLabel: 'Güvenli test yapılamıyor',
  nextYes: 'access_result_adapter_intermittent', nextNo: 'access_adapter_ripple', nextUnknown: 'access_adapter_ripple',
  scoreYes: { access_psu_sag: 28, access_reader_power: 10 }, scoreNo: { access_psu_sag: -6, access_psu_ripple: 12 }, scoreUnknown: { access_psu_sag: 6 },
  testSteps: ['Konnektörü zorlamadan kablo/jak/klemensi ayrı ayrı hareket ettirin.', 'DMM MIN/MAX ile panel girişini izleyin.', 'Kablo ve kart tarafı lehimlerini büyüteçle kontrol edin.'],
  stopConditions: ['Konnektörde ısınma, erime veya ark var'], sourceIds: ['keysight_power'],
})

nodes.access_adapter_ripple = question({
  id: 'access_adapter_ripple', device: 'access', category: 'CACS Güç Kalitesi', title: 'Ripple / Transient Reset Korelasyonu',
  prompt: 'Osiloskop veya MIN/MAX kaydında kilit/okuyucu yükü başladığı anda besleme dip/ripple ile reset eşleşiyor mu?',
  yesLabel: 'Dip/ripple resetle eşleşiyor', noLabel: 'Besleme kararlı', unknownLabel: 'Osiloskop/MIN-MAX yok',
  nextYes: 'access_result_psu_ripple', nextNo: 'access_reader_status_led', nextUnknown: 'access_reader_status_led',
  scoreYes: { access_psu_ripple: 48, access_psu_sag: 14 }, scoreNo: { access_psu_ripple: -16 }, scoreUnknown: { access_psu_ripple: 8 },
  testSteps: ['Prob ground yayını kısa tutup panel girişinde ölçün.', 'Kilit rölesini ve okuyucu aktivitesini ayrı tetikleyin.', 'Reset anındaki minimum voltaj ve ripple tepesini kaydedin.'], sourceIds: ['keysight_power', 'ti_power_transient'],
})

nodes.access_reader_status_led = question({
  id: 'access_reader_status_led', device: 'access', category: 'Okuyucu Triage', title: 'Okuyucu Güç / Bip / LED Tepkisi',
  prompt: 'Okuyucu açılış belirtisi veriyor ve kart okutulduğunda bip/LED davranışı değişiyor mu?',
  yesLabel: 'Okuyucu kartı algılıyor', noLabel: 'Güç/okuma tepkisi yok', unknownLabel: 'LED/bip gözlenemiyor',
  nextYes: 'access_protocol_select', nextNo: 'access_reader_voltage', nextUnknown: 'access_reader_voltage',
  scoreYes: { access_reader_power: -12, reader_bus_fault: 16 }, scoreNo: { access_reader_power: 30, reader_bus_fault: 12 }, scoreUnknown: { access_reader_power: 8 },
  testSteps: ['Güç verildiğinde açılış LED/bip davranışını kaydedin.', 'Bilinen yetkili ve bilinmeyen iki kartla karşılaştırın.', 'Okuyucuyu kontrolör yanında kısa kabloyla A/B test etmeye hazırlayın.'], sourceIds: ['hid_signo', 'paxton_net2'],
})

nodes.access_protocol_select = question({
  id: 'access_protocol_select', device: 'access', category: 'Okuyucu Protokolü', title: 'Okuyucu Wiegand mı OSDP/RS485 mi?',
  prompt: 'Kablo şeması ve kontrolör ayarından okuyucu veri protokolünü seçin.',
  yesLabel: 'Wiegand D0/D1', noLabel: 'OSDP / RS485', unknownLabel: 'Protokol bilinmiyor',
  nextYes: 'access_wiegand_activity', nextNo: 'access_bus_voltage', nextUnknown: 'access_result_reader_reference',
  scoreYes: { reader_bus_fault: 8 }, scoreNo: { access_rs485_fault: 10 }, scoreUnknown: { reader_bus_fault: 8 },
  testSteps: ['Okuyucu ve kontrolör bağlantı şemasını karşılaştırın.', 'Wiegand D0/D1 ile OSDP A/B hatlarını karıştırmayın.', 'Kontrolör yazılımındaki port modunu doğrulayın.'], sourceIds: ['hid_signo', 'paxton_net2'],
})

nodes.access_wiegand_activity = question({
  id: 'access_wiegand_activity', device: 'access', category: 'Wiegand Veri Hattı', title: 'D0 / D1 Pulse Aktivitesi',
  prompt: 'Kart okutulduğunda D0/D1 hatlarında lojik pulse oluşuyor ve GND referansı kontrolörle ortak mı?',
  yesLabel: 'Pulse aktivitesi var', noLabel: 'Pulse yok/hat sabit', unknownLabel: 'Lojik prob yok',
  nextYes: 'access_event_log', nextNo: 'access_result_reader_bus', nextUnknown: 'access_event_log',
  scoreYes: { reader_bus_fault: -16, access_credential_config: 14 }, scoreNo: { reader_bus_fault: 46 }, scoreUnknown: { reader_bus_fault: 8 },
  danger: 'low', meterMode: 'Logic Probe', powerState: 'Okuyucu ve kontrolör enerjili', probeBlack: 'Kontrolör GND', probeRed: 'D0 ve D1 hatları ayrı',
  testSteps: ['Boşta D0/D1 seviyelerini kaydedin.', 'Kart okutulurken her hattı ayrı izleyin.', 'Kontrolör yanında kısa kablo testini saha kablosuyla karşılaştırın.'], sourceIds: ['hid_signo', 'paxton_net2'],
})

nodes.access_event_log = question({
  id: 'access_event_log', device: 'access', category: 'Olay Kaydı', title: 'Kart Okuma Olayı Kontrolörde Görülüyor mu?',
  prompt: 'Kart okutulduğunda olay kaydında kart numarası ve karar nedeni oluşuyor mu?',
  yesLabel: 'Olay ve kart numarası görülüyor', noLabel: 'Kontrolöre olay ulaşmıyor', unknownLabel: 'Yazılıma erişilemiyor',
  nextYes: 'access_credential_decision', nextNo: 'access_result_reader_bus', nextUnknown: 'access_lock_voltage',
  scoreYes: { reader_bus_fault: -18, access_credential_config: 20 }, scoreNo: { reader_bus_fault: 30 }, scoreUnknown: { access_credential_config: 8 }, sourceIds: ['paxton_net2'],
})

nodes.access_credential_decision = question({
  id: 'access_credential_decision', device: 'access', category: 'Yetkilendirme', title: 'Olay Kaydı Erişimi Reddediyor mu?',
  prompt: 'Olay kaydında geçersiz kart, site kodu/format, zaman profili veya kapı yetkisi reddi açıkça görülüyor mu?',
  yesLabel: 'Yetki/format reddi var', noLabel: 'Erişim verildi', unknownLabel: 'Karar nedeni belirsiz',
  nextYes: 'access_result_config', nextNo: 'access_lock_voltage', nextUnknown: 'access_lock_voltage',
  scoreYes: { access_credential_config: 48 }, scoreNo: { access_credential_config: -18, lock_output_fault: 16 }, scoreUnknown: { access_credential_config: 8 }, sourceIds: ['paxton_net2'],
})

nodes.access_controller_network_or_bus = question({
  id: 'access_controller_network_or_bus', device: 'access', category: 'Kontrolör Haberleşmesi', title: 'Kontrolör Ethernet Üzerinden Erişilebilir mi?',
  prompt: 'Kontrolör MAC/IP ile keşfediliyor, ping veriyor veya üretici yazılımında online görünüyor mu?',
  yesLabel: 'Ethernet erişimi var', noLabel: 'Kontrolör offline', unknownLabel: 'Ağ testi yapılamıyor',
  nextYes: 'access_result_software_service', nextNo: 'access_bus_voltage', nextUnknown: 'access_bus_voltage',
  scoreYes: { access_rs485_fault: -10, access_credential_config: 16 }, scoreNo: { access_rs485_fault: 24, mcu_boot: 18 }, scoreUnknown: { access_rs485_fault: 8 },
  testSteps: ['Kontrolör link LED ve switch portunu kontrol edin.', 'MAC/IP keşfi ve ping sonucunu kaydedin.', 'Sunucu hizmeti ile saha kontrolörü erişimini ayrı test edin.'], sourceIds: ['paxton_net2'],
})

nodes.access_door_inputs = question({
  id: 'access_door_inputs', device: 'access', category: 'Kapı Girişleri', title: 'Kapı Kontağı / REX / Acil Açma Durumu',
  prompt: 'Her fiziksel giriş elle değiştirildiğinde kontrolör terminali ve yazılım durumu doğru değişiyor mu?',
  yesLabel: 'Girişler doğru değişiyor', noLabel: 'Bir giriş sabit/ters/kararsız', unknownLabel: 'Giriş testi yapılamıyor',
  nextYes: 'access_result_config', nextNo: 'access_result_door_input', nextUnknown: 'access_result_door_input',
  scoreYes: { access_door_input_fault: -16, access_credential_config: 10 }, scoreNo: { access_door_input_fault: 48 }, scoreUnknown: { access_door_input_fault: 10 },
  testSteps: ['Kapı kapalı/açık durumunu terminalde ölçün.', 'REX ve acil açmayı tek tek tetikleyin.', 'Normalde açık/kapalı yazılım ayarını fiziksel kontakla karşılaştırın.'], sourceIds: ['paxton_net2'],
})

nodes.access_lock_voltage = measurement({
  id: 'access_lock_voltage', device: 'access', category: 'Kilit Çıkışı', title: 'Komut Anında Kilit Voltajı',
  prompt: 'Kapı aç komutu boyunca kilit klemensindeki voltajı, kilit bağlı ve akım çekerken ölçün.',
  unit: 'V', meterMode: 'DC Voltage', powerState: 'Kontrolör enerjili, kapı aç komutu aktif, kilit bağlı', probeBlack: 'Kilit - / PSU 0V', probeRed: 'Kilit + çıkışı',
  expected: { min: 10.8, max: 13.8 }, danger: 'medium', hint: '24V kilitlerde bu aralık kullanılmaz; model etiketi önceliklidir.',
  testSteps: ['Kilit nominalini ve fail-safe/fail-secure tipini doğrulayın.', 'Komut öncesi ve komut anı MIN/MAX voltajı kaydedin.', 'Panel klemensi ile kilit ucunu karşılaştırarak kablo düşümünü bulun.'],
  stopConditions: ['Kilit nominali bilinmiyor', 'Bobin veya kablo hızla ısınıyor'], sourceIds: ['paxton_net2', 'keysight_power'],
  rules: [
    { when: { operator: '<', value: 9.5 }, label: 'Kilit çıkışı düşük/yok', next: 'access_relay_click', scoreDelta: { lock_output_fault: 42, access_psu_sag: 12 } },
    { when: { operator: 'between', min: 10.8, max: 13.8 }, label: '12V kilit çıkışı yük altında uygun', next: 'access_lock_current_behavior', scoreDelta: { lock_output_fault: -8, access_lock_mechanical: 18 } },
    { when: { operator: '>', value: 14.2 }, label: 'Kilit çıkışı modele göre yüksek', next: 'access_result_lock_or_cable', scoreDelta: { lock_output_fault: 22 } },
  ], fallbackNext: 'access_relay_click',
})

nodes.access_lock_current_behavior = question({
  id: 'access_lock_current_behavior', device: 'access', category: 'Kilit İzolasyonu', title: 'Bilinen Sağlam Kilit / Kısa Kablo A-B Testi',
  prompt: 'Aynı çıkışta kısa kabloyla bilinen sağlam eşdeğer kilit çalışıyor mu?',
  yesLabel: 'Sağlam kilit çalışıyor', noLabel: 'Sağlam kilit de çalışmıyor', unknownLabel: 'A-B kilit testi yok',
  nextYes: 'access_result_lock_mechanical', nextNo: 'access_result_lock_contact', nextUnknown: 'access_result_lock_or_cable',
  scoreYes: { access_lock_mechanical: 44, lock_output_fault: -12 }, scoreNo: { lock_output_fault: 36, access_psu_sag: 10 }, scoreUnknown: { access_lock_mechanical: 10 },
  testSteps: ['Mevcut kilidi saha kablosundan ayırın.', 'Aynı nominalde sağlam kilidi panel yanında kısa kabloyla bağlayın.', 'Flyback diyot yönünü ve fail-safe/fail-secure davranışı doğrulayın.'], sourceIds: ['paxton_net2'],
})

nodes.access_result_psu_ripple = result({
  id: 'access_result_psu_ripple', device: 'access', category: 'CACS Güç Kalitesi', title: 'Adaptör Ripple / Transient Çökme Arızası',
  summary: 'Ortalama DC seviye normal görünse de yük geçişindeki dip veya ripple kontrolörü resetliyor.',
  components: ['Adaptör çıkış kondansatörleri', 'DC kablo/jak', 'Kilit ve okuyucu ani yükü'],
  repair: 'Doğru akım kapasiteli, düşük ripple’lı bilinen sağlam adaptörle A/B test yapın; kablo düşümü ve konnektörü düzeltin.',
  verification: 'Kilit/okuyucu tekrarlı çalışırken besleme dip yapmamalı ve kontrolör resetlenmemelidir.', sourceIds: ['keysight_power', 'ti_power_transient'],
})
nodes.access_result_software_service = result({
  id: 'access_result_software_service', device: 'access', category: 'Kontrolör Haberleşmesi', title: 'Sunucu Hizmeti / Kontrolör Kaydı Arızası', severity: 'info',
  summary: 'Kontrolör ağdan erişilebilir; sorun sunucu hizmeti, kontrolör kaydı, güvenlik duvarı veya yazılım yapılandırmasında.',
  components: ['CACS sunucu hizmeti', 'Kontrolör kaydı ve IP', 'Firewall/VLAN izinleri'],
  repair: 'Sunucu hizmetini, olay logunu ve kontrolör kayıt/IP eşleşmesini doğrulayın; yeniden eklemeden önce yapılandırmayı yedekleyin.',
  verification: 'Kontrolör online görünmeli, olaylar gerçek zamanlı akmalı ve kapı komutları cevap vermelidir.', sourceIds: ['paxton_net2'],
})
nodes.access_result_door_input = result({
  id: 'access_result_door_input', device: 'access', category: 'Kapı Girişleri', title: 'Kapı Kontağı / REX / Acil Açma Girişi Arızası',
  summary: 'Fiziksel kapı durumu kontrolörde doğru değişmiyor veya giriş normal mantığı ters/kararsız.',
  components: ['Manyetik kapı kontağı', 'REX butonu/sensörü', 'Acil açma kontağı ve kablo'],
  repair: 'Kontak tipini ve kablo sürekliliğini düzeltin; yazılımdaki NO/NC mantığını fiziksel devreyle eşleştirin.',
  verification: 'Her giriş elle tetiklendiğinde yazılım olayı bir kez ve doğru durumda kaydetmelidir.', sourceIds: ['paxton_net2'],
})
nodes.access_result_lock_mechanical = result({
  id: 'access_result_lock_mechanical', device: 'access', category: 'Kilit İzolasyonu', title: 'Kilit / Kapı Baskısı / Saha Kablosu Arızası',
  summary: 'Kontrolör çıkışı ve sağlam test kilidi normal; arıza mevcut kilit, kapı hizası veya saha kablosunda.',
  components: ['Elektromıknatıs/elektrikli karşılık', 'Kapı dili ve mekanik baskı', 'Kilit saha kablosu'],
  repair: 'Kilit akımını, kablo ucundaki voltajı ve mekanik hizayı düzeltin; arızalı bobin/karşılığı değiştirin.',
  verification: 'Kapı baskı altındayken de güvenilir açılmalı ve yeniden kilitlenme durumu doğru raporlanmalıdır.', sourceIds: ['paxton_net2'],
})

nodes.pbx_symptom = symptom({
  id: 'pbx_symptom', device: 'pbx', category: 'PBX Triage', title: 'Santral Belirti Sınıflandırması',
  prompt: 'FXS portu, iki telli saha hattı, telefon cihazı ve santral yapılandırmasını ayrı test edin.', sourceIds: ['cisco_fxs'],
  options: [
    { label: 'Tek dahili çalışmıyor / çevir sesi yok', description: 'Bilinen sağlam telefon önce doğrudan FXS portunda denenir.', next: 'pbx_isolate_at_port', scoreDelta: { pbx_cabling_fault: 30, pbx_port_fault: 22, pbx_handset_fault: 12 } },
    { label: 'Tüm dahili telefonlar çalışmıyor', description: 'Santral ana besleme ve sistem durumu önceliklidir.', next: 'pbx_power_present', scoreDelta: { pbx_power_fault: 38, pbx_config_fault: 12 } },
    { label: 'Telefon çalıyor ama ses tek yönlü/parazitli', description: 'İç arama ile kablo, ahize ve analog ses yolu ayrılır.', next: 'pbx_audio_bidirectional', scoreDelta: { pbx_audio_fault: 34, pbx_handset_fault: 14 } },
    { label: 'Dahili telefon çalmıyor', description: 'Arama yönlendirmesi ile AC ring üretimi ve zil yükü test edilir.', next: 'pbx_ringing_call_reaches_port', scoreDelta: { pbx_ring_fault: 30, pbx_config_fault: 16, pbx_handset_fault: 12 } },
    { label: 'Rakamlar/DTMF algılanmıyor veya arama tamamlanmıyor', description: 'DTMF üretimi, port algısı ve numara planı ayrılır.', next: 'pbx_dtmf_test', scoreDelta: { pbx_dtmf_fault: 36, pbx_config_fault: 14 } },
    { label: 'İç aramalar var, dış hat/trunk çalışmıyor', description: 'Dahili çekirdek normal kabul edilip trunk ve yönlendirme incelenir.', next: 'pbx_trunk_status', scoreDelta: { pbx_trunk_fault: 36, pbx_config_fault: 18 } },
  ],
})

nodes.pbx_isolate_at_port = question({
  id: 'pbx_isolate_at_port', device: 'pbx', category: 'Port İzolasyonu', title: 'Bilinen Sağlam Telefon Doğrudan FXS Portunda Çalışıyor mu?',
  prompt: 'Patch panel ve saha kablosunu ayırıp kısa sağlam kabloyla analog test telefonunu doğrudan ilgili porta bağlayın.',
  yesLabel: 'Doğrudan portta çalışıyor', noLabel: 'Portta da çalışmıyor', unknownLabel: 'Porta erişemiyorum',
  nextYes: 'pbx_cable_pair_test', nextNo: 'pbx_extension_voltage', nextUnknown: 'pbx_extension_voltage',
  scoreYes: { pbx_cabling_fault: 48, pbx_port_fault: -16 }, scoreNo: { pbx_port_fault: 32, pbx_handset_fault: 8 }, scoreUnknown: { pbx_cabling_fault: 8 },
  testSteps: ['Saha çiftini ve port numarasını etiketleyin.', 'Bilinen sağlam analog telefonu kısa kabloyla porta takın.', 'Aynı telefonu sağlam bir portta da doğrulayın.'], sourceIds: ['cisco_fxs'],
})

nodes.pbx_cable_pair_test = question({
  id: 'pbx_cable_pair_test', device: 'pbx', category: 'Saha Hattı', title: 'Patch Panel / Priz / İki Telli Hat Testi',
  prompt: 'Port ve telefon ayrıyken dahili çiftte uçtan uca süreklilik var, damarlar arası kısa ve toprağa kaçak yok mu?',
  yesLabel: 'Kablo ölçümleri normal', noLabel: 'Açık/kısa/kaçak var', unknownLabel: 'Hat tester yok',
  nextYes: 'pbx_result_handset', nextNo: 'pbx_result_cabling', nextUnknown: 'pbx_result_cabling',
  scoreYes: { pbx_cabling_fault: -14, pbx_handset_fault: 24 }, scoreNo: { pbx_cabling_fault: 50 }, scoreUnknown: { pbx_cabling_fault: 12 },
  danger: 'medium', testSteps: ['Her iki uçta santral ve telefon bağlantısını ayırın.', 'Damar sürekliliği ve damarlar arası izolasyonu ölçün.', 'Patch panel, Krone ve priz eklerini tek tek by-pass ederek karşılaştırın.'],
  stopConditions: ['Hat üzerinde yabancı AC/DC gerilim var'], sourceIds: ['cisco_fxs'],
})

nodes.pbx_extension_voltage = measurement({
  id: 'pbx_extension_voltage', device: 'pbx', category: 'FXS Hat Beslemesi', title: 'Ahize Kapalı FXS DC Voltajı',
  prompt: 'Bilinen sağlam telefon doğrudan porttayken ahize kapalı durumda tip-ring DC voltajını ölçün.',
  unit: 'V', meterMode: 'DC Voltage', powerState: 'Santral açık, telefon on-hook', probeBlack: 'Tip/Ring damarlarından biri', probeRed: 'Diğer Tip/Ring damarı',
  expected: { min: 22, max: 52 }, danger: 'medium', hint: 'Cisco FXS portlarında modele göre yaklaşık -24V, -36V veya -48V idle seviyeleri görülebilir; polarite işareti yerine mutlak değeri girin.',
  testSteps: ['Önce sağlam bir portun idle voltajını referans alın.', 'Problemli portu saha kablosu ayrıyken ölçün.', 'Telefon bağlı/ayrıyken farkı karşılaştırın.'],
  stopConditions: ['Tip-ring üzerinde beklenmeyen şebeke/yabancı gerilim var'], sourceIds: ['cisco_fxs_voltage'],
  rules: [
    { when: { operator: '<', value: 12 }, label: 'FXS idle voltajı yok/çok düşük', next: 'pbx_result_line_voltage', scoreDelta: { pbx_port_fault: 34, pbx_cabling_fault: 18 } },
    { when: { operator: 'between', min: 12, max: 21.99 }, label: 'FXS idle voltajı düşük/sınırda', next: 'pbx_result_line_voltage', scoreDelta: { pbx_port_fault: 26, pbx_cabling_fault: 14 } },
    { when: { operator: 'between', min: 22, max: 52 }, label: 'Model ailesi için olası FXS idle aralığında', next: 'pbx_offhook_response', scoreDelta: { pbx_port_fault: -8 } },
    { when: { operator: '>', value: 56 }, label: 'FXS idle voltajı model referansının üzerinde', next: 'pbx_result_port_card', scoreDelta: { pbx_port_fault: 28 } },
  ], fallbackNext: 'pbx_offhook_response',
})

nodes.pbx_offhook_response = question({
  id: 'pbx_offhook_response', device: 'pbx', category: 'FXS Loop Durumu', title: 'Ahize Kalkınca Loop Durumu Değişiyor mu?',
  prompt: 'Telefon off-hook olduğunda DC seviye düşüyor ve santral portu off-hook/aktif olarak algılıyor mu?',
  yesLabel: 'Loop algılanıyor', noLabel: 'Off-hook algılanmıyor', unknownLabel: 'Port durumu izlenemiyor',
  nextYes: 'pbx_dial_tone', nextNo: 'pbx_result_port_or_phone', nextUnknown: 'pbx_dial_tone',
  scoreYes: { pbx_port_fault: -12 }, scoreNo: { pbx_port_fault: 38, pbx_handset_fault: 16 }, scoreUnknown: { pbx_port_fault: 8 },
  testSteps: ['Idle voltajını kaydedin.', 'Ahizeyi kaldırıp voltaj ve port durumunu aynı anda izleyin.', 'Aynı testi bilinen sağlam telefonla tekrarlayın.'], sourceIds: ['cisco_fxs'],
})

nodes.pbx_dial_tone = question({
  id: 'pbx_dial_tone', device: 'pbx', category: 'Çevir Sesi', title: 'Test Telefonunda Çevir Sesi Var mı?',
  prompt: 'Bilinen sağlam analog telefonla doğrudan portta temiz ve sürekli çevir sesi duyuluyor mu?',
  yesLabel: 'Çevir sesi var', noLabel: 'Çevir sesi yok', unknownLabel: 'Test telefonu yok',
  nextYes: 'pbx_dtmf_test', nextNo: 'pbx_result_port_or_phone', nextUnknown: 'pbx_result_need_phone_tester',
  scoreYes: { pbx_port_fault: -14 }, scoreNo: { pbx_port_fault: 28, pbx_config_fault: 16 }, scoreUnknown: { pbx_handset_fault: 8 }, sourceIds: ['cisco_fxs'],
})

nodes.pbx_dtmf_test = question({
  id: 'pbx_dtmf_test', device: 'pbx', category: 'Rakam Sinyalleşmesi', title: 'DTMF Rakamları Doğru Algılanıyor mu?',
  prompt: '0-9, * ve # tuşlarıyla test edildiğinde santral doğru rakamları algılıyor ve aramayı başlatıyor mu?',
  yesLabel: 'DTMF normal', noLabel: 'Rakam eksik/yanlış', unknownLabel: 'DTMF test edilemiyor',
  nextYes: 'pbx_internal_call', nextNo: 'pbx_result_dtmf', nextUnknown: 'pbx_internal_call',
  scoreYes: { pbx_dtmf_fault: -18 }, scoreNo: { pbx_dtmf_fault: 48, pbx_handset_fault: 12 }, scoreUnknown: { pbx_dtmf_fault: 8 },
  testSteps: ['Bilinen sağlam DTMF telefon kullanın.', 'Tüm tuşları tek tek deneyin.', 'Aynı telefonu sağlam portla karşılaştırın.'], sourceIds: ['cisco_fxs'],
})

nodes.pbx_internal_call = question({
  id: 'pbx_internal_call', device: 'pbx', category: 'İç Arama', title: 'Dahili Arama Kuruluyor mu?',
  prompt: 'İki dahili arasında arama kuruluyor, karşı taraf çalıyor ve çağrı bağlanıyor mu?',
  yesLabel: 'Arama kuruluyor', noLabel: 'Arama/yönlendirme başarısız', unknownLabel: 'İkinci dahili yok',
  nextYes: 'pbx_audio_bidirectional', nextNo: 'pbx_result_config_trunk', nextUnknown: 'pbx_result_config_trunk',
  scoreYes: { pbx_config_fault: -14 }, scoreNo: { pbx_config_fault: 38 }, scoreUnknown: { pbx_config_fault: 8 }, sourceIds: ['cisco_fxs'],
})

nodes.pbx_audio_bidirectional = question({
  id: 'pbx_audio_bidirectional', device: 'pbx', category: 'Analog Ses Yolu', title: 'İki Yönlü Ses Temiz mi?',
  prompt: 'İç aramada her iki yönde ses var mı; uğultu, parazit, aşırı zayıflık veya yankı oluşuyor mu?',
  yesLabel: 'İki yönlü ses normal', noLabel: 'Tek yön/parazit/yankı var', unknownLabel: 'Ses testi yapılamıyor',
  nextYes: 'pbx_result_endpoint', nextNo: 'pbx_result_audio', nextUnknown: 'pbx_result_need_phone_tester',
  scoreYes: { pbx_audio_fault: -18 }, scoreNo: { pbx_audio_fault: 48, pbx_cabling_fault: 12 }, scoreUnknown: { pbx_audio_fault: 8 },
  testSteps: ['Kısa port bağlantısı ile saha hattını karşılaştırın.', 'Ahize ve spiral kordonu bilinen sağlamla değiştirin.', 'Uzun hat, floresan/motor yakınlığı ve ek noktalarını kontrol edin.'], sourceIds: ['cisco_fxs'],
})

nodes.pbx_ringing_call_reaches_port = question({
  id: 'pbx_ringing_call_reaches_port', device: 'pbx', category: 'Zil Sinyali', title: 'Santral Aramayı Bu Porta Yönlendiriyor mu?',
  prompt: 'İç arama sırasında port durumu ringing/alerting oluyor ve arayan tarafta geri çalma duyuluyor mu?',
  yesLabel: 'Port ringing durumunda', noLabel: 'Arama porta ulaşmıyor', unknownLabel: 'Port durumu görünmüyor',
  nextYes: 'pbx_ring_voltage', nextNo: 'pbx_result_config_trunk', nextUnknown: 'pbx_ring_voltage',
  scoreYes: { pbx_config_fault: -12, pbx_ring_fault: 18 }, scoreNo: { pbx_config_fault: 38 }, scoreUnknown: { pbx_ring_fault: 8 }, sourceIds: ['cisco_fxs'],
})

nodes.pbx_ring_voltage = measurement({
  id: 'pbx_ring_voltage', device: 'pbx', category: 'Zil Sinyali', title: 'Arama Sırasında AC Ring Voltajı',
  prompt: 'Bilinen sağlam test telefonu doğrudan porttayken arama boyunca tip-ring AC True-RMS voltajını ölçün.',
  unit: 'V', meterMode: 'AC Voltage', powerState: 'Santral aktif, ilgili port çalıyor', probeBlack: 'Tip/Ring damarlarından biri', probeRed: 'Diğer Tip/Ring damarı',
  expected: { min: 40, max: 105 }, danger: 'high', hint: 'Cisco dokümanında cihaz algılama alt sınırı 40Vrms, merkez tipi kaynaklar yaklaşık 85-100Vrms olabilir; model kılavuzu önceliklidir.',
  testSteps: ['DMM’yi AC True-RMS konumuna alın.', 'Aramayı tekrarlayıp ring süresindeki değeri kaydedin.', 'Sağlam portun ring voltajıyla karşılaştırın.'],
  stopConditions: ['Yalıtımsız test kablosu kullanılıyor', 'Hat üzerinde yabancı şebeke gerilimi var'], sourceIds: ['cisco_fxs_voltage'],
  rules: [
    { when: { operator: '<', value: 30 }, label: 'Ring voltajı yok/çok düşük', next: 'pbx_result_ring', scoreDelta: { pbx_ring_fault: 46, pbx_port_fault: 12 } },
    { when: { operator: 'between', min: 40, max: 105 }, label: 'Ring voltajı olası çalışma aralığında', next: 'pbx_ring_handset_compare', scoreDelta: { pbx_ring_fault: -10, pbx_handset_fault: 18 } },
    { when: { operator: '>', value: 110 }, label: 'Ring voltajı model referansının üzerinde', next: 'pbx_result_ring', scoreDelta: { pbx_ring_fault: 32 } },
  ], fallbackNext: 'pbx_result_ring',
})

nodes.pbx_ring_handset_compare = question({
  id: 'pbx_ring_handset_compare', device: 'pbx', category: 'Zil İzolasyonu', title: 'Bilinen Sağlam Telefon Portta Çalıyor mu?',
  prompt: 'Bilinen sağlam düşük REN analog telefon kısa kabloyla doğrudan portta çalıyor mu?',
  yesLabel: 'Portta çalıyor', noLabel: 'Portta da çalmıyor', unknownLabel: 'Test telefonu yok',
  nextYes: 'pbx_result_cabling', nextNo: 'pbx_result_ring', nextUnknown: 'pbx_result_need_phone_tester',
  scoreYes: { pbx_cabling_fault: 28, pbx_handset_fault: 24 }, scoreNo: { pbx_ring_fault: 38, pbx_port_fault: 12 }, scoreUnknown: { pbx_handset_fault: 8 }, sourceIds: ['cisco_fxs_voltage'],
})

nodes.pbx_trunk_status = question({
  id: 'pbx_trunk_status', device: 'pbx', category: 'Dış Hat / Trunk', title: 'İç Aramalar Tamamen Normal mi?',
  prompt: 'Dahili-dahili arama, zil ve iki yönlü ses normalken yalnız dış hat çağrıları mı başarısız?',
  yesLabel: 'Yalnız trunk/dış hat arızalı', noLabel: 'İç aramalar da arızalı', unknownLabel: 'İç arama testi yok',
  nextYes: 'pbx_result_trunk', nextNo: 'pbx_power_present', nextUnknown: 'pbx_result_config_trunk',
  scoreYes: { pbx_trunk_fault: 46, pbx_config_fault: 18 }, scoreNo: { pbx_port_fault: 14, pbx_config_fault: 12 }, scoreUnknown: { pbx_trunk_fault: 8 }, sourceIds: ['cisco_fxs'],
})

nodes.pbx_result_cabling = result({
  id: 'pbx_result_cabling', device: 'pbx', category: 'Saha Hattı', title: 'Patch Panel / Priz / Dahili Kablo Arızası',
  summary: 'FXS portu kısa bağlantıda çalışıyor; saha iki telli hattında açık, kısa, kaçak veya yüksek temas direnci var.',
  components: ['Patch panel/Krone', 'RJ11/RJ45 uçlama', 'Dahili priz ve saha kablosu'],
  repair: 'Hattı bölerek arızalı segmenti bulun, oksitli ek ve yanlış çiftleri yeniden sonlandırın.',
  verification: 'Porttan prize idle/off-hook/ring davranışı korunmalı ve test telefonu sahada tam çalışmalıdır.', sourceIds: ['cisco_fxs'],
})
nodes.pbx_result_handset = result({
  id: 'pbx_result_handset', device: 'pbx', category: 'Uç Cihaz', title: 'Telefon / Ahize / Zil Devresi Arızası', severity: 'info',
  summary: 'Port ve saha kablosu ölçümleri normal; problem telefon cihazı, ahize kordonu veya zil yükünde.',
  components: ['Analog telefon', 'Ahize ve spiral kordon', 'Zil devresi/REN yükü'],
  repair: 'Bilinen sağlam telefonla değiştirin; cihazın analog FXS ve ring özellikleriyle uyumunu doğrulayın.',
  verification: 'Aynı prizde bilinen sağlam telefon çevir sesi, arama, zil ve iki yönlü sesi geçmelidir.', sourceIds: ['cisco_fxs_voltage'],
})
nodes.pbx_result_ring = result({
  id: 'pbx_result_ring', device: 'pbx', category: 'Zil Sinyali', title: 'FXS Ring Üretimi / Zil Yükü Arızası',
  summary: 'Arama porta ulaşıyor ancak ring voltajı/frekansı veya yük sürme kapasitesi telefonu çaldıramıyor.',
  components: ['FXS port ring jeneratörü', 'Port kartı', 'Telefon REN/zil devresi'],
  repair: 'Sağlam port ve düşük REN telefonla karşılaştırın; model destekliyorsa ring voltajı/frekans ayarını kontrol edin.',
  verification: 'Telefon doğrudan portta ve saha hattı sonunda her çağrıda güvenilir çalmalıdır.', sourceIds: ['cisco_fxs_voltage'],
})
nodes.pbx_result_dtmf = result({
  id: 'pbx_result_dtmf', device: 'pbx', category: 'Rakam Sinyalleşmesi', title: 'DTMF / Numara Planı Arızası', severity: 'info',
  summary: 'Çevir sesi mevcut fakat rakam üretimi, algılama veya arama planı çağrıyı tamamlamıyor.',
  components: ['Telefon DTMF üretimi', 'FXS DSP/algılama', 'Numara planı ve yetki'],
  repair: 'Bilinen DTMF telefonla test edin; pulse/DTMF modu, port DSP durumu ve numara planını doğrulayın.',
  verification: 'Tüm DTMF tuşları doğru algılanmalı ve izinli dahili/dış numaralar tamamlanmalıdır.', sourceIds: ['cisco_fxs'],
})
nodes.pbx_result_audio = result({
  id: 'pbx_result_audio', device: 'pbx', category: 'Analog Ses Yolu', title: 'Tek Yönlü Ses / Empedans / EMI Arızası',
  summary: 'Çağrı kuruluyor fakat analog ses yolu iki yönde temiz değil.',
  components: ['Ahize/kordon', 'FXS port ses yolu', 'Uzun hat, ekler ve EMI kaynakları'],
  repair: 'Kısa port testiyle saha hattını ayırın; ahizeyi değiştirin ve uzun/EMI’lı güzergâh ile empedans ayarını kontrol edin.',
  verification: 'İki yönde konuşma seviyesi dengeli, uğultusuz ve yankısız olmalıdır.', sourceIds: ['cisco_fxs'],
})
nodes.pbx_result_trunk = result({
  id: 'pbx_result_trunk', device: 'pbx', category: 'Dış Hat / Trunk', title: 'Trunk / Operatör / Yönlendirme Arızası',
  summary: 'PBX dahili çekirdeği normal; arıza dış hat portu, operatör devresi veya trunk yönlendirmesinde.',
  components: ['FXO/SIP trunk durumu', 'Operatör demark hattı', 'Çıkış yönlendirme ve yetki'],
  repair: 'Trunk alarm/kayıtlarını, operatör hattını ve yönlendirme desenlerini birbirinden bağımsız test edin.',
  verification: 'Gelen ve giden dış çağrılar doğru numara bilgisi ve iki yönlü sesle tamamlanmalıdır.', sourceIds: ['cisco_fxs'],
})

nodes.uvis_symptom = symptom({
  id: 'uvis_symptom', device: 'uvis', category: 'UVIS Triage', title: 'UVIS Belirti Sınıflandırması',
  prompt: 'Kontrol PC, tetik, aydınlatma, kamera ağı, kayıt ve kalibrasyon zincirini ayrı değerlendirin.', sourceIds: ['axis_network', 'axis_image'],
  options: [
    { label: 'Sistem/PC/NVR hiç açılmıyor', description: 'Kontrol ünitesi güç yolu ve çevre birimleri izole edilir.', next: 'uvis_control_power_ok', scoreDelta: { uvis_control_power: 36 } },
    { label: 'Aydınlatma barı yanmıyor veya segmentler eksik', description: 'Sürücü komutu ve nominale göre yük altı çıkış ayrılır.', next: 'uvis_illumination_test', scoreDelta: { uvis_illumination_fault: 38 } },
    { label: 'Araç geçiyor ama çekim tetiklenmiyor', description: 'Loop/fotosel olayı ve tek-geçiş tekrarlanabilirliği kontrol edilir.', next: 'uvis_trigger_detected', scoreDelta: { uvis_trigger_fault: 40 } },
    { label: 'Kamera linki/görüntü akışı yok', description: 'Fiziksel link ile uygulama stream’i birbirinden ayrılır.', next: 'uvis_network_link', scoreDelta: { uvis_network_fault: 28, video_link_fault: 18 } },
    { label: 'Canlı görüntü var ama kayıt oluşmuyor', description: 'Disk sağlığı ve doğrudan yazma testi yapılır.', next: 'uvis_storage_health', scoreDelta: { uvis_storage_fault: 38, uvis_software_fault: 12 } },
    { label: 'Görüntü dikişi/geometri/pozlama bozuk', description: 'Referans hedefle optik ve yazılım kalibrasyonu ayrılır.', next: 'uvis_reference_capture', scoreDelta: { uvis_calibration_fault: 38, uvis_illumination_fault: 10 } },
  ],
})

nodes.uvis_illumination_test = question({
  id: 'uvis_illumination_test', device: 'uvis', category: 'UVIS Aydınlatma', title: 'Aydınlatma Komutu ve Segment Durumu',
  prompt: 'Araç tetiklenince kontrol çıkışı aktif oluyor ve tüm aydınlatma segmentleri aynı anda kararlı yanıyor mu?',
  yesLabel: 'Komut ve segmentler normal', noLabel: 'Komut/segment eksik', unknownLabel: 'Tetik testi yapılamıyor',
  nextYes: 'uvis_reference_capture', nextNo: 'uvis_illumination_output_percent', nextUnknown: 'uvis_illumination_output_percent',
  scoreYes: { uvis_illumination_fault: -14 }, scoreNo: { uvis_illumination_fault: 36 }, scoreUnknown: { uvis_illumination_fault: 8 },
  testSteps: ['Tetik girişini kontrollü oluşturun.', 'Her segmentin açılma anı ve parlaklığını karşılaştırın.', 'Kamera pozlama anıyla aydınlatma senkronunu gözleyin.'], sourceIds: ['axis_image'],
})

nodes.uvis_illumination_output_percent = measurement({
  id: 'uvis_illumination_output_percent', device: 'uvis', category: 'UVIS Aydınlatma', title: 'Yük Altı Aydınlatma Çıkışı / Nominal Oranı',
  prompt: 'Etiketteki nominal voltaja göre yük altında ölçülen değerin yüzdesini girin: ölçülen ÷ nominal × 100.',
  unit: '%', meterMode: 'DC Voltage', powerState: 'Aydınlatma aktif ve bar bağlı', probeBlack: 'Aydınlatma sürücü -', probeRed: 'Aydınlatma sürücü +',
  expected: { min: 90, max: 110 }, danger: 'medium', hint: 'Mutlak voltaj yerine model etiketine oran girilir; AC/strobe sürücülerde osiloskop ve üretici kılavuzu gerekir.',
  testSteps: ['Nominal değeri sürücü/bar etiketinden doğrulayın.', 'Aydınlatma aktifken çıkışı yük ucunda ölçün.', 'Ölçülen değeri nominale bölüp yüzde olarak girin.'],
  stopConditions: ['Nominal veya çıkış tipi bilinmiyor', 'Strobe/pulse çıkış DMM ile güvenilir ölçülemiyor'], sourceIds: ['keysight_power'],
  rules: [
    { when: { operator: '<', value: 80 }, label: 'Aydınlatma çıkışı nominalin çok altında', next: 'uvis_result_illumination', scoreDelta: { uvis_illumination_fault: 48 } },
    { when: { operator: 'between', min: 90, max: 110 }, label: 'Aydınlatma çıkışı nominal toleransında', next: 'uvis_reference_capture', scoreDelta: { uvis_illumination_fault: -12 } },
    { when: { operator: '>', value: 115 }, label: 'Aydınlatma çıkışı nominalin üzerinde', next: 'uvis_result_illumination', scoreDelta: { uvis_illumination_fault: 40 } },
  ], fallbackNext: 'uvis_result_illumination',
})

nodes.uvis_trigger_detected = question({
  id: 'uvis_trigger_detected', device: 'uvis', category: 'Araç Tetikleme', title: 'Loop / Fotosel / Tetik Olayı Görülüyor mu?',
  prompt: 'Araç veya kontrollü test hedefi geçtiğinde I/O ekranında tetik olayı oluşuyor mu?',
  yesLabel: 'Tetik olayı var', noLabel: 'Tetik olayı yok', unknownLabel: 'I/O durumu izlenemiyor',
  nextYes: 'uvis_trigger_repeatability', nextNo: 'uvis_result_trigger', nextUnknown: 'uvis_result_trigger',
  scoreYes: { uvis_trigger_fault: -12 }, scoreNo: { uvis_trigger_fault: 46 }, scoreUnknown: { uvis_trigger_fault: 10 },
  testSteps: ['Sensör besleme ve durum LED’ini kaydedin.', 'Kontrol yazılımındaki giriş bitini canlı izleyin.', 'Farklı geçiş hızlarında tetik oluşumunu karşılaştırın.'], sourceIds: ['axis_network'],
})

nodes.uvis_trigger_repeatability = question({
  id: 'uvis_trigger_repeatability', device: 'uvis', category: 'Araç Tetikleme', title: 'Tetik Tekrarlanabilir ve Tek Atımlı mı?',
  prompt: 'Yavaş ve normal geçişlerde her araç için tam bir tetik oluşuyor; çift tetik veya kaçırma görülmüyor mu?',
  yesLabel: 'Tetik kararlı', noLabel: 'Kaçırıyor/çift tetikliyor', unknownLabel: 'Tekrarlı test yok',
  nextYes: 'uvis_network_link', nextNo: 'uvis_result_trigger', nextUnknown: 'uvis_network_link',
  scoreYes: { uvis_trigger_fault: -14 }, scoreNo: { uvis_trigger_fault: 42 }, scoreUnknown: { uvis_trigger_fault: 6 }, sourceIds: ['axis_network'],
})

nodes.uvis_image_stream = question({
  id: 'uvis_image_stream', device: 'uvis', category: 'Görüntü Akışı', title: 'UVIS Uygulamasında Canlı Görüntü Var mı?',
  prompt: 'Kamera linki varken UVIS uygulaması canlı görüntüyü ve çekim akışını gösterebiliyor mu?',
  yesLabel: 'Uygulama görüntüsü var', noLabel: 'Uygulamada stream yok', unknownLabel: 'Uygulamaya erişilemiyor',
  nextYes: 'uvis_reference_capture', nextNo: 'uvis_direct_stream', nextUnknown: 'uvis_direct_stream',
  scoreYes: { video_link_fault: -14 }, scoreNo: { uvis_software_fault: 22, video_link_fault: 18 }, scoreUnknown: { uvis_software_fault: 8 }, sourceIds: ['axis_network'],
})

nodes.uvis_direct_stream = question({
  id: 'uvis_direct_stream', device: 'uvis', category: 'Görüntü Akışı', title: 'Kamera Doğrudan Stream Veriyor mu?',
  prompt: 'UVIS yazılımı dışında üretici aracı/web arayüzü ile kameranın doğrudan görüntüsü açılıyor mu?',
  yesLabel: 'Doğrudan stream var', noLabel: 'Kamera stream’i yok', unknownLabel: 'Doğrudan erişim yok',
  nextYes: 'uvis_result_software', nextNo: 'uvis_result_video_path', nextUnknown: 'uvis_result_network',
  scoreYes: { uvis_software_fault: 42, video_link_fault: -14 }, scoreNo: { video_link_fault: 38, uvis_network_fault: 14 }, scoreUnknown: { uvis_network_fault: 10 }, sourceIds: ['axis_network'],
})

nodes.uvis_storage_health = question({
  id: 'uvis_storage_health', device: 'uvis', category: 'UVIS Depolama', title: 'Disk Sağlığı / Boş Alan / Yazma Testi',
  prompt: 'Disk/RAID sağlıklı, yeterli boş alan var ve kısa manuel kayıt dosyası oluşturulup tekrar okunabiliyor mu?',
  yesLabel: 'Depolama sağlıklı', noLabel: 'Yazma/sağlık hatası var', unknownLabel: 'Disk bilgisi yok',
  nextYes: 'uvis_result_software', nextNo: 'uvis_result_storage', nextUnknown: 'uvis_result_storage',
  scoreYes: { uvis_storage_fault: -16, uvis_software_fault: 14 }, scoreNo: { uvis_storage_fault: 48 }, scoreUnknown: { uvis_storage_fault: 10 }, sourceIds: ['axis_network'],
})

nodes.uvis_reference_capture = question({
  id: 'uvis_reference_capture', device: 'uvis', category: 'Kalibrasyon', title: 'Referans Hedef Çekimi Uyumlu mu?',
  prompt: 'Sabit referans hedefte geometri, stitching çizgileri, pozlama ve aydınlatma tüm kamera kanallarında tutarlı mı?',
  yesLabel: 'Referans çekim uyumlu', noLabel: 'Geometri/pozlama sapıyor', unknownLabel: 'Referans hedef yok',
  nextYes: 'uvis_result_calibration', nextNo: 'uvis_result_calibration_fault', nextUnknown: 'uvis_result_calibration_fault',
  scoreYes: { uvis_calibration_fault: -18 }, scoreNo: { uvis_calibration_fault: 46, uvis_illumination_fault: 10 }, scoreUnknown: { uvis_calibration_fault: 10 }, sourceIds: ['axis_image'],
})

nodes.uvis_result_illumination = result({
  id: 'uvis_result_illumination', device: 'uvis', category: 'UVIS Aydınlatma', title: 'Aydınlatma Barı / Sürücü / Senkron Arızası',
  summary: 'Aydınlatma komutu, segment çıkışı veya yük altı seviye referans çekim için yeterli ve kararlı değil.',
  components: ['Aydınlatma bar segmentleri', 'LED/strobe sürücü', 'Tetik-senkron kablosu'],
  repair: 'Segmentleri ve sürücü kanallarını A/B karşılaştırın; kablo düşümü, akım limiti ve tetik senkronunu düzeltin.',
  verification: 'Tüm segmentler aynı anda kararlı yanmalı ve referans çekimde pozlama farkı oluşturmamalıdır.', sourceIds: ['keysight_power', 'axis_image'],
})
nodes.uvis_result_storage = result({
  id: 'uvis_result_storage', device: 'uvis', category: 'UVIS Depolama', title: 'Kayıt Diski / Yazma İzni Arızası',
  summary: 'Canlı görüntüden bağımsız olarak UVIS kayıt ortamı dolu, sağlıksız veya yazılamıyor.',
  components: ['HDD/SSD/RAID', 'Kayıt klasörü izinleri', 'Disk doluluk ve sağlık'],
  repair: 'Disk sağlığını ve dosya sistemi yazma izinlerini düzeltin; kayıt indeksini yalnız yedek sonrası yeniden oluşturun.',
  verification: 'Yeni geçiş kaydı oluşmalı, indekslenmeli ve istemciden tekrar açılabilmelidir.', sourceIds: ['axis_network'],
})
nodes.uvis_result_calibration_fault = result({
  id: 'uvis_result_calibration_fault', device: 'uvis', category: 'Kalibrasyon', title: 'Kamera Geometrisi / Stitching Kalibrasyonu Arızası', severity: 'info',
  summary: 'Güç, tetik ve stream çalışıyor ancak referans hedefte kamera kanalları geometrik veya pozlama olarak eşleşmiyor.',
  components: ['Kamera montaj açısı', 'Stitching/kalibrasyon profili', 'Aydınlatma homojenliği'],
  repair: 'Mekanik kamera sabitlemesini doğrulayıp üretici referans hedefiyle kalibrasyon profilini yeniden oluşturun.',
  verification: 'Referans çizgileri kesintisiz birleşmeli ve farklı hızlarda araç görüntüsü tekrarlanabilir olmalıdır.', sourceIds: ['axis_image'],
})
nodes.uvis_result_video_path = result({
  id: 'uvis_result_video_path', device: 'uvis', category: 'Görüntü Akışı', title: 'Kamera Stream / Kanal Arızası',
  summary: 'Fiziksel ağ linkine rağmen kamera doğrudan görüntü akışı üretmiyor.',
  components: ['Kamera firmware/stream profili', 'Kamera sensör/işlemci', 'Codec ve erişim yetkisi'],
  repair: 'Basit stream profili ve bilinen istemciyle test edin; kanal bazında firmware ve kamera modülünü karşılaştırın.',
  verification: 'Her kamera kanalı doğrudan ve UVIS yazılımı içinde kesintisiz görüntü vermelidir.', sourceIds: ['axis_network'],
})

nodes.sliding_symptom = symptom({
  id: 'sliding_symptom', device: 'sliding', category: 'Kayar Kapı Triage', title: 'Otomatik Kayar Kapı Belirti Sınıflandırması',
  prompt: 'Aktivasyon, güvenlik alanı, mekanik ray, enkoder/öğrenme, kilit ve acil güç zincirini ayırın.', sourceIds: ['dormakaba_sliding', 'geze_sliding'],
  options: [
    { label: 'Kapı hiç açılmıyor / enerji yok', description: 'Şebeke, sigorta, acil stop ve 24V aksesuar hattı kontrol edilir.', next: 'sliding_mains_check', scoreDelta: { input_protection_fault: 28, sliding_drive_fault: 14 } },
    { label: 'Radar görüyor ama kapı açılmıyor', description: 'Aktivasyon girişinden motor sürücüye doğru ilerlenir.', next: 'sliding_sensor_trigger', scoreDelta: { sliding_sensor_fault: 28, sliding_drive_fault: 16 } },
    { label: 'Kapı kapanırken geri açıyor / açık kalıyor', description: 'Güvenlik test objesi, sensör alanı ve mekanik engel ayrılır.', next: 'sliding_safety_function_test', scoreDelta: { sliding_safety_fault: 26, sliding_mechanical_fault: 16 } },
    { label: 'Hareket sert, yavaş, sesli veya ortada duruyor', description: 'Ray/kayış/pulley serbestliği ile enkoder öğrenmesi ayrılır.', next: 'sliding_obstruction_test', scoreDelta: { sliding_mechanical_fault: 32, sliding_encoder_fault: 14 } },
    { label: 'Ekranda hata kodu / öğrenme hatası var', description: 'Üretici hata sınıfı seçilerek doğru alt sisteme gidilir.', next: 'sliding_error_code', scoreDelta: { sliding_encoder_fault: 14, sliding_drive_fault: 14, mcu_boot: 8 } },
    { label: 'Acil güç, batarya veya kilit sorunu var', description: 'USV/batarya göstergesi ile kilit geri bildirimi ayrılır.', next: 'sliding_emergency_module', scoreDelta: { sliding_battery_fault: 24, sliding_lock_fault: 22 } },
  ],
})

nodes.sliding_error_code = symptom({
  id: 'sliding_error_code', device: 'sliding', category: 'Üretici Hata Kodu', title: 'Kayar Kapı Hata Sınıfını Seçin', optionBadge: 'KOD',
  prompt: 'Tam kod üreticiye göre değişir; ekrandaki açıklamayı en yakın alt sistemle eşleştirin.', sourceIds: ['geze_sliding'],
  options: [
    { label: 'Sensör / safety test hatası', description: 'Aktivasyon ve güvenlik alanı fonksiyon testi yapılır.', next: 'sliding_safety_function_test', scoreDelta: { sliding_safety_fault: 34, sliding_sensor_fault: 18 } },
    { label: 'Encoder / zero point / learning hatası', description: 'Mekanik serbestlikten sonra enkoder ve öğrenme turu kontrol edilir.', next: 'sliding_obstruction_test', scoreDelta: { sliding_encoder_fault: 40 } },
    { label: 'Motor / frequency converter / drive hatası', description: 'Sürücü komutu ve model nominaline göre çıkış kontrol edilir.', next: 'sliding_motor_output', scoreDelta: { sliding_drive_fault: 38 } },
    { label: 'Locking device / kapı kilidi hatası', description: 'Kilit çıkışı ve kilit durum girişi karşılaştırılır.', next: 'sliding_lock_check', scoreDelta: { sliding_lock_fault: 42 } },
    { label: 'Low battery / USV / power failure', description: 'Acil güç modülü ve şebeke geri dönüşü kontrol edilir.', next: 'sliding_emergency_module', scoreDelta: { sliding_battery_fault: 38, input_protection_fault: 12 } },
    { label: 'Kod açıklaması bilinmiyor', description: 'Model ve kontrol kartı servis tablosu gereklidir.', next: 'sliding_result_code_reference', scoreDelta: { mcu_boot: 10 } },
  ],
})

nodes.sliding_safety_function_test = question({
  id: 'sliding_safety_function_test', device: 'sliding', category: 'Güvenlik Fonksiyonu', title: 'Onaylı Test Objesiyle Güvenlik Alanı',
  prompt: 'Eşik alanındaki onaylı test objesi kapının kapanmasını engelliyor veya kapanan kapıyı yeniden açtırıyor mu?',
  yesLabel: 'Güvenlik tepkisi doğru', noLabel: 'Kapı objeye rağmen kapanıyor', unknownLabel: 'Test objesi/alan güvenliği yok',
  nextYes: 'sliding_sensor_trigger', nextNo: 'sliding_result_safety', nextUnknown: 'sliding_result_safety',
  scoreYes: { sliding_safety_fault: -18 }, scoreNo: { sliding_safety_fault: 52 }, scoreUnknown: { sliding_safety_fault: 12 },
  danger: 'high', testSteps: ['Yaya trafiğini test alanından tamamen uzaklaştırın.', 'Uygun test objesini eşik ve kapı hareket alanında ayrı konumlandırın.', 'Her iki yöndeki aktivasyon ve yeniden açma tepkisini kaydedin.'],
  stopConditions: ['Kapı test objesine temas ediyor', 'Yaya trafiği kontrol altına alınamıyor', 'Cam/kanat/taşıyıcıda fiziksel hasar var'], sourceIds: ['dormakaba_sliding'],
})

nodes.sliding_obstruction_test = question({
  id: 'sliding_obstruction_test', device: 'sliding', category: 'Mekanik İzolasyon', title: 'Ray / Kayış / Makara Serbestlik Testi',
  prompt: 'Enerji güvenli ayrıldığında kanatlar ray boyunca takılmadan hareket ediyor; kayış, makara ve mekanik stoplar sağlam mı?',
  yesLabel: 'Mekanik hareket serbest', noLabel: 'Sürtünme/sıkışma var', unknownLabel: 'Manuel test güvenli değil',
  nextYes: 'sliding_encoder_learning', nextNo: 'sliding_result_mechanical_limit', nextUnknown: 'sliding_result_mechanical_limit',
  scoreYes: { sliding_mechanical_fault: -18, sliding_encoder_fault: 14 }, scoreNo: { sliding_mechanical_fault: 48 }, scoreUnknown: { sliding_mechanical_fault: 10 },
  danger: 'high', testSteps: ['Şebeke ve acil güç modülünü ayırın.', 'Kanatları üretici prosedürüyle manuel moda alın.', 'Ray, askı makaraları, kayış gergisi ve stopları gözleyin.'],
  stopConditions: ['Kanat düşme/ayrılma riski var', 'Cam veya taşıyıcı çatlak', 'Manuel serbest bırakma prosedürü bilinmiyor'], sourceIds: ['dormakaba_sliding'],
})

nodes.sliding_encoder_learning = question({
  id: 'sliding_encoder_learning', device: 'sliding', category: 'Enkoder / Öğrenme', title: 'Öğrenme Turu ve Sıfır Noktası',
  prompt: 'Mekanik hareket serbestken öğrenme turu tamamlanıyor ve sıfır/açık/kapalı konumları tekrar edilebilir mi?',
  yesLabel: 'Öğrenme tamamlanıyor', noLabel: 'Encoder/zero/learning hatası', unknownLabel: 'Prosedür bilinmiyor',
  nextYes: 'sliding_motor_output', nextNo: 'sliding_result_encoder', nextUnknown: 'sliding_result_code_reference',
  scoreYes: { sliding_encoder_fault: -18 }, scoreNo: { sliding_encoder_fault: 48 }, scoreUnknown: { sliding_encoder_fault: 10 }, sourceIds: ['geze_sliding'],
})

nodes.sliding_motor_output = question({
  id: 'sliding_motor_output', device: 'sliding', category: 'Motor Sürücü', title: 'Motor Sürücü Komutu Oluşuyor mu?',
  prompt: 'Aç/kapat komutu sırasında sürücü durumunda motor çıkışı/akım komutu görülüyor mu?',
  yesLabel: 'Sürücü komutu var', noLabel: 'Sürücü çıkış vermiyor', unknownLabel: 'Sürücü verisi yok',
  nextYes: 'sliding_motor_output_ratio', nextNo: 'sliding_result_control_card', nextUnknown: 'sliding_result_control_card',
  scoreYes: { sliding_drive_fault: -8, sliding_mechanical_fault: 12 }, scoreNo: { sliding_drive_fault: 44, mcu_boot: 10 }, scoreUnknown: { sliding_drive_fault: 10 }, sourceIds: ['geze_sliding'],
})

nodes.sliding_motor_output_ratio = measurement({
  id: 'sliding_motor_output_ratio', device: 'sliding', category: 'Motor Sürücü', title: 'Motor Çıkışı / Model Nominal Oranı',
  prompt: 'Üretici test noktasındaki yük altı çıkışın motor/model nominaline oranını girin: ölçülen ÷ nominal × 100.',
  unit: '%', meterMode: 'AC/DC Voltage', powerState: 'Yetkili servis modu, hareket komutu aktif', probeBlack: 'Üretici motor çıkışı referansı', probeRed: 'Üretici motor çıkışı ölçüm noktası',
  expected: { min: 85, max: 110 }, danger: 'high', hint: 'PWM/frekans konvertörü çıkışı standart DMM ile yanlış okunabilir; model servis yöntemi önceliklidir.',
  testSteps: ['Motor tipi ve ölçüm yöntemini servis kılavuzundan doğrulayın.', 'Hareket alanını kapatıp çıkışı yük altında ölçün.', 'Ölçülen değeri model nominaline oranlayın.'],
  stopConditions: ['PWM/VFD ölçümü için uygun cihaz yok', 'Hareket alanı emniyete alınmadı', 'Korumasız şebeke terminali var'], sourceIds: ['geze_sliding'],
  rules: [
    { when: { operator: '<', value: 70 }, label: 'Motor çıkışı nominalin çok altında', next: 'sliding_result_control_card', scoreDelta: { sliding_drive_fault: 44 } },
    { when: { operator: 'between', min: 85, max: 110 }, label: 'Motor çıkışı model nominaline uygun', next: 'sliding_limit_encoder_check', scoreDelta: { sliding_drive_fault: -12, sliding_mechanical_fault: 14 } },
    { when: { operator: '>', value: 115 }, label: 'Motor çıkışı nominalin üzerinde', next: 'sliding_result_control_card', scoreDelta: { sliding_drive_fault: 38 } },
  ], fallbackNext: 'sliding_result_control_card',
})

nodes.sliding_limit_encoder_check = question({
  id: 'sliding_limit_encoder_check', device: 'sliding', category: 'Konum Geri Bildirimi', title: 'Limit / Enkoder Durumu Kararlı mı?',
  prompt: 'Açık-kapalı limit, sıfır noktası ve encoder sayımı hareket boyunca atlama yapmadan doğru değişiyor mu?',
  yesLabel: 'Geri bildirim normal', noLabel: 'Limit/encoder kararsız', unknownLabel: 'Sinyal izlenemiyor',
  nextYes: 'sliding_result_motor_calibration', nextNo: 'sliding_result_encoder', nextUnknown: 'sliding_result_code_reference',
  scoreYes: { sliding_encoder_fault: -16 }, scoreNo: { sliding_encoder_fault: 44 }, scoreUnknown: { sliding_encoder_fault: 10 }, sourceIds: ['geze_sliding'],
})

nodes.sliding_emergency_module = question({
  id: 'sliding_emergency_module', device: 'sliding', category: 'Acil Güç / Kilit', title: 'USV / Akü Düşük veya Güç Kesintisi Kodu Var mı?',
  prompt: 'Ekran/servis menüsü düşük akü, USV veya güç kesintisi gösteriyor; kapı şebeke kesilince beklenen güvenli moda geçemiyor mu?',
  yesLabel: 'Acil güç/batarya hatası', noLabel: 'Acil güç normal', unknownLabel: 'Modül durumu yok',
  nextYes: 'sliding_result_battery', nextNo: 'sliding_lock_check', nextUnknown: 'sliding_lock_check',
  scoreYes: { sliding_battery_fault: 48 }, scoreNo: { sliding_battery_fault: -16 }, scoreUnknown: { sliding_battery_fault: 8 }, sourceIds: ['geze_sliding'],
})

nodes.sliding_lock_check = question({
  id: 'sliding_lock_check', device: 'sliding', category: 'Kilit Sistemi', title: 'Kilit Açılıyor ve Durum Girişi Değişiyor mu?',
  prompt: 'Aç komutunda elektromekanik kilit bırakıyor ve kontrol kartı kilit durumunu doğru algılıyor mu?',
  yesLabel: 'Kilit ve geri bildirim normal', noLabel: 'Kilit/geri bildirim hatalı', unknownLabel: 'Kilit testi yapılamıyor',
  nextYes: 'sliding_aux_voltage', nextNo: 'sliding_result_lock', nextUnknown: 'sliding_result_lock',
  scoreYes: { sliding_lock_fault: -16 }, scoreNo: { sliding_lock_fault: 46 }, scoreUnknown: { sliding_lock_fault: 10 }, sourceIds: ['geze_sliding'],
})

nodes.sliding_result_safety = result({
  id: 'sliding_result_safety', device: 'sliding', category: 'Güvenlik Fonksiyonu', title: 'Güvenlik Sensörü / İzleme Arızası', severity: 'critical',
  summary: 'Kapı onaylı test objesine güvenli tepki vermiyor; otomatik kullanım sürdürülmemeli.',
  components: ['Presence/safety sensörü', 'Sensör test girişi', 'Eşik ve kapı hareket alanı'],
  repair: 'Kapıyı otomatik hizmetten çıkarın; sensör hizalama, kapsama, kablo ve test geri bildirimini yetkili servisle düzeltin.',
  verification: 'Test objesi eşikteyken kapı kapanmamalı; kapanma sırasında algılanınca güvenli biçimde yeniden açmalıdır.', sourceIds: ['dormakaba_sliding'],
})
nodes.sliding_result_encoder = result({
  id: 'sliding_result_encoder', device: 'sliding', category: 'Enkoder / Öğrenme', title: 'Enkoder / Sıfır Noktası / Öğrenme Arızası',
  summary: 'Mekanik hareket serbest ancak konum geri bildirimi veya öğrenme turu güvenilir değil.',
  components: ['Enkoder ve kablosu', 'Sıfır noktası sensörü', 'Öğrenme/konum hafızası'],
  repair: 'Enkoder mekanik bağlantısı, besleme/sinyal ve konnektörü doğrulayın; sonra üretici öğrenme turunu tekrarlayın.',
  verification: 'Kapı tekrarlı çevrimlerde aynı açık/kapalı konumlara hatasız ulaşmalıdır.', sourceIds: ['geze_sliding'],
})
nodes.sliding_result_battery = result({
  id: 'sliding_result_battery', device: 'sliding', category: 'Acil Güç', title: 'USV / Akü / Şarj Modülü Arızası',
  summary: 'Acil güç modülü düşük batarya veya güç kesintisi hatası veriyor ve güvenli geçiş davranışı bozuk.',
  components: ['Acil güç aküsü', 'USV/şarj modülü', 'Şebeke kesinti algısı'],
  repair: 'Aküyü yük altında test edin, bağlantı ve şarj modülünü doğrulayın; üretici güvenli çıkış senaryosunu yeniden devreye alın.',
  verification: 'Şebeke kesme testinde kapı tanımlı güvenli moda geçmeli ve düşük batarya kodu dönmemelidir.', sourceIds: ['geze_sliding'],
})
nodes.sliding_result_lock = result({
  id: 'sliding_result_lock', device: 'sliding', category: 'Kilit Sistemi', title: 'Elektromekanik Kilit / Durum Girişi Arızası',
  summary: 'Kilit bırakmıyor veya kontrol kartı kilit konumunu yanlış okuyor.',
  components: ['Elektromekanik kilit', 'Kilit sürücü çıkışı', 'Kilit durum anahtarı/kablosu'],
  repair: 'Kilit mekanizmasını, sürücü çıkışını ve durum kontağını ayrı test edin; mekanik baskıyı giderin.',
  verification: 'Aç komutunda kilit tam bırakmalı, kapanışta yeniden kilitlenmeli ve durum doğru raporlanmalıdır.', sourceIds: ['geze_sliding'],
})
nodes.sliding_result_code_reference = result({
  id: 'sliding_result_code_reference', device: 'sliding', category: 'Üretici Hata Kodu', title: 'Model Hata Tablosu Gerekli', severity: 'info',
  summary: 'Ekran kodu genel alt sistem sınıflarıyla güvenilir eşleştirilemiyor.',
  components: ['Kapı operatörü modeli', 'Kontrol kartı/revizyon', 'Tam hata kodu ve olay sırası'],
  repair: 'Tam model servis kılavuzundaki hata/ön koşul tablosunu kullanın; kodu silmeden önce kök nedeni kaydedin.',
  verification: 'Onarım sonrası hata hafızası kontrol edilmeli ve güvenlik fonksiyon testleri tekrarlanmalıdır.', sourceIds: ['geze_sliding'],
})

nodes.support_symptom = symptom({
  id: 'support_symptom', device: 'support', category: 'Besleme / Yardımcı Cihaz Triage', title: 'Besleme ve Yardımcı Cihaz Belirti Sınıflandırması',
  prompt: 'Adaptör, SMPS, röle veya saha bağlantısındaki baskın belirtiyi seçin.', sourceIds: ['keysight_power', 'fluke_dc_supply'],
  options: [
    { label: 'Nominal çıkış / polarite bilinmiyor', description: 'Etiket ve şema doğrulanmadan enerji uygulanmaz.', next: 'support_result_identify_label', scoreDelta: { support_psu_fault: 12, input_protection_fault: 8 } },
    { label: 'Çıkış voltajı düşük, yüksek veya yok', description: 'Etiketteki 5V, 12V veya 24V değere göre ölçüm seçilir.', next: 'support_nominal_select', scoreDelta: { support_psu_fault: 30, support_connector_fault: 12 } },
    { label: 'Boşta normal, cihaz bağlanınca çöküyor/resetliyor', description: 'Besleme kapasitesi ile bağlı yük ayrı ayrı sınanır.', next: 'support_load_drop', scoreDelta: { support_psu_sag: 34, support_load_short: 22, capacitor_esr: 12 } },
    { label: 'Parazit, görüntü çizgisi veya rastgele reset var', description: 'Ripple ve transient tepki osiloskopla incelenir.', next: 'support_ripple_test', scoreDelta: { support_psu_ripple: 38, capacitor_esr: 16 } },
    { label: 'Kablo/jak oynayınca çalışıyor', description: 'Konnektör ve kablo yük altında gerilim düşümüyle doğrulanır.', next: 'support_connector_test', scoreDelta: { support_connector_fault: 42 } },
    { label: 'Röle/kontaktör komuta rağmen çalışmıyor', description: 'Bobin sürücüsü ile güç kontağı ayrı test edilir.', next: 'support_relay_contact', scoreDelta: { support_relay_fault: 34, relay_driver: 14 } },
  ],
})

nodes.support_nominal_select = symptom({
  id: 'support_nominal_select', device: 'support', category: 'Nominal Değer', title: 'Etiket Çıkış Değerini Seçin',
  prompt: 'Besleme etiketinde veya sistem şemasında yazan nominal DC çıkışı seçin. AC çıkışlı ve PoE kaynaklarda bu genel akışı kullanmayın.', optionBadge: 'ETİKET', sourceIds: ['keysight_power'],
  options: [
    { label: '5V DC', description: 'USB tipi ve 5V lojik beslemeler.', next: 'support_output_voltage_5v', scoreDelta: {} },
    { label: '12V DC', description: 'Kamera, CACS ve yaygın yardımcı adaptörler.', next: 'support_output_voltage', scoreDelta: {} },
    { label: '24V DC', description: 'Kontrol, röle ve otomasyon beslemeleri.', next: 'support_output_voltage_24v', scoreDelta: {} },
    { label: 'Farklı / okunamıyor', description: 'Üretici değeri bulunmadan test sürdürülmez.', next: 'support_result_identify_label', scoreDelta: {} },
  ],
})

function supportVoltageMeasurement({ id, nominal, min, max, low, high }) {
  return measurement({
    id, device: 'support', category: 'DC Çıkış Doğrulama', title: `${nominal}V DC Çıkış - Yük Bağlı`,
    prompt: `${nominal}V etiketli beslemeyi gerçek cihaz yükü bağlıyken çıkış klemensinde ölçün.`,
    unit: 'V', meterMode: 'DC Voltage', powerState: 'Besleme enerjili, gerçek yük bağlı ve çalışma komutu aktif',
    probeBlack: 'Besleme çıkış - / GND', probeRed: 'Besleme çıkış +', expected: { min, max }, danger: 'low',
    hint: 'Etiket toleransı veya üretici servis değeri varsa bu genel tarama aralığından önce gelir.',
    testSteps: ['Etiket voltajı, polarite ve akım kapasitesini kaydedin.', 'Ölçümü önce besleme çıkışında, sonra cihaz girişinde aynı çalışma anında tekrarlayın.', 'Reset veya röle çekme anındaki en düşük değeri not edin.'],
    stopConditions: ['Ters polarite, erimiş konnektör veya kabloda aşırı ısınma var', 'Besleme akım limitine giriyor ya da yükte kısa devre belirtisi var'],
    sourceIds: ['keysight_power', 'fluke_dc_supply'],
    rules: [
      { when: { operator: '<', value: low }, label: `${nominal}V çıkış düşük veya yok`, next: 'support_result_psu_fault', scoreDelta: { support_psu_fault: 42, support_connector_fault: 10 } },
      { when: { operator: 'between', min, max }, label: `${nominal}V çıkış yük altında nominal aralıkta`, next: 'support_load_drop', scoreDelta: { support_psu_fault: -10 } },
      { when: { operator: '>', value: high }, label: `${nominal}V çıkış yüksek; bağlı cihaz için riskli`, next: 'support_result_psu_fault', scoreDelta: { support_psu_fault: 42, input_protection_fault: 12 } },
    ],
    fallbackNext: 'support_result_psu_fault',
  })
}

nodes.support_output_voltage_5v = supportVoltageMeasurement({ id: 'support_output_voltage_5v', nominal: 5, min: 4.75, max: 5.25, low: 4.5, high: 5.4 })
nodes.support_output_voltage = supportVoltageMeasurement({ id: 'support_output_voltage', nominal: 12, min: 11.4, max: 12.6, low: 10.8, high: 13.2 })
nodes.support_output_voltage_24v = supportVoltageMeasurement({ id: 'support_output_voltage_24v', nominal: 24, min: 22.8, max: 25.2, low: 21.6, high: 26.4 })

nodes.support_load_drop = question({
  id: 'support_load_drop', device: 'support', category: 'Yük Regülasyonu', title: 'Çalışma Anında %5’ten Fazla Düşüm Var mı?',
  prompt: 'Boştaki değer ile cihazın en yüksek akım çektiği andaki değeri karşılaştırın. Çıkış %5’ten fazla düşüyor veya cihaz resetliyor mu?',
  yesLabel: 'Düşüm/reset var', noLabel: 'Yükte stabil', unknownLabel: 'Dinamik ölçemiyorum',
  nextYes: 'support_load_isolation', nextNo: 'support_ripple_test', nextUnknown: 'support_result_reference',
  scoreYes: { support_psu_sag: 40, support_load_short: 18, capacitor_esr: 14 }, scoreNo: { support_psu_sag: -12 }, scoreUnknown: { support_psu_sag: 8 },
  testSteps: ['Multimetrenin MIN/MAX kaydını veya osiloskop trendini açın.', 'Kamera IR, kilit çekme, motor başlama ya da röle çekme anını tetikleyin.', 'Besleme çıkışı ve cihaz girişi ölçümlerini karşılaştırın.'],
  stopConditions: ['Kablo veya adaptör hızla ısınıyor', 'Çıkış kısa devre korumasına girip tekrarlı aç-kapa yapıyor'], sourceIds: ['keysight_power', 'ti_power_transient'],
})

nodes.support_load_isolation = question({
  id: 'support_load_isolation', device: 'support', category: 'A/B Yük İzolasyonu', title: 'Besleme Bilinen Yükte Stabil mi?',
  prompt: 'Gerçek cihazı ayırıp beslemeyi akımı sınırlandırılmış elektronik yük veya değeri bilinen sağlam eş yükle deneyin. Aynı akım seviyesinde çıkış stabil kalıyor mu?',
  yesLabel: 'Bilinen yükte stabil', noLabel: 'Bilinen yükte de çöküyor', unknownLabel: 'Uygun test yükü yok',
  nextYes: 'support_result_load_short', nextNo: 'support_result_psu_weak', nextUnknown: 'support_result_reference',
  scoreYes: { support_load_short: 42, support_psu_sag: -12 }, scoreNo: { support_psu_sag: 46, capacitor_esr: 18 }, scoreUnknown: { support_psu_sag: 12, support_load_short: 10 },
  testSteps: ['Gerçek yükü enerjisizken ayırın.', 'Test yükünü sıfır akımdan başlayıp etiket akımını aşmadan yükseltin.', 'Çıkış seviyesi, akım limiti ve sıcaklığı kaydedin.'],
  stopConditions: ['Test yükünün veya kablonun güç değeri yetersiz', 'Besleme koku, ses, ark veya aşırı ısı belirtisi gösteriyor'], sourceIds: ['keysight_power'],
})

nodes.support_ripple_test = measurement({
  id: 'support_ripple_test', device: 'support', category: 'Güç Kalitesi', title: 'Yük Altında Ripple Oranı',
  prompt: 'Osiloskopta ölçülen tepeden tepeye ripple değerini DC nominal çıkışa bölüp yüzde olarak girin.',
  unit: '%', meterMode: 'Oscilloscope, AC coupling, kısa ground spring', powerState: 'Gerçek yük bağlı ve en yüksek akım senaryosu aktif',
  probeBlack: 'Çıkış kondansatörü eksi ucu', probeRed: 'Çıkış kondansatörü artı ucu', expected: { min: 0, max: 2 }, danger: 'low',
  hint: 'Bu değer genel tarama eşiğidir. Üreticinin ripple limiti ve ölçüm bant genişliği önceliklidir.',
  testSteps: ['Probun uzun toprak kablosu yerine kısa ground spring kullanın.', '20 MHz bant genişliği limitiyle ve akım geçişi sırasında dalga biçimini kaydedin.', 'Ripple yüzdesini Vpp / VDC x 100 ile hesaplayın.'],
  stopConditions: ['Prob toprağı şebeke primerine veya izole olmayan hot-ground noktasına bağlanacak', 'Osiloskop/izolasyon kategorisi devreye uygun değil'], sourceIds: ['fluke_dc_supply', 'ti_power_transient'],
  rules: [
    { when: { operator: '<', value: 0 }, label: 'Negatif ripple oranı geçersiz; ölçümü doğrulayın', next: 'support_result_reference', scoreDelta: {} },
    { when: { operator: 'between', min: 0, max: 2 }, label: 'Genel tarama sınırında düşük ripple', next: 'support_connector_test', scoreDelta: { support_psu_ripple: -12, capacitor_esr: -8 } },
    { when: { operator: 'between', min: 2.01, max: 5 }, label: 'Ripple yükselmiş; datasheet ile karşılaştırın', next: 'support_result_ripple', scoreDelta: { support_psu_ripple: 34, capacitor_esr: 18 } },
    { when: { operator: '>', value: 5 }, label: 'Ripple ciddi yüksek', next: 'support_result_ripple', scoreDelta: { support_psu_ripple: 48, capacitor_esr: 24 } },
  ], fallbackNext: 'support_result_ripple',
})

nodes.support_connector_test = question({
  id: 'support_connector_test', device: 'support', category: 'Bağlantı Gerilim Düşümü', title: 'Kablo / Jak Üzerinde Anormal Düşüm Var mı?',
  prompt: 'Yük akımı akarken besleme çıkışı ile cihaz girişini karşılaştırın. Kabloyu oynatmadan ve oynatırken belirgin düşüm, kesinti veya ısınma var mı?',
  yesLabel: 'Düşüm/temassızlık var', noLabel: 'Bağlantı kararlı', unknownLabel: 'İki uç ölçülemiyor',
  nextYes: 'support_result_connector', nextNo: 'support_relay_contact', nextUnknown: 'support_result_reference',
  scoreYes: { support_connector_fault: 48 }, scoreNo: { support_connector_fault: -14 }, scoreUnknown: { support_connector_fault: 8 },
  testSteps: ['Yük altında besleme çıkışındaki VDC değerini kaydedin.', 'Aynı anda veya aynı yük koşulunda cihaz girişindeki VDC değerini ölçün.', 'DC jak, klemens ve kabloyu hafif hareket ettirirken MIN/MAX kaydını izleyin.'],
  stopConditions: ['Konnektörde ark, erime veya dokunulamayacak ısı var'], sourceIds: ['fluke_dc_supply'],
})

nodes.support_relay_contact = question({
  id: 'support_relay_contact', device: 'support', category: 'Röle / Kontaktör', title: 'Bobin Komutu ve NO/NC Kontak Değişimi Doğru mu?',
  prompt: 'Komut sırasında bobin nominal gerilime ulaşıyor ve COM-NO/NC kontakları yükten ayrılmış süreklilik testinde doğru değişiyor mu?',
  yesLabel: 'Bobin ve kontak normal', noLabel: 'Bobin/kontak hatalı', unknownLabel: 'Güvenli ölçemiyorum',
  nextYes: 'support_result_wiring_device', nextNo: 'support_result_relay_driver', nextUnknown: 'support_result_reference',
  scoreYes: { support_relay_fault: -12, relay_driver: -8 }, scoreNo: { support_relay_fault: 40, relay_driver: 22 }, scoreUnknown: { support_relay_fault: 10 },
  testSteps: ['Kontak sürekliliği için yük ve enerjiyi ayırın.', 'Bobin direncini aynı model sağlam röle veya datasheet ile karşılaştırın.', 'Komut sırasında bobin gerilimini ve sürücü transistoru çıkışını ölçün.'],
  stopConditions: ['Kontak şebeke veya yüksek enerjili yük taşıyor ve güvenli izolasyon yapılamıyor'], sourceIds: ['fluke_dc_supply'],
})

nodes.support_result_ripple = result({
  id: 'support_result_ripple', device: 'support', category: 'Güç Kalitesi', title: 'Ripple / Transient Tepki Arızası',
  summary: 'DC ortalama değer kabul edilebilir görünse de çıkış ripple veya yük geçişi sırasında kararlı değil.',
  components: ['Çıkış elektrolitik kondansatörleri', 'SMPS geri besleme ve kompanzasyon', 'Kablo endüktansı/toprak dönüşü'],
  repair: 'Doğru ESR, sıcaklık ve ripple akım sınıfındaki kondansatörleri; feedback lehimlerini ve adaptör kapasitesini doğrulayın.',
  verification: 'Nominal yük ve ani akım geçişinde ripple üretici limitinde kalmalı, bağlı cihaz resetlememelidir.', sourceIds: ['fluke_dc_supply', 'ti_power_transient'],
})
nodes.support_result_connector = result({
  id: 'support_result_connector', device: 'support', category: 'Bağlantılar', title: 'DC Jak / Klemens / Kablo Temassızlığı',
  summary: 'Besleme çıkışı doğru olsa da cihaz girişine kadar anormal gerilim düşümü veya hareketle kesinti oluşuyor.',
  components: ['DC jak ve merkez pin', 'Klemens ve kablo pabucu', 'Kablo damarı', 'Kart giriş lehimleri'],
  repair: 'Hasarlı konnektörü ve kabloyu uygun akım sınıfıyla değiştirin; oksitli veya çatlak lehimli noktaları onarın.',
  verification: 'Nominal yükte uçtan uca düşüm kabul sınırında kalmalı ve hareket testinde kesinti olmamalıdır.', sourceIds: ['fluke_dc_supply'],
})
nodes.support_result_load_short = result({
  id: 'support_result_load_short', device: 'support', category: 'Yük İzolasyonu', title: 'Bağlı Cihaz Aşırı Akım / Kalkış Yükü Şüphesi', severity: 'critical',
  summary: 'Besleme bilinen yükte stabil; çökme yalnız asıl cihaz bağlandığında oluşuyor. Kısa devre, motor/IR/kilit kalkış akımı veya yetersiz besleme kapasitesi ayrılmalı.',
  components: ['Bağlı cihaz giriş koruması', 'Motor, kilit veya IR yükü', 'DC/DC giriş kondansatörleri', 'Adaptör akım kapasitesi'],
  repair: 'Cihazı akım sınırlamalı laboratuvar kaynağında akım profiliyle test edin; kısa devreyi ve kalkış akımını etikete göre doğrulayın.',
  verification: 'Doğru kapasiteli beslemede çalışma akımı model sınırını aşmamalı ve koruma tetiklenmemelidir.', sourceIds: ['keysight_power'],
})
nodes.support_result_reference = result({
  id: 'support_result_reference', device: 'support', category: 'Ölçüm Planı', title: 'Model Değeri veya Kontrollü Test Düzeneği Gerekli', severity: 'info',
  summary: 'Mevcut kanıt, besleme ile bağlı yükü güvenilir biçimde ayırmaya yetmiyor.',
  components: ['Üretici çıkış toleransı', 'Elektronik yük / akım pensi', 'Osiloskop ve uygun prob', 'Bilinen sağlam eş cihaz'],
  repair: 'Etiket akımı ve ripple limitini bulun; akımı sınırlı A/B yük testi ile ölçümü tekrarlayın.',
  verification: 'Sonuç, boşta voltaj yerine nominal yük ve transient kaydıyla doğrulanmalıdır.', sourceIds: ['keysight_power', 'fluke_dc_supply'],
})

nodes.general_symptom = symptom({
  id: 'general_symptom', device: 'general', category: 'Kart Seviyesi Triage', title: 'Genel Kart Belirti Sınıflandırması',
  prompt: 'Kartın baskın belirtisini enerji, açılış sırası ve çevresel koşula göre seçin.', sourceIds: ['fluke_dc_supply', 'ti_power_transient'],
  options: [
    { label: 'Yanık, oksit, şişme veya çatlak lehim var', description: 'Enerji vermeden görsel ve direnç kontrolleri yapılır.', next: 'general_visual_check', scoreDelta: { general_visual_damage: 40, capacitor_esr: 12 } },
    { label: 'Kart hiç açılmıyor / giriş akımı yok', description: 'Etiket giriş gerilimi ve koruma yolu doğrulanır.', next: 'general_input_nominal_select', scoreDelta: { input_protection_fault: 28, general_regulator_fault: 22 } },
    { label: '5V / 3.3V rayı düşük veya regülatör ısınıyor', description: 'Ana lojik rayları ve kısa devre/ripple ayrımı yapılır.', next: 'general_5v_rail', scoreDelta: { general_regulator_fault: 36, rail_short: 22 } },
    { label: 'Rastgele reset / ısınınca veya soğukken arıza', description: 'Termal korelasyon, güç kalitesi ve bağlantılar incelenir.', next: 'general_thermal_inspection', scoreDelta: { general_thermal_fault: 38, capacitor_esr: 16, general_reset_fault: 12 } },
    { label: 'Beslemeler var ancak MCU boot etmiyor', description: 'Ripple, reset, clock ve bellek sırasıyla test edilir.', next: 'general_3v3_rail', scoreDelta: { general_reset_fault: 20, general_clock_fault: 18, general_memory_fault: 14, general_firmware_fault: 12 } },
    { label: 'Kart açılıyor fakat haberleşme/çevre birimi yok', description: 'Boot aktivitesi ve veri yolu davranışı incelenir.', next: 'general_bus_activity', scoreDelta: { general_firmware_fault: 28, general_memory_fault: 12 } },
  ],
})

nodes.general_visual_check = question({
  id: 'general_visual_check', type: 'inspection', device: 'general', category: 'Görsel İnceleme', title: 'Enerjisiz Görsel ve Koku Kontrolü',
  prompt: 'Büyüteç altında yanık, oksit, sıvı izi, şişmiş kondansatör, kopuk pad veya halka çatlak lehim görülüyor mu?',
  yesLabel: 'Hasar bulundu', noLabel: 'Belirgin hasar yok', unknownLabel: 'İnceleme yetersiz',
  nextYes: 'general_result_visual_damage', nextNo: 'general_input_nominal_select', nextUnknown: 'general_input_nominal_select',
  scoreYes: { general_visual_damage: 48, capacitor_esr: 16 }, scoreNo: { general_visual_damage: -12 }, scoreUnknown: { general_visual_damage: 6 },
  testSteps: ['Kartın iki yüzünü iyi ışık ve büyüteçle inceleyin.', 'Konnektör, güç elemanları ve ağır komponentlerin lehim halkalarını kontrol edin.', 'Enerji vermeden ana rayların GND direncini benzer sağlam kartla karşılaştırın.'],
  stopConditions: ['Karbonlaşmış PCB, sıvı altında enerji veya patlamış hücre/komponent var'], sourceIds: ['fluke_dc_supply'],
})

nodes.general_input_nominal_select = symptom({
  id: 'general_input_nominal_select', device: 'general', category: 'Giriş Referansı', title: 'Kart Etiket Girişini Seçin',
  prompt: 'Kart etiketi, adaptörü veya sistem şemasındaki nominal DC giriş değerini seçin.', optionBadge: 'ETİKET', sourceIds: ['keysight_power'],
  options: [
    { label: '5V DC', description: '5V girişli kartlar.', next: 'general_input_voltage_5v', scoreDelta: {} },
    { label: '12V DC', description: '12V girişli kartlar.', next: 'general_input_voltage', scoreDelta: {} },
    { label: '24V DC', description: '24V girişli kontrol kartları.', next: 'general_input_voltage_24v', scoreDelta: {} },
    { label: 'Farklı / bilinmiyor', description: 'Model referansı bulunmadan enerji yolu yorumlanmaz.', next: 'general_result_input_reference', scoreDelta: {} },
  ],
})

function generalInputMeasurement({ id, nominal, min, max, low, high }) {
  return measurement({
    id, device: 'general', category: 'Giriş Beslemesi', title: `${nominal}V Kart Girişi - Yük Altında`,
    prompt: `${nominal}V etiketli kartın giriş soketini normal çalışma/yük koşulunda ölçün.`,
    unit: 'V', meterMode: 'DC Voltage + MIN/MAX', powerState: 'Kart enerjili, akım sınırlaması model değerine ayarlı',
    probeBlack: 'Kart giriş GND / eksi', probeRed: 'Sigorta ve ters polarite korumasından önce +VIN', expected: { min, max }, danger: 'low',
    hint: 'Kart/üretici toleransı bu genel aralıktan önce gelir.',
    testSteps: ['Laboratuvar kaynağı kullanılıyorsa akım limitini model normal akımına göre ayarlayın.', 'Adaptör çıkışı ile kart girişini aynı çalışma anında karşılaştırın.', 'Başlangıç anındaki minimum gerilimi ve maksimum akımı kaydedin.'],
    stopConditions: ['Akım limiti hemen devreye giriyor', 'Giriş koruma elemanı veya kablo hızla ısınıyor'], sourceIds: ['keysight_power', 'fluke_dc_supply'],
    rules: [
      { when: { operator: '<', value: low }, label: `${nominal}V giriş düşük/yok`, next: 'general_result_input_fault', scoreDelta: { input_protection_fault: 40, general_regulator_fault: 16 } },
      { when: { operator: 'between', min, max }, label: `${nominal}V giriş yük altında uygun`, next: 'general_5v_rail', scoreDelta: { input_protection_fault: -12 } },
      { when: { operator: '>', value: high }, label: `${nominal}V giriş yüksek`, next: 'general_result_input_fault', scoreDelta: { input_protection_fault: 30, general_regulator_fault: 20 } },
    ], fallbackNext: 'general_result_input_fault',
  })
}

nodes.general_input_voltage_5v = generalInputMeasurement({ id: 'general_input_voltage_5v', nominal: 5, min: 4.75, max: 5.25, low: 4.5, high: 5.4 })
nodes.general_input_voltage = generalInputMeasurement({ id: 'general_input_voltage', nominal: 12, min: 11.4, max: 12.6, low: 10.8, high: 13.2 })
nodes.general_input_voltage_24v = generalInputMeasurement({ id: 'general_input_voltage_24v', nominal: 24, min: 22.8, max: 25.2, low: 21.6, high: 26.4 })

nodes.general_5v_rail = measurement({
  id: 'general_5v_rail', device: 'general', category: 'Regülatörler', title: '5V Ana Lojik Rayı',
  prompt: '5V rayını regülatör çıkışında ve en uzak 5V yük noktasında ölçün.',
  unit: 'V', meterMode: 'DC Voltage', powerState: 'Kart enerjili ve normal yükte', probeBlack: 'Kart GND', probeRed: '5V regülatör çıkışı / test noktası',
  expected: { min: 4.75, max: 5.25 }, danger: 'low', hint: '5V rayı bulunmayan kartta şemadaki bir sonraki ana lojik raya geçin.',
  testSteps: ['Enerjisizken 5V-GND direncini kaydedin.', 'Regülatör giriş ve çıkışını aynı referans GND ile ölçün.', 'Ray düşükse akım sınırlamalı enjeksiyon yalnız uygun voltaj sınırıyla yapılmalıdır.'],
  stopConditions: ['Düşük dirençli raya akım/voltaj sınırı bilinmeden enerji enjekte edilecek', 'MCU veya BGA üzerinde hızla yükselen sıcaklık var'], sourceIds: ['keysight_power', 'fluke_dc_supply'],
  rules: [
    { when: { operator: '<', value: 4.5 }, label: '5V rayı düşük/yok', next: 'general_result_5v_fault', scoreDelta: { general_regulator_fault: 42, rail_short: 24 } },
    { when: { operator: 'between', min: 4.75, max: 5.25 }, label: '5V rayı nominal', next: 'general_3v3_rail', scoreDelta: { general_regulator_fault: -8 } },
    { when: { operator: '>', value: 5.4 }, label: '5V rayı tehlikeli yüksek', next: 'general_result_5v_fault', scoreDelta: { general_regulator_fault: 44, general_firmware_fault: 10 } },
  ], fallbackNext: 'general_result_5v_fault',
})

nodes.general_3v3_rail = measurement({
  id: 'general_3v3_rail', device: 'general', category: 'Regülatörler', title: '3.3V MCU / Lojik Rayı',
  prompt: 'MCU, Flash ve haberleşme entegrelerinin 3.3V rayını açılış ve normal çalışma sırasında ölçün.',
  unit: 'V', meterMode: 'DC Voltage + MIN/MAX', powerState: 'Kart enerjili, açılış ve normal yük', probeBlack: 'Kart GND', probeRed: '3.3V test noktası / MCU VCC',
  expected: { min: 3.15, max: 3.45 }, danger: 'low', hint: 'Farklı I/O voltajlı MCU için datasheet VDD sınırı kullanılmalıdır.',
  testSteps: ['3.3V rayının enerjisiz GND direncini kaydedin.', 'Açılışta dip veya tekrarlı yükselme olup olmadığını MIN/MAX ile kontrol edin.', 'MCU ile Flash üzerindeki seviyeyi karşılaştırarak PCB düşümünü ayırın.'],
  stopConditions: ['Rayda kısa devre varken sınırsız akım uygulanıyor'], sourceIds: ['keysight_power', 'ti_power_transient'],
  rules: [
    { when: { operator: '<', value: 3 }, label: '3.3V rayı düşük/yok', next: 'general_result_3v3_fault', scoreDelta: { general_regulator_fault: 38, rail_short: 24 } },
    { when: { operator: 'between', min: 3.15, max: 3.45 }, label: '3.3V rayı nominal', next: 'general_ripple_check', scoreDelta: { general_regulator_fault: -10 } },
    { when: { operator: '>', value: 3.55 }, label: '3.3V rayı yüksek', next: 'general_result_3v3_fault', scoreDelta: { general_regulator_fault: 42, general_firmware_fault: 10 } },
  ], fallbackNext: 'general_result_3v3_fault',
})

nodes.general_ripple_check = measurement({
  id: 'general_ripple_check', device: 'general', category: 'Güç Bütünlüğü', title: '3.3V Ray Ripple - mVpp',
  prompt: '3.3V rayındaki tepeden tepeye ripple ve transient tepe değerini kısa topraklı osiloskop probuyla ölçün.',
  unit: 'mVpp', meterMode: 'Oscilloscope, AC coupling, 20 MHz limit', powerState: 'Kart en yoğun işlem/yük durumunda',
  probeBlack: 'MCU yakını GND test noktası', probeRed: 'MCU yakını 3.3V decoupling kondansatörü', expected: { min: 0, max: 100 }, danger: 'low',
  hint: '100 mVpp genel tarama eşiğidir; MCU ve regülatör datasheet sınırları önceliklidir.',
  testSteps: ['Kısa ground spring kullanın ve prob halkasını küçültün.', 'Açılış, röle/motor komutu ve haberleşme yükü sırasında dalga biçimini kaydedin.', 'Periyodik ripple ile tek seferlik brownout/transient olayını ayrı not edin.'],
  stopConditions: ['Toprak referansı şebeke primeri/hot-ground', 'Osiloskop uygun izolasyona sahip değil'], sourceIds: ['fluke_dc_supply', 'ti_power_transient'],
  rules: [
    { when: { operator: '<', value: 0 }, label: 'Negatif mVpp değeri geçersiz', next: 'general_result_need_scope', scoreDelta: {} },
    { when: { operator: 'between', min: 0, max: 100 }, label: 'Genel tarama sınırında düşük ripple', next: 'general_power_sequence', scoreDelta: { capacitor_esr: -10 } },
    { when: { operator: 'between', min: 100.01, max: 200 }, label: 'Ripple sınırda/yüksek', next: 'general_result_capacitor', scoreDelta: { capacitor_esr: 34, general_regulator_fault: 16 } },
    { when: { operator: '>', value: 200 }, label: '3.3V ripple ciddi yüksek', next: 'general_result_capacitor', scoreDelta: { capacitor_esr: 48, general_reset_fault: 18 } },
  ], fallbackNext: 'general_result_capacitor',
})

nodes.general_power_sequence = question({
  id: 'general_power_sequence', device: 'general', category: 'Açılış Sıralaması', title: 'Raylar Tek Seferde ve Kararlı Yükseliyor mu?',
  prompt: 'VIN, 5V, 3.3V ve PGOOD/reset açılışta tekrarlı yükselmeden, brownout olmadan üretici sırasına ulaşıyor mu?',
  yesLabel: 'Sıralama kararlı', noLabel: 'Salınım/brownout var', unknownLabel: 'Çok kanallı ölçemiyorum',
  nextYes: 'general_reset_check', nextNo: 'general_result_capacitor', nextUnknown: 'general_result_need_scope',
  scoreYes: { general_reset_fault: -6, capacitor_esr: -6 }, scoreNo: { capacitor_esr: 34, general_reset_fault: 24, general_regulator_fault: 18 }, scoreUnknown: { general_reset_fault: 8 },
  testSteps: ['En az iki osiloskop kanalıyla ana ray ve reset/PGOOD sinyalini birlikte tetikleyin.', 'Soğuk açılış ile sıcak yeniden başlatmayı ayrı kaydedin.', 'Datasheet power-up ve brownout eşiklerini referans alın.'],
  stopConditions: ['Osiloskop prob referansı izole olmayan primer devreye bağlanacak'], sourceIds: ['ti_power_transient'],
})

nodes.general_reset_check = question({
  id: 'general_reset_check', device: 'general', category: 'MCU Reset', title: 'Reset Darbesi ve Kararlı HIGH Seviyesi Doğru mu?',
  prompt: 'Reset hattı açılışta datasheet süresi kadar aktif kalıp sonra tek geçişle pasif/HIGH oluyor ve çalışma sırasında kararlı kalıyor mu?',
  yesLabel: 'Reset zamanlaması doğru', noLabel: 'Reset düşük/tekrarlı/kararsız', unknownLabel: 'Osiloskop yok',
  nextYes: 'general_clock_check', nextNo: 'general_result_reset_fault', nextUnknown: 'general_result_need_scope',
  scoreYes: { general_reset_fault: -14 }, scoreNo: { general_reset_fault: 48, general_regulator_fault: 10 }, scoreUnknown: { general_reset_fault: 10 },
  testSteps: ['Reset pinini açılıştan önce tetikleyerek tek atışta kaydedin.', 'Reset supervisor beslemesi, PGOOD ve manuel reset girişini karşılaştırın.', 'Lojik polariteyi MCU datasheetinden doğrulayın.'], sourceIds: ['ti_power_transient'],
})

nodes.general_clock_check = question({
  id: 'general_clock_check', device: 'general', category: 'MCU Clock', title: 'Kristal / Osilatör Başlıyor mu?',
  prompt: 'Düşük kapasitanslı x10 probla kristal veya harici osilatör çıkışında beklenen frekans ve kararlı genlik görülüyor mu?',
  yesLabel: 'Clock kararlı', noLabel: 'Clock yok/kararsız', unknownLabel: 'Uygun prob yok',
  nextYes: 'general_memory_detected', nextNo: 'general_result_clock_fault', nextUnknown: 'general_result_need_scope',
  scoreYes: { general_clock_fault: -16 }, scoreNo: { general_clock_fault: 48, general_firmware_fault: 8 }, scoreUnknown: { general_clock_fault: 10 },
  testSteps: ['Prob kapasitansının kristali durdurabileceğini dikkate alın.', 'Varsa buffered clock/test çıkışını tercih edin.', 'Frekansı kart şeması veya kristal işaretiyle karşılaştırın.'], sourceIds: ['fluke_dc_supply'],
})

nodes.general_memory_detected = question({
  id: 'general_memory_detected', device: 'general', category: 'Hafıza / Boot', title: 'SPI Flash / EEPROM Güvenilir Okunuyor mu?',
  prompt: 'Doğru voltajlı programlayıcıyla iki bağımsız okuma aynı hash değerini veriyor ve verify hatasız tamamlanıyor mu?',
  yesLabel: 'Tekrarlı okuma aynı', noLabel: 'Okunmuyor/veri değişiyor', unknownLabel: 'Programlayıcı veya doğru dump yok',
  nextYes: 'general_bus_activity', nextNo: 'general_result_memory_fault', nextUnknown: 'general_result_need_programmer',
  scoreYes: { general_memory_fault: -16 }, scoreNo: { general_memory_fault: 48, general_firmware_fault: 12 }, scoreUnknown: { general_memory_fault: 10 },
  testSteps: ['Yazma işleminden önce en az iki dump yedeği alın.', 'Programlayıcı I/O voltajını bellek datasheetine göre ayarlayın.', 'Devre üzeri okuma kararsızsa diğer veri yolu yüklerini ve chip-select durumunu ayırın.'],
  stopConditions: ['Yedek alınmadan erase/write yapılacak', '1.8V belleğe 3.3V programlayıcı bağlanacak'], sourceIds: ['fluke_dc_supply'],
})

nodes.general_bus_activity = question({
  id: 'general_bus_activity', device: 'general', category: 'Boot / Veri Yolu', title: 'Boot Aktivitesi veya Hata Kaydı Var mı?',
  prompt: 'UART boot logu, SPI chip-select, I2C aktivitesi veya servis yazılımında tutarlı bir başlatma/hata kaydı görülüyor mu?',
  yesLabel: 'Boot aktivitesi var', noLabel: 'Aktivite yok / aynı yerde kilitli', unknownLabel: 'Protokol ölçemiyorum',
  nextYes: 'general_result_firmware_peripheral', nextNo: 'general_result_firmware', nextUnknown: 'general_result_need_scope',
  scoreYes: { general_firmware_fault: 14, general_clock_fault: -8 }, scoreNo: { general_firmware_fault: 38, general_memory_fault: 12, general_reset_fault: 10 }, scoreUnknown: { general_firmware_fault: 8 },
  testSteps: ['Lojik seviyeyi ve protokol hızını şemadan doğrulayın.', 'Boot anını reset kenarıyla birlikte tetikleyin.', 'Veri yolu çökmesini bulmak için bağlı çevre birimlerini kontrollü ayırın.'], sourceIds: ['fluke_dc_supply'],
})

nodes.general_thermal_inspection = question({
  id: 'general_thermal_inspection', device: 'general', category: 'Termal / Aralıklı Arıza', title: 'Arıza Sıcaklıkla Tekrarlanabilir mi?',
  prompt: 'Termal kamera ve kontrollü soğutma/ısıtma ile arıza aynı bölgede, aynı sıcaklık geçişinde tekrar oluşuyor mu?',
  yesLabel: 'Termal korelasyon var', noLabel: 'Sıcaklıkla ilişkili değil', unknownLabel: 'Kontrollü test yapılamıyor',
  nextYes: 'general_result_thermal', nextNo: 'general_input_nominal_select', nextUnknown: 'general_input_nominal_select',
  scoreYes: { general_thermal_fault: 48 }, scoreNo: { general_thermal_fault: -12 }, scoreUnknown: { general_thermal_fault: 6 },
  testSteps: ['Kartın normal sıcaklık haritasını kaydedin.', 'Küçük bölgeleri kontrollü değiştirin; yoğunlaşma oluşturmayın.', 'Arıza anında ray, reset ve haberleşme sinyalini eş zamanlı kaydedin.'],
  stopConditions: ['Yanıcı soğutucu veya kontrolsüz sıcak hava kullanılacak', 'Komponent maksimum sıcaklığı bilinmiyor'], sourceIds: ['fluke_dc_supply'],
})

nodes.general_result_capacitor = result({
  id: 'general_result_capacitor', device: 'general', category: 'Güç Bütünlüğü', title: 'Ripple / Brownout / Çıkış Kondansatörü Şüphesi',
  summary: 'DC ray ortalaması uygun görünse de ripple veya açılış sıralaması MCU’yu kararsız bırakıyor.',
  components: ['Regülatör çıkış kondansatörleri', 'Feedback/kompanzasyon', 'PGOOD ve reset supervisor', 'Toprak dönüş yolu'],
  repair: 'Kondansatör ESR/kapasite ve regülatör döngüsünü doğrulayın; aynı değer, ESR, sıcaklık ve ripple sınıfıyla değiştirin.',
  verification: 'Soğuk/sıcak açılışta raylar tek geçişle yükselmeli, ripple datasheet limitinde ve reset kararlı olmalıdır.', sourceIds: ['ti_power_transient', 'fluke_dc_supply'],
})
nodes.general_result_firmware = result({
  id: 'general_result_firmware', device: 'general', category: 'Firmware / Boot', title: 'Firmware Bütünlüğü veya Boot Yapılandırması Şüphesi',
  summary: 'Temel raylar mevcut ancak boot aktivitesi yok, aynı noktada kilitleniyor veya çevre birimi başlatılamıyor.',
  components: ['Boot strap dirençleri', 'Firmware imajı ve konfigürasyon', 'Watchdog/brownout ayarı', 'Kilitlenen çevre birimi'],
  repair: 'Özgün dump yedeğini koruyun; doğru kart revizyonuna ait doğrulanmış imaj ve boot strap değerleriyle karşılaştırın.',
  verification: 'UART/servis logu normal boot akışını tamamlamalı ve tüm çevre birimleri tekrarlı açılışta tanınmalıdır.', sourceIds: ['fluke_dc_supply'],
})
nodes.general_result_thermal = result({
  id: 'general_result_thermal', device: 'general', category: 'Termal / Aralıklı Arıza', title: 'Isıya Bağlı Komponent veya Lehim Arızası',
  summary: 'Arıza belirli sıcaklık bölgesiyle tekrarlanabilir biçimde ilişkilendirildi.',
  components: ['Çatlak BGA/QFN veya ağır komponent lehimi', 'Kurumuş elektrolitik kondansatör', 'Termal korumaya giren regülatör', 'Oksitli konnektör'],
  repair: 'Bölgeyi elektriksel ölçümle daraltın; körlemesine reflow yerine arızalı komponent/lehimi IPC uyumlu işlemle onarın.',
  verification: 'Kart soğuk ve sıcak çevrimlerde, nominal yükte kesintisiz çalışmalı; sıcaklık haritası normal olmalıdır.', sourceIds: ['fluke_dc_supply'],
})
nodes.general_result_input_reference = result({
  id: 'general_result_input_reference', device: 'general', category: 'Giriş Referansı', title: 'Kart Nominal Giriş Bilgisi Gerekli', severity: 'info',
  summary: 'Kartın güvenli giriş voltajı ve polaritesi doğrulanmadan güç yolu teşhisi sürdürülemez.',
  components: ['Kart etiketi ve revizyonu', 'Orijinal adaptör', 'Giriş koruma topolojisi', 'Üretici şeması/datasheet'],
  repair: 'Konnektörden regülatör girişine kadar izi takip edin; parça kodları ve üretici dökümanıyla nominal değeri belirleyin.',
  verification: 'Akım sınırlı kaynağın voltajı, polaritesi ve limiti belgelenmeden karta enerji uygulanmamalıdır.', sourceIds: ['keysight_power'],
})

// PROFILE_NODES

Object.assign(data.nodes, nodes)

data.probabilityDisclaimer = 'Bu değerler gerçek arıza olasılığı veya saha istatistiği değildir. Toplamı 100’e normalize edilmiş servis öncelik ağırlıklarıdır; kapatılmış iş emri verisiyle kalibre edilmemiştir.'
data.researchAudit = {
  reviewedAt: '2026-07-15',
  datasetGrain: 'Bir kayıt, bir cihaz ailesindeki tek teşhis adımı veya sonuç düğümüdür.',
  priorCalibration: 'uncalibrated_heuristic',
  evidencePolicy: 'Üretici/model kılavuzu en yüksek önceliktedir; genel mühendislik eşikleri yalnız tarama amacı taşır.',
  sourcePolicy: 'Kaynak bağlantısı yalnız ilgili üretici, standart kuruluşu veya ölçüm yöntemini yayımlayan teknik kuruma verilir.',
  limitations: ['Başlangıç servis ağırlıkları kapatılmış iş emri verisiyle kalibre edilmemiştir.', 'Model-özel eşiklerde cihaz etiketi ve üretici servis kılavuzu uygulamadaki değerden önce gelir.'],
}

data.nodes.ups_battery_voltage.sourceIds = ['yuasa_vrla']

Object.assign(data.nodes.ups_charge_voltage, {
  title: '12V VRLA Float / Şarj Gerilimi',
  expected: { min: 13.4, max: 13.9 },
  hint: 'Genel float tarama aralığıdır. GS Yuasa örnek blokta 20°C için 13.65V belirtilir; boost/cyclic aşaması ve sıcaklık kompanzasyonu model kılavuzundan doğrulanmalıdır.',
  sourceIds: ['yuasa_vrla'],
  rules: [
    { when: { operator: '<', value: 12.8 }, label: 'Şarj çıkışı belirgin düşük', next: 'ups_input_fuse', scoreDelta: { charger_fault: 34, input_protection_fault: 12 } },
    { when: { operator: 'between', min: 12.8, max: 13.39 }, label: 'Float gerilimi düşük/sınırda', next: 'ups_5v_rail', scoreDelta: { charger_fault: 18 } },
    { when: { operator: 'between', min: 13.4, max: 13.9 }, label: 'Genel float aralığında', next: 'ups_5v_rail', scoreDelta: { charger_fault: -8 } },
    { when: { operator: 'between', min: 13.91, max: 14.6 }, label: 'Boost/cyclic şarj olabilir; model ve şarj aşamasını doğrulayın', next: 'ups_5v_rail', scoreDelta: { charger_fault: 4 } },
    { when: { operator: '>', value: 14.6 }, label: '12V VRLA için aşırı şarj şüphesi', next: 'ups_5v_rail', scoreDelta: { charger_fault: 32, battery_degraded: 10 } },
  ],
})

Object.assign(data.nodes.fire_zone_resistance, {
  title: '6.8 kΩ Zone EOL — C-TEC FP/CFP',
  hint: 'Yalnız panel etiketi veya C-TEC FP/CFP kılavuzu 6.8 kΩ gösteriyorsa kullanın; bazı C-TEC zone devreleri kapasitif EOL kullanır.',
  sourceIds: ['ctec_fire'],
})
Object.assign(data.nodes.fire_zone_resistance_22k, {
  title: '2.2 kΩ EOL — Yalnız Model Kılavuzuyla',
  hint: '2.2 kΩ evrensel zone değeri değildir. Notifier belgeleri farklı çıkış/modüllerde farklı EOL değerleri kullanıldığını gösterir; panel/model şeması doğrulanmadan bu seçeneği kullanmayın.',
  sourceIds: ['notifier_eol_legacy'],
})
Object.assign(data.nodes.fire_zone_resistance_47k, {
  title: '4.7 kΩ Zone EOL — Notifier NFS Supra',
  hint: 'Notifier NFS Supra için 4.7 kΩ veya kılavuzda belirtilen kapasitif EOL kullanılır. Başka panelde üretici değerini seçin.',
  sourceIds: ['notifier_nfs_supra'],
})
Object.assign(data.nodes.cctv_poe_voltage, {
  sourceIds: ['axis_poe_power', 'microchip_poe'],
  hint: 'Voltaj tek başına PoE sınıfını veya kullanılabilir gücü kanıtlamaz; port bütçesi, kamera maksimum tüketimi ve kablo kaybını birlikte doğrulayın.',
})
Object.assign(data.nodes.access_bus_voltage, {
  title: 'OSDP / RS-485 Diferansiyel Aktivite Ön Kontrolü',
  prompt: 'Kart okutma veya OSDP sorgusu sırasında, izole diferansiyel prob ya da RS-485 analizörüyle A-B diferansiyel salınımını Vpp olarak kaydedin.',
  unit: 'Vpp',
  meterMode: 'Oscilloscope / RS-485 analyzer',
  powerState: 'Okuyucu ve kontrolör enerjili; haberleşme tetikleniyor',
  probeBlack: 'İzole diferansiyel prob - / RS-485 B',
  probeRed: 'İzole diferansiyel prob + / RS-485 A',
  expected: { min: 0.4, max: 12 },
  hint: 'Diferansiyel aktivite geçerli OSDP çerçevesini kanıtlamaz. Adres, baud, kablo, sonlandırma ve Secure Channel ayrıca doğrulanmalıdır.',
  testSteps: ['Topraklı standart osiloskop probunu doğrudan A-B arasına bağlamayın; izole diferansiyel prob veya RS-485 analizörü kullanın.', 'Kart okutma ve kontrolör sorgusu sırasında A-B dalga biçimini yakalayın.', 'Bükümlü çift, A/B yönü, benzersiz adres, baud hızı ve Secure Channel durumunu yazılımdan doğrulayın.'],
  stopConditions: ['İzole diferansiyel ölçüm veya RS-485 analizörü yok', 'Hat üzerinde beklenmeyen yüksek ortak-mod gerilim var'],
  rules: [
    { when: { operator: '<', value: 0.2 }, label: 'Diferansiyel aktivite yok veya hat kısa/sabit', next: 'access_result_rs485_bus', scoreDelta: { reader_bus_fault: 36, access_rs485_fault: 28 } },
    { when: { operator: 'between', min: 0.2, max: 0.39 }, label: 'Diferansiyel genlik alıcı eşiğine çok yakın; marj yetersiz', next: 'access_result_rs485_bus', scoreDelta: { reader_bus_fault: 28, access_rs485_fault: 32 } },
    { when: { operator: 'between', min: 0.4, max: 12 }, label: 'Diferansiyel aktivite görülüyor; OSDP çerçevesini analiz edin', next: 'access_result_config', scoreDelta: { reader_bus_fault: -6, access_rs485_fault: 8 } },
    { when: { operator: '>', value: 12 }, label: 'Prob referansı, kablolama veya ortak-mod gerilim anormal', next: 'access_result_rs485_bus', scoreDelta: { reader_bus_fault: 30, access_rs485_fault: 30 } },
  ],
  sourceIds: ['sia_osdp_checklist', 'ti_rs485'],
})
for (const nodeId of ['uvis_camera_power_voltage', 'uvis_illumination_output_percent']) {
  data.nodes[nodeId].sourceIds = [...new Set([...(data.nodes[nodeId].sourceIds || []), 'hikvision_uvss'])]
}
data.nodes.sliding_aux_voltage.sourceIds = []
for (const nodeId of ['sliding_safety_function_test', 'sliding_result_safety']) {
  data.nodes[nodeId].sourceIds = [...new Set([...(data.nodes[nodeId].sourceIds || []), 'dormakaba_esa100'])]
}

Object.assign(data.nodes.fire_battery_voltage, {
  title: '24V VRLA Akü Grubu Float Gerilimi',
  prompt: 'İki adet 12V VRLA bloktan oluşan akü grubunu panel şebekede ve şarj kararlı durumdayken ölçün; blok sıcaklıklarını ve tek tek voltajlarını da kaydedin.',
  powerState: 'Panel şebekede, aküler bağlı, şarj kararlı ve sıcaklık kaydedilmiş',
  expected: { min: 26.8, max: 27.8 },
  hint: 'İki blok için genel float taramasıdır. Kapasiteyi kanıtlamaz; panel üreticisinin sıcaklık kompanzasyonu ve akü modeli önceliklidir.',
  testSteps: ['Şişme, ısınma, sızıntı ve pabuç oksidasyonunu kontrol edin.', 'Grup toplamını ve her 12V bloğu aynı anda ayrı kaydedin.', 'Şebeke kesme/yük testi yalnız bina sorumlusu onayı ve panel üreticisi prosedürüyle yapılmalıdır.'],
  stopConditions: ['Aktif alarm veya tahliye durumu var', 'Akü şişmiş, ısınıyor veya sızdırıyor', 'Panelin geçici devre dışı kalması yetkilendirilmedi'],
  sourceIds: ['ctec_fire', 'yuasa_vrla'],
  rules: [
    { when: { operator: '<', value: 25.6 }, label: 'Akü grubu float seviyesi belirgin düşük', next: 'fire_result_battery', scoreDelta: { panel_battery_fault: 42, charger_fault: 18 } },
    { when: { operator: 'between', min: 25.6, max: 26.79 }, label: 'Float seviyesi düşük/sınırda; blok ve şarj ayrımı gerekli', next: 'fire_result_battery', scoreDelta: { panel_battery_fault: 28, charger_fault: 20 } },
    { when: { operator: 'between', min: 26.8, max: 27.8 }, label: 'Genel 24V VRLA float aralığında; kapasite henüz doğrulanmadı', next: 'fire_panel_24v', scoreDelta: { panel_battery_fault: -8 } },
    { when: { operator: 'between', min: 27.81, max: 29.2 }, label: 'Boost/cyclic veya sıcaklık kompanzasyonu olabilir; panel kılavuzunu doğrulayın', next: 'fire_panel_24v', scoreDelta: { charger_fault: 8 } },
    { when: { operator: '>', value: 29.2 }, label: 'Akü grubu aşırı şarj şüphesi', next: 'fire_result_charger_high', scoreDelta: { charger_fault: 38, panel_battery_fault: 16 } },
  ],
})

Object.assign(data.nodes.ups_result_rail_short, {
  title: '5V Rayında Düşük Direnç Şüphesi',
  summary: '5V-GND direnci düşük ve sabit görünüyor; ancak kart topolojisi, kondansatör şarjı ve yarıiletken yolları bilinmeden bu değer tek başına kısa devre kanıtı değildir.',
  repair: 'İki polaritede ve zaman içinde ölçün, sağlam kartla karşılaştırın ve hattı bölerek daraltın. Rayın güvenli maksimum voltajı bilinmeden güç enjekte etmeyin.',
  verification: 'Akım sınırlı doğrulamada anormal ısınma olmamalı; 5V rayı yükte kararlı kalmalı ve kartın normal akım tüketimi model referansıyla uyuşmalıdır.',
})
Object.assign(data.nodes.cctv_result_input_short, {
  title: 'Kamera Girişinde Düşük Direnç Şüphesi',
  summary: '12V giriş-GND ölçümü düşük ve sabit görünüyor; giriş kapasitörleri ile koruma/çevirici topolojisi ayrılmadan kesin kısa devre kararı verilemez.',
  repair: 'İki polaritede diyot/direnç davranışını, zamanla yükselmeyi ve sağlam kamera referansını karşılaştırın. Güvenli akım limiti bilinmeden enjeksiyon yapmayın.',
  verification: 'Kamera etiket akımı içinde açılmalı, girişte anormal ısınma olmamalı ve IR/PTZ yükünde besleme çökmemelidir.',
})
Object.assign(data.nodes.access_result_reader_short, {
  title: 'Okuyucu Besleme Hattında Düşük Direnç Şüphesi',
  summary: 'Okuyucu ayrıyken hat düşük direnç gösteriyor; kablo, koruma elemanı ve kontrolör çıkışı ayrı ölçülmeden kesin kısa devre kararı verilemez.',
  repair: 'Okuyucuyu, saha kablosunu ve panel çıkışını üç ayrı bölümde ölçün; iki polarite ve sağlam hat karşılaştırması yapın.',
  verification: 'Bağlı okuyucu model akımı içinde çalışmalı, besleme çökmemeli ve kablo/koruma elemanında anormal ısınma olmamalıdır.',
})

const researchedNodeSources = {
  fire_zone_alarm_led: ['ctec_fire', 'notifier_nfs_supra'],
  fire_result_zone_short: ['ctec_fire', 'notifier_nfs_supra'],
  fire_result_zone_open: ['ctec_fire', 'notifier_nfs_supra'],
  fire_result_eol_mismatch: ['ctec_fire', 'notifier_nfs_supra', 'notifier_eol_legacy'],
  fire_result_field_device: ['ctec_fire', 'notifier_nfs_supra'],
  fire_result_zone_trace: ['ctec_fire', 'notifier_nfs_supra'],
  fire_siren_fuse: ['ctec_fire'],
  fire_result_siren_field: ['ctec_fire'],
  fire_result_siren_fuse: ['ctec_fire'],
  fire_result_siren_driver: ['ctec_fire'],
  fire_result_panel_logic: ['ctec_fire'],
  fire_result_battery: ['ctec_fire', 'yuasa_vrla'],
  fire_result_charger_high: ['ctec_fire', 'yuasa_vrla'],
  access_result_rs485_bus: ['sia_osdp_checklist', 'ti_rs485'],
  access_result_config: ['sia_osdp_checklist', 'paxton_net2'],
  cctv_result_poe_source: ['axis_poe_power', 'microchip_poe'],
  cctv_result_link_fault: ['axis_network'],
  cctv_result_config_or_sensor: ['axis_network'],
  uvis_result_network: ['hikvision_uvss', 'axis_network'],
  uvis_result_software: ['hikvision_uvss'],
  uvis_result_calibration: ['hikvision_uvss'],
  pbx_power_present: ['cisco_fxs'],
  pbx_result_power: ['cisco_fxs'],
  pbx_result_line_voltage: ['cisco_fxs_voltage'],
  pbx_result_port_card: ['cisco_fxs', 'cisco_fxs_voltage'],
  pbx_result_port_or_phone: ['cisco_fxs'],
  sliding_sensor_trigger: ['dormakaba_esa100'],
  sliding_result_sensor: ['dormakaba_esa100'],
  sliding_result_mechanical_limit: ['dormakaba_esa100', 'geze_sliding'],
}
for (const [nodeId, sourceIds] of Object.entries(researchedNodeSources)) {
  data.nodes[nodeId].sourceIds = [...new Set([...(data.nodes[nodeId].sourceIds || []), ...sourceIds])]
}

function replaceWithFieldQuestion(nodeId, config) {
  const node = data.nodes[nodeId]
  const measurementFields = ['unit', 'meterMode', 'powerState', 'probeBlack', 'probeRed', 'expected', 'hint', 'rules', 'fallbackNext', 'thresholdPolicy']
  for (const field of measurementFields) {
    delete node[field]
  }

  Object.assign(node, {
    type: 'question_boolean',
    unknownLabel: 'Kontrol edemiyorum',
    scoreYes: {},
    scoreNo: {},
    scoreUnknown: {},
    testSteps: [],
    stopConditions: [],
    ...config,
  })
}

replaceWithFieldQuestion('cctv_poe_voltage', {
  category: 'PoE ve Ethernet Kontrolü',
  title: 'Sağlam PoE Portu ve Kısa Ethernet Kablosu Denemesi',
  prompt: 'Kamerayı switch yanına alın. Kısa ve sağlam bir Ethernet kablosuyla, çalıştığı bilinen PoE portu veya uygun enjektörde deneyin. Kamera açılıyor ve ağ ışığı geliyor mu?',
  yesLabel: 'Kısa sağlam kabloyla çalışıyor',
  noLabel: 'Kısa kabloyla da çalışmıyor',
  unknownLabel: 'Sağlam PoE portu yok',
  nextYes: 'cctv_result_cable',
  nextNo: 'cctv_poe_budget',
  nextUnknown: 'cctv_result_power_reference',
  scoreYes: { cctv_cable_fault: 48, poe_power_fault: -12 },
  scoreNo: { cctv_cable_fault: -12, poe_power_fault: 18 },
  scoreUnknown: { poe_power_fault: 8 },
  testSteps: ['Saha kablosunu iki uçtan ayırın.', 'Kamerayı kısa ve sağlam Ethernet kablosuyla switch yanında deneyin.', 'Aynı kablo ve portta çalışan başka bir kamera varsa sonucu karşılaştırın.'],
  stopConditions: ['Çıplak RJ45 uçlarına multimetre probu sokulacak', 'Pasif PoE yönü veya kamera beslemesi bilinmiyor'],
})

replaceWithFieldQuestion('access_bus_voltage', {
  category: 'RS485 / OSDP Kablo Kontrolü',
  title: 'Kısa Sağlam Kablo ve Ayar Denemesi',
  prompt: 'Okuyucuyu kontrolörün yanına alın. Kısa ve sağlam bir kabloyla bağlayın; A/B uçlarının ters olmadığını, klemenslerin gevşek veya oksitli olmadığını ve bilgisayardaki adres/port ayarını kontrol edin. Okuyucu görülüyor mu?',
  yesLabel: 'Kısa sağlam kabloyla çalışıyor',
  noLabel: 'Kısa kabloyla da çalışmıyor',
  unknownLabel: 'Kısa kablo veya yazılım erişimi yok',
  nextYes: 'access_result_rs485_bus',
  nextNo: 'access_result_config',
  nextUnknown: 'access_result_rs485_bus',
  scoreYes: { reader_bus_fault: 38, access_rs485_fault: 26 },
  scoreNo: { reader_bus_fault: -8, access_rs485_fault: 18, access_credential_config: 16 },
  scoreUnknown: { reader_bus_fault: 10 },
  testSteps: ['Enerjiyi kesin; A/B ve besleme uçlarını etikete göre yeniden kontrol edin.', 'Kablo damarlarında kopukluk ve damarlar arasında kısa devre olup olmadığını multimetreyle ölçün.', 'Okuyucuyu kısa sağlam kabloyla bağlayıp bilgisayar yazılımında adres ve port ayarını kontrol edin.'],
  stopConditions: ['Kablo üzerinde beklenmeyen yüksek gerilim var', 'Okuyucu besleme voltajı bilinmiyor'],
})

replaceWithFieldQuestion('support_ripple_test', {
  category: 'Adaptör Karşılaştırması',
  title: 'Sağlam Adaptörle Sorun Kayboluyor mu?',
  prompt: 'Aynı voltajda ve yeterli akımda olduğu bilinen sağlam bir adaptör ile deneyin. Cihazın yeniden başlaması, görüntü çizgisi veya uğultu kayboluyor mu?',
  yesLabel: 'Sağlam adaptörle sorun kayboldu',
  noLabel: 'Sorun devam ediyor',
  unknownLabel: 'Uygun sağlam adaptör yok',
  nextYes: 'support_result_ripple',
  nextNo: 'support_connector_test',
  nextUnknown: 'support_connector_test',
  scoreYes: { support_psu_ripple: 44, capacitor_esr: 18 },
  scoreNo: { support_psu_ripple: -10, support_connector_fault: 12 },
  scoreUnknown: { support_psu_ripple: 8 },
  testSteps: ['Adaptörlerin çıkış voltajı ve artı/eksi yönü aynı olmalıdır.', 'Sağlam adaptörün akım değeri cihazın istediğinden düşük olmamalıdır.', 'Sorunu aynı yük ve kabloyla tekrar deneyin.'],
  stopConditions: ['Adaptör voltajı veya artı/eksi yönü uyuşmuyor', 'Kablo, jak veya adaptör ısınıyor'],
})

replaceWithFieldQuestion('general_ripple_check', {
  category: 'Besleme Kararlılığı',
  title: 'Açılışta 3.3V veya 5V Düşüyor mu?',
  prompt: 'Multimetrenin MIN/MAX özelliğiyle cihaz açılırken 5V ve 3.3V hatlarını ayrı ayrı izleyin. Voltaj belirgin düşüyor veya cihaz tekrar tekrar açılmaya çalışıyor mu?',
  yesLabel: 'Voltaj düşüyor / cihaz yeniden başlıyor',
  noLabel: 'Voltajlar kararlı',
  unknownLabel: 'MIN/MAX yok; gözlemle karar veremiyorum',
  nextYes: 'general_result_capacitor',
  nextNo: 'general_power_sequence',
  nextUnknown: 'general_power_sequence',
  scoreYes: { capacitor_esr: 42, general_regulator_fault: 18, general_reset_fault: 14 },
  scoreNo: { capacitor_esr: -10 },
  scoreUnknown: { general_reset_fault: 6 },
  testSteps: ['Siyah probu kart eksi/GND noktasına sabitleyin.', '5V ve 3.3V noktalarını cihaz açılırken ayrı ayrı MIN/MAX ile ölçün.', 'Varsa aynı voltajlı sağlam adaptörle sonucu karşılaştırın.'],
  stopConditions: ['Prob kayıp iki noktayı kısa devre edebilir', 'Kartta yanık, duman veya aşırı ısınma var'],
})

Object.assign(data.nodes.access_adapter_ripple, {
  category: 'Besleme Kararlılığı',
  title: 'Yük Binerken Voltaj Düşüyor mu?',
  prompt: 'Kilit veya okuyucu çalıştığı anda multimetrenin MIN/MAX değerinde belirgin düşme oluyor ya da panel yeniden başlıyor mu? Aynı voltajlı sağlam adaptörle de karşılaştırın.',
  yesLabel: 'Voltaj düşüyor / panel yeniden başlıyor',
  noLabel: 'Voltaj sabit',
  unknownLabel: 'MIN/MAX veya sağlam adaptör yok',
  testSteps: ['Multimetreyi panelin DC girişine bağlayıp MIN/MAX kaydını açın.', 'Kilit ve okuyucuyu ayrı ayrı çalıştırın.', 'Aynı voltaj ve yeterli akımdaki sağlam adaptörle tekrar deneyin.'],
})

Object.assign(data.nodes.access_wiegand_activity, {
  category: 'Okuyucu Kablo Kontrolü',
  title: 'Okuyucu Kablosu ve Bilgisayar Kaydı Kontrolü',
  prompt: 'D0, D1, eksi/GND ve besleme uçları doğru mu; kabloda kopukluk, kısa devre, gevşek veya oksitli klemens var mı? Kısa sağlam kabloyla kart okutunca bilgisayardaki olay kaydına kart numarası geliyor mu?',
  yesLabel: 'Kısa kabloyla olay kaydı geliyor',
  noLabel: 'Olay kaydı gelmiyor',
  unknownLabel: 'Yazılıma erişilemiyor',
  testSteps: ['Enerjiyi kesin ve D0, D1, eksi/GND ile besleme damarlarını etikete göre kontrol edin.', 'Kabloda kopukluk ve damarlar arası kısa devreyi multimetreyle ölçün.', 'Kısa sağlam kabloyla kart okutun ve bilgisayardaki olay kaydını izleyin.'],
})
delete data.nodes.access_wiegand_activity.meterMode
delete data.nodes.access_wiegand_activity.powerState
delete data.nodes.access_wiegand_activity.probeBlack
delete data.nodes.access_wiegand_activity.probeRed

Object.assign(data.nodes.general_power_sequence, {
  category: 'Açılış Kontrolü',
  title: '5V ve 3.3V Sabitken Kart Yine Açılmıyor mu?',
  prompt: '5V ve 3.3V açılış sırasında sabit kaldığı hâlde ekran, durum ışığı veya bilgisayar bağlantısı hâlâ gelmiyor mu?',
  yesLabel: 'Besleme sabit ama kart açılmıyor',
  noLabel: 'Besleme düşüyor veya dalgalanıyor',
  unknownLabel: 'Açılış değerini ölçemiyorum',
  nextYes: 'general_reset_check',
  nextNo: 'general_result_capacitor',
  nextUnknown: 'general_reset_check',
  testSteps: ['Multimetrede MIN/MAX ile 5V ve 3.3V değerlerini ayrı kaydedin.', 'Ekran, durum ışıkları ve bilgisayar bağlantısının açılış davranışını not edin.', 'Bağlı çevre kablolarını tek tek ayırarak cihazın açılıp açılmadığını deneyin.'],
  stopConditions: ['Kartta yanık, duman veya aşırı ısınma var'],
})

Object.assign(data.nodes.general_reset_check, {
  category: 'Açılış Belirtisi',
  title: 'Kart Sürekli Yeniden Başlıyor mu?',
  prompt: 'Durum ışığı, ekran veya bilgisayar bağlantısı düzenli aralıklarla gidip geliyor; röle sürekli çekip bırakıyor ya da cihaz açılış ekranında kalıyor mu?',
  yesLabel: 'Sürekli yeniden başlıyor',
  noLabel: 'Tek sefer açılıyor ama çalışmıyor',
  unknownLabel: 'Belirti görülemiyor',
  nextYes: 'general_result_reset_fault',
  nextNo: 'general_clock_check',
  nextUnknown: 'general_clock_check',
  scoreYes: { general_reset_fault: 48, general_regulator_fault: 10 },
  scoreNo: { general_reset_fault: -10 },
  scoreUnknown: { general_reset_fault: 6 },
  testSteps: ['Ekran ve durum ışıklarının açılış sırasını izleyin.', 'Bilgisayarda USB, seri port veya Ethernet bağlantısının gelip gittiğini kontrol edin.', 'Bağlı çevre cihazlarını enerjisizken tek tek ayırıp yeniden deneyin.'],
})

Object.assign(data.nodes.general_clock_check, {
  category: 'Kart Açılış Kontrolü',
  title: 'Kartta Herhangi Bir Açılış Belirtisi Var mı?',
  prompt: '5V ve 3.3V normal olduğu hâlde durum ışığı yanıyor, ekran değişiyor, röle bir kez çekiyor veya bilgisayar cihazı görüyor mu?',
  yesLabel: 'Bir açılış belirtisi var',
  noLabel: 'Hiçbir açılış belirtisi yok',
  unknownLabel: 'Belirtiyi ayırt edemiyorum',
  nextYes: 'general_memory_detected',
  nextNo: 'general_result_clock_fault',
  nextUnknown: 'general_memory_detected',
  testSteps: ['Kartı enerjilendirirken ışık, ekran ve röle sesini izleyin.', 'Bilgisayarda yeni USB/seri/Ethernet cihazı oluşup oluşmadığına bakın.', 'Varsa üreticinin servis programında cihaz araması yapın.'],
})

Object.assign(data.nodes.general_memory_detected, {
  category: 'Ayar ve Kayıt Kontrolü',
  title: 'Bilgisayar Cihaz Bilgisini veya Ayarları Okuyor mu?',
  prompt: 'Üreticinin servis programı cihazı görüyor; model, sürüm, kayıt veya ayar bilgilerini tutarlı biçimde okuyabiliyor mu?',
  yesLabel: 'Cihaz ve ayarlar okunuyor',
  noLabel: 'Cihaz görülüyor ama bilgi okunmuyor',
  unknownLabel: 'Servis programına erişilemiyor',
  nextYes: 'general_bus_activity',
  nextNo: 'general_result_memory_fault',
  nextUnknown: 'general_bus_activity',
  testSteps: ['Doğru USB, seri veya Ethernet kablosunu kullanın.', 'Bilgisayarın cihazı görüp görmediğini kontrol edin.', 'Ayarları değiştirmeden önce ekrandaki mevcut bilgilerin görüntüsünü veya notunu alın.'],
  stopConditions: ['Yedek alınmadan ayarlar silinecek veya cihaz yazılımı yazılacak'],
})

Object.assign(data.nodes.general_bus_activity, {
  category: 'Bilgisayar Bağlantısı',
  title: 'Bilgisayarda Bağlantı veya Hata Kaydı Var mı?',
  prompt: 'USB, seri port veya Ethernet bağlantısı bilgisayarda görünüyor; servis programında anlaşılır bir hata kaydı oluşuyor mu?',
  yesLabel: 'Bağlantı veya hata kaydı var',
  noLabel: 'Bilgisayar cihazı görmüyor',
  unknownLabel: 'Bilgisayar bağlantısı yok',
  nextYes: 'general_result_firmware_peripheral',
  nextNo: 'general_result_firmware',
  nextUnknown: 'general_result_firmware',
  testSteps: ['Sağlam olduğu bilinen USB, seri veya Ethernet kablosu kullanın.', 'Bilgisayarda doğru portun oluştuğunu kontrol edin.', 'Hata kaydını silmeden önce kodu ve zamanı not edin.'],
})

Object.assign(data.nodes.general_thermal_inspection, {
  category: 'Aralıklı Arıza',
  title: 'Arıza Isınınca veya Soğukken Değişiyor mu?',
  prompt: 'Cihaz normal çalışırken gözle ve dikkatli dokunma kontrolünde aşırı ısınan parça, ısınınca kesilen bağlantı veya soğukken zor açılma görülüyor mu?',
  yesLabel: 'Isıyla birlikte arıza değişiyor',
  noLabel: 'Sıcaklıkla ilişkisi yok',
  unknownLabel: 'Güvenli kontrol yapılamıyor',
  testSteps: ['Kartı yanık, kararma, şişmiş kondansatör ve çatlak lehim açısından gözle kontrol edin.', 'Kablo ve soketleri zorlamadan hafifçe kontrol edin.', 'Aşırı ısınan bölge varsa enerjiyi kesin ve yerini not edin.'],
  stopConditions: ['Parça dokunulamayacak kadar sıcak', 'Yanık kokusu, duman veya erime var', 'Kontrol şebeke gerilimi açıkken yapılacak'],
})

Object.assign(data.nodes.support_load_drop, {
  title: 'Cihaz Çalışırken Voltaj Belirgin Düşüyor mu?',
  prompt: 'Boştaki voltaj ile cihaz çalışırken ölçülen en düşük değeri karşılaştırın. Voltaj belirgin düşüyor veya cihaz yeniden başlıyor mu?',
  yesLabel: 'Voltaj düşüyor / cihaz yeniden başlıyor',
  noLabel: 'Yükte voltaj sabit',
  unknownLabel: 'MIN/MAX ile ölçemiyorum',
  testSteps: ['Multimetrenin MIN/MAX kaydını açın.', 'Cihazın en çok güç çektiği anı çalıştırın.', 'Adaptör çıkışı ile cihaz girişindeki voltajı ayrı ayrı karşılaştırın.'],
})

Object.assign(data.nodes.support_load_isolation, {
  category: 'Sağlam Cihazla Karşılaştırma',
  title: 'Adaptör Sağlam Eş Cihazda Çalışıyor mu?',
  prompt: 'Adaptörü, aynı voltaj ve benzer akım isteyen sağlam bir cihazda deneyin. Voltaj sabit kalıyor ve cihaz normal çalışıyor mu?',
  yesLabel: 'Sağlam cihazda çalışıyor',
  noLabel: 'Sağlam cihazda da çöküyor',
  unknownLabel: 'Uygun eş cihaz yok',
  testSteps: ['İki cihazın voltajını, artı/eksi yönünü ve akım ihtiyacını karşılaştırın.', 'Adaptörü önce enerjisizken bağlayın.', 'Çalışırken voltajı ve ısınmayı gözleyin.'],
})

Object.assign(data.nodes.uvis_illumination_output_percent, {
  hint: 'Çıkış darbeli veya yanıp sönen tipteyse multimetre doğru değer göstermeyebilir. Böyle durumda segmentleri gözle karşılaştırın ve sağlam aydınlatma modülüyle deneyin.',
})
Object.assign(data.nodes.sliding_motor_output_ratio, {
  hint: 'Motor çıkışı darbeli veya frekans kontrollü ise standart multimetre yanıltıcı olabilir. Bu durumda kablo, soket, mekanik sıkışma ve bilgisayardaki hata kaydını önce kontrol edin.',
  testSteps: ['Enerjiyi kesin; motor kablosunda kopukluk, gevşek veya oksitli soket olup olmadığını kontrol edin.', 'Hareket alanını emniyete alın ve kapının elle rahat hareket edip etmediğini kontrol edin.', 'Üretici açıkça multimetreyle ölçüm noktası veriyorsa çıkışı yük altında ölçün.'],
  stopConditions: ['Hareket alanı emniyete alınmadı', 'Korumasız şebeke terminali var', 'Üretici standart multimetreyle ölçüme izin vermiyor'],
})

Object.assign(data.nodes.pbx_result_cabling, {
  title: 'RJ11 Ucu veya Telefon Kablosu Arızası',
  summary: 'Santral portu kısa bağlantıda çalışıyor. RJ11 ucu iyi çakılmamış, iki damardan biri kopmuş, yanlış çift bağlanmış, priz/klemens gevşemiş veya ek yeri oksitlenmiş olabilir.',
  components: ['RJ11 fişi ve orta iki uç', 'Telefon prizi, patch panel ve klemensler', 'İki damarlı telefon kablosu ve ek yerleri'],
  repair: 'Hattı parçalara ayırın; kopuk veya kısa devre olan bölümü bulun. Oksitli ekleri temizleyin, gevşek bağlantıları sıkın ve RJ11 ucunu doğru iki damarla yeniden çakın.',
  verification: 'Sağlam telefon sahadaki prizde çevir sesi vermeli, arama yapmalı ve her çağrıda çalmalıdır.',
})
Object.assign(data.nodes.cctv_result_cable, {
  title: 'RJ45 Ucu veya Ethernet Kablosu Arızası',
  summary: 'Kamera kısa sağlam kabloyla çalışıyor. Saha kablosunda damar kopması, RJ45 ucun kötü çakılması, yanlış renk sırası, gevşek patch panel veya oksitli ek olabilir.',
  components: ['İki uçtaki RJ45 fişler', 'Ethernet kablosunun sekiz damarı', 'Patch panel, keystone ve ek noktaları'],
  repair: 'Kabloyu iki uçtan ayırıp sürekliliği kontrol edin. Hatalı RJ45 uçlarını doğru renk sırasıyla yeniden çakın; oksitli veya gevşek ekleri yenileyin.',
  verification: 'Kamera saha kablosunda açılmalı; switch ağ ışığı sabit kalmalı ve bilgisayardan görüntü kesintisiz gelmelidir.',
})
Object.assign(data.nodes.access_result_rs485_bus, {
  title: 'Okuyucu Kablosu, A/B Yönü veya Klemens Arızası',
  summary: 'Okuyucu kısa sağlam kabloyla çalışıyor. Saha kablosu kopuk veya kısa devre olabilir; A/B uçları ters, klemens gevşek ya da bağlantı oksitli olabilir.',
  repair: 'Enerjiyi kesin. Kablo damarlarını uçtan uca ölçün, A/B bağlantısını şemaya göre düzeltin ve oksitli/gevşek klemensleri yenileyin.',
  verification: 'Okuyucu saha kablosunda her kartı okumalı ve olay bilgisayardaki kayda düşmelidir.',
})
Object.assign(data.nodes.ups_result_scope_required, {
  title: 'Röle Komutu veya Bağlantısı Belirsiz',
  summary: 'Röle çekme sesi duyulmuyor. Röle bobini, sürücü parçası, soket veya kontrol bağlantısı arızalı olabilir.',
  components: ['Röle bobini ve kontakları', 'Röle sürücü parçası', 'Soket, klemens ve lehimler'],
  repair: 'Enerjiyi kesin; röle bobinini ve kablo sürekliliğini multimetreyle kontrol edin. Bilgisayar servis ekranı varsa röle komutunun oluştuğunu doğrulayın.',
  verification: 'Komut verildiğinde röle bir kez çekmeli, kontak çıkışı değişmeli ve bağlantı ısınmamalıdır.',
})
Object.assign(data.nodes.barrier_result_scope_required, {
  title: 'Motor Komutu veya Röle Bağlantısı Belirsiz',
  summary: 'Motor komutu verildiği hâlde röle sesi duyulmuyor. Emniyet girişi, röle bobini, sürücü parçası veya bağlantı temassız olabilir.',
  components: ['Emniyet girişleri', 'Motor rölesi ve bobini', 'Klemens, soket ve lehimler'],
  repair: 'Bilgisayar veya kart ekranındaki emniyet durumlarını kontrol edin. Enerjiyi kestikten sonra röle bobini ve kablo sürekliliğini multimetreyle ölçün.',
  verification: 'Emniyet girişleri normalken aç/kapa komutunda röle çekmeli ve motor bağlantısına çıkış gelmelidir.',
})
Object.assign(data.nodes.barrier_result_remote_receiver, {
  title: 'Kumanda, Pil, Anten veya Alıcı Arızası',
  summary: 'Alıcı beslemesi var fakat kumandaya tepki yok. Kumanda pili bitmiş, kumanda tanıtması silinmiş, anten kopmuş veya alıcı kartı arızalı olabilir.',
  components: ['Kumanda pili', 'Anten kablosu ve lehimi', 'Kumanda alıcı kartı', 'Kumanda tanıtma ayarı'],
  repair: 'Yeni pil ve sağlam kumandayla deneyin. Anten kablosunda kopukluk ve lehim çatlağı olup olmadığını kontrol edin; gerekirse kumandayı yeniden tanıtın.',
  verification: 'Kumandaya her basıldığında alıcı ışığı yanmalı ve bariyer komutu güvenilir biçimde algılamalıdır.',
})
Object.assign(data.nodes.access_result_reader_bus, {
  title: 'Okuyucu Kablosu veya Okuyucu Arızası',
  summary: 'Okuyucuda besleme var ancak kart bilgisi kontrolöre ulaşmıyor. D0/D1 veya A/B kablosu kopuk, ters, kısa devre, gevşek ya da oksitli olabilir; okuyucu da arızalı olabilir.',
  components: ['Okuyucu veri kablosu', 'D0/D1 veya A/B klemensleri', 'Okuyucu ve kontrolör bağlantısı'],
  repair: 'Enerjiyi kesin; kablo damarlarını uçtan uca ölçün. Klemensleri temizleyip sıkın ve okuyucuyu kısa sağlam kabloyla kontrolör yanında deneyin.',
  verification: 'Kart okutulduğunda okuyucu tepki vermeli ve kart numarası bilgisayardaki olay kaydında görünmelidir.',
})
Object.assign(data.nodes.general_result_clock_fault, {
  title: 'Ana Kart Açılışı Başlamıyor',
  summary: '5V ve 3.3V normal olduğu hâlde kartta ışık, ekran, röle veya bilgisayar bağlantısı belirtisi yok. Ana işlemciyi başlatan kristal bölümü veya çevresindeki lehimler arızalı olabilir.',
  components: ['Kristal ve çevresindeki küçük kondansatörler', 'Ana işlemci besleme bağlantıları', 'Oksitli veya çatlak lehimler'],
  repair: 'Kristal ve çevresini oksit, kırık parça ve çatlak lehim açısından büyüteçle kontrol edin. Özel ölçüm gerektiren kart içi onarım için kart servisine yönlendirin.',
  verification: 'Onarım sonrası kart her açılışta ışık, ekran veya bilgisayar bağlantısı belirtisi vermelidir.',
})
Object.assign(data.nodes.general_result_memory_fault, {
  title: 'Cihaz Ayar Hafızası Okunamıyor',
  summary: 'Bilgisayar cihazı görüyor ancak model, sürüm veya ayar bilgilerini okuyamıyor. Hafıza entegresi, beslemesi veya lehim bağlantısı arızalı olabilir.',
  components: ['Ayar hafızası entegresi', 'Hafıza besleme hattı', 'Entegre lehimleri ve bağlantı yolları'],
  repair: 'Önce mevcut ayarların yedeğini koruyun. Entegre çevresinde oksit ve çatlak lehim kontrolü yapın; hafıza yazma işlemini yalnız doğru model dosyası varsa uygulayın.',
  verification: 'Bilgisayar servis programı cihaz bilgilerini her bağlantıda aynı ve hatasız okumalıdır.',
})
Object.assign(data.nodes.ups_result_output_filter, {
  title: 'Çıkışta Voltaj Düşmesi veya Dalgalanma',
  summary: 'Sorun hem şebeke hem akü çalışmasında görülüyor. Zayıf kondansatör, gevşek/oksitli klemens veya çatlak lehim voltajı bozuyor olabilir.',
  components: ['Çıkış kondansatörleri', 'Klemens ve yüksek akım kabloları', 'Röle ve güç kartı lehimleri'],
  repair: 'Şişmiş kondansatör, kararmış parça, oksitli klemens ve çatlak lehim kontrolü yapın. Çıkış voltajını multimetre MIN/MAX ile boşta ve yükte karşılaştırın.',
  verification: 'Yük bağlandığında çıkış voltajı belirgin düşmemeli ve UPS yeniden başlamamalıdır.',
})
Object.assign(data.nodes.general_result_capacitor, {
  title: 'Zayıf Kondansatör veya Besleme Düşmesi',
  summary: '5V/3.3V ortalama değeri normal görünse de açılışta voltaj düşüyor veya cihaz yeniden başlıyor. Zayıf kondansatör, adaptör ya da besleme bağlantısı buna sebep olabilir.',
  components: ['Şişmiş veya sızdırmış kondansatörler', 'Adaptör ve DC giriş bağlantısı', '5V/3.3V besleme bölümü', 'Çatlak lehim ve oksitli soketler'],
  repair: 'Önce sağlam adaptörle karşılaştırın. Şişmiş/sızdırmış kondansatörleri ve çatlak lehimleri kontrol edin; değişimde aynı kapasite, voltaj ve sıcaklık değerini kullanın.',
  verification: 'Cihaz soğuk ve sıcakken tek seferde açılmalı; multimetre MIN/MAX değerinde belirgin voltaj düşmesi görülmemelidir.',
})
Object.assign(data.nodes.general_result_firmware, {
  title: 'Cihaz Yazılımı veya Bağlı Parça Açılışı Engelliyor',
  summary: 'Temel beslemeler var ancak kart açılışı tamamlamıyor. Bozuk ayar/yazılım veya kısa devre yapan bağlı bir sensör, ekran ya da haberleşme modülü olabilir.',
  components: ['Cihaz ayarları ve doğru model yazılımı', 'Bağlı sensör, ekran ve haberleşme kabloları', 'Ana kart hafızası'],
  repair: 'Bağlı parçaları enerjisizken tek tek ayırıp yeniden deneyin. Yazılım veya ayar yüklemeden önce mevcut yedeği alın ve tam model/revizyon uyumunu doğrulayın.',
  verification: 'Kart tekrarlı açılışlarda normal başlamalı ve bağlı parçaları bilgisayar servis programında görmelidir.',
})
Object.assign(data.nodes.general_result_firmware_peripheral, {
  title: 'Bağlı Sensör, Röle veya Haberleşme Kablosu Sorunu',
  summary: 'Ana kart açılıyor. Sorun bağlı sensör, röle çıkışı, saha kablosu, soket veya cihaz ayarında olabilir.',
  components: ['Sensör ve saha kabloları', 'Röle çıkışları ve klemensler', 'Bilgisayar servis ayarları'],
  repair: 'Bağlı parçaları enerjisizken tek tek ayırın; kablo kopması, kısa devre, gevşek soket ve oksit kontrolü yapın. Bilgisayardaki hata kaydını not edin.',
  verification: 'Tüm girişler ve çıkışlar tek tek denendiğinde hata tekrarlanmamalıdır.',
})
Object.assign(data.nodes.general_result_thermal, {
  title: 'Isıya Bağlı Lehim veya Soket Temassızlığı',
  summary: 'Arıza cihaz ısınınca ya da soğukken değişiyor. Çatlak lehim, oksitli soket veya zayıflamış kondansatör olabilir.',
  components: ['Ağır parçaların ve soketlerin lehimleri', 'Şişmiş veya sızdırmış kondansatörler', 'Oksitli konnektör ve kablolar'],
  repair: 'Şüpheli bölgeyi büyüteçle kontrol edin. Oksitli soketi temizleyin, gevşek bağlantıyı yenileyin; rastgele ısıtma yapmak yerine görülen çatlak lehimi onarın.',
  verification: 'Cihaz hem soğukken hem ısındıktan sonra kesintisiz çalışmalıdır.',
})
Object.assign(data.nodes.support_result_ripple, {
  title: 'Adaptör Voltajı Dalgalı',
  summary: 'Adaptörün ortalama voltajı normal görünse de yük bindiğinde voltaj düşüyor veya parazit oluşuyor. Adaptör kondansatörü zayıf olabilir.',
  components: ['Adaptör çıkış kondansatörleri', 'DC kablo ve jak', 'Bağlı cihazın akım ihtiyacı'],
  repair: 'Aynı voltaj ve yeterli akımdaki sağlam adaptörle karşılaştırın. Sorun kaybolursa adaptörü değiştirin; DC jak ve kabloda temassızlık/ısınma kontrolü yapın.',
  verification: 'Cihaz en yüksek yükte çalışırken yeniden başlamamalı, parazit yapmamalı ve voltaj belirgin düşmemelidir.',
})
Object.assign(data.nodes.support_result_psu_weak, {
  title: 'Adaptör Yük Altında Zayıf Kalıyor',
  summary: 'Adaptör boşta normal voltaj gösteriyor ancak cihaz bağlanınca voltaj düşüyor. Adaptör zayıf, akım değeri yetersiz veya bağlı cihaz fazla akım çekiyor olabilir.',
  components: ['Adaptör', 'DC kablo ve jak', 'Bağlı cihaz'],
  repair: 'Aynı voltajda ve yeterli akımdaki sağlam adaptörle deneyin. Sağlam adaptör de çöküyorsa bağlı cihazda kısa devre veya aşırı akım arayın.',
  verification: 'Cihaz normal yükte çalışırken voltaj sabit kalmalı ve yeniden başlama olmamalıdır.',
})
Object.assign(data.nodes.fire_result_panel_logic, {
  title: 'Yangın Paneli Sürekli Yeniden Başlıyor',
  summary: 'Ana besleme normal ancak panel kararsız. 5V/3.3V besleme, zayıf kondansatör, gevşek soket veya ana kart arızası olabilir.',
  components: ['5V/3.3V besleme bölümü', 'Kondansatörler', 'Ana kart soketleri ve lehimleri'],
  repair: 'Panel yetkili biçimde devre dışıyken soket, oksit, şişmiş kondansatör ve çatlak lehim kontrolü yapın. 5V/3.3V değerini MIN/MAX ile izleyin.',
  verification: 'Panel en az 30 dakika yeniden başlamadan çalışmalı ve yeni sistem arızası göstermemelidir.',
})
Object.assign(data.nodes.fire_result_charger_high, {
  title: 'Akü Şarj Voltajı Çok Yüksek',
  summary: 'Panelin akü şarj voltajı model değerinin üzerinde. Şarj bölümü arızalıysa akü ısınabilir ve zarar görebilir.',
  components: ['Şarj bölümü', 'Akü bağlantıları', 'Şarj çıkış kondansatörleri'],
  repair: 'Aküyü uzun süre yüksek voltajda bırakmayın. Doğru model değerini kontrol edin ve şarj bölümünü yetkili kart servisine yönlendirin.',
  verification: 'Şarj voltajı üretici değerine dönmeli; akü ısınmamalı veya şişmemelidir.',
})
Object.assign(data.nodes.cctv_result_ir_driver, {
  title: 'Gece Görüş LED’i veya Işık Sensörü Arızası',
  summary: 'Karanlıkta gece görüş ışıkları yanmıyor. Işık sensörü, LED kartı, soket veya bağlantı kablosu arızalı olabilir.',
  components: ['Gece görüş LED kartı', 'Işık sensörü', 'LED kart soketi ve kablosu'],
  repair: 'Kamera camını kapatıp gece modunu deneyin. LED soketinde gevşeklik, oksit ve kablo kopması kontrolü yapın; sağlam LED modülüyle karşılaştırın.',
  verification: 'Karanlıkta LED’ler yanmalı ve görüntü gece moduna geçmelidir.',
})
Object.assign(data.nodes.sliding_result_control_card, {
  title: 'Kayar Kapı Motoru, Kablosu veya Kontrol Kartı Arızası',
  summary: 'Açma komutu geliyor ancak motor hareket etmiyor. Motor kablosu kopuk, soket gevşek/oksitli, kapı mekanik olarak sıkışmış veya kontrol kartı arızalı olabilir.',
  components: ['Motor kablosu ve soketi', 'Kapı rayı ve hareketli parçalar', 'Motor ve kontrol kartı çıkışı'],
  repair: 'Enerjiyi kesin; motor kablosunda kopukluk ve sokette oksit/gevşeklik kontrolü yapın. Kapının elle rahat hareket ettiğini doğrulayın; sonra bilgisayardaki hata kaydını inceleyin.',
  verification: 'Kapı aç/kapa komutunda takılmadan hareket etmeli ve güvenlik sensörleri çalışmalıdır.',
})
Object.assign(data.nodes.pbx_result_dtmf, {
  title: 'Telefon Tuşları veya Numara Ayarı Sorunu',
  summary: 'Çevir sesi var ancak bazı tuşlar algılanmıyor veya arama tamamlanmıyor. Telefon tuşları ya da santral numara/yetki ayarı sorunlu olabilir.',
  components: ['Analog telefon tuşları', 'Santral portu', 'Numara planı ve arama yetkisi'],
  repair: 'Sağlam telefonla tüm tuşları deneyin. Aynı sorun varsa bilgisayardan numara planı, tuş algılama modu ve arama yetkisini kontrol edin.',
  verification: '0-9, * ve # tuşları doğru algılanmalı; izinli numaralar aranabilmelidir.',
})
Object.assign(data.nodes.pbx_result_audio, {
  title: 'Ahize, Kablo veya Parazit Kaynaklı Ses Sorunu',
  summary: 'Arama kuruluyor fakat ses tek yönlü, zayıf, uğultulu veya parazitli. Ahize kablosu, telefon hattı, oksitli ek veya yakındaki güç kablosu sebep olabilir.',
  components: ['Ahize ve spiral kablo', 'RJ11 fişi ve telefon hattı', 'Oksitli ekler ve yakındaki güç kabloları'],
  repair: 'Sağlam ahize/telefonla deneyin. RJ11 uçlarını ve ekleri yenileyin; telefon kablosunu motor, floresan ve güç kablolarından uzaklaştırarak karşılaştırın.',
  verification: 'İki yönde ses temiz, dengeli, uğultusuz ve kesintisiz olmalıdır.',
})
Object.assign(data.nodes.pbx_result_trunk, {
  title: 'Dış Hat veya Yönlendirme Ayarı Sorunu',
  summary: 'Dahili aramalar çalışıyor ancak dış arama çalışmıyor. Operatör hattı, dış hat portu, SIP bağlantısı veya santral yönlendirme ayarı sorunlu olabilir.',
  components: ['Operatör dış hattı', 'Santral dış hat portu veya SIP hesabı', 'Gelen/giden arama yönlendirmesi'],
  repair: 'Bilgisayar yönetim ekranında dış hat durumunu ve hata kaydını kontrol edin. Operatör hattını ve yönlendirme ayarını ayrı ayrı deneyin.',
  verification: 'Gelen ve giden dış çağrılar kurulmalı ve iki yönde ses gelmelidir.',
})

delete data.nodes.general_result_need_scope
delete data.nodes.general_result_need_programmer

const plainFaultLabels = {
  battery_degraded: 'Akü zayıflamış veya bir hücresi bozulmuş olabilir',
  charger_fault: 'Akü şarj olmuyor; adaptör, kablo veya şarj bölümü arızalı olabilir',
  input_protection_fault: 'Giriş sigortası atmış, diyot yanmış veya girişte temassızlık olabilir',
  rail_short: '5V/3.3V besleme hattında kısa devre veya fazla akım çeken parça olabilir',
  capacitor_esr: 'Kondansatör zayıflamış; cihaz bu yüzden yeniden başlıyor olabilir',
  mosfet_short: 'Güç transistörü kısa devre olmuş olabilir',
  relay_driver: 'Röle bobini, sürücü parçası veya bağlantısı arızalı olabilir',
  motor_output: 'Motor çıkışı, kontaktör, kablo veya klemens arızalı olabilir',
  photo_sensor: 'Fotosel kirli, hizasız, kablosu kopuk veya bağlantısı temassız olabilir',
  remote_receiver: 'Kumanda pili, alıcı anteni veya kumanda tanıtma ayarı sorunlu olabilir',
  mcu_boot: 'Ana kart veya cihaz yazılımı açılmıyor olabilir',
  zone_loop_fault: 'Yangın hattında kablo kopması veya kısa devre olabilir',
  siren_output_fault: 'Siren sigortası, çıkışı, kablosu veya sirenin kendisi arızalı olabilir',
  panel_battery_fault: 'Yangın paneli aküsü zayıf veya şarj bağlantısı arızalı olabilir',
  poe_power_fault: 'PoE portu, enjektör, Ethernet kablosu veya kamera beslemesi arızalı olabilir',
  video_link_fault: 'RJ45/BNC kablosu, switch portu veya bağlantı ucu arızalı olabilir',
  ir_led_fault: 'Gece görüş LED’i, ışık sensörü veya bağlantısı arızalı olabilir',
  reader_bus_fault: 'Okuyucu veri kablosu kopuk, uçlar ters veya klemens temassız olabilir',
  lock_output_fault: 'Kilit rölesi, diyot, kablo veya kilit beslemesi arızalı olabilir',
  access_psu_sag: 'Adaptör yük bindiğinde voltaj düşürüyor veya bağlantısı temassız olabilir',
  uvis_control_power: 'UVIS bilgisayarı, kayıt cihazı, monitör veya güç kablosu arızalı olabilir',
  uvis_trigger_fault: 'Araç sensörü, fotosel veya tetik kablosu arızalı olabilir',
  uvis_network_fault: 'UVIS Ethernet kablosu, switch portu veya ağ ayarı sorunlu olabilir',
  uvis_software_fault: 'UVIS programı, kayıt ayarı veya bilgisayar servisi çalışmıyor olabilir',
  pbx_power_fault: 'Santral beslemesi, güç kablosu veya port kartı arızalı olabilir',
  pbx_line_fault: 'Telefon hattında voltaj yok; kablo, priz veya santral portu arızalı olabilir',
  pbx_port_fault: 'Santral telefon portu veya bağlı telefon arızalı olabilir',
  pbx_config_fault: 'Santral abone, dış hat veya yönlendirme ayarı yanlış olabilir',
  sliding_sensor_fault: 'Kapı radarı, fotosel, açma butonu veya kablosu arızalı olabilir',
  sliding_drive_fault: 'Kayar kapı motoru, sürücü kartı veya motor kablosu arızalı olabilir',
  sliding_mechanical_fault: 'Kapı rayında sıkışma, limit veya konum sensörü sorunu olabilir',
  support_psu_fault: 'Adaptör çıkışı yanlış, düşük veya tamamen yok olabilir',
  support_relay_fault: 'Röle, kontaktör veya normalde açık/kapalı kontak arızalı olabilir',
  general_visual_damage: 'Kartta yanık, oksit, sıvı izi veya çatlak lehim olabilir',
  general_regulator_fault: 'Kartın 5V/3.3V beslemesi düşük, yüksek veya kesik olabilir',
  general_clock_memory_fault: 'Ana kart açılmıyor; hafıza, kristal veya cihaz yazılımı sorunlu olabilir',
  battery_connection_fault: 'Akü klemensi, kablo pabucu veya seri bağlantı temassız olabilir',
  ups_overload: 'UPS kapasitesi aşılmış veya bağlı cihazda kısa devre olabilir',
  ups_transfer_fault: 'UPS şebekeden aküye geçemiyor; röle veya bağlantı arızalı olabilir',
  ups_inverter_fault: 'UPS aküden çıkış üretemiyor; güç kartı veya trafo arızalı olabilir',
  bluebus_fault: 'Bariyer güvenlik cihazı, kablosu veya tanıtma ayarı sorunlu olabilir',
  stop_input_fault: 'Acil durdurma girişi aktif, kablosu kopuk veya bağlantısı kararsız olabilir',
  barrier_encoder_fault: 'Bariyer konum sensörü, limit veya öğrenme ayarı sorunlu olabilir',
  barrier_mechanical_fault: 'Bariyer kolu, yay veya redüktör sıkışmış olabilir',
  barrier_mains_fault: 'Bariyer şebeke girişi, sigortası veya yardımcı beslemesi arızalı olabilir',
  fire_eol_mismatch: 'Yangın hattı sonu direnci yanlış, gevşek veya panel modeline uygun olmayabilir',
  fire_earth_fault: 'Yangın hattında kablo gövdeye/toprağa değiyor olabilir',
  fire_aux_overload: 'Panel yardımcı çıkışında kısa devre veya fazla yük olabilir',
  fire_field_device_fault: 'Dedektör, buton, siren veya saha bağlantısı arızalı olabilir',
  cctv_cable_fault: 'Ethernet/RJ45 kablosu kopuk, uç yanlış çakılmış veya ek yeri temassız olabilir',
  cctv_poe_budget_fault: 'PoE switch gücü kameraya yetmiyor olabilir',
  cctv_network_config: 'Kamera IP, ağ geçidi veya ağ ayarı yanlış olabilir',
  cctv_stream_fault: 'Kamera görüntü biçimi, cihaz yazılımı veya kayıt kanalı uyumsuz olabilir',
  cctv_image_optics: 'Kamera camı/lensi kirli, nemli veya gece ışığı yansıyor olabilir',
  cctv_storage_fault: 'Kayıt diski/SD kart dolu, bozuk veya yazma izni kapalı olabilir',
  access_psu_ripple: 'Adaptör voltajı dalgalanıyor; panel bu yüzden yeniden başlıyor olabilir',
  access_reader_power: 'Okuyucu besleme kablosu kopuk, eksi hattı temassız veya voltaj düşük olabilir',
  access_credential_config: 'Kart yetkisi, kart biçimi veya zaman ayarı yanlış olabilir',
  access_lock_mechanical: 'Kilit sıkışmış, kapı baskı yapıyor veya kabloda voltaj düşüyor olabilir',
  access_door_input_fault: 'Kapı kontağı, çıkış butonu veya acil açma kablosu arızalı olabilir',
  access_rs485_fault: 'RS485 A/B uçları ters, kablo kopuk, klemens gevşek veya adres yanlış olabilir',
  uvis_illumination_fault: 'UVIS aydınlatma çubuğu, kablosu veya sürücüsü arızalı olabilir',
  uvis_storage_fault: 'UVIS kayıt diski dolu, bozuk veya yazma izni kapalı olabilir',
  uvis_calibration_fault: 'UVIS kamera hizası veya görüntü birleştirme ayarı bozulmuş olabilir',
  pbx_cabling_fault: 'RJ11 ucu kötü çakılmış, telefon kablosu kopuk veya ek yeri oksitli olabilir',
  pbx_handset_fault: 'Telefon, ahize kablosu veya RJ11 soketi arızalı olabilir',
  pbx_ring_fault: 'Santral zil sinyali zayıf veya telefonun zil devresi arızalı olabilir',
  pbx_audio_fault: 'Ahize, telefon kablosu veya çevredeki elektriksel parazit sesi bozuyor olabilir',
  pbx_dtmf_fault: 'Telefon tuş sesi veya santral numara planı ayarı sorunlu olabilir',
  pbx_trunk_fault: 'Dış hat, operatör bağlantısı veya yönlendirme ayarı sorunlu olabilir',
  sliding_safety_fault: 'Kayar kapı güvenlik sensörü, kablosu veya ayarı arızalı olabilir',
  sliding_encoder_fault: 'Kayar kapı konum sensörü veya öğrenme ayarı bozulmuş olabilir',
  sliding_lock_fault: 'Kayar kapı kilidi, kablosu veya kilit durum girişi arızalı olabilir',
  sliding_battery_fault: 'Kayar kapı acil güç aküsü zayıf veya şarj olmuyor olabilir',
  support_psu_sag: 'Adaptör cihaz çalışırken voltaj düşürüyor olabilir',
  support_psu_ripple: 'Adaptör voltajı dalgalı; cihazı yeniden başlatıyor veya parazit yapıyor olabilir',
  support_connector_fault: 'DC jak, klemens, kablo veya lehim temassız/oksitli olabilir',
  support_load_short: 'Bağlı cihazda kısa devre veya fazla akım çekme olabilir',
  general_reset_fault: 'Besleme düşüyor veya kart sürekli yeniden başlıyor olabilir',
  general_clock_fault: 'Ana kartta açılışı başlatan bölüm arızalı olabilir',
  general_memory_fault: 'Cihaz ayarlarını tutan hafıza veya bağlantıları arızalı olabilir',
  general_firmware_fault: 'Cihaz yazılımı bozuk veya bağlı bir parça açılışı engelliyor olabilir',
  general_thermal_fault: 'Isınınca açılan lehim çatlağı, oksitli soket veya arızalı parça olabilir',
}
for (const [faultId, label] of Object.entries(plainFaultLabels)) {
  if (data.faultCatalog[faultId]) {
    data.faultCatalog[faultId].label = label
  }
}

function simplifyFieldText(value) {
  if (typeof value !== 'string') {
    return value
  }

  return value
    .replace(/PoE tester/giu, 'sağlam PoE portu ve kısa Ethernet kablosu')
    .replace(/RS-485 analizörü/giu, 'bilgisayar servis yazılımı')
    .replace(/diferansiyel prob/giu, 'sağlam kısa kablo')
    .replace(/osiloskop/giu, 'multimetre MIN/MAX kaydı')
    .replace(/oscilloscope/giu, 'multimetre MIN/MAX kaydı')
    .replace(/logic probe/giu, 'bilgisayar olay kaydı')
    .replace(/lojik prob/giu, 'bilgisayar olay kaydı')
    .replace(/programlayıcı/giu, 'bilgisayar servis yazılımı')
    .replace(/termal kamera/giu, 'görsel sıcaklık kontrolü')
    .replace(/elektronik yük/giu, 'sağlam eş cihaz')
    .replace(/\bSMPS\b/gu, 'güç kaynağı')
    .replace(/\bMOSFET\b/gu, 'güç transistörü')
    .replace(/\bVRLA\b/gu, 'kapalı tip kurşun akü')
    .replace(/\bFloat\b/gu, 'bekleme şarj')
    .replace(/\bboost\/cyclic\b/giu, 'hızlı/döngüsel')
    .replace(/\bself-test\b/giu, 'kendi kendine test')
    .replace(/\bPGOOD\b/gu, 'besleme hazır sinyali')
    .replace(/\bpull-up\b/giu, 'sinyal direnci')
    .replace(/\bgate\/base\b/giu, 'kontrol ucu')
    .replace(/\bSoC\b/gu, 'ana işlemci')
    .replace(/\bTVS\b/gu, 'koruma diyodu')
    .replace(/\btriac\b/giu, 'güç anahtarı')
    .replace(/\bBGA\/QFN\b/gu, 'büyük entegre')
    .replace(/\bPWM\/VFD\b/gu, 'motor sürücü')
    .replace(/\bDSP\b/gu, 'ses işleme devresi')
    .replace(/ESR yükselmiş/giu, 'zayıflamış')
    .replace(/ESR ölçümü yapın/giu, 'Şişmiş veya sızdırmış kondansatörleri kontrol edin')
    .replace(/ESR ile kontrol edin/giu, 'sağlam kondansatörle karşılaştırın')
    .replace(/ESR\/kapasite/giu, 'kondansatör durumu')
    .replace(/düşük ESR eşdeğerleriyle/giu, 'aynı özellikte yenileriyle')
    .replace(/\bESR\b/gu, 'kondansatör iç direnci')
    .replace(/deep discharge/giu, 'derin boşalma')
    .replace(/\bfeedback\b/giu, 'geri besleme')
    .replace(/\bclock\b/giu, 'saat sinyali')
    .replace(/\bdump\b/giu, 'yedek dosya')
    .replace(/\bverify\b/giu, 'doğrulama')
    .replace(/\bhot-ground\b/giu, 'şebeke tarafı eksi referansı')
    .replace(/ripple/giu, 'besleme dalgalanması')
    .replace(/transient/giu, 'ani voltaj değişimi')
    .replace(/brownout/giu, 'voltaj düşüp yeniden başlama')
    .replace(/MCU/gu, 'ana işlemci')
    .replace(/firmware/giu, 'cihaz yazılımı')
    .replace(/boot/giu, 'açılış')
    .replace(/FXS port/giu, 'santral analog telefon portu')
    .replace(/FXS/giu, 'analog telefon portu')
    .replace(/endpoint/giu, 'telefon cihazı')
    .replace(/stream/giu, 'canlı görüntü')
    .replace(/codec/giu, 'görüntü biçimi')
    .replace(/krimp/giu, 'uç çakımı')
    .replace(/terminasyon/giu, 'hat sonlandırma direnci')
    .replace(/polarite/giu, 'artı/eksi yönü')
    .replace(/\bREN\b/gu, 'telefon zil yükü')
    .replace(/\bDTMF\b/gu, 'tuş sesi (DTMF)')
    .replace(/\bEMI\b/gu, 'elektriksel parazit')
    .replace(/encoder/giu, 'konum sensörü')
    .replace(/enkoder/giu, 'konum sensörü')
    .replace(/konfigürasyon/giu, 'ayar')
    .replace(/regülasyon/giu, 'voltaj kararlılığı')
    .replace(/datasheet/giu, 'üretici teknik belgesi')
    .replace(/diferansiyel/giu, 'A-B arasındaki')
    .replace(/stitching/giu, 'görüntü birleştirme')
    .replace(/NO\/NC/giu, 'normalde açık/kapalı (NO/NC)')
    .replace(/multimetre MIN\/MAX kaydıla/giu, 'multimetrenin MIN/MAX kaydıyla')
    .replace(/ana işlemci[’']yu/giu, 'ana işlemciyi')
    .replace(/elektriksel parazit[’']lı/giu, 'elektriksel parazitli')
    .replace(/voltaj kararlılığıu/giu, 'voltaj kararlılığı')
    .replace(/besleme dalgalanması ve ani voltaj değişimi tepki/giu, 'besleme dalgalanması ve ani voltaj değişimini')
    .replace(/\s{2,}/gu, ' ')
    .trim()
}

const simpleScalarFields = ['category', 'title', 'prompt', 'hint', 'summary', 'repair', 'verification', 'yesLabel', 'noLabel', 'unknownLabel', 'powerState', 'probeBlack', 'probeRed', 'optionBadge']
for (const node of Object.values(data.nodes)) {
  node.toolLevel = 'field_basic'
  for (const field of simpleScalarFields) {
    node[field] = simplifyFieldText(node[field])
  }
  for (const field of ['components', 'testSteps', 'stopConditions']) {
    if (Array.isArray(node[field])) {
      node[field] = node[field].map(simplifyFieldText)
    }
  }
  if (Array.isArray(node.options)) {
    node.options = node.options.map((option) => ({
      ...option,
      label: simplifyFieldText(option.label),
      description: simplifyFieldText(option.description),
    }))
  }
  if (Array.isArray(node.rules)) {
    node.rules = node.rules.map((rule) => ({ ...rule, label: simplifyFieldText(rule.label) }))
  }
}
for (const fault of Object.values(data.faultCatalog)) {
  fault.label = simplifyFieldText(fault.label)
  fault.componentGroup = simplifyFieldText(fault.componentGroup)
}

const profileNames = Object.fromEntries(data.deviceProfiles.map((profile) => [profile.id, profile.name]))
for (const node of Object.values(data.nodes)) {
  node.category ||= profileNames[node.device] || 'Teknik Teşhis'
  node.sourceIds ||= []

  const sourceTypes = node.sourceIds.map((sourceId) => data.sourceCatalog[sourceId]?.sourceType).filter(Boolean)
  const level = sourceTypes.includes('manufacturer')
    ? 'manufacturer'
    : sourceTypes.includes('standards-body')
      ? 'standard'
      : sourceTypes.includes('engineering-guide')
        ? 'engineering'
        : 'heuristic'
  node.evidence = {
    level,
    reviewedAt: '2026-07-15',
    statement: level === 'heuristic'
      ? 'Bu kontrol genel servis tecrübesine dayanır. Önce kablo, soket, oksit ve beslemeyi kontrol edin; tek başına bu sonuca göre parça değiştirmeyin.'
      : 'Bu kontrol teknik kaynağa dayanır. Cihaz modeli farklıysa etiketi ve bağlantı şemasını da kontrol edin.',
  }

  if (node.type === 'measurement') {
    const modelSpecificMeasurements = new Set([
      'ups_charge_voltage', 'ups_inverter_output_voltage',
      'barrier_24v_input', 'barrier_logic_5v', 'barrier_motor_voltage_dc', 'barrier_motor_voltage_ac', 'barrier_receiver_5v',
      'fire_zone_resistance', 'fire_zone_resistance_22k', 'fire_zone_resistance_47k', 'fire_panel_24v', 'fire_battery_voltage', 'fire_siren_voltage',
      'cctv_supply_voltage', 'cctv_ir_voltage', 'cctv_loaded_supply_voltage',
      'access_adapter_loaded_voltage', 'access_reader_voltage_5v', 'access_reader_voltage_12v', 'access_lock_voltage',
      'uvis_camera_power_voltage', 'uvis_illumination_output_percent',
      'pbx_extension_voltage', 'pbx_ring_voltage',
      'sliding_aux_voltage', 'sliding_motor_output_ratio',
    ])
    node.thresholdPolicy = modelSpecificMeasurements.has(node.id)
      ? 'model_specific'
      : 'general_screening'
  }
}

const measurementNodes = Object.values(data.nodes).filter((node) => node.type === 'measurement')
data.researchAudit.coverage = {
  profileCount: data.deviceProfiles.length,
  nodeCount: Object.keys(data.nodes).length,
  faultCount: Object.keys(data.faultCatalog).length,
  sourceCount: Object.keys(data.sourceCatalog).length,
  measurementCount: measurementNodes.length,
  sourcedMeasurementCount: measurementNodes.filter((node) => node.sourceIds.length > 0).length,
  modelSpecificMeasurementCount: measurementNodes.filter((node) => node.thresholdPolicy === 'model_specific').length,
  heuristicNodeCount: Object.values(data.nodes).filter((node) => node.evidence.level === 'heuristic').length,
}

for (const profile of data.deviceProfiles) {
  profile.description = simplifyFieldText(profile.description)
  profile.sourceIds = profileSources[profile.id]
  profile.commonSymptoms = data.nodes[profile.startNodeId].options.map((option) => option.label)
  profile.priorModel = {
    type: 'heuristic_service_priority',
    calibrated: false,
    reviewedAt: '2026-07-15',
  }
  profile.faultPriors = Object.entries(priorScores[profile.id]).map(([faultId, probability]) => ({
    faultId,
    label: data.faultCatalog[faultId].label,
    probability,
    basis: simplifyFieldText(priorBasis[faultId] || 'Bu yalnız başlangıç servis önceliğidir; yapılan kontroller adayların sırasını değiştirir.'),
    weightType: 'heuristic_service_priority',
    evidenceLevel: 'low',
    calibrated: false,
    sourceIds: profile.sourceIds,
  }))
}

writeFileSync(dataUrl, `${JSON.stringify(data, null, 2)}\n`)
console.log(`Diagnostics expanded to ${Object.keys(data.nodes).length} nodes and ${Object.keys(data.faultCatalog).length} faults.`)
