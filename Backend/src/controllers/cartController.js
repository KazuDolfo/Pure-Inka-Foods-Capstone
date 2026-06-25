const cartRepository = require('../repositories/cartRepository');
const productRepository = require('../repositories/productRepository');
const asyncHandler = require('express-async-handler');

const syncCart = asyncHandler(async (req, res) => {
  const { localCart } = req.body;
  const userId = req.user.id_usuario;

  if (localCart && Array.isArray(localCart)) {
    const id_carrito = await cartRepository.getOrCreateCart(userId);
    for (const item of localCart) {
      if (item.id_producto && item.cantidad) {
        await cartRepository.addItem(id_carrito, item.id_producto, item.cantidad);
      }
    }
  }

  const items = await cartRepository.getItems(userId);
  res.json({ success: true, data: items });
});

const getCart = asyncHandler(async (req, res) => {
  const userId = req.user.id_usuario;
  const items = await cartRepository.getItems(userId);

  res.json({
    success: true,
    data: items,
  });
});

const addToCart = asyncHandler(async (req, res) => {
  const { id_producto, cantidad } = req.body;
  const userId = req.user.id_usuario;

  if (!id_producto || !cantidad) {
    res.status(400);
    throw new Error('Producto y cantidad son requeridos');
  }

  const id_carrito = await cartRepository.getOrCreateCart(userId);

  const product = await productRepository.findById(id_producto);
  if (!product) {
    res.status(404);
    throw new Error('Producto no encontrado');
  }

  if (product.stock_actual < cantidad) {
    res.status(400);
    throw new Error('Stock insuficiente');
  }

  await cartRepository.addItem(id_carrito, id_producto, cantidad);

  res.json({
    success: true,
    message: 'Carrito actualizado',
  });
});

const removeFromCart = asyncHandler(async (req, res) => {
  const userId = req.user.id_usuario;
  const { id_producto } = req.params;

  await cartRepository.removeItem(userId, id_producto);

  res.json({
    success: true,
    message: 'Producto eliminado del carrito',
  });
});

const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user.id_usuario;

  await cartRepository.clear(userId);

  res.json({
    success: true,
    message: 'Carrito vaciado correctamente',
  });
});

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  syncCart
};
