const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::product.product', ({ strapi }) => ({
  /**
   * Sync product data from Medusa
   */
  async syncFromMedusa(medusaProduct) {
    try {
      // Check if product already exists
      const existingProduct = await strapi.documents('api::product.product').findFirst({
        filters: { medusa_id: medusaProduct.id },
      });

      const productData = {
        title: medusaProduct.title,
        description: medusaProduct.description,
        medusa_id: medusaProduct.id,
        handle: medusaProduct.handle,
        status: medusaProduct.status,
        weight: medusaProduct.weight,
        length: medusaProduct.length,
        height: medusaProduct.height,
        width: medusaProduct.width,
        origin_country: medusaProduct.origin_country,
        material: medusaProduct.material,
        metadata: medusaProduct.metadata,
      };

      if (existingProduct) {
        // Update existing product
        return await strapi.documents('api::product.product').update({
          documentId: existingProduct.documentId,
          data: productData,
        });
      } else {
        // Create new product
        return await strapi.documents('api::product.product').create({
          data: productData,
        });
      }
    } catch (error) {
      strapi.log.error('Error syncing product from Medusa:', error);
      throw error;
    }
  },

  /**
   * Sync product to Medusa
   */
  async syncToMedusa(productData) {
    try {
      const medusaBackendUrl = process.env.MEDUSA_BACKEND_URL;
      if (!medusaBackendUrl) {
        throw new Error('MEDUSA_BACKEND_URL environment variable is not set');
      }

      // Transform Strapi product data to Medusa format
      const medusaProductData = {
        title: productData.title,
        description: productData.description,
        handle: productData.handle,
        status: productData.status,
        weight: productData.weight,
        length: productData.length,
        height: productData.height,
        width: productData.width,
        origin_country: productData.origin_country,
        material: productData.material,
        metadata: productData.metadata,
      };

      // Note: This would require Medusa API authentication
      // Implementation depends on your Medusa setup
      strapi.log.info('Product data ready for Medusa sync:', medusaProductData);
      
      return medusaProductData;
    } catch (error) {
      strapi.log.error('Error syncing product to Medusa:', error);
      throw error;
    }
  },
}));