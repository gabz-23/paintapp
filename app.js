const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const tools = {
    pencil: 'pencil',
    eraser: 'eraser',
    fill: 'fill',
    picker: 'picker',
    square: 'square',
    circle: 'circle',
};

let history = [];

let startX, startY;
let lastX = 0;
let lastY = 0;
let imageData;

let isDrawing = false;

const $canvas = $('#canvas');
const ctx = $canvas.getContext('2d', { willReadFrequently: true });
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, $canvas.width, $canvas.height);

// Botones
const $pencilBtn = $('#pencil');
const $eraserBtn = $('#eraser');
const $cleanBtn = $('#clear-canvas');
const $colorPicker = $('#color-picker');
const $saveImage = $('#save-image');

$canvas.addEventListener('mousedown', startDrawing);
$canvas.addEventListener('mousemove', draw);

// Detener dibujo al soltar el click
$canvas.addEventListener('mouseup', () => (isDrawing = false));

// Seleccionar color
$canvas.addEventListener('click', (e) => currentTool === tools.picker && picker(e));

// Limpiar canvas
$cleanBtn.addEventListener('click', () => ctx.clearRect(0, 0, $canvas.width, $canvas.height));

// Cambiar herramienta
let currentTool = null;

$$('.tool').forEach((tool) => {
    tool.addEventListener('click', () => {
        currentTool = tools[tool.id];
        tool.classList.add('active');

        // si dio clic en otra herramienta remover el activo anterior
        $$('.tool').forEach((t) => t.id !== tool.id && t.classList.remove('active'));
    });
});

function startDrawing(event) {
    const { offsetX, offsetY } = event;
    isDrawing = true;

    // guarda coordenadas iniciales
    [startX, startY] = [offsetX, offsetY];
    [lastX, lastY] = [offsetX, offsetY];

    imageData = ctx.getImageData(0, 0, $canvas.width, $canvas.height);
    history.push(imageData);
}

function draw(event) {
    if (!isDrawing) return;

    const { offsetX, offsetY } = event;

    // comenzar trazado
    ctx.beginPath();

    //mover trazado de coordenadas actuales
    ctx.moveTo(lastX, lastY);

    //actualizar coordenadas
    ctx.lineTo(offsetX, offsetY);

    ctx.lineWidth = 3;

    switch (currentTool) {
        case tools.pencil:
            // guardar coordenadas actuales
            [lastX, lastY] = [offsetX, offsetY];
            [startX, startY] = [offsetX, offsetY];

            ctx.strokeStyle = $colorPicker.value;
            ctx.stroke();
            break;
        case tools.eraser:
            // guardar coordenadas actuales
            [lastX, lastY] = [offsetX, offsetY];
            [startX, startY] = [offsetX, offsetY];

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 8;
            ctx.stroke();
            break;
        case tools.square:
            drawSquare(offsetX, offsetY, startX, startY);
            break;
        case tools.circle:
            drawCircle(offsetX, offsetY, startX, startY);
            break;
    }
}

// pasar de rgb a hexadecimal
function rgbToHex(r, g, b) {
    return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
}

function picker(event) {
    const { offsetX, offsetY } = event;
    const pixel = ctx.getImageData(offsetX, offsetY, 1, 1).data;
    $colorPicker.value = rgbToHex(pixel[0], pixel[1], pixel[2]);
}

// dibujar cuadrado
function drawSquare(offsetX, offsetY, startX, startY) {
    ctx.putImageData(imageData, 0, 0);

    const width = offsetX - startX;
    const height = offsetY - startY;

    ctx.beginPath();
    ctx.rect(startX, startY, width, height);
    ctx.stroke();
    ctx.strokeStyle = $colorPicker.value;
}

// Dibujar circulo
function drawCircle(offsetX, offsetY, startX, startY) {
    ctx.putImageData(imageData, 0, 0);

    const width = offsetX - startX;
    const height = offsetY - startY;

    ctx.beginPath();
    ctx.arc(startX, startY, Math.abs(width), Math.abs(height), 0, 1);
    ctx.stroke();
    ctx.strokeStyle = $colorPicker.value;
}

// guardar dibujo
$saveImage.addEventListener('click', () => {
    let link = document.createElement('a');
    link.download = 'file';
    link.href = $canvas.toDataURL('image/jpg');
    link.click();
});

// Aplicar el Ctrl + Z
window.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'z') {
        if (history.length > 0) {
            ctx.putImageData(history[history.length - 1], 0, 0);
            history.pop();
        }
    }
});
