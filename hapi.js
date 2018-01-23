'use strict'
 
const hapi = require('hapi')
const crypto = require('crypto')
 
// Set the server to launch on localhost:3000
const server = hapi.server({ host: 'localhost', port: 3000 })

// Replace with your Xero Webhook Key
const xero_webhook_key = 'XERO_WEBHOOK_KEY'
 
// Create a route to receive Xero webhook requests
// NOTE: Config is set to not parse the request payload (body), this is required as we need to generate our signature from the body as it was received (raw)
server.route({
  method: 'POST',
  path: '/webhook',
  config: {
    payload: { parse: false }
  },
  handler: function (request, h) {

    // Grab the body & signature
    const body = request.payload.toString()
    const signature = request.headers['x-xero-signature']
    
    console.log("Body: "+body)
    console.log("Xero Signature: "+signature)

    // Create our HMAC hash of the body, using our webhooks key
    // Note: You need to explicitly set utf8 input encoding
    let hmac = crypto.createHmac("sha256", xero_webhook_key).update(body, 'utf8').digest("base64");
    console.log("Resp Signature: "+hmac)

    // Create response (without a body)
    const response = h.response()
    
    // Now set the response code, based on whether the signature matched our hmac hash
    if (signature == hmac) {
      response.code(200)
    } else {
      response.code(401)
    }

    return response    
  }
})
 
server.start(function (err) {
  if (err) {
    throw err
  }
 
  console.log('Server started on port 3000')
})
