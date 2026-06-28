/**
 * Lead.ma Chat Widget Bootstrap Script
 *
 * Usage:
 *   <script
 *     src="https://app.lead.ma/widget.js"
 *     data-org-id="YOUR_ORG_UUID"
 *     data-api-key="YOUR_WIDGET_KEY"
 *     data-primary="#4F46E5"
 *     data-position="bottom-right"
 *     async
 *   ></script>
 *
 * Production: This will be replaced with a bundled SDK that loads React and the widget component.
 * Development: The iframe approach below is a simple stub for testing.
 */

(function () {
  'use strict'

  // Get script element and attributes
  var script = document.currentScript
  if (!script) {
    console.warn('[Lead.ma] Could not find current script element')
    return
  }

  var orgId = script.getAttribute('data-org-id')
  var apiKey = script.getAttribute('data-api-key')
  var primary = script.getAttribute('data-primary') || '#4F46E5'
  var position = script.getAttribute('data-position') || 'bottom-right'
  var baseUrl = script.getAttribute('data-base-url') || 'https://app.lead.ma'

  if (!orgId) {
    console.warn('[Lead.ma] data-org-id is required')
    return
  }

  // Build iframe URL
  var iframeUrl = new URL(baseUrl + '/embed/chat')
  iframeUrl.searchParams.set('org', orgId)
  iframeUrl.searchParams.set('primary', primary)
  iframeUrl.searchParams.set('position', position)

  // Create and configure iframe
  var iframe = document.createElement('iframe')
  iframe.src = iframeUrl.toString()
  iframe.setAttribute('title', 'Lead.ma Chat Widget')
  iframe.setAttribute('allow', 'microphone')
  iframe.style.cssText =
    'position:fixed;' +
    (position === 'bottom-left' ? 'left:0;' : 'right:0;') +
    'bottom:0;' +
    'width:100%;' +
    'height:100%;' +
    'border:none;' +
    'z-index:99999;' +
    'font-family:system-ui,-apple-system,sans-serif;'

  // Message handler for widget-to-parent communication
  window.addEventListener('message', function (event) {
    // Only accept messages from our widget iframe
    if (event.source !== iframe.contentWindow) return

    var data = event.data
    if (!data || !data.type) return

    // Handle different widget events
    if (data.type === 'widget_qualified') {
      console.log('[Lead.ma] Lead qualified with score:', data.score)
      // Dispatch custom event for customer integration
      window.dispatchEvent(new CustomEvent('leadmaQualified', { detail: data }))
    } else if (data.type === 'widget_error') {
      console.error('[Lead.ma] Widget error:', data.error)
    }
  })

  // Inject iframe into page when DOM is ready
  if (document.body) {
    document.body.appendChild(iframe)
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      document.body.appendChild(iframe)
    })
  }

  console.log('[Lead.ma] Widget loaded for org:', orgId)
})()
