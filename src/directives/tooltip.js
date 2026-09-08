export const tooltip = {
  mounted(el, binding) {
    if (!binding.value) return

    const position = Object.keys(binding.modifiers)[0] || 'top'

    const tooltipEl = document.createElement('div')
    tooltipEl.textContent = binding.value
    tooltipEl.className = 'tooltip-custom'
    tooltipEl.style.cssText = `
      position: fixed;
      z-index: 9999;
      background-color: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 14px;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
      white-space: nowrap;
    `

    // Add arrow
    const arrow = document.createElement('div')
    arrow.style.cssText = `
      position: absolute;
      width: 0;
      height: 0;
      border-style: solid;
    `
    tooltipEl.appendChild(arrow)

    el._tooltipEl = tooltipEl
    el._tooltipArrow = arrow
    el._tooltipPosition = position

    const repositionTooltip = () => {
      if (!tooltipEl.parentNode) return

      const rect = el.getBoundingClientRect()
      const tooltipRect = tooltipEl.getBoundingClientRect()

      // Check if element is visible in viewport
      if (rect.width === 0 || rect.height === 0) {
        tooltipEl.style.opacity = '0'
        return
      }

      let top, left

      switch (position) {
        case 'bottom':
          left = rect.left + rect.width / 2 - tooltipRect.width / 2
          top = rect.bottom + 8
          break
        case 'left':
          left = rect.left - tooltipRect.width - 8
          top = rect.top + rect.height / 2 - tooltipRect.height / 2
          break
        case 'right':
          left = rect.right + 8
          top = rect.top + rect.height / 2 - tooltipRect.height / 2
          break
        default: // top
          left = rect.left + rect.width / 2 - tooltipRect.width / 2
          top = rect.top - tooltipRect.height - 8
      }

      // Ensure tooltip stays within viewport
      const padding = 8
      left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding))
      top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding))

      tooltipEl.style.left = `${left}px`
      tooltipEl.style.top = `${top}px`
    }

    const updateArrowPosition = () => {
      const arrowBase = `
        position: absolute;
        width: 0;
        height: 0;
        border-style: solid;
      `

      switch (position) {
        case 'bottom':
          arrow.style.cssText = arrowBase + `
            border-width: 0 5px 5px 5px;
            border-color: transparent transparent rgba(0, 0, 0, 0.9) transparent;
            top: -5px;
            left: 50%;
            transform: translateX(-50%);
          `
          break
        case 'left':
          arrow.style.cssText = arrowBase + `
            border-width: 5px 0 5px 5px;
            border-color: transparent transparent transparent rgba(0, 0, 0, 0.9);
            right: -5px;
            top: 50%;
            transform: translateY(-50%);
          `
          break
        case 'right':
          arrow.style.cssText = arrowBase + `
            border-width: 5px 5px 5px 0;
            border-color: transparent rgba(0, 0, 0, 0.9) transparent transparent;
            left: -5px;
            top: 50%;
            transform: translateY(-50%);
          `
          break
        default: // top
          arrow.style.cssText = arrowBase + `
            border-width: 5px 5px 0 5px;
            border-color: rgba(0, 0, 0, 0.9) transparent transparent transparent;
            bottom: -5px;
            left: 50%;
            transform: translateX(-50%);
          `
      }
    }

    const showTooltip = () => {
      document.body.appendChild(tooltipEl)
      updateArrowPosition()
      repositionTooltip()

      setTimeout(() => {
        tooltipEl.style.opacity = '1'
      }, 10)

      // Add scroll listener to reposition tooltip - listen on window and all parent scroll containers
      window.addEventListener('scroll', repositionTooltip, true)
      
      // Also add a resize listener
      window.addEventListener('resize', repositionTooltip)
    }

    const hideTooltip = () => {
      tooltipEl.style.opacity = '0'
      window.removeEventListener('scroll', repositionTooltip, true)
      window.removeEventListener('resize', repositionTooltip)
      setTimeout(() => {
        if (tooltipEl.parentNode) {
          document.body.removeChild(tooltipEl)
        }
      }, 200)
    }

    el.addEventListener('mouseenter', showTooltip)
    el.addEventListener('mouseleave', hideTooltip)
    el.addEventListener('click', hideTooltip)

    el._tooltipShowFn = showTooltip
    el._tooltipHideFn = hideTooltip
    el._tooltipRepositionFn = repositionTooltip
  },

  updated(el, binding) {
    if (el._tooltipEl) {
      const textNode = el._tooltipEl.firstChild
      if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        textNode.textContent = binding.value || ''
      }
    }
  },

  unmounted(el) {
    if (el._tooltipEl && el._tooltipEl.parentNode) {
      document.body.removeChild(el._tooltipEl)
    }
    if (el._tooltipShowFn) {
      el.removeEventListener('mouseenter', el._tooltipShowFn)
    }
    if (el._tooltipHideFn) {
      el.removeEventListener('mouseleave', el._tooltipHideFn)
      el.removeEventListener('click', el._tooltipHideFn)
    }
    if (el._tooltipRepositionFn) {
      window.removeEventListener('scroll', el._tooltipRepositionFn, true)
      window.removeEventListener('resize', el._tooltipRepositionFn)
    }
  }
}