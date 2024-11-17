def convert_base(number, from_base, to_base):
    # Переводим число из изначальной системы счисления в десятичную
    decimal_number = int(number, from_base)
    # Переводим из десятичной системы в целевую
    result = ''
    digits = '0123456789ABCDEF'
    while decimal_number > 0:
        result = digits[decimal_number % to_base] + result
        decimal_number //= to_base
    return result or '0' 

while True:
    try:
        # Ввод числа
        number = input("Введите число (или 'exit' для выхода): ")
        if number.lower() == 'exit':
            print("Программа завершена")
            break

        # Ввод изначальной системы счисления
        from_base = int(input("Введите изначальную систему счисления (от 2 до 16): "))
        if not (2 <= from_base <= 16):
            raise ValueError("Система счисления должна быть от 2 до 16 ~_~")

        # Ввод целевой системы счисления
        to_base = int(input("Введите систему счисления, в которую нужно перевести (от 2 до 16): "))
        if not (2 <= to_base <= 16):
            raise ValueError("Система счисления должна быть от 2 до 16 =_=")

        # Вывод результата
        print("Результат:", convert_base(number, from_base, to_base))

    except ValueError as e:
        print("Ошибка:", e)
