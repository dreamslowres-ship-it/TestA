/**
 * GIF1.js - Módulo de exportación a GIF (VERSIÓN 100% OFFLINE)
 * * Uso: window.procesarGIF(datos, callback, config)
 * datos: { frames: [strings], width: número, height: número, fps: número }
 * callback: (exito: boolean) => void
 * config: { escala: número, aspectRatio: 'square' | 'free' }
 */

window.procesarGIF = async function(datos, callback, config) {
    try {
        // --- VALIDACIÓN DE DATOS ---
        if (!datos || !datos.frames || !Array.isArray(datos.frames) || datos.frames.length === 0) {
            throw new Error('Los datos no contienen frames válidos.');
        }
        if (!datos.width || !datos.height || !datos.fps) {
            throw new Error('Faltan dimensiones o FPS en los datos.');
        }

        // --- VERIFICACIÓN DE LIBRERÍA LOCAL ---
        // Ahora comprobamos que el script js/gif.js se haya cargado correctamente desde el HTML
        if (typeof window.GIF === 'undefined') {
            throw new Error('La librería local GIF no está cargada. Revisa tu index.html.');
        }

        // --- CONFIGURACIÓN ---
        const escala = config.escala || 4;
        const aspectRatio = config.aspectRatio || 'square';

        const fontSize = 16 * escala;
        const lineHeight = fontSize * 1.15;
        const charWidth = fontSize * 0.6; // Ancho aproximado por carácter (monoespaciado)

        // Dimensiones del contenido ASCII
        const contentW = datos.width * charWidth;
        const contentH = datos.height * lineHeight;

        // Calcular dimensiones finales del lienzo (con margen)
        const margen = 20 * escala;
        let canvasW, canvasH;
        if (aspectRatio === 'square') {
            const maxDim = Math.max(contentW, contentH);
            canvasW = canvasH = maxDim + margen;
        } else {
            canvasW = contentW + margen;
            canvasH = contentH + margen;
        }

        // --- CREAR LIENZO ---
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = Math.round(canvasW);
        canvas.height = Math.round(canvasH);

        // --- INICIALIZAR GIF (100% OFFLINE) ---
        // Apuntamos directamente al Worker físico en nuestra carpeta js/
        const gif = new window.GIF({
            workers: 2,
            quality: 10,
            width: canvas.width,
            height: canvas.height,
            workerScript: 'js/gif.worker.js' 
        });

        // --- CENTRADO DEL TEXTO ---
        const offsetX = (canvas.width - contentW) / 2;
        const offsetY = (canvas.height - contentH) / 2;

        // --- DIBUJAR CADA FRAME ---
        datos.frames.forEach((frameText) => {
            // Fondo oscuro para el GIF
            ctx.fillStyle = '#050505';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Estilo del texto ASCII
            ctx.font = `bold ${fontSize}px monospace`;
            ctx.fillStyle = '#dddddd';
            ctx.textBaseline = 'top';

            const lines = frameText.split('\n');
            lines.forEach((line, i) => {
                ctx.fillText(line, offsetX, offsetY + (i * lineHeight));
            });

            const delay = Math.round(1000 / datos.fps);
            gif.addFrame(ctx, { copy: true, delay });
        });

        // --- GENERAR Y DESCARGAR ---
        gif.on('finished', (blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bittex_${Date.now()}.gif`;
            a.click();
            
            // Liberar memoria después de un tiempo
            setTimeout(() => URL.revokeObjectURL(url), 5000);
            callback(true);
        });

        gif.on('progress', (p) => {
            // Opcional: podrías actualizar una barra de progreso visible en el futuro
            console.log(`Progreso GIF: ${Math.round(p * 100)}%`);
        });

        // Arrancar el motor de compresión
        gif.render();

    } catch (error) {
        console.error('Error en procesarGIF:', error);
        if (callback) callback(false);
    }
};
