-- ============================================================
--  Sistema de Tickets de Soporte
--  database.sql
--  Ejecutar con: mysql -u root -p < database.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS ticket_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ticket_db;

-- ============================================================
--  TABLA: users
-- ============================================================
CREATE TABLE users (
  id            INT          NOT NULL AUTO_INCREMENT,
  name          VARCHAR(150) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('user','support') NOT NULL DEFAULT 'user',
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- ============================================================
--  TABLA: categories
-- ============================================================
CREATE TABLE categories (
  id          INT          NOT NULL AUTO_INCREMENT,
  name        VARCHAR(100) NOT NULL,
  description VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (id)
);

-- ============================================================
--  TABLA: tickets
-- ============================================================
CREATE TABLE tickets (
  id          INT  NOT NULL AUTO_INCREMENT,
  user_id     INT  NOT NULL,
  category_id INT  NOT NULL,
  assigned_to INT  DEFAULT NULL,
  title       VARCHAR(255) NOT NULL,
  description TEXT         NOT NULL,
  priority    ENUM('low','medium','high')                       NOT NULL DEFAULT 'medium',
  status      ENUM('pending','in_progress','resolved','closed') NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_tickets_user
    FOREIGN KEY (user_id)     REFERENCES users(id)      ON DELETE CASCADE,
  CONSTRAINT fk_tickets_category
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  CONSTRAINT fk_tickets_support
    FOREIGN KEY (assigned_to) REFERENCES users(id)      ON DELETE SET NULL
);

-- ============================================================
--  TABLA: messages
-- ============================================================
CREATE TABLE messages (
  id         INT  NOT NULL AUTO_INCREMENT,
  ticket_id  INT  NOT NULL,
  user_id    INT  NOT NULL,
  content    TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_messages_ticket
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  CONSTRAINT fk_messages_user
    FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE
);

-- ============================================================
--  INDICES (mejoran rendimiento)
-- ============================================================
CREATE INDEX idx_tickets_user_id     ON tickets  (user_id);
CREATE INDEX idx_tickets_assigned_to ON tickets  (assigned_to);
CREATE INDEX idx_tickets_status      ON tickets  (status);
CREATE INDEX idx_messages_ticket_id  ON messages (ticket_id);

-- ============================================================
--  TRIGGER
-- ============================================================
DELIMITER $$

CREATE TRIGGER trg_ticket_assign_status
BEFORE UPDATE ON tickets
FOR EACH ROW
BEGIN
  IF NEW.assigned_to IS NOT NULL
     AND OLD.assigned_to IS NULL
     AND NEW.status = 'pending'
  THEN
    SET NEW.status = 'in_progress';
  END IF;
END$$

-- ============================================================
--  STORED PROCEDURES
-- ============================================================

CREATE PROCEDURE sp_get_tickets_by_user(IN p_user_id INT)
BEGIN
  SELECT
    t.id, t.title, t.priority, t.status,
    t.created_at, c.name AS category_name
  FROM tickets t
  JOIN categories c ON t.category_id = c.id
  WHERE t.user_id = p_user_id
  ORDER BY t.created_at DESC;
END$$

CREATE PROCEDURE sp_create_ticket(
  IN p_user_id INT,
  IN p_category_id INT,
  IN p_title VARCHAR(255),
  IN p_description TEXT,
  IN p_priority VARCHAR(10)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error al crear el ticket';
  END;

  START TRANSACTION;
    INSERT INTO tickets (user_id, category_id, title, description, priority)
    VALUES (p_user_id, p_category_id, p_title, p_description, p_priority);
  COMMIT;
END$$

DELIMITER ;

-- ============================================================
--  DATOS DE PRUEBA
-- ============================================================

INSERT INTO categories (name, description) VALUES
  ('Soporte tecnico', 'Errores o fallas del sistema'),
  ('Facturacion',     'Problemas con pagos o cobros'),
  ('Acceso y cuenta', 'Problemas para iniciar sesion'),
  ('Consulta general','Preguntas sobre el servicio'),
  ('Otro',            'Cualquier otro tipo de problema');

INSERT INTO users (name, email, password_hash, role) VALUES
  ('Juan Perez',   'juan@mail.com',      '$2b$10$hashUsuario1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'user'),
  ('Maria Lopez',  'maria@mail.com',     '$2b$10$hashUsuario2xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'user'),
  ('Ana Soporte',  'ana@soporte.com',    '$2b$10$hashSoporte1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'support'),
  ('Carlos Admin', 'carlos@soporte.com', '$2b$10$hashSoporte2xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'support');

INSERT INTO tickets (user_id, category_id, assigned_to, title, description, priority, status) VALUES
  (1, 1, NULL,
   'No funciona la app',
   'La aplicacion se cierra sola cada vez que intento subir una foto.',
   'high', 'pending'),
  (1, 3, 3,
   'No puedo iniciar sesion',
   'Cambie la contrasena dos veces y sigue sin funcionar.',
   'high', 'in_progress'),
  (2, 2, 4,
   'Cobro duplicado en abril',
   'Me debitaron el servicio dos veces en el mismo mes.',
   'medium', 'resolved'),
  (2, 4, 3,
   'Consulta sobre planes',
   'Cuales son los planes disponibles?',
   'low', 'closed');

INSERT INTO messages (ticket_id, user_id, content) VALUES
  (1, 1, 'La app se cierra sola cuando intento subir fotos.'),
  (1, 3, 'Ya estamos revisando tu caso. Que version tenes?'),
  (1, 1, 'Android 14, version 3.2.1.'),
  (2, 1, 'Intente recuperar la contrasena y sigue sin dejarme entrar.'),
  (2, 3, 'Encontramos el problema. Restablecemos tu acceso, proba ahora.'),
  (2, 1, 'Funciono! Muchas gracias.'),
  (3, 2, 'Me debitaron dos veces el mismo mes.'),
  (3, 4, 'Confirmamos el cobro duplicado. El reembolso se acredita en 3-5 dias.'),
  (3, 2, 'Muchas gracias por la rapidez.');

-- ============================================================
--  FIN DEL SCRIPT
-- ============================================================