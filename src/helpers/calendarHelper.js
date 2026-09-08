/**
 * Calendar Helper Functions
 * Utility functions for date manipulation and formatting in calendar views
 */

/**
 * Format a date object or string to ISO format (YYYY-MM-DD)
 * @param {Date|string} date - Date to format
 * @returns {string|null} ISO formatted date string or null
 */
export function formatDateToISO(date) {
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date
  }
  
  if (date instanceof Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  return null
}

/**
 * Safely parse a date string to a Date object
 * @param {string} dateString - Date string to parse
 * @returns {Date|null} Parsed Date object or null
 */
export function parseDateSafe(dateString) {
  if (!dateString) return null
  
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day)
  }
  
  return new Date(dateString)
}

/**
 * Get today's date in ISO format
 * @returns {string} Today's date in YYYY-MM-DD format
 */
export function getTodayISO() {
  const today = new Date()
  return formatDateToISO(today)
}

/**
 * Get the start and end dates of a week containing the given date
 * @param {Date} date - Reference date
 * @returns {Object} Object with startDate and endDate
 */
export function getWeekBounds(date) {
  const day = date.getDay()
  const startDate = new Date(date)
  startDate.setDate(date.getDate() - day)
  
  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 6)
  
  return { startDate, endDate }
}

/**
 * Get all days in a week starting from Sunday
 * @param {Date} date - Reference date
 * @returns {Array} Array of date objects for each day in the week
 */
export function getWeekDays(date) {
  const { startDate } = getWeekBounds(date)
  const days = []
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(startDate)
    day.setDate(startDate.getDate() + i)
    days.push(day)
  }
  
  return days
}

/**
 * Get calendar days for month view (including overflow from adjacent months)
 * @param {Date} date - Reference date
 * @returns {Array} Array of day objects with metadata
 */
export function getMonthCalendarDays(date) {
  const year = date.getFullYear()
  const month = date.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)

  const startingDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const days = []
  const todayISO = getTodayISO()

  // Previous month days
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const dayNumber = prevMonthLastDay - i
    const dateObj = new Date(year, month - 1, dayNumber)
    const dateISO = formatDateToISO(dateObj)
    days.push({
      dayNumber,
      date: dateISO,
      dateObj,
      isCurrentMonth: false,
      isToday: dateISO === todayISO,
    })
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const dateObj = new Date(year, month, i)
    const dateISO = formatDateToISO(dateObj)

    days.push({
      dayNumber: i,
      date: dateISO,
      dateObj,
      isCurrentMonth: true,
      isToday: dateISO === todayISO,
    })
  }

  // Next month days (fill to 42 cells - 6 weeks)
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    const dateObj = new Date(year, month + 1, i)
    const dateISO = formatDateToISO(dateObj)
    days.push({
      dayNumber: i,
      date: dateISO,
      dateObj,
      isCurrentMonth: false,
      isToday: dateISO === todayISO,
    })
  }

  return days
}

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type ('full', 'short', 'time')
 * @returns {string} Formatted date string
 */
export function formatEventDate(date, format = 'full') {
  if (!date) return ''
  
  const dateObj = parseDateSafe(date)
  if (!dateObj) return String(date)
  
  const options = {
    full: {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    },
    short: {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    },
    time: {
      hour: '2-digit',
      minute: '2-digit'
    }
  }
  
  return dateObj.toLocaleDateString('en-US', options[format] || options.full)
}

/**
 * Get time slots for day/week view
 * @param {number} startHour - Starting hour (0-23)
 * @param {number} endHour - Ending hour (0-23)
 * @param {number} interval - Interval in minutes
 * @returns {Array} Array of time slot strings
 */
export function getTimeSlots(startHour = 0, endHour = 23, interval = 60) {
  const slots = []
  
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const hourStr = String(hour).padStart(2, '0')
      const minuteStr = String(minute).padStart(2, '0')
      const time = `${hourStr}:${minuteStr}`
      
      // Format for display (12-hour format)
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
      const ampm = hour < 12 ? 'AM' : 'PM'
      const display = `${displayHour}:${minuteStr} ${ampm}`
      
      slots.push({ time, display })
    }
  }
  
  return slots
}

/**
 * Check if two dates are the same day
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {boolean} True if same day
 */
export function isSameDay(date1, date2) {
  const d1 = formatDateToISO(date1)
  const d2 = formatDateToISO(date2)
  return d1 === d2
}

/**
 * Check if date is in range
 * @param {Date|string} date - Date to check
 * @param {Date|string} startDate - Range start
 * @param {Date|string} endDate - Range end
 * @returns {boolean} True if date is in range
 */
export function isDateInRange(date, startDate, endDate) {
  const d = parseDateSafe(date)
  const start = parseDateSafe(startDate)
  const end = parseDateSafe(endDate)
  
  if (!d || !start || !end) return false
  
  return d >= start && d <= end
}

/**
 * Get week number of the year
 * @param {Date} date - Reference date
 * @returns {number} Week number
 */
export function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}

/**
 * Get month name
 * @param {Date} date - Reference date
 * @param {string} format - 'long' or 'short'
 * @returns {string} Month name
 */
export function getMonthName(date, format = 'long') {
  return date.toLocaleDateString('en-US', { month: format })
}

/**
 * Get year
 * @param {Date} date - Reference date
 * @returns {number} Year
 */
export function getYear(date) {
  return date.getFullYear()
}

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Format date for calendar display (YYYY-MM-DD) without timezone issues
 * @param {string|Date} dateString - Date to format
 * @returns {string|null} Formatted date or null
 */
export function formatDateForCalendar(dateString) {
  if (!dateString) return null
  // If already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString
  }
  // Otherwise parse and format
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return null
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Format date for display without timezone shift (DD-MMM-YYYY)
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date or 'N/A'
 */
export function formatDateDisplay(dateString) {
  if (!dateString) return 'N/A'

  try {
    // Handle YYYY-MM-DD format directly without timezone conversion
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-')
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      return `${day}-${monthNames[parseInt(month) - 1]}-${year}`
    }

    // Fallback for other date formats
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'N/A'
    
    const day = String(date.getDate()).padStart(2, '0')
    const month = date.toLocaleString('en-GB', { month: 'short' })
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
  } catch (error) {
    console.warn('Error formatting date:', error)
    return 'N/A'
  }
}