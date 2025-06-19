const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::medusa-webhook.medusa-webhook', ({ strapi }) => ({
  /**
   * Handle webhook events from Medusa
   */
  async handleWebhook(ctx) {
    try {
      const { event, data } = ctx.request.body;
      
      strapi.log.info(`Received Medusa webhook: ${event}`);

      switch (event) {
        case 'product.created':
        case 'product.updated':
          await this.handleProductEvent(data);
          break;
          
        case 'product_collection.created':
        case 'product_collection.updated':
          await this.handleCollectionEvent(data);
          break;
          
        case 'product_category.created':
        case 'product_category.updated':
          await this.handleCategoryEvent(data);
          break;
          
        default:
          strapi.log.info(`Unhandled webhook event: ${event}`);
      }

      ctx.send({ success: true });
    } catch (error) {
      strapi.log.error('Webhook processing error:', error);
      ctx.badRequest('Webhook processing failed');
    }
  },

  /**
   * Handle product events
   */
  async handleProductEvent(productData) {
    try {
      await strapi.service('api::product.product').syncFromMedusa(productData);
      strapi.log.info(`Product ${productData.id} synced successfully`);
    } catch (error) {
      strapi.log.error('Product sync error:', error);
      throw error;
    }
  },

  /**
   * Handle collection events
   */
  async handleCollectionEvent(collectionData) {
    try {
      const existingCollection = await strapi.documents('api::collection.collection').findFirst({
        filters: { medusa_id: collectionData.id },
      });

      const collectionPayload = {
        title: collectionData.title,
        handle: collectionData.handle,
        medusa_id: collectionData.id,
        metadata: collectionData.metadata,
      };

      if (existingCollection) {
        await strapi.documents('api::collection.collection').update({
          documentId: existingCollection.documentId,
          data: collectionPayload,
        });
      } else {
        await strapi.documents('api::collection.collection').create({
          data: collectionPayload,
        });
      }

      strapi.log.info(`Collection ${collectionData.id} synced successfully`);
    } catch (error) {
      strapi.log.error('Collection sync error:', error);
      throw error;
    }
  },

  /**
   * Handle category events
   */
  async handleCategoryEvent(categoryData) {
    try {
      const existingCategory = await strapi.documents('api::category.category').findFirst({
        filters: { medusa_id: categoryData.id },
      });

      const categoryPayload = {
        name: categoryData.name,
        handle: categoryData.handle,
        medusa_id: categoryData.id,
        metadata: categoryData.metadata,
      };

      if (existingCategory) {
        await strapi.documents('api::category.category').update({
          documentId: existingCategory.documentId,
          data: categoryPayload,
        });
      } else {
        await strapi.documents('api::category.category').create({
          data: categoryPayload,
        });
      }

      strapi.log.info(`Category ${categoryData.id} synced successfully`);
    } catch (error) {
      strapi.log.error('Category sync error:', error);
      throw error;
    }
  },
}));