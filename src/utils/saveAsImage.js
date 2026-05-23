import html2canvas from 'html2canvas'

/**
 * Generates a formatted date string in yyyyMMdd format
 * @returns {string} Date string like 20260523
 */
function getFormattedDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

/**
 * Captures a DOM element and downloads it as a JPG image
 * @param {HTMLElement} element - The element to capture
 * @param {string} filename - The base filename (without extension)
 * @returns {Promise<void>}
 */
export async function saveElementAsImage(element, filename = 'xirr') {
  if (!element) {
    console.error('Element not found for capture')
    return
  }

  try {
    // Capture the element as canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher DPI for better quality
      backgroundColor: '#ffffff',
      allowTaint: true,
      useCORS: true,
      logging: false,
    })

    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const dateStr = getFormattedDate()
      link.href = url
      link.download = `${filename}-${dateStr}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, 'image/jpeg', 0.95)
  } catch (error) {
    console.error('Error capturing image:', error)
    alert('Failed to save image. Please try again.')
  }
}
