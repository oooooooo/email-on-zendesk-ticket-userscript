// ==UserScript==
// @name        Email on Zendesk ticket for Userscript
// @namespace   Violentmonkey Scripts
// @match       https://*.zendesk.com/*
// @grant       none
// @version     1.0
// @author      oooooooo
// @downloadURL https://raw.githubusercontent.com/oooooooo//email-on-zendesk-ticket-userscript/main.js
// @homepageURL https://github.com/oooooooo/email-on-zendesk-ticket-userscript
// @description Name -> Name <email>
// ==/UserScript==
(() => {
  'use strict'

  const delay = 2000
  const maxTry = 10

  let exTicketId = 0

  const showEmail = (json) => {
    const emails = {}
    for (const user of json['users']) {
      emails[user['name']] = user['email']
    }

    for (const strong of document.getElementsByTagName('strong')) {
      const email = emails[strong.innerText]
      if (email !== undefined) {
        strong.innerText = `${strong.innerText} <${email}>`
      }
    }
  }

  const main = () => {
    const uri = document.location
    if (uri.href.match(/\/agent\/tickets\/\d+$/) === null) {
      return false
    }
    const ticketId = uri.href.split('/').pop()
    exTicketId = ticketId

    const conversationsUrl = `https://${uri.host}/api/lotus/tickets/${ticketId}/conversations.json?include=users`
    fetch(conversationsUrl)
      .then((response) => response.json())
      .then((json) => showEmail(json))
      .catch((error) => console.error(error))
  }

  window.addEventListener('mouseup', () => {
    let count = 0

    const uriWait = setTimeout(() => {
      const ticketId = document.location.href.split('/').pop()
      if (exTicketId !== ticketId) {
        clearTimeout(uriWait)
        main()
      }

      count++
      if (count > maxTry) {
        clearTimeout(uriWait)
      }
    }, delay)
  })

  const domWait = setTimeout(() => {
    let count = 0

    if (document.getElementsByTagName('strong').length > 0) {
      clearTimeout(domWait)
      main()
    }

    count++
    if (count > maxTry) {
      clearTimeout(domWait)
    }
  }, delay)
})()
