CREATE TABLE IF NOT EXISTS `publicacion_usuario_like` (
  `usuarioId` varchar(36) NOT NULL,
  `publicacionId` varchar(36) NOT NULL,
  `fechaCreacion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`usuarioId`, `publicacionId`),
  KEY `IDX_like_usuario` (`usuarioId`),
  KEY `IDX_like_publicacion` (`publicacionId`),
  CONSTRAINT `FK_like_usuario` FOREIGN KEY (`usuarioId`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_like_publicacion` FOREIGN KEY (`publicacionId`) REFERENCES `publicacion` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
