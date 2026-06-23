const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'data', 'store.db');
let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initTables();
    seedProducts();
  }
  return db;
}

function initTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      pass TEXT NOT NULL,
      dir TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      cat TEXT NOT NULL,
      price REAL NOT NULL,
      old_price REAL DEFAULT 0,
      img TEXT DEFAULT '',
      section TEXT DEFAULT 'destacados',
      stock INTEGER DEFAULT 0,
      descripcion TEXT DEFAULT '',
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      qty INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE(user_id, product_id)
    );
  `);
}

function seedProducts() {
  const count = db.prepare('SELECT COUNT(*) as c FROM products').get();
  if (count.c > 0) return;

  const insert = db.prepare(`
    INSERT INTO products (id, name, cat, price, old_price, img, section, stock, descripcion)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const products = [
    [1, 'Cerveza Corona x 6', 'Cervezas', 8.50, 10.00, 'https://placehold.co/400x300/f39c12/white?text=Corona', 'destacados', 40, 'Cerveza Corona extra fría. Pack de 6 botellas de 355ml. Importada de México.'],
    [2, 'Cerveza Heineken x 6', 'Cervezas', 9.00, 11.00, 'https://placehold.co/400x300/f39c12/white?text=Heineken', 'destacados', 35, 'Heineken lager premium. Pack 6 latas de 330ml. Cerveza holandesa.'],
    [3, 'Cerveza Nacional x 6', 'Cervezas', 4.50, 5.50, 'https://placehold.co/400x300/f39c12/white?text=Nacional', 'destacados', 60, 'Cerveza nacional cubana. Pack de 6 botellas de 330ml. Fresca y ligera.'],
    [4, 'Cerveza Artesanal IPA', 'Cervezas', 3.50, 0, 'https://placehold.co/400x300/f39c12/white?text=IPA', 'destacados', 25, 'Cerveza artesanal estilo IPA. Amarga y aromática. Botella de 500ml.'],
    [5, 'Cerveza Bucanero x 6', 'Cervezas', 5.00, 6.50, 'https://placehold.co/400x300/f39c12/white?text=Bucanero', 'destacados', 50, 'Bucanero cerveza cubana. Pack 6 botellas de 330ml. Sabor intenso.'],
    [6, 'Cerveza Sin Alcohol x 6', 'Cervezas', 4.00, 0, 'https://placehold.co/400x300/f39c12/white?text=Sin+Alcohol', 'destacados', 20, 'Cerveza sin alcohol. Pack 6 latas de 330ml. Ideal para conductores.'],
    [7, 'Costillas de Cerdo BBQ', 'Carnes a la Brasa', 12.50, 15.00, 'https://placehold.co/400x300/e74c3c/white?text=Costillas+BBQ', 'destacados', 15, 'Costillas de cerdo ahumadas con salsa BBQ casera. Porción para 2 personas.'],
    [8, 'Pollo a la Brasa 1/2', 'Carnes a la Brasa', 8.00, 10.00, 'https://placehold.co/400x300/e74c3c/white?text=Pollo+Brasa', 'destacados', 20, 'Medio pollo a la brasa con adobo secreto. Acompañado de yuca y ensalada.'],
    [9, 'Filete de Res a la Parilla', 'Carnes a la Brasa', 15.00, 0, 'https://placehold.co/400x300/e74c3c/white?text=Filete+Res', 'destacados', 12, 'Filete de res angus a la parilla. Término a elegir. Incluye papas fritas.'],
    [10, 'Choripán Argentino', 'Carnes a la Brasa', 5.50, 7.00, 'https://placehold.co/400x300/e74c3c/white?text=Choripan', 'destacados', 25, 'Chorizo parrillero en pan artesanal con chimichurri y salsa criolla.'],
    [11, 'Brocheta de Camarones', 'Carnes a la Brasa', 7.50, 0, 'https://placehold.co/400x300/e74c3c/white?text=Camarones', 'destacados', 18, 'Brocheta de camarones salteados con vegetales. Porción de 4 unidades.'],
    [12, 'Pulpo a la Gallega', 'Carnes a la Brasa', 11.00, 0, 'https://placehold.co/400x300/e74c3c/white?text=Pulpo', 'destacados', 10, 'Pulpo cocido a la parilla con pimentón y aceite de oliva. Plato tradicional.'],
    [13, 'Tazón de Maní Salado', 'Snacks & Tapas', 2.00, 0, 'https://placehold.co/400x300/2ecc71/white?text=Mani', 'menu', 80, 'Maní salado tostado. Perfecto para acompañar tu cerveza.'],
    [14, 'Papas Fritas con Queso', 'Snacks & Tapas', 4.50, 5.50, 'https://placehold.co/400x300/2ecc71/white?text=Papas+Queso', 'menu', 40, 'Papas fritas crujientes bañadas en queso cheddar derretido y bacon.'],
    [15, 'Alitas de Pollo BBQ', 'Snacks & Tapas', 6.00, 8.00, 'https://placehold.co/400x300/2ecc71/white?text=Alitas+BBQ', 'menu', 30, 'Alitas de pollo bañadas en salsa BBQ ahumada. Porción de 8 unidades.'],
    [16, 'Nachos con Guacamole', 'Snacks & Tapas', 5.00, 0, 'https://placehold.co/400x300/2ecc71/white?text=Nachos', 'menu', 35, 'Nachos crujientes con guacamole fresco, crema agria y pico de gallo.'],
    [17, 'Tabla de Quesos y Embutidos', 'Snacks & Tapas', 10.00, 0, 'https://placehold.co/400x300/2ecc71/white?text=Quesos', 'menu', 15, 'Selección de quesos finos y embutidos con frutas y frutos secos.'],
    [18, 'Tostones con Mojo', 'Snacks & Tapas', 3.50, 0, 'https://placehold.co/400x300/2ecc71/white?text=Tostones', 'menu', 50, 'Tostones de plátano verde crujientes con mojo de ajo y limón.'],
    [19, 'Ron Havana Club 7 Años', 'Licores', 25.00, 30.00, 'https://placehold.co/400x300/9b59b6/white?text=Havana+7', 'destacados', 20, 'Ron Havana Club 7 años. Botella de 750ml. Suave y añejo.'],
    [20, 'Vodka Absolut 750ml', 'Licores', 22.00, 0, 'https://placehold.co/400x300/9b59b6/white?text=Absolut', 'destacados', 15, 'Vodka Absolut original. Botella de 750ml. Destilado sueco premium.'],
    [21, 'Whisky Johnnie Walker Red', 'Licores', 30.00, 35.00, 'https://placehold.co/400x300/9b59b6/white?text=JW+Red', 'destacados', 12, 'Whisky escocés Johnnie Walker Red Label. Botella de 750ml.'],
    [22, 'Gin Tonic Preparado', 'Cócteles', 6.00, 0, 'https://placehold.co/400x300/3498db/white?text=Gin+Tonic', 'destacados', 30, 'Gin tonic preparado con ginebra premium, tónica Schweppes y rodaja de limón.'],
    [23, 'Mojito Cubano', 'Cócteles', 5.00, 6.50, 'https://placehold.co/400x300/3498db/white?text=Mojito', 'destacados', 40, 'Mojito cubano clásico con hierbabuena, lima y ron Havana Club.'],
    [24, 'Piña Colada', 'Cócteles', 6.50, 0, 'https://placehold.co/400x300/3498db/white?text=Pina+Colada', 'destacados', 25, 'Piña colada cremosa con ron, crema de coco y jugo de piña natural.'],
    [25, 'Cerveza Parranda x 12', 'Cervezas', 15.00, 20.00, 'https://placehold.co/400x300/f39c12/white?text=Parranda', 'destacados', 30, 'Cerveza Parranda. Pack de 12 botellas. ¡La favorita de la fiesta!'],
    [26, 'Parrillada para 2', 'Carnes a la Brasa', 24.00, 30.00, 'https://placehold.co/400x300/e74c3c/white?text=Parrillada', 'destacados', 10, 'Parrillada completa para 2 personas: carne, pollo, chorizo, costillas y acompañantes.'],
  ];

  const tx = db.transaction(() => {
    for (const p of products) {
      insert.run(...p);
    }
  });
  tx();
}

module.exports = { getDb };
