document.getElementById('imageLoaderButton').addEventListener('click', () => {
    document.getElementById('change').click();
});

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const radiusSlider = document.getElementById('radiusSlider');
const radiusInput = document.getElementById('radiusInput');
const imageLoader = document.getElementById('imageLoader');
const deleteCircleBtn = document.getElementById('deleteCircleBtn');
const clearCanvasBtn = document.getElementById('clearCanvasBtn');
const modal = document.getElementById('confirmationModal');
const confirmBtn = document.getElementById('confirmBtn');
const cancelBtn = document.getElementById('cancelBtn');
const saveDataBtn = document.getElementById('saveDataBtn');
const loadDataBtn = document.getElementById('loadDataBtn');
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
    // Очищаем холст
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рисуем изображение, если оно загружено
    if (img) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Рисуем линии между кругами
    for (let i = 0; i < circles.length - 1; i++) {
        const circle1 = circles[i];
        const circle2 = circles[i + 1];
        const angle = Math.atan2(circle2.y - circle1.y, circle2.x - circle1.x);

        const startX = circle1.x + circle1.radius * Math.cos(angle);
        const startY = circle1.y + circle1.radius * Math.sin(angle);
        const endX = circle2.x - circle2.radius * Math.cos(angle);
        const endY = circle2.y - circle2.radius * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);

        ctx.shadowColor = 'rgba(255, 255, 255, 1)';
        ctx.shadowBlur = 10;

        ctx.strokeStyle = '#501e82';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.closePath();
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
    }

    // Рисуем сами круги
    circles.forEach(circle => {
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);

        // Меняем цвет на зелёный, если круг выполнен
        ctx.strokeStyle = circle.checked ? '#2d8b45' : '#cf412a'; // Зелёный для выполненных, красный для остальных
        ctx.lineWidth = 4;

        ctx.shadowColor = 'rgba(255, 255, 255, 1)';
        ctx.shadowBlur = 10;

        ctx.stroke();
        ctx.closePath();
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
    });
}

// Обновляем список задач (перечень кругов)
function updateTaskList() {
    taskList.innerHTML = '';  // Очищаем старый список
    circles.forEach((circle, index) => {
        const listItem = document.createElement('li');
        listItem.style.display = 'flex';
        listItem.style.alignItems = 'center';

        // Создаем чекбокс
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = circle.checked || false; // Устанавливаем состояние, если оно есть

        // Создаем текстовое поле
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Действие на точке ${index + 1}`;
        input.value = circle.text || ''; // Устанавливаем текст, если он есть

        // Устанавливаем класс `completed`, если круг уже отмечен
        if (circle.checked) {
            input.classList.add('completed');
        }

        // Отслеживаем изменения состояния чекбокса
        checkbox.addEventListener('change', (e) => {
            circle.checked = e.target.checked; // Сохраняем состояние чекбокса
            if (circle.checked) {
                input.classList.add('completed'); // Добавляем класс выполненного
            } else {
                input.classList.remove('completed'); // Убираем класс выполненного
            }
            drawCircles(); // Перерисовываем круги
        });

        // Отслеживаем изменения в поле ввода
        input.addEventListener('input', (e) => {
            circle.text = e.target.value; // Сохраняем текст в соответствующем круге
        });

        // Добавляем номер пункта
        const numberSpan = document.createElement('span');
        numberSpan.textContent = `${index + 1}.`;

        // Добавляем элементы в пункт списка
        listItem.appendChild(checkbox);
        listItem.appendChild(numberSpan);
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

function saveState() {
    localStorage.setItem('circles', JSON.stringify(circles));
}

function loadState() {
    const savedCircles = JSON.parse(localStorage.getItem('circles') || '[]');
    circles.push(...savedCircles);
    drawCircles();
    updateTaskList();
}

// Вызываем "saveState" при изменении данных (например, в "updateTaskList").
window.addEventListener('beforeunload', saveState);

// Загружаем состояние при загрузке страницы
window.addEventListener('load', loadState);

// Показываем модальное окно
clearCanvasBtn.addEventListener('click', () => {
    modal.style.display = 'flex'; // Показываем модальное окно
});

// Подтверждаем действие
confirmBtn.addEventListener('click', () => {
    // Очистить карту и удалить круги
    circles.length = 0;
    updateTaskList();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (img) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
    modal.style.display = 'none'; // Скрыть модальное окно
});

// Отменяем действие
cancelBtn.addEventListener('click', () => {
    modal.style.display = 'none'; // Просто скрываем окно
});

// Закрываем модальное окно при клике вне его
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

saveDataBtn.addEventListener('click', () => {
    // Сохраняем изображение canvas
    const canvasData = canvas.toDataURL('image/png'); // Получаем данные холста в формате base64

    // Сохраняем список дел
    const taskData = circles.map((circle, index) => ({
        index: index + 1,
        x: circle.x,
        y: circle.y,
        radius: circle.radius,
        text: circle.text || '',
        checked: circle.checked || false,
    }));

    // Объединяем всё в один объект
    const dataToSave = {
        canvasImage: canvasData,
        tasks: taskData,
    };

    // Генерируем JSON файл
    const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'application/json' });

    // Создаём ссылку для скачивания
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'canvas_and_tasks.json'; // Имя файла
    link.click();

    // Освобождаем URL
    URL.revokeObjectURL(link.href);
});

// Загрузка данных
loadDataBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const data = JSON.parse(event.target.result);

                // Восстанавливаем изображение на холсте
                const image = new Image();
                image.onload = function() {
                    // Устанавливаем размер холста
                    const maxWidth = 1200;
                    const maxHeight = 885;
                    let imgWidth = image.width;
                    let imgHeight = image.height;
                    const scaleFactor = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
                    imgWidth = imgWidth * scaleFactor;
                    imgHeight = imgHeight * scaleFactor;

                    canvas.width = imgWidth;
                    canvas.height = imgHeight;
                    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

                    // Восстанавливаем круги
                    circles.length = 0;  // Очищаем массив кругов
                    data.tasks.forEach(task => {
                        circles.push({
                            x: task.x,
                            y: task.y,
                            radius: task.radius,
                            text: task.text,
                            checked: task.checked,
                        });
                    });

                    drawCircles();  // Перерисовываем холст и круги
                    updateTaskList();  // Обновляем список задач
                };
                image.src = data.canvasImage;
            };
            reader.readAsText(file);  // Читаем файл как текст
        }
    });

    input.click();  // Открываем диалог выбора файла
});