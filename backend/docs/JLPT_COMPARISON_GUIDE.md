# Hướng dẫn so sánh JLPT Level với Comparison Operators

## Quan trọng: Cách JLPT Level được lưu trữ

**JLPT Level trong database:**
- `1` = N1 (cao nhất)
- `2` = N2
- `3` = N3
- `4` = N4
- `5` = N5 (thấp nhất)

**Quy tắc:** Số nhỏ hơn = Level cao hơn

## Cách tạo Value với điều kiện so sánh

### ✅ ĐÚNG: "Từ N2 trở lên" (N2, N1)

**Cách tạo:**
- `valuename`: "Từ N2 trở lên"
- `comparison_operator`: `>=` (Lớn hơn hoặc bằng)
- `comparison_value`: `2` (N2)

**Logic so sánh:**
- Code sẽ đảo ngược: `cvLevel <= 2`
- Kết quả: CV có jlptLevel = 1 (N1) hoặc 2 (N2) → ✅ MATCH

**Ví dụ:**
- CV có N1 (jlptLevel = 1) → `1 <= 2` → ✅ TRUE → Match!
- CV có N2 (jlptLevel = 2) → `2 <= 2` → ✅ TRUE → Match!
- CV có N3 (jlptLevel = 3) → `3 <= 2` → ❌ FALSE → Không match

### ❌ SAI: Dùng toán tử "<" cho "Từ N2 trở lên"

**Nếu bạn tạo:**
- `comparison_operator`: `<` (Nhỏ hơn)
- `comparison_value`: `2`

**Logic so sánh:**
- Code sẽ đảo ngược: `cvLevel > 2`
- Kết quả: CV có jlptLevel = 3, 4, 5 (N3, N4, N5) → ❌ SAI!

**Ví dụ:**
- CV có N1 (jlptLevel = 1) → `1 > 2` → ❌ FALSE → Không match (SAI!)
- CV có N2 (jlptLevel = 2) → `2 > 2` → ❌ FALSE → Không match (SAI!)
- CV có N3 (jlptLevel = 3) → `3 > 2` → ✅ TRUE → Match (NHƯNG SAI!)

## Bảng hướng dẫn tạo Value cho JLPT

| Yêu cầu | Operator | Value | Logic Code | Kết quả |
|---------|----------|-------|------------|---------|
| **Từ N2 trở lên** (N2, N1) | `>=` | `2` | `cvLevel <= 2` | ✅ N1, N2 |
| **Từ N3 trở lên** (N3, N2, N1) | `>=` | `3` | `cvLevel <= 3` | ✅ N1, N2, N3 |
| **Từ N2 trở xuống** (N2, N3, N4, N5) | `<=` | `2` | `cvLevel >= 2` | ✅ N2, N3, N4, N5 |
| **Trên N3** (N1, N2) | `>` | `3` | `cvLevel < 3` | ✅ N1, N2 |
| **Dưới N2** (N3, N4, N5) | `<` | `2` | `cvLevel > 2` | ✅ N3, N4, N5 |
| **Chính xác N2** | `=` | `2` | `cvLevel === 2` | ✅ N2 |
| **Từ N3 đến N1** | `between` | `3` (start), `1` (end) | `1 <= cvLevel <= 3` | ✅ N1, N2, N3 |

## Ví dụ cụ thể

### Ví dụ 1: Ứng viên N1, Job yêu cầu "Từ N2 trở lên"

**Tạo Value:**
```sql
INSERT INTO `values` (`id_typename`, `valuename`, `comparison_operator`, `comparison_value`)
VALUES (1, 'Từ N2 trở lên', '>=', '2');
```

**So sánh:**
- CV: jlptLevel = 1 (N1)
- Value: operator = `>=`, value = `2`
- Logic: `1 <= 2` → ✅ TRUE
- **Kết quả: MATCH!** ✅

### Ví dụ 2: Ứng viên N3, Job yêu cầu "Từ N2 trở lên"

**So sánh:**
- CV: jlptLevel = 3 (N3)
- Value: operator = `>=`, value = `2`
- Logic: `3 <= 2` → ❌ FALSE
- **Kết quả: KHÔNG MATCH** ❌

### Ví dụ 3: Ứng viên N1, Job yêu cầu "Dưới N2" (N3, N4, N5)

**Tạo Value:**
```sql
INSERT INTO `values` (`id_typename`, `valuename`, `comparison_operator`, `comparison_value`)
VALUES (1, 'Dưới N2', '<', '2');
```

**So sánh:**
- CV: jlptLevel = 1 (N1)
- Value: operator = `<`, value = `2`
- Logic: `1 > 2` → ❌ FALSE
- **Kết quả: KHÔNG MATCH** ❌ (đúng vì N1 không "dưới" N2)

## Quy tắc vàng

1. **"Từ X trở lên"** → Dùng `>=` với giá trị X
2. **"Từ X trở xuống"** → Dùng `<=` với giá trị X
3. **"Trên X"** → Dùng `>` với giá trị X
4. **"Dưới X"** → Dùng `<` với giá trị X

**Lưu ý:** Code sẽ tự động đảo ngược logic cho JLPT vì số nhỏ hơn = level cao hơn.

## Code Logic (Tự động đảo ngược)

```javascript
// Trong commissionCalculator.js
if (typeId === 1) { // JLPT
  switch (operator) {
    case '>=': // "Từ N3 trở lên"
      return cvLevel <= compareValue; // Đảo ngược!
    case '<=': // "Từ N2 trở xuống"
      return cvLevel >= compareValue; // Đảo ngược!
    case '>': // "Trên N3"
      return cvLevel < compareValue; // Đảo ngược!
    case '<': // "Dưới N2"
      return cvLevel > compareValue; // Đảo ngược!
  }
}
```

**Bạn chỉ cần nhập toán tử và giá trị theo ý nghĩa thông thường, code sẽ tự động đảo ngược!**

