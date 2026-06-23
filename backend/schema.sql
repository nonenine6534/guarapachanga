-- MySQL Schema para La Guarapachanga
-- Crear base de datos:
-- CREATE DATABASE la_guarapachanga CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE la_guarapachanga;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  pass VARCHAR(255) NOT NULL,
  dir VARCHAR(255) DEFAULT '',
  phone VARCHAR(20) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  cat VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  old_price DECIMAL(10,2) DEFAULT 0,
  img VARCHAR(500) DEFAULT '',
  section VARCHAR(50) DEFAULT 'destacados',
  stock INT DEFAULT 0,
  descripcion TEXT DEFAULT '',
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  qty INT NOT NULL DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_product (user_id, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insertar productos iniciales
INSERT INTO products (id, name, cat, price, old_price, img, section, stock, descripcion) VALUES
(1, 'Manzana Roja x kg', 'Frutas & Verduras', 2.99, 3.99, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=300&fit=crop', 'frutas', 50, 'Manzanas rojas frescas importadas. Ricas en fibra y vitaminas. Perfectas para jugos y postres.'),
(2, 'Leche Entera 1L', 'Lácteos', 1.25, 0, 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop', 'destacados', 100, 'Leche entera pasteurizada de la mejor calidad. Fuente de calcio y proteínas.'),
(3, 'Pan Integral x 500g', 'Panadería', 2.50, 0, 'https://images.unsplash.com/photo-1549931319-a5457534615e?w=400&h=300&fit=crop', 'destacados', 30, 'Pan integral elaborado con harina de trigo 100% integral. Alto contenido de fibra.'),
(4, 'Huevos x 12', 'Lácteos', 3.40, 0, 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=300&fit=crop', 'destacados', 60, 'Huevos frescos de gallinas criadas en libertad. Ricos en proteínas y omega 3.'),
(5, 'Pollo Entero x kg', 'Carnes & Aves', 5.90, 7.50, 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop', 'destacados', 25, 'Pollo entero fresco de corral. Crianza natural, libre de hormonas.'),
(6, 'Banana x kg', 'Frutas & Verduras', 1.80, 0, 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400&h=300&fit=crop', 'frutas', 80, 'Plátanos/fruta bomba maduros y dulces. Ideal para postres y batidos.'),
(7, 'Tomate x kg', 'Frutas & Verduras', 2.20, 0, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop', 'frutas', 70, 'Tomates pera frescos cultivados en invernadero. Perfectos para ensaladas y salsas.'),
(8, 'Lechuga', 'Frutas & Verduras', 1.10, 0, 'https://images.unsplash.com/photo-1556801712-76c8eb07bbc9?w=400&h=300&fit=crop', 'frutas', 45, 'Lechuga americana fresca y crujiente. Ideal para ensaladas y hamburguesas.'),
(9, 'Naranja x kg', 'Frutas & Verduras', 2.10, 0, 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400&h=300&fit=crop', 'frutas', 90, 'Naranjas jugosas recién cosechadas. Alto contenido de vitamina C.'),
(10, 'Cebolla x kg', 'Frutas & Verduras', 1.50, 0, 'https://images.unsplash.com/photo-1508747703725-71997763a514?w=400&h=300&fit=crop', 'frutas', 65, 'Cebolla blanca seleccionada. Sabor intenso ideal para guisos y ensaladas.'),
(11, 'Arroz 1kg', 'Despensa', 1.85, 0, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop', 'destacados', 120, 'Arroz blanco de grano largo. Producto nacional de primera calidad.'),
(12, 'Aceite Oliva 500ml', 'Despensa', 4.95, 0, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=300&fit=crop', 'destacados', 40, 'Aceite de oliva virgen extra. Importado de España. Ideal para ensaladas y cocina.'),
(13, 'Yogur Natural x 4', 'Lácteos', 2.30, 0, 'https://images.unsplash.com/photo-1564485377539-4af72e1f393f?w=400&h=300&fit=crop', 'destacados', 55, 'Yogur natural cremoso sin azúcar añadida. Probióticos naturales.'),
(14, 'Queso Fresco 200g', 'Lácteos', 2.75, 0, 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=300&fit=crop', 'destacados', 35, 'Queso blanco fresco elaborado artesanalmente. Suave y cremoso.'),
(15, 'Agua Mineral 1.5L', 'Bebidas', 0.95, 0, 'https://images.unsplash.com/photo-1560789494-2f1b78c8d0b0?w=400&h=300&fit=crop', 'destacados', 200, 'Agua mineral natural de manantial. Pura y libre de sodio.'),
(16, 'Jugo de Naranja 1L', 'Bebidas', 2.40, 0, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop', 'destacados', 60, 'Jugo de naranja natural pasteurizado. Sin azúcares añadidos.'),
(17, 'Papel Higiénico x 6', 'Limpieza', 3.80, 0, 'https://images.unsplash.com/photo-1585232002126-6ba4c4e1a14f?w=400&h=300&fit=crop', 'destacados', 90, 'Papel higiénico suave de 3 capas. Pack ahorro de 6 unidades.'),
(18, 'Detergente 750ml', 'Limpieza', 2.95, 0, 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=400&h=300&fit=crop', 'destacados', 45, 'Detergente líquido concentrado. Elimina manchas difíciles. Fragancia fresca.'),
(19, 'Carne Molida x kg', 'Carnes & Aves', 8.50, 0, 'https://images.unsplash.com/photo-1602470520428-deb49cc7ff0b?w=400&h=300&fit=crop', 'destacados', 30, 'Carne de res molida fresca. 90% carne magra. Ideal para hamburguesas y pasta.'),
(20, 'Pescado Fresco x kg', 'Carnes & Aves', 7.20, 9.00, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop', 'destacados', 20, 'Pescado fresco de captura del día. Rico en omega 3 y proteínas.'),
(21, 'Galletas x 200g', 'Snacks', 1.60, 0, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop', 'destacados', 75, 'Galletas de avena con chispas de chocolate. Horneadas artesanalmente.'),
(22, 'Papas Fritas x 150g', 'Snacks', 2.10, 0, 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=300&fit=crop', 'destacados', 85, 'Papas fritas crujientes sabor original. Bolsa resellable.'),
(23, 'Café Molido 250g', 'Despensa', 3.50, 0, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop', 'destacados', 50, 'Café arábica molido 100% puro. Tostado medio. Aroma y sabor intenso.'),
(24, 'Fideos x 500g', 'Despensa', 1.30, 0, 'https://images.unsplash.com/photo-1556760544-74068565f05c?w=400&h=300&fit=crop', 'destacados', 110, 'Fideos de sémola de trigo. Cocción rápida 8 minutos. Ideal para sopas y pastas.');
