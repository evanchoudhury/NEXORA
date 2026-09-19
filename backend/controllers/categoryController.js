const productService = require('../services/productService');
const { query } = require('../config/insforge');

const getCategories = async (req, res, next) => {
  try {
    const categories = await productService.getCategories();
    res.status(200).json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, imageUrl, icon } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Category name is required.' }
      });
    }

    const finalSlug = (slug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const result = await query(
      `INSERT INTO categories (name, slug, description, image_url, icon)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, finalSlug, description || null, imageUrl || null, icon || null]
    );

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: { category: result.rows[0] }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory
};
