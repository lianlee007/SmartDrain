/**
 * Redimensiona y comprime imágenes del cliente antes de subirlas.
 * Convierte a JPEG en base64 para adjuntar en reportes sin exceder límites del API.
 */
const MAX_ANCHO = 960;
const CALIDAD = 0.72;

/**
 * Lee un File, escala al ancho máximo y devuelve data URL JPEG.
 * Rechaza archivos no imagen o mayores a 8 MB.
 */
export function comprimirImagen(archivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!archivo.type.startsWith('image/')) {
      reject(new Error('Selecciona un archivo de imagen válido.'));
      return;
    }
    if (archivo.size > 8 * 1024 * 1024) {
      reject(new Error('La imagen no puede superar 8 MB.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Formato de imagen no soportado.'));
      img.onload = () => {
        const escala = Math.min(1, MAX_ANCHO / img.width);
        const ancho = Math.round(img.width * escala);
        const alto = Math.round(img.height * escala);
        const canvas = document.createElement('canvas');
        canvas.width = ancho;
        canvas.height = alto;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo procesar la imagen.'));
          return;
        }
        ctx.drawImage(img, 0, 0, ancho, alto);
        resolve(canvas.toDataURL('image/jpeg', CALIDAD));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(archivo);
  });
}
