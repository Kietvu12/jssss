# Tài Liệu Tính Toán Số Tiền Thanh Toán (Hoa Hồng)

## 📋 Mục Lục
1. [Tổng Quan](#tổng-quan)
2. [Các Thành Phần Tham Gia Tính Toán](#các-thành-phần-tham-gia-tính-toán)
3. [Luồng Tính Toán](#luồng-tính-toán)
4. [Công Thức Tính Toán Chi Tiết](#công-thức-tính-toán-chi-tiết)
5. [So Sánh Job Value với CV](#so-sánh-job-value-với-cv)
6. [Các Trường Hợp Ngoại Lệ](#các-trường-hợp-ngoại-lệ)
7. [Ví Dụ Cụ Thể](#ví-dụ-cụ-thể)
8. [Lưu Ý Quan Trọng](#lưu-ý-quan-trọng)

---

## 📌 Tổng Quan

Hệ thống tự động tính toán số tiền hoa hồng cho Cộng Tác Viên (CTV) hoặc Admin dựa trên nhiều yếu tố:
- Lương tháng của ứng viên (`monthly_salary`)
- Loại hoa hồng của job (`job_commission_type`)
- Giá trị hoa hồng trong job (`job_values`)
- Rank level của CTV (`rank_level.percent`)
- Campaign (nếu job thuộc campaign)
- Thông tin CV của ứng viên để so khớp điều kiện

**File xử lý:** `backend/src/utils/commissionCalculator.js`

**Function:** `calculateCommission({ jobId, jobApplicationId, monthlySalary, collaboratorId, cvCode })`

---

## 🔧 Các Thành Phần Tham Gia Tính Toán

### 1. **Monthly Salary** (`monthly_salary`)
- **Nguồn:** `job_applications.monthly_salary`
- **Đơn vị:** 万円 (Yên Nhật)
- **Mô tả:** Lương tháng của ứng viên sau khi được nhận vào công ty
- **Chuyển đổi:** `annualSalary = monthlySalary × 12` (万円/năm)

### 2. **Job Commission Type** (`job_commission_type`)
- **Nguồn:** `jobs.job_commission_type`
- **Giá trị:** 
  - `'fixed'`: Hoa hồng cố định (số tiền cố định - VND)
  - `'percent'`: Hoa hồng theo phần trăm (tính theo % lương năm)
- **Mặc định:** `'fixed'`

### 3. **Job Values** (`job_values`)
- **Nguồn:** Bảng `job_values` liên kết với `jobs`
- **Mô tả:** Chứa các điều kiện và giá trị hoa hồng tương ứng
- **Cấu trúc:**
  - `typeId`: ID của loại điều kiện (liên kết với `types`)
  - `valueId`: ID của giá trị cụ thể (liên kết với `values`)
  - `value`: Giá trị hoa hồng (% hoặc số tiền cố định - VND)
  - `isRequired`: Có bắt buộc hay không

### 4. **Type** (`types`)
- **Nguồn:** Bảng `types`
- **Mô tả:** Loại điều kiện (ví dụ: JLPT Level, Experience Years, Specialization, Qualification)
- **Trường quan trọng:**
  - `cvField`: Tên field trong CV để so sánh (ví dụ: 'jlptLevel', 'experienceYears', 'specialization', 'qualification')
  - Nếu `cvField = null` → Type này không so sánh với CV

### 5. **Value** (`values`)
- **Nguồn:** Bảng `values` liên kết với `types`
- **Mô tả:** Giá trị cụ thể của điều kiện
- **Trường quan trọng:**
  - `comparisonOperator`: Toán tử so sánh (`>=`, `<=`, `>`, `<`, `=`, `between`)
  - `comparisonValue`: Giá trị để so sánh
  - `comparisonValueEnd`: Giá trị kết thúc (chỉ dùng cho `between`)

### 6. **Rank Level** (`rank_levels`)
- **Nguồn:** `rank_levels.percent` liên kết với `collaborators.rank_level_id`
- **Mô tả:** Phần trăm hoa hồng mà CTV được hưởng dựa trên cấp độ của họ
- **Ví dụ:** 
  - Rank Level 1: 50%
  - Rank Level 2: 70%
  - Rank Level 3: 80%
  - Rank Level 4: 90%
  - Rank Level 5: 100%

### 7. **Campaign** (`campaigns`)
- **Nguồn:** Bảng `campaigns` liên kết với `jobs` qua `job_campaigns`
- **Mô tả:** Chiến dịch đặc biệt có thể ghi đè các quy tắc tính toán thông thường
- **Điều kiện kích hoạt:**
  - `campaign.status = 1` (Active)
  - Thời gian hiện tại nằm trong khoảng `start_date` và `end_date`
- **Trường:** `campaigns.percent`: Phần trăm hoa hồng của campaign

### 8. **CV Storage** (`cv_storages`)
- **Nguồn:** `cv_storages` liên kết với `job_applications.cv_code`
- **Mô tả:** Thông tin CV của ứng viên để so khớp điều kiện
- **Các trường có thể so sánh:**
  - `jlptLevel`: Cấp độ JLPT (1=N1, 2=N2, 3=N3, 4=N4, 5=N5)
  - `experienceYears`: Số năm kinh nghiệm
  - `specialization`: Chuyên ngành
  - `qualification`: Bằng cấp

---

## 🔄 Luồng Tính Toán

### **Thứ Tự Ưu Tiên:**

```
1. Job thuộc Campaign (Ưu tiên cao nhất)
   ↓
2. Ngoại lệ: typeId = 2, valueId = 6
   ↓
3. Ngoại lệ: typeId = 2, valueId = 7
   ↓
4. Trường hợp thông thường: Tìm job_value phù hợp với CV
   - Ưu tiên 1: So sánh với comparison operator
   - Ưu tiên 2: Exact match với valueId
   - Ưu tiên 3: So sánh với valuename (chỉ cho JLPT)
   - Fallback: Lấy job_value đầu tiên có value
```

---

## 📐 Công Thức Tính Toán Chi Tiết

### **1. Trường Hợp: Job Thuộc Campaign** ⭐ (Ưu tiên cao nhất)

Khi job thuộc một campaign đang hoạt động, **TẤT CẢ** các quy tắc tính toán thông thường bị ghi đè.

#### **Công Thức:**

**Cho CTV:**
```
Số tiền CTV nhận (VND) = (monthlySalary × 12) × (campaign.percent / 100) × (rankLevel.percent / 100)
```

**Cho Admin:**
```
Số tiền Admin nhận (VND) = (monthlySalary × 12) × (campaign.percent / 100)
```
*(Admin không nhân với rankLevel.percent)*

#### **Ví Dụ:**
- `monthlySalary` = 30 万円
- `campaign.percent` = 6%
- `rankLevel.percent` = 80%

**CTV nhận:**
```
= (30 × 12) × 6% × 80%
= 360 × 0.06 × 0.8
= 17.28 万円
```

**Admin nhận:**
```
= (30 × 12) × 6%
= 360 × 0.06
= 21.6 万円
```

---

### **2. Trường Hợp: Job Không Thuộc Campaign**

#### **A. Ngoại Lệ Đặc Biệt: typeId = 2, valueId = 6**

Khi `job_value` có `typeId = 2` và `valueId = 6`:
- CTV trực tiếp nhận theo công thức, **KHÔNG CẦN** so khớp điều kiện CV
- Bỏ qua việc kiểm tra CV

**Công thức:**

**Nếu `job_commission_type = 'percent'`:**
```
CTV nhận = (monthlySalary × 12) × (job_value.value / 100) × (rankLevel.percent / 100)
Admin nhận = (monthlySalary × 12) × (job_value.value / 100)
```

**Nếu `job_commission_type = 'fixed'`:**
```
CTV nhận = job_value.value × (rankLevel.percent / 100)
Admin nhận = job_value.value
```

**Ví Dụ:**
- `monthlySalary` = 25 万円
- `job_commission_type` = 'percent'
- `job_value.value` = 5 (từ valueId = 6)
- `rankLevel.percent` = 80%

**CTV nhận:**
```
= (25 × 12) × 5% × 80%
= 300 × 0.05 × 0.8
= 12 万円
```

---

#### **B. Ngoại Lệ Đặc Biệt: typeId = 2, valueId = 7**

Tương tự như valueId = 6:
- **KHÔNG CẦN** so sánh với CV
- Công thức giống hệt valueId = 6

**Công thức:** Giống như valueId = 6

---

#### **C. Trường Hợp Thông Thường**

Hệ thống sẽ tìm `job_value` phù hợp với CV theo thứ tự ưu tiên:

1. **Ưu tiên 1:** Tìm job_value có `comparisonOperator` và match với CV
2. **Ưu tiên 2:** Tìm job_value có `type.cvField` và `valueId` khớp với giá trị CV
3. **Ưu tiên 3:** Lấy job_value đầu tiên có `value`
4. **Fallback:** Lấy job_value đầu tiên trong danh sách

**Công thức:**

**Nếu `job_commission_type = 'percent'`:**
```
CTV nhận = (monthlySalary × 12) × (matchedJobValue.value / 100) × (rankLevel.percent / 100)
Admin nhận = (monthlySalary × 12) × (matchedJobValue.value / 100)
```

**Nếu `job_commission_type = 'fixed'`:**
```
CTV nhận = matchedJobValue.value × (rankLevel.percent / 100)
Admin nhận = matchedJobValue.value
```

**Ví Dụ:**
- `monthlySalary` = 35 万円
- `job_commission_type` = 'percent'
- `matchedJobValue.value` = 4 (sau khi so khớp với CV)
- `rankLevel.percent` = 90%

**CTV nhận:**
```
= (35 × 12) × 4% × 90%
= 420 × 0.04 × 0.9
= 15.12 万円
```

**Lưu ý:** 
- Nếu không tìm thấy `job_value` phù hợp → Trả về `0`
- Nếu không có `cvCode` → Vẫn tìm theo ưu tiên 3 và fallback

---

## 🔍 So Sánh Job Value với CV

### **Cách Hệ Thống Xác Định Field So Sánh**

Hệ thống sử dụng `type.cvField` để biết cần so sánh với field nào trong CV:

- `type.cvField = 'jlptLevel'` → So sánh với `cv.jlptLevel`
- `type.cvField = 'experienceYears'` → So sánh với `cv.experienceYears`
- `type.cvField = 'specialization'` → So sánh với `cv.specialization`
- `type.cvField = 'qualification'` → So sánh với `cv.qualification`
- `type.cvField = null` → Type này không so sánh với CV

### **Quy Trình So Sánh**

#### **Bước 1: Kiểm tra comparisonOperator**

Nếu `value.comparisonOperator` tồn tại:
- Lấy giá trị từ CV: `cvValue = cv[type.cvField]`
- So sánh với `compareValue(cvValue, valueRef, cvField)`
- **Đặc biệt cho JLPT:** Logic đảo ngược (số nhỏ hơn = level cao hơn)

**Ví dụ:**
- Type có `cvField = 'jlptLevel'`
- Value có `comparisonOperator = '>='`, `comparisonValue = 3` (N3 trở lên)
- CV có `jlptLevel = 1` (N1)
- So sánh: `1 <= 3` → ✅ TRUE (vì N1 cao hơn N3)

#### **Bước 2: Exact Match với valueId**

Nếu không có `comparisonOperator`:
- So sánh: `jobValue.valueId === cv[type.cvField]`

**Ví dụ:**
- Type có `cvField = 'jlptLevel'`
- JobValue có `valueId = 2` (N2)
- CV có `jlptLevel = 2` (N2)
- So sánh: `2 === 2` → ✅ TRUE

#### **Bước 3: So Sánh với valuename (chỉ cho JLPT)**

Nếu `cvField = 'jlptLevel'` và không match ở bước 2:
- Lấy `value.valuename` và kiểm tra xem có chứa "N1", "N2", "N3", "N4", "N5" tương ứng không

**Ví dụ:**
- CV có `jlptLevel = 1` (N1)
- Value có `valuename = "N1 Level"`
- So sánh: `"N1 Level".includes("N1")` → ✅ TRUE

---

## ⚠️ Các Trường Hợp Ngoại Lệ

### **1. Ngoại Lệ: Job Thuộc Campaign**

**Đặc điểm:**
- Ghi đè **TẤT CẢ** các quy tắc tính toán thông thường
- Bỏ qua `job_commission_type` và `job_values`
- Chỉ sử dụng `campaign.percent`

**Điều kiện kích hoạt:**
- Job có liên kết với Campaign
- Campaign có `status = 1` (Active)
- Thời gian hiện tại nằm trong khoảng `start_date` và `end_date`

---

### **2. Ngoại Lệ: typeId = 2, valueId = 6**

**Đặc điểm:**
- CTV trực tiếp nhận theo công thức
- **KHÔNG CẦN** so khớp điều kiện CV
- Bỏ qua việc kiểm tra CV hoàn toàn

**Khi nào sử dụng:**
- Khi job có điều kiện đặc biệt không cần kiểm tra CV
- Áp dụng cho tất cả ứng viên không phân biệt trình độ

---

### **3. Ngoại Lệ: typeId = 2, valueId = 7**

**Đặc điểm:**
- Tương tự valueId = 6
- **KHÔNG CẦN** so sánh với CV
- Công thức giống hệt valueId = 6

---

### **4. Ngoại Lệ: Admin Tiến Cử**

**Đặc điểm:**
- Admin **KHÔNG** nhân với `rankLevel.percent`
- Admin nhận đúng % hoặc số tiền của sàn

**Công thức cho Admin:**
```
Nếu percent: Admin nhận = (monthlySalary × 12) × (percent / 100)
Nếu fixed: Admin nhận = fixed_amount
```

**Ví dụ:**
- `monthlySalary` = 30 万円
- `percent` = 5%

**CTV (rank 80%):**
```
= (30 × 12) × 5% × 80% = 14.4 万円
```

**Admin:**
```
= (30 × 12) × 5% = 18 万円
```

---

### **5. Ngoại Lệ: Không Tìm Thấy Job Value Phù Hợp**

**Khi nào xảy ra:**
- `job_commission_type = 'percent'` hoặc `'fixed'`
- Không có `job_value` nào khớp với điều kiện CV
- Không có `cvCode` hoặc CV không tồn tại

**Xử lý:**
- Trả về `0` (không có hoa hồng)
- Hoặc lấy `job_value` đầu tiên làm fallback (nếu có)

---

### **6. Ngoại Lệ: CTV Không Có Rank Level**

**Khi nào xảy ra:**
- CTV chưa được gán `rank_level_id`
- `rank_level` không tồn tại trong database

**Xử lý:**
- Throw error: `"CTV không có rank level"`
- Cần gán rank level cho CTV trước khi tính toán

---

### **7. Ngoại Lệ: Monthly Salary = 0 hoặc NULL**

**Khi nào xảy ra:**
- `job_application.monthly_salary` = 0 hoặc NULL
- Chưa cập nhật lương cho ứng viên

**Xử lý:**
- `annualSalary = 0`
- Nếu `job_commission_type = 'percent'` → Kết quả = 0
- Nếu `job_commission_type = 'fixed'` → Vẫn tính được (dựa trên fixed_amount)

---

## 📊 Ví Dụ Cụ Thể

### **Ví Dụ 1: Job Thuộc Campaign**

**Thông tin:**
- `monthlySalary` = 40 万円
- `campaign.percent` = 7%
- `rankLevel.percent` = 85%
- `job_commission_type` = 'percent'
- `job_values` = 5%

**Tính toán:**
```
→ Job thuộc campaign → Bỏ qua job_commission_type và job_values
→ CTV nhận = (40 × 12) × 7% × 85%
          = 480 × 0.07 × 0.85
          = 28.56 万円
```

---

### **Ví Dụ 2: Job Có Ngoại Lệ valueId = 6**

**Thông tin:**
- `monthlySalary` = 28 万円
- `job_commission_type` = 'percent'
- `job_value` (valueId = 6) = 4.5%
- `rankLevel.percent` = 80%

**Tính toán:**
```
→ Có valueId = 6 → Không cần so khớp CV
→ CTV nhận = (28 × 12) × 4.5% × 80%
          = 336 × 0.045 × 0.8
          = 12.096 万円
```

---

### **Ví Dụ 3: Job Commission Type = 'fixed'**

**Thông tin:**
- `monthlySalary` = 35 万円 (không ảnh hưởng)
- `job_commission_type` = 'fixed'
- `job_value.value` = 60 万円
- `rankLevel.percent` = 90%

**Tính toán:**
```
→ CTV nhận = 60 × 90%
          = 54 万円
```

---

### **Ví Dụ 4: Job Commission Type = 'percent' với So Sánh CV**

**Thông tin:**
- `monthlySalary` = 32 万円
- `job_commission_type` = 'percent'
- Job có Type "JLPT Level" với `cvField = 'jlptLevel'`
- Job có Value "Từ N3 trở lên" với `comparisonOperator = '>='`, `comparisonValue = 3`
- CV có `jlptLevel = 1` (N1)
- `rankLevel.percent` = 75%

**Tính toán:**
```
→ So sánh: CV jlptLevel = 1, Value ">= 3"
→ Logic đảo ngược: 1 <= 3 → ✅ TRUE
→ matchedJobValue.value = 5%
→ CTV nhận = (32 × 12) × 5% × 75%
          = 384 × 0.05 × 0.75
          = 14.4 万円
```

---

### **Ví Dụ 5: Admin Tiến Cử**

**Thông tin:**
- `monthlySalary` = 30 万円
- `job_commission_type` = 'percent'
- `job_value.value` = 6%
- `collaboratorId` = null (Admin)

**Tính toán:**
```
→ Admin nhận = (30 × 12) × 6%
            = 360 × 0.06
            = 21.6 万円
(Không nhân với rankLevel.percent)
```

---

### **Ví Dụ 6: So Sánh với Experience Years**

**Thông tin:**
- `monthlySalary` = 40 万円
- `job_commission_type` = 'percent'
- Job có Type "Experience Years" với `cvField = 'experienceYears'`
- Job có Value "Trên 3 năm" với `comparisonOperator = '>'`, `comparisonValue = 3`
- CV có `experienceYears = 5`
- `rankLevel.percent` = 80%

**Tính toán:**
```
→ So sánh: CV experienceYears = 5, Value "> 3"
→ Logic bình thường: 5 > 3 → ✅ TRUE
→ matchedJobValue.value = 6%
→ CTV nhận = (40 × 12) × 6% × 80%
          = 480 × 0.06 × 0.8
          = 23.04 万円
```

---

## ⚠️ Lưu Ý Quan Trọng

### **1. Thứ Tự Ưu Tiên**

Luôn kiểm tra theo thứ tự:
1. **Campaign** (cao nhất)
2. **Ngoại lệ valueId = 6**
3. **Ngoại lệ valueId = 7**
4. **Trường hợp thông thường** (so sánh với CV)

### **2. Monthly Salary**

- **Bắt buộc** có giá trị để tính toán (trừ trường hợp fixed)
- Được lấy từ `job_applications.monthly_salary`
- Đơn vị: **万円** (Yên Nhật)
- Chuyển đổi: `annualSalary = monthlySalary × 12`

### **3. Rank Level**

- CTV **BẮT BUỘC** phải có `rank_level`
- Admin **KHÔNG** cần rank level (nhận đúng % sàn)
- Nếu CTV không có rank level → Throw error

### **4. Campaign**

- Campaign phải **đang hoạt động** (status = 1)
- Thời gian hiện tại phải nằm trong khoảng `start_date` và `end_date`
- Campaign **ghi đè** tất cả quy tắc khác

### **5. Job Values**

- Cần có ít nhất 1 `job_value` để tính toán
- Nếu `job_commission_type = 'percent'`, cần so khớp với CV (trừ ngoại lệ)
- Nếu không tìm thấy job_value phù hợp → Trả về 0

### **6. CV Code và So Sánh**

- Cần `cvCode` để so khớp điều kiện (nếu `job_commission_type = 'percent'`)
- Nếu không có `cvCode` → Vẫn tìm theo ưu tiên 3 và fallback
- Type phải có `cvField` để biết so sánh với field nào trong CV

### **7. Type và cvField**

- Mỗi Type có thể có `cvField` để chỉ định field trong CV cần so sánh
- Nếu `cvField = null` → Type này không so sánh với CV
- Các `cvField` hợp lệ: `'jlptLevel'`, `'experienceYears'`, `'specialization'`, `'qualification'`

### **8. Comparison Operator**

- Hỗ trợ: `>=`, `<=`, `>`, `<`, `=`, `between`
- **Đặc biệt cho JLPT:** Logic đảo ngược (số nhỏ hơn = level cao hơn)
- Nếu không có `comparisonOperator` → So sánh exact match với `valueId`

### **9. Xử Lý Lỗi**

- Nếu job không tồn tại → Throw error
- Nếu CTV không có rank level → Throw error
- Nếu không tìm thấy job_value phù hợp → Trả về 0

---

## 🔄 Khi Nào Số Tiền Được Tính?

### **1. Tự Động Khi Tạo Job Application**

Khi CTV tạo `job_application` với `monthlySalary`:
- Hệ thống tự động gọi `calculateCommission()`
- Tạo `payment_request` với số tiền đã tính
- `status = 0` (Chờ duyệt)

### **2. Tự Động Khi Cập Nhật Monthly Salary**

Khi Admin/CTV cập nhật `job_applications.monthly_salary`:
- Hệ thống tự động tính lại số tiền
- Cập nhật `payment_request.amount`
- Chỉ cập nhật nếu `payment_request.status = 0` (Chờ duyệt)

### **3. Thủ Công**

CTV có thể chỉnh sửa `amount` trong `payment_request`:
- Chỉ khi `status = 0` (Chờ duyệt)
- Sau khi chỉnh sửa, Admin vẫn có thể xem và điều chỉnh

---

## 📝 Tóm Tắt Công Thức

| Trường Hợp | Công Thức CTV | Công Thức Admin |
|-----------|---------------|-----------------|
| **Campaign** | `(salary × 12) × campaign% × rank%` | `(salary × 12) × campaign%` |
| **valueId = 6 (percent)** | `(salary × 12) × job_value% × rank%` | `(salary × 12) × job_value%` |
| **valueId = 6 (fixed)** | `fixed_amount × rank%` | `fixed_amount` |
| **valueId = 7 (percent)** | `(salary × 12) × job_value% × rank%` | `(salary × 12) × job_value%` |
| **valueId = 7 (fixed)** | `fixed_amount × rank%` | `fixed_amount` |
| **Thông thường (percent)** | `(salary × 12) × matchedJobValue% × rank%` | `(salary × 12) × matchedJobValue%` |
| **Thông thường (fixed)** | `matchedJobValue × rank%` | `matchedJobValue` |

**Lưu ý:** 
- `salary` = `monthlySalary` (đơn vị: 万円)
- Kết quả cuối cùng = VND (hoặc 万円, tùy vào cách lưu trữ)

---

## 🔍 Chi Tiết So Sánh CV

### **Logic So Sánh với Comparison Operator**

#### **Cho JLPT (cvField = 'jlptLevel'):**

Vì số nhỏ hơn = level cao hơn (1=N1 cao nhất, 5=N5 thấp nhất), logic được đảo ngược:

| Operator | Ý nghĩa | Logic Code | Ví dụ |
|----------|---------|------------|-------|
| `>=` | "Từ N3 trở lên" | `cvLevel <= compareValue` | CV N1 (1) với ">= 3" → `1 <= 3` → ✅ |
| `<=` | "Từ N2 trở xuống" | `cvLevel >= compareValue` | CV N3 (3) với "<= 2" → `3 >= 2` → ✅ |
| `>` | "Trên N3" | `cvLevel < compareValue` | CV N1 (1) với "> 3" → `1 < 3` → ✅ |
| `<` | "Dưới N2" | `cvLevel > compareValue` | CV N3 (3) với "< 2" → `3 > 2` → ✅ |
| `=` | "Chính xác N2" | `cvLevel === compareValue` | CV N2 (2) với "= 2" → `2 === 2` → ✅ |
| `between` | "Từ N3 đến N1" | `min <= cvLevel <= max` | CV N2 (2) với "between 3-1" → `1 <= 2 <= 3` → ✅ |

#### **Cho Các Field Khác (experienceYears, specialization, qualification):**

Logic bình thường (số lớn hơn = giá trị cao hơn):

| Operator | Ý nghĩa | Logic Code | Ví dụ |
|----------|---------|------------|-------|
| `>=` | "Từ 3 năm trở lên" | `cvValue >= compareValue` | CV 5 năm với ">= 3" → `5 >= 3` → ✅ |
| `<=` | "Từ 5 năm trở xuống" | `cvValue <= compareValue` | CV 3 năm với "<= 5" → `3 <= 5` → ✅ |
| `>` | "Trên 3 năm" | `cvValue > compareValue` | CV 5 năm với "> 3" → `5 > 3` → ✅ |
| `<` | "Dưới 5 năm" | `cvValue < compareValue` | CV 3 năm với "< 5" → `3 < 5` → ✅ |
| `=` | "Chính xác 3 năm" | `cvValue === compareValue` | CV 3 năm với "= 3" → `3 === 3` → ✅ |
| `between` | "Từ 2 đến 5 năm" | `min <= cvValue <= max` | CV 3 năm với "between 2-5" → `2 <= 3 <= 5` → ✅ |

---

## 📚 Tham Khảo

- **File xử lý:** `backend/src/utils/commissionCalculator.js`
- **Tài liệu so sánh JLPT:** `backend/docs/JLPT_COMPARISON_GUIDE.md`
- **Tài liệu comparison operators:** `backend/docs/COMPARISON_OPERATORS.md`

**Ngày cập nhật:** 2024-02-01

**Phiên bản:** 2.0 (Refactored với cvField)
