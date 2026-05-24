-- Restablece niveles realistas (ejecutar si la BD quedó con todo en Critico)
USE smartdrain;

UPDATE sensores SET nivel_agua = 18, flujo = 1.85, bateria = 98, estado = 'Normal' WHERE id = 's1';
UPDATE sensores SET nivel_agua = 44, flujo = 1.35, bateria = 76, estado = 'Normal' WHERE id = 's2';
UPDATE sensores SET nivel_agua = 31, flujo = 1.62, bateria = 88, estado = 'Normal' WHERE id = 's3';
UPDATE sensores SET nivel_agua = 11, flujo = 1.98, bateria = 95, estado = 'Normal' WHERE id = 's4';
UPDATE sensores SET nivel_agua = 14, flujo = 1.92, bateria = 92, estado = 'Normal' WHERE id = 's5';
UPDATE sensores SET nivel_agua = 24, flujo = 1.72, bateria = 84, estado = 'Normal' WHERE id = 's6';
UPDATE sensores SET nivel_agua = 33, flujo = 1.55, bateria = 81, estado = 'Normal' WHERE id = 's7';
UPDATE sensores SET nivel_agua = 39, flujo = 1.42, bateria = 99, estado = 'Normal' WHERE id = 's8';
