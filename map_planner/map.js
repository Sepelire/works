document.getElementById('imageLoaderButton').addEventListener('click', () => {
    document.getElementById('change').click();
});

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const radiusSlider = document.getElementById('radiusSlider');
const radiusInput = document.getElementById('radiusInput');
const imageLoader = document.getElementById('imageLoader');
const deleteCircleBtn = document.getElementById('deleteCircleBtn');
const taskList = document.getElementById('taskList');
const circles = [];
let radius = 10;
let img = null;
let isDragging = false;  // Отслеживаем, перетаскивается ли сейчас круг
let draggedCircle = null;  // Храним круг, который перетаскиваем
let offsetX, offsetY;  // Смещение мыши относительно центра круга при перетаскивании

// Обновляем радиус круга, если меняется значение ползунка или текстового поля
radiusSlider.addEventListener('input', (e) => {
    radius = parseInt(e.target.value);
    radiusInput.value = radius;

    // Изменяем цвет ползунка в зависимости от текущего значения
    const value = (radius - radiusSlider.min) / (radiusSlider.max - radiusSlider.min) * 100;
    radiusSlider.style.background = `linear-gradient(to right, #f1a742 0%, #f1a742 ${value}%, #ddd ${value}%, #ddd 100%)`;
});

radiusInput.addEventListener('input', (e) => {
    radius = parseInt(e.target.value);
    radiusSlider.value = radius;

    // Тот же эффект для ползунка, если изменилось значение в поле ввода
    const value = (radius - radiusSlider.min) / (radiusSlider.max - radiusSlider.min) * 100;
    radiusSlider.style.background = `linear-gradient(to right, #f1a742 0%, #f1a742 ${value}%, #ddd ${value}%, #ddd 100%)`;
});

// Загружаем изображение, если пользователь выбрал файл
imageLoader.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
        img = new Image();
        img.onload = function() {
            // Подгоняем размер изображения, чтобы оно поместилось в холст
            const maxWidth = 1200;
            const maxHeight = 885;
            let imgWidth = img.width;
            let imgHeight = img.height;

            // Считаем коэффициент масштабирования, чтобы вписать изображение в ограничения
            const scaleFactor = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
            imgWidth = imgWidth * scaleFactor;
            imgHeight = imgHeight * scaleFactor;

            canvas.width = imgWidth;
            canvas.height = imgHeight;
            drawCircles();  // Перерисовываем все, включая круги
        };
        img.src = event.target.result;
    };
    if (file) {
        reader.readAsDataURL(file);
    }
});

// Функция для отрисовки кругов и изображения на холсте
function drawCircles() {
    // Сначала очищаем холст, чтобы перерисовать всё заново
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Если есть изображение, рисуем его на холсте
    if (img) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    } else {
        // Если изображения нет, заливаем холст белым
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Рисуем линии между всеми парами кругов
    for (let i = 0; i < circles.length - 1; i++) {
        const circle1 = circles[i];
        const circle2 = circles[i + 1];

        // Вычисляем угол между центрами двух кругов
        const angle = Math.atan2(circle2.y - circle1.y, circle2.x - circle1.x);

        // Определяем точки на окружности, чтобы провести линию между кругами
        const startX = circle1.x + circle1.radius * Math.cos(angle);
        const startY = circle1.y + circle1.radius * Math.sin(angle);
        const endX = circle2.x - circle2.radius * Math.cos(angle);
        const endY = circle2.y - circle2.radius * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);

        // Настройка тени для линии
        ctx.shadowColor = 'rgba(255, 255, 255, 1)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Устанавливаем стиль линии и рисуем
        ctx.strokeStyle = '#501e82';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.closePath();

        // Сбрасываем тень, чтобы не влиять на другие элементы
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
    }

    // Рисуем каждый круг с белой размытой тенью
    circles.forEach(circle => {
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);

        // Настройка тени для круга
        ctx.shadowColor = 'rgba(255, 255, 255, 1)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.strokeStyle = '#cf412a';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.closePath();

        // Сбрасываем тень
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
    });
}

// Обновляем список задач (перечень кругов)
function updateTaskList() {
    taskList.innerHTML = '';  // Очищаем старый список
    circles.forEach((circle, index) => {
        const listItem = document.createElement('li');
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Пункт ${index + 1}`;
        listItem.appendChild(input);
        taskList.appendChild(listItem);
    });
}

// Обработчик события для перетаскивания кругов
canvas.addEventListener('mousedown', (e) => {
    const x = e.offsetX;
    const y = e.offsetY;

    // Проверяем, не наводится ли мышь на один из кругов
    for (let i = 0; i < circles.length; i++) {
        const circle = circles[i];
        const dx = x - circle.x;
        const dy = y - circle.y;
        if (Math.sqrt(dx * dx + dy * dy) <= circle.radius) {
            isDragging = true;
            draggedCircle = circle;
            offsetX = x - circle.x;
            offsetY = y - circle.y;
            return;
        }
    }

    // Если не перетаскиваем, то добавляем новый круг
    if (!isDragging) {
        circles.push({ x, y, radius });
        updateTaskList();  // Обновляем список задач
        drawCircles();  // Перерисовываем все круги
    }
});

// Обработчик для перетаскивания кругов
canvas.addEventListener('mousemove', (e) => {
    if (isDragging && draggedCircle) {
        const x = e.offsetX;
        const y = e.offsetY;

        // Обновляем позицию круга, пока его перетаскивают
        draggedCircle.x = x - offsetX;
        draggedCircle.y = y - offsetY;
        drawCircles();  // Перерисовываем все элементы
    }
});

// Обработчик завершения перетаскивания круга
canvas.addEventListener('mouseup', () => {
    isDragging = false;
    draggedCircle = null;
});

// Удаление круга правым кликом мыши
canvas.addEventListener('mousedown', (e) => {
    if (e.button === 2) {
        const x = e.offsetX;
        const y = e.offsetY;

        // Проверяем, на каком круге был клик
        for (let i = 0; i < circles.length; i++) {
            const circle = circles[i];
            const dx = x - circle.x;
            const dy = y - circle.y;
            if (Math.sqrt(dx * dx + dy * dy) <= circle.radius) {
                circles.splice(i, 1);  // Удаляем круг
                updateTaskList();  // Обновляем список
                drawCircles();  // Перерисовываем холст
                return;
            }
        }
    }   
});

// Отключаем контекстное меню при правом клике
canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Удаляем последний добавленный круг
deleteCircleBtn.addEventListener('click', () => {
    circles.pop();  // Удаляем последний круг
    updateTaskList();  // Обновляем список задач
    drawCircles();  // Перерисовываем холст
});