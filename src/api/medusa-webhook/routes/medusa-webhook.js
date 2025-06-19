module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/medusa-webhook',
      handler: 'medusa-webhook.handleWebhook',
      config: {
        auth: false, // Disable authentication for webhook
        policies: [], // Add custom policies if needed
      },
    },
  ],
};