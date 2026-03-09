# Hướng dẫn sử dụng Comparison Operators cho Values

## Tổng quan

Hệ thống hỗ trợ so sánh điều kiện phức tạp cho các giá trị trong bảng `values`. Điều này cho phép tạo các điều kiện như "Từ N3 trở lên", "Trên 3 năm kinh nghiệm", v.v.

## Cấu trúc Database

Bảng `values` đã được thêm 3 trường mới:
- `comparison_operator`: Toán tử so sánh (`>=`, `<=`, `>`, `<`, `=`, `between`)
- `comparison_value`: Giá trị để so sánh
- `comparison_value_end`: Giá trị kết thúc (chỉ dùng cho `between`)

## Các toán tử hỗ trợ

### 1. `>=` (Lớn hơn hoặc bằng)
- **Ví dụ JLPT**: "Từ N3 trở lên"
  - `comparison_operator`: `>=`
  - `comparison_value`: `3` (N3)
  - **Logic**: CV có jlptLevel <= 3 (vì 1=N1 cao nhất, 5=N5 thấp nhất)
  
- **Ví dụ Experience**: "Từ 3 năm trở lên"
  - `comparison_operator`: `>=`
  - `comparison_value`: `3`
  - **Logic**: CV có experienceYears >= 3

### 2. `<=` (Nhỏ hơn hoặc bằng)
- **Ví dụ JLPT**: "Từ N2 trở xuống"
  - `comparison_operator`: `<=`
  - `comparison_value`: `2` (N2)
  - **Logic**: CV có jlptLevel >= 2
  
- **Ví dụ Experience**: "Từ 5 năm trở xuống"
  - `comparison_operator`: `<=`
  - `comparison_value`: `5`
  - **Logic**: CV có experienceYears <= 5

### 3. `>` (Lớn hơn)
- **Ví dụ JLPT**: "Trên N3"
  - `comparison_operator`: `>`
  - `comparison_value`: `3` (N3)
  - **Logic**: CV có jlptLevel < 3 (tức là N1 hoặc N2)
  
- **Ví dụ Experience**: "Trên 3 năm"
  - `comparison_operator`: `>`
  - `comparison_value`: `3`
  - **Logic**: CV có experienceYears > 3

### 4. `<` (Nhỏ hơn)
- **Ví dụ JLPT**: "Dưới N2"
  - `comparison_operator`: `<`
  - `comparison_value`: `2` (N2)
  - **Logic**: CV có jlptLevel > 2 (tức là N3, N4, hoặc N5)
  
- **Ví dụ Experience**: "Dưới 5 năm"
  - `comparison_operator`: `<`
  - `comparison_value`: `5`
  - **Logic**: CV có experienceYears < 5

### 5. `=` (Bằng)
- **Ví dụ JLPT**: "Chính xác N2"
  - `comparison_operator`: `=`
  - `comparison_value`: `2` (N2)
  - **Logic**: CV có jlptLevel = 2
  
- **Ví dụ Experience**: "Chính xác 3 năm"
  - `comparison_operator`: `=`
  - `comparison_value`: `3`
  - **Logic**: CV có experienceYears = 3

### 6. `between` (Trong khoảng)
- **Ví dụ JLPT**: "Từ N3 đến N1"
  - `comparison_operator`: `between`
  - `comparison_value`: `3` (N3)
  - `comparison_value_end`: `1` (N1)
  - **Logic**: CV có jlptLevel từ 1 đến 3 (N1, N2, N3)
  
- **Ví dụ Experience**: "Từ 2 đến 5 năm"
  - `comparison_operator`: `between`
  - `comparison_value`: `2`
  - `comparison_value_end`: `5`
  - **Logic**: CV có experienceYears từ 2 đến 5

## Lưu ý đặc biệt cho JLPT

**Quan trọng**: Với JLPT, số nhỏ hơn = level cao hơn:
- `1` = N1 (cao nhất)
- `2` = N2
- `3` = N3
- `4` = N4
- `5` = N5 (thấp nhất)

Do đó:
- "Từ N3 trở lên" (>= N3) nghĩa là jlptLevel <= 3 (N1, N2, N3)
- "Từ N2 trở xuống" (<= N2) nghĩa là jlptLevel >= 2 (N2, N3, N4, N5)

## Ví dụ sử dụng trong SQL

```sql
-- Tạo value "Từ N3 trở lên"
INSERT INTO `values` (`id_typename`, `valuename`, `comparison_operator`, `comparison_value`)
VALUES (1, 'Từ N3 trở lên', '>=', '3');

-- Tạo value "Trên 3 năm kinh nghiệm"
INSERT INTO `values` (`id_typename`, `valuename`, `comparison_operator`, `comparison_value`)
VALUES (2, 'Trên 3 năm kinh nghiệm', '>', '3');

-- Tạo value "Từ 2 đến 5 năm"
INSERT INTO `values` (`id_typename`, `valuename`, `comparison_operator`, `comparison_value`, `comparison_value_end`)
VALUES (2, 'Từ 2 đến 5 năm', 'between', '2', '5');
```

## Logic so sánh trong Code

Hàm `compareValue()` trong `commissionCalculator.js` sẽ:
1. Kiểm tra xem value có `comparison_operator` không
2. Nếu có, so sánh theo operator
3. Nếu không, fallback về exact match (logic cũ)

**Ưu tiên so sánh**:
1. **Ưu tiên 1**: So sánh với comparison operator (nếu có)
2. **Ưu tiên 2**: Exact match (valueId hoặc valuename)
3. **Ưu tiên 3**: Fallback về job_value đầu tiên

## Migration

Chạy migration để thêm các trường mới:
```sql
-- File: wwjs/backend/schema/migrations/add_comparison_fields_to_values.sql
```

