import sys
import json
import re
import datetime
from PIL import Image
import pytesseract

def is_adult(reg_num: str) -> bool:
    pattern = r'^(\d{6})-(\d{7})$'
    match = re.match(pattern, reg_num)
    if not match:
        raise ValueError("주민등록번호 형식이 올바르지 않습니다. (예: 000000-0000000)")
    
    birth_str = match.group(1)  # YYMMDD
    second_part = match.group(2)
    gender_digit = second_part[0]
    
    if gender_digit in ['1', '2']:
        century = 1900
    elif gender_digit in ['3', '4']:
        century = 2000
    else:
        raise ValueError("지원하지 않는 주민등록번호 형식입니다.")
    
    year = century + int(birth_str[:2])
    month = int(birth_str[2:4])
    day = int(birth_str[4:6])
    
    try:
        birth_date = datetime.date(year, month, day)
    except ValueError:
        raise ValueError("유효하지 않은 생년월일입니다.")
    
    today = datetime.date.today()
    age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
    return age >= 19

def extract_reg_num_from_image(image_path: str) -> str:
    image = Image.open(image_path)
    ocr_result = pytesseract.image_to_string(image, lang='kor')
    pattern = r'\b(\d{6,8})-(\d{7})\b'
    match = re.search(pattern, ocr_result)
    if match:
        front_part = match.group(1)
        back_part = match.group(2)
        if len(front_part) != 6:
            front_part = front_part[:6]
        reg_num = f"{front_part}-{back_part}"
        return reg_num
    else:
        raise ValueError("이미지에서 주민등록번호 형식의 숫자 값을 찾을 수 없습니다.")

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "이미지 파일 경로가 필요합니다."}))
        sys.exit(1)
    image_path = sys.argv[1]
    try:
        reg_num = extract_reg_num_from_image(image_path)
        adult = is_adult(reg_num)
        result = {"adult": adult, "reg_num": reg_num}
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
