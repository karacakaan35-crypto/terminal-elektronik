import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

let fontFilesPromise

function formatDate(date = new Date()) {
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''

  for (let index = 0; index < bytes.length; index += 8192) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 8192))
  }

  return btoa(binary)
}

async function loadFontFiles() {
  if (!fontFilesPromise) {
    fontFilesPromise = Promise.all([
      fetch('/fonts/NotoSans-Regular.ttf').then((response) => {
        if (!response.ok) {
          throw new Error('PDF normal fontu yüklenemedi.')
        }
        return response.arrayBuffer()
      }),
      fetch('/fonts/NotoSans-Bold.ttf').then((response) => {
        if (!response.ok) {
          throw new Error('PDF kalın fontu yüklenemedi.')
        }
        return response.arrayBuffer()
      }),
    ])
  }

  return fontFilesPromise
}

async function registerFonts(doc) {
  const [regular, bold] = await loadFontFiles()
  doc.addFileToVFS('NotoSans-Regular.ttf', arrayBufferToBase64(regular))
  doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal')
  doc.addFileToVFS('NotoSans-Bold.ttf', arrayBufferToBase64(bold))
  doc.addFont('NotoSans-Bold.ttf', 'NotoSans', 'bold')
  doc.setFont('NotoSans', 'normal')
}

function drawPageChrome(doc, appName) {
  const pageCount = doc.getNumberOfPages()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    doc.setPage(pageNumber)
    doc.setFillColor(10, 13, 20)
    doc.rect(0, 0, pageWidth, 15, 'F')
    doc.setFont('NotoSans', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(255, 255, 255)
    doc.text(appName, 12, 9.5)
    doc.setFont('NotoSans', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(103, 232, 249)
    doc.text('SERVİS VE ARIZA TEŞHİS RAPORU', pageWidth - 12, 9.5, { align: 'right' })

    doc.setDrawColor(212, 212, 216)
    doc.line(12, pageHeight - 11, pageWidth - 12, pageHeight - 11)
    doc.setFontSize(7.5)
    doc.setTextColor(82, 82, 91)
    doc.text(`Oluşturulma: ${formatDate()}`, 12, pageHeight - 6)
    doc.text(`Sayfa ${pageNumber} / ${pageCount}`, pageWidth - 12, pageHeight - 6, { align: 'right' })
  }
}

export async function downloadServiceReport({ appName, selectedProfile, history, candidates, resultNode, notes }) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  await registerFonts(doc)
  doc.setProperties({
    title: `${appName} - Servis Raporu`,
    subject: selectedProfile?.name || 'Elektronik arıza teşhis raporu',
    author: appName,
    creator: appName,
  })

  const tableBase = {
    margin: { top: 22, left: 12, right: 12, bottom: 16 },
    styles: {
      font: 'NotoSans',
      fontStyle: 'normal',
      fontSize: 7.2,
      cellPadding: 1.6,
      overflow: 'linebreak',
      valign: 'middle',
      textColor: [39, 39, 42],
    },
    headStyles: {
      font: 'NotoSans',
      fontStyle: 'bold',
      textColor: [255, 255, 255],
      fillColor: [15, 118, 110],
    },
    alternateRowStyles: { fillColor: [244, 244, 245] },
    rowPageBreak: 'avoid',
    showHead: 'everyPage',
  }
  const resultRows = [
    ['Teşhis', resultNode?.summary || 'Teşhis tamamlanmadı.'],
    ['Kontrol Edilecekler', resultNode?.components?.join(', ') || '-'],
    ['Onarım Önerisi', resultNode?.repair || '-'],
    ['Doğrulama', resultNode?.verification || '-'],
  ]

  if (notes?.trim()) {
    resultRows.push(['Teknisyen Notu', notes.trim()])
  }

  autoTable(doc, {
    ...tableBase,
    startY: 22,
    head: [['Rapor Bilgisi', 'Değer', 'Rapor Bilgisi', 'Değer']],
    body: [
      ['Tarih', formatDate(), 'Cihaz Profili', selectedProfile?.name || '-'],
      ['Test Sayısı', `${history.length}`, 'En Güçlü Aday', candidates[0]?.label || '-'],
      ['Sonuç', resultNode?.title || 'Teşhis tamamlanmadı', 'Güven', `%${candidates[0]?.probability || 0}`],
    ],
    columnStyles: {
      0: { cellWidth: 32, fontStyle: 'bold' },
      1: { cellWidth: 72 },
      2: { cellWidth: 32, fontStyle: 'bold' },
      3: { cellWidth: 137 },
    },
  })

  autoTable(doc, {
    ...tableBase,
    startY: doc.lastAutoTable.finalY + 4,
    head: [['Nihai Değerlendirme', 'Açıklama']],
    body: resultRows,
    headStyles: { ...tableBase.headStyles, fillColor: [190, 24, 93] },
    columnStyles: {
      0: { cellWidth: 42, fontStyle: 'bold' },
      1: { cellWidth: 231 },
    },
  })

  autoTable(doc, {
    ...tableBase,
    startY: doc.lastAutoTable.finalY + 4,
    head: [['#', 'Teşhis Adımı', 'Ölçüm / Cevap', 'Teknik Yorum', 'Saat']],
    body: history.length > 0
      ? history.map((entry, index) => [
          String(index + 1),
          entry.title,
          entry.answer,
          entry.interpretation || '-',
          entry.time || '-',
        ])
      : [['-', 'Henüz işlem kaydı yok', '-', '-', '-']],
    headStyles: { ...tableBase.headStyles, fillColor: [22, 163, 74] },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 65 },
      2: { cellWidth: 56 },
      3: { cellWidth: 125 },
      4: { cellWidth: 19 },
    },
  })

  autoTable(doc, {
    ...tableBase,
    startY: doc.lastAutoTable.finalY + 4,
    head: [['İlk 3 Başlangıç Oranı', 'Ön Tanı', 'Saha Gerekçesi']],
    body: (selectedProfile?.faultPriors || []).slice(0, 3).map((prior) => [
      `%${prior.probability}`,
      prior.label,
      prior.basis || '-',
    ]),
    headStyles: { ...tableBase.headStyles, fillColor: [8, 145, 178] },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 104 },
      2: { cellWidth: 141 },
    },
  })

  autoTable(doc, {
    ...tableBase,
    startY: doc.lastAutoTable.finalY + 4,
    head: [['Canlı Olasılık', 'Muhtemel Arıza', 'Komponent Grubu', 'Risk']],
    body: candidates.slice(0, 4).map((candidate) => [
      `%${candidate.probability}`,
      candidate.label,
      candidate.componentGroup,
      candidate.risk === 'critical' ? 'Kritik' : candidate.risk === 'warning' ? 'Uyarı' : 'Bilgi',
    ]),
    headStyles: { ...tableBase.headStyles, fillColor: [217, 119, 6] },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 136 },
      2: { cellWidth: 82 },
      3: { cellWidth: 27 },
    },
  })

  drawPageChrome(doc, appName)
  doc.save(`terminal-elektronik-servis-raporu-${new Date().toISOString().slice(0, 10)}.pdf`)
}
