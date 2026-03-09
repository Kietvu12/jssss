# Danh Sách Đầy Đủ Các Chức Năng Cho Admin & CTV

## 📋 Tổng Quan

Dựa trên phân tích database JobShare 2.0, hệ thống có **48 bảng** với các chức năng được phân chia cho 2 đối tượng chính:

- **Admin**: Quản trị viên hệ thống (3 vai trò: Super Admin, Admin Backoffice, Admin CA Team)
- **CTV (Collaborator)**: Cộng tác viên - người giới thiệu ứng viên cho các công việc

---

## 👨‍💼 CHỨC NĂNG CHO ADMIN

### 🔐 1. QUẢN LÝ XÁC THỰC & PHÂN QUYỀN

#### 1.1. Quản lý Admin

- ✅ **Đăng nhập/Đăng xuất hệ thống**
- ✅ **Quản lý tài khoản Admin**
  - Xem danh sách admin
  - Thêm mới admin
  - Chỉnh sửa thông tin admin (tên, email, SĐT, avatar)
  - Xóa/khóa tài khoản admin
  - Phân quyền admin (Super Admin, Admin Backoffice, Admin CA Team)
  - Gán nhóm quyền (group_id)
  - Kích hoạt/vô hiệu hóa tài khoản (is_active)
- ✅ **Quản lý nhóm quyền (Groups)**
  - Xem danh sách nhóm quyền
  - Tạo nhóm quyền mới
  - Chỉnh sửa nhóm quyền
  - Xóa nhóm quyền
  - Phân quyền chi tiết cho từng nhóm

#### 1.3. Quản lý Admin Group (Nhóm Admin)

**📌 PHÂN QUYỀN TỔNG QUAN:**

- **SuperAdmin (role = 1):** Có quyền quản lý toàn bộ Admin Group, bao gồm tạo, sửa, xóa nhóm, gán/gỡ admin, cấu hình quyền hạn, xem tất cả thống kê và báo cáo.
- **Admin trong nhóm (Admin CA Team - role = 3, có group_id):** Chỉ có quyền xem thông tin nhóm của mình, quản lý CTV được phân công cho nhóm, xử lý đơn ứng tuyển và CV của CTV trong nhóm, xem thống kê của nhóm mình. **KHÔNG có quyền** quản lý nhóm, gán/gỡ admin, hoặc xem dữ liệu của nhóm khác.

*Chi tiết phân quyền xem ở mục 1.3.7*

##### 1.3.1. Quản lý danh sách Admin Group (Super Admin)

- ✅ **Xem danh sách Admin Group**
  - Hiển thị danh sách tất cả nhóm admin
  - Lọc theo tên nhóm
  - Lọc theo mã nhóm (code)
  - Lọc theo trạng thái (active/inactive)
  - Tìm kiếm nhóm theo từ khóa (tên, mã)
  - Sắp xếp theo tên, ngày tạo, số lượng admin
  - Xem số lượng admin trong từng nhóm
  - Xem số lượng CTV được phân công cho nhóm
  - Phân trang danh sách

- ✅ **Xem chi tiết Admin Group**
  - Thông tin cơ bản nhóm:
    - Tên nhóm (name)
    - Mã nhóm (code)
    - Mã giới thiệu (referral_code) - nếu có
    - Mô tả nhóm (description)
    - Trạng thái (status: active/inactive)
    - Ngày tạo, ngày cập nhật
  - Danh sách admin thuộc nhóm:
    - Tên, email, SĐT admin
    - Vai trò admin (Super Admin, Admin Backoffice, Admin CA Team)
    - Trạng thái tài khoản admin
    - Ngày tham gia nhóm
  - Thống kê nhóm:
    - Tổng số admin trong nhóm
    - Số admin active/inactive
    - Số lượng CTV được phân công cho nhóm
    - Số đơn ứng tuyển do nhóm xử lý
    - Số CV do nhóm quản lý
  - Lịch sử hoạt động của nhóm:
    - Lịch sử tạo, chỉnh sửa, xóa
    - Lịch sử gán/gỡ admin
    - Lịch sử thay đổi quyền hạn

##### 1.3.2. Tạo và chỉnh sửa Admin Group

- ✅ **Tạo Admin Group mới**
  - Nhập thông tin cơ bản:
    - Tên nhóm (bắt buộc)
    - Mã nhóm (code) - tự động tạo hoặc nhập thủ công
    - Mã giới thiệu (referral_code) - tự động tạo hoặc nhập thủ công
    - Mô tả nhóm (description)
  - Thiết lập trạng thái:
    - Active/Inactive
  - Cấu hình quyền hạn của nhóm (nếu có hệ thống phân quyền):
    - Quyền truy cập các module
    - Quyền CRUD (Create, Read, Update, Delete)
    - Quyền xem báo cáo, thống kê
    - Quyền quản lý CTV, đơn ứng tuyển
  - Validation:
    - Kiểm tra mã nhóm không trùng
    - Kiểm tra mã giới thiệu không trùng

- ✅ **Chỉnh sửa Admin Group**
  - Cập nhật thông tin cơ bản:
    - Cập nhật tên nhóm
    - Cập nhật mã nhóm (nếu cho phép)
    - Cập nhật mã giới thiệu
    - Cập nhật mô tả
  - Thay đổi trạng thái:
    - Kích hoạt/Vô hiệu hóa nhóm
  - Cập nhật cấu hình quyền hạn:
    - Thay đổi quyền truy cập module
    - Thay đổi quyền CRUD
    - Thay đổi quyền xem báo cáo
  - Validation:
    - Kiểm tra mã nhóm không trùng với nhóm khác
    - Kiểm tra nhóm có admin không trước khi vô hiệu hóa

- ✅ **Xóa Admin Group**
  - Kiểm tra điều kiện:
    - Kiểm tra xem nhóm có admin nào không
    - Không cho xóa nếu nhóm còn admin
    - Hiển thị cảnh báo nếu nhóm đang có CTV được phân công
  - Xóa nhóm:
    - Soft delete (nếu có deleted_at)
    - Hard delete (nếu không có admin và CTV)
  - Xử lý admin sau khi xóa nhóm:
    - Gỡ group_id khỏi admin (set null)
    - Hoặc chuyển admin sang nhóm khác

##### 1.3.3. Quản lý Admin trong nhóm

- ✅ **Gán admin vào nhóm**
  - Gán 1 admin vào 1 nhóm:
    - Chọn admin từ danh sách
    - Chọn nhóm đích
    - Xác nhận gán
  - Gán nhiều admin vào 1 nhóm (bulk assign):
    - Chọn nhiều admin cùng lúc
    - Chọn nhóm đích
    - Gán hàng loạt
  - Chuyển admin từ nhóm này sang nhóm khác:
    - Chọn admin
    - Chọn nhóm nguồn
    - Chọn nhóm đích
    - Xác nhận chuyển
  - Validation:
    - Kiểm tra admin đã thuộc nhóm khác chưa
    - Kiểm tra admin có quyền tham gia nhóm không

- ✅ **Gỡ admin khỏi nhóm**
  - Gỡ 1 admin khỏi nhóm:
    - Chọn admin
    - Chọn nhóm
    - Xác nhận gỡ
  - Gỡ nhiều admin khỏi nhóm (bulk remove):
    - Chọn nhiều admin
    - Gỡ hàng loạt
  - Xử lý sau khi gỡ:
    - Set group_id = null cho admin
    - Ghi log hành động

- ✅ **Xem danh sách admin trong nhóm**
  - Lọc admin theo nhóm:
    - Chọn nhóm
    - Hiển thị danh sách admin thuộc nhóm
  - Xem thông tin chi tiết admin trong nhóm:
    - Thông tin cá nhân
    - Vai trò, quyền hạn
    - Trạng thái tài khoản
    - Ngày tham gia nhóm
  - Xem quyền hạn của admin trong nhóm:
    - Quyền được kế thừa từ nhóm
    - Quyền riêng của admin (nếu có)
  - Thống kê admin trong nhóm:
    - Số đơn ứng tuyển đã xử lý
    - Số CTV được phân công
    - Số CV đã quản lý

##### 1.3.4. Quản lý quyền hạn nhóm

- ✅ **Cấu hình quyền truy cập module**
  - Module quản lý CTV:
    - Xem danh sách CTV
    - Tạo/sửa/xóa CTV
    - Phân công CTV
  - Module quản lý đơn ứng tuyển:
    - Xem danh sách đơn
    - Tạo/sửa/xóa đơn
    - Thay đổi trạng thái đơn
  - Module quản lý CV:
    - Xem danh sách CV
    - Tạo/sửa/xóa CV
  - Module quản lý việc làm:
    - Xem danh sách việc làm
    - Tạo/sửa/xóa việc làm
  - Module quản lý thanh toán:
    - Xem yêu cầu thanh toán
    - Duyệt/từ chối thanh toán
  - Module báo cáo & thống kê:
    - Xem dashboard
    - Xem báo cáo
    - Xuất báo cáo

- ✅ **Cấu hình quyền CRUD**
  - Quyền Create (Tạo mới):
    - Cho phép/không cho phép tạo mới
    - Áp dụng cho từng module
  - Quyền Read (Xem):
    - Xem tất cả
    - Chỉ xem của nhóm mình
    - Chỉ xem của mình
  - Quyền Update (Chỉnh sửa):
    - Cho phép/không cho phép chỉnh sửa
    - Chỉnh sửa tất cả
    - Chỉ chỉnh sửa của nhóm mình
    - Chỉ chỉnh sửa của mình
  - Quyền Delete (Xóa):
    - Cho phép/không cho phép xóa
    - Xóa tất cả
    - Chỉ xóa của nhóm mình
    - Chỉ xóa của mình

- ✅ **Cấu hình quyền đặc biệt**
  - Quyền xem báo cáo, thống kê:
    - Xem dashboard tổng quan
    - Xem báo cáo CTV
    - Xem báo cáo đơn ứng tuyển
    - Xem báo cáo thanh toán
    - Xuất báo cáo Excel/PDF
  - Quyền quản lý CTV:
    - Phân công CTV cho admin
    - Chuyển CTV giữa các admin
    - Xem tất cả CTV
    - Chỉ xem CTV được phân công
  - Quyền quản lý đơn ứng tuyển:
    - Xem tất cả đơn
    - Chỉ xem đơn của nhóm mình
    - Chỉ xem đơn của mình
    - Thay đổi trạng thái đơn
  - Quyền quản lý hệ thống:
    - Cấu hình hệ thống
    - Quản lý admin khác
    - Quản lý nhóm admin

##### 1.3.5. Thống kê và báo cáo Admin Group

- ✅ **Thống kê hoạt động của nhóm**
  - Thống kê admin:
    - Tổng số admin trong nhóm
    - Số admin active/inactive
    - Số admin theo vai trò
  - Thống kê CTV:
    - Tổng số CTV được phân công cho nhóm
    - Số CTV active/inactive
    - Top CTV có nhiều đơn ứng tuyển nhất
  - Thống kê đơn ứng tuyển:
    - Tổng số đơn do nhóm xử lý
    - Số đơn theo trạng thái
    - Tỷ lệ thành công (nyusha/thanh toán)
    - Biểu đồ đơn theo thời gian
  - Thống kê CV:
    - Tổng số CV do nhóm quản lý
    - Số CV mới trong tháng
  - Thống kê thanh toán:
    - Tổng số tiền thanh toán
    - Số yêu cầu thanh toán đã duyệt
    - Biểu đồ thanh toán theo thời gian

- ✅ **Xuất báo cáo Admin Group**
  - Báo cáo danh sách admin trong nhóm:
    - Excel/PDF
    - Bao gồm thông tin admin, vai trò, trạng thái
  - Báo cáo hoạt động nhóm:
    - Excel/PDF
    - Thống kê đơn ứng tuyển, CV, thanh toán
  - Báo cáo CTV được phân công:
    - Excel/PDF
    - Danh sách CTV, số đơn, số tiền

##### 1.3.6. Lịch sử và log Admin Group

- ✅ **Xem lịch sử hoạt động của nhóm**
  - Lịch sử tạo, chỉnh sửa, xóa:
    - Ai thực hiện
    - Khi nào
    - Thay đổi gì
    - Dữ liệu trước và sau
  - Lịch sử gán admin vào nhóm:
    - Admin nào được gán
    - Ai gán
    - Khi nào
    - Từ nhóm nào sang nhóm nào
  - Lịch sử gỡ admin khỏi nhóm:
    - Admin nào bị gỡ
    - Ai gỡ
    - Khi nào
  - Lịch sử thay đổi quyền hạn:
    - Quyền nào được thay đổi
    - Ai thay đổi
    - Khi nào
    - Giá trị trước và sau

- ✅ **Xem log chi tiết**
  - Lọc log theo:
    - Admin thực hiện
    - Loại hành động
    - Khoảng thời gian
    - Nhóm
  - Xem chi tiết log:
    - Thông tin đầy đủ về hành động
    - Dữ liệu trước và sau (JSON)
    - IP address
    - User agent

##### 1.3.7. Phân quyền SuperAdmin và AdminGroup

**🔑 QUYỀN CỦA SUPER ADMIN (role = 1) ĐỐI VỚI ADMIN GROUP:**

- ✅ **Quản lý toàn bộ Admin Group**
  - **Tạo Admin Group mới:**
    - Tạo nhóm mới với đầy đủ thông tin
    - Cấu hình quyền hạn cho nhóm
    - Thiết lập mã giới thiệu (referral_code)
  - **Chỉnh sửa Admin Group:**
    - Sửa tất cả thông tin nhóm (tên, mã, mô tả)
    - Thay đổi trạng thái nhóm (active/inactive)
    - Cấu hình lại quyền hạn của nhóm
  - **Xóa Admin Group:**
    - Xóa nhóm (soft delete hoặc hard delete)
    - Xử lý admin sau khi xóa nhóm
  - **Gán/Gỡ admin vào nhóm:**
    - Gán bất kỳ admin nào vào bất kỳ nhóm nào
    - Gán nhiều admin cùng lúc (bulk assign)
    - Chuyển admin giữa các nhóm
    - Gỡ admin khỏi nhóm
  - **Xem toàn bộ thông tin:**
    - Xem danh sách tất cả nhóm
    - Xem chi tiết mọi nhóm
    - Xem tất cả admin trong mọi nhóm
    - Xem lịch sử hoạt động của tất cả nhóm
  - **Cấu hình quyền hạn:**
    - Cấu hình quyền truy cập module cho nhóm
    - Cấu hình quyền CRUD cho nhóm
    - Cấu hình quyền đặc biệt cho nhóm
  - **Thống kê và báo cáo:**
    - Xem thống kê của tất cả nhóm
    - Xuất báo cáo của tất cả nhóm
    - So sánh hiệu suất giữa các nhóm

**👥 QUYỀN CỦA ADMIN TRONG NHÓM (Admin CA Team - role = 3, có group_id):**

- ✅ **Xem thông tin nhóm của mình (CHỈ ĐỌC)**
  - Xem thông tin cơ bản nhóm:
    - Tên, mã nhóm
    - Mô tả nhóm
    - Trạng thái nhóm
    - Mã giới thiệu (referral_code)
  - Xem danh sách admin cùng nhóm:
    - Tên, email, vai trò
    - Trạng thái tài khoản
    - **KHÔNG được xem mật khẩu, thông tin nhạy cảm**
  - Xem quyền hạn của nhóm mình:
    - Quyền truy cập module được cấp
    - Quyền CRUD được cấp
    - Quyền đặc biệt được cấp
  - **KHÔNG được:**
    - Tạo nhóm mới
    - Chỉnh sửa thông tin nhóm
    - Xóa nhóm
    - Gán/gỡ admin vào nhóm
    - Thay đổi quyền hạn của nhóm

- ✅ **Quản lý CTV được phân công cho nhóm**
  - Xem danh sách CTV được phân công cho nhóm:
    - Tất cả CTV được SuperAdmin phân công cho nhóm
    - Lọc, tìm kiếm CTV
  - Xem chi tiết CTV được phân công:
    - Thông tin đầy đủ của CTV
    - Lịch sử hoạt động
  - **Tiến cử ứng viên cho CTV được phân công:**
    - Tạo đơn ứng tuyển mới cho CTV
    - Chọn việc làm
    - Nhập thông tin ứng viên
    - Upload CV, tài liệu
  - **Thêm mới ứng viên cho CTV được phân công:**
    - Tạo CV mới cho CTV
    - Nhập thông tin ứng viên
    - Upload file CV
  - Xem danh sách đơn ứng tuyển của CTV được phân công
  - Xem danh sách CV của CTV được phân công
  - Cập nhật thông tin đơn ứng tuyển của CTV được phân công
  - Thay đổi trạng thái đơn ứng tuyển của CTV được phân công
  - **KHÔNG được:**
    - Phân công CTV mới cho nhóm (chỉ SuperAdmin mới có quyền)
    - Chuyển CTV sang nhóm khác
    - Gỡ CTV khỏi nhóm
    - Xem CTV không thuộc nhóm mình

- ✅ **Quản lý đơn ứng tuyển của nhóm**
  - Xem danh sách đơn ứng tuyển:
    - Chỉ xem đơn của CTV được phân công cho nhóm
    - Lọc theo trạng thái, ngày, việc làm
    - Tìm kiếm đơn
  - Xem chi tiết đơn ứng tuyển:
    - Thông tin đầy đủ đơn
    - Lịch sử thay đổi trạng thái
  - Tạo đơn ứng tuyển mới:
    - Chỉ cho CTV được phân công cho nhóm
    - Chọn việc làm
    - Nhập thông tin ứng viên
  - Chỉnh sửa đơn ứng tuyển:
    - Chỉ đơn của CTV được phân công cho nhóm
    - Cập nhật thông tin ứng viên
    - Cập nhật lịch trình (ngày PV, nyusha)
    - Thay đổi trạng thái đơn
  - Xóa đơn ứng tuyển:
    - Chỉ đơn của CTV được phân công cho nhóm
  - **KHÔNG được:**
    - Xem đơn của CTV không thuộc nhóm mình
    - Chỉnh sửa đơn của nhóm khác
    - Xóa đơn của nhóm khác

- ✅ **Quản lý CV của nhóm**
  - Xem danh sách CV:
    - Chỉ xem CV của CTV được phân công cho nhóm
    - Lọc, tìm kiếm CV
  - Xem chi tiết CV:
    - Thông tin đầy đủ CV
    - File CV đính kèm
  - Tạo CV mới:
    - Chỉ cho CTV được phân công cho nhóm
    - Nhập thông tin ứng viên
    - Upload file CV
  - Chỉnh sửa CV:
    - Chỉ CV của CTV được phân công cho nhóm
    - Cập nhật thông tin ứng viên
    - Thay đổi file CV
  - Xóa CV:
    - Chỉ CV của CTV được phân công cho nhóm
  - **KHÔNG được:**
    - Xem CV của CTV không thuộc nhóm mình
    - Chỉnh sửa CV của nhóm khác

- ✅ **Quản lý thanh toán của nhóm**
  - Xem danh sách yêu cầu thanh toán:
    - Chỉ yêu cầu của CTV được phân công cho nhóm
    - Lọc theo trạng thái, thời gian
  - Xem chi tiết yêu cầu thanh toán:
    - Thông tin đầy đủ yêu cầu
    - Thông tin đơn ứng tuyển liên quan
  - Duyệt/Từ chối yêu cầu thanh toán:
    - Chỉ yêu cầu của CTV được phân công cho nhóm
    - Nhập lý do từ chối (nếu có)
  - **KHÔNG được:**
    - Xem yêu cầu thanh toán của CTV không thuộc nhóm mình
    - Duyệt yêu cầu của nhóm khác

- ✅ **Xem thống kê của nhóm**
  - Xem thống kê hoạt động của nhóm:
    - Số admin trong nhóm
    - Số CTV được phân công
    - Số đơn ứng tuyển do nhóm xử lý
    - Số CV do nhóm quản lý
    - Biểu đồ thống kê
  - Xem thống kê cá nhân trong nhóm:
    - Số đơn đã xử lý
    - Số CTV được phân công
    - Số CV đã quản lý
    - Tỷ lệ thành công
  - **KHÔNG được:**
    - Xem thống kê của nhóm khác
    - So sánh với nhóm khác (trừ khi SuperAdmin cho phép)
    - Xuất báo cáo tổng hợp (chỉ SuperAdmin)

- ✅ **Xem lịch sử hoạt động**
  - Xem lịch sử hoạt động của nhóm:
    - Lịch sử tạo, chỉnh sửa đơn ứng tuyển
    - Lịch sử thay đổi trạng thái đơn
    - Lịch sử quản lý CV
  - **KHÔNG được:**
    - Xem lịch sử quản lý nhóm (chỉ SuperAdmin)
    - Xem lịch sử của nhóm khác

**📋 TÓM TẮT PHÂN QUYỀN:**

| Chức năng | SuperAdmin | Admin trong nhóm (Admin CA Team) |
|-----------|------------|----------------------------------|
| **Tạo Admin Group** | ✅ Có quyền | ❌ Không có quyền |
| **Chỉnh sửa Admin Group** | ✅ Có quyền | ❌ Không có quyền |
| **Xóa Admin Group** | ✅ Có quyền | ❌ Không có quyền |
| **Gán/Gỡ admin vào nhóm** | ✅ Có quyền | ❌ Không có quyền |
| **Cấu hình quyền hạn nhóm** | ✅ Có quyền | ❌ Không có quyền |
| **Xem thông tin nhóm** | ✅ Xem tất cả nhóm | ✅ Chỉ xem nhóm của mình |
| **Xem admin trong nhóm** | ✅ Xem tất cả | ✅ Chỉ xem admin cùng nhóm |
| **Quản lý CTV** | ✅ Quản lý tất cả CTV | ✅ Chỉ CTV được phân công cho nhóm |
| **Phân công CTV cho nhóm** | ✅ Có quyền | ❌ Không có quyền |
| **Quản lý đơn ứng tuyển** | ✅ Quản lý tất cả đơn | ✅ Chỉ đơn của CTV trong nhóm |
| **Quản lý CV** | ✅ Quản lý tất cả CV | ✅ Chỉ CV của CTV trong nhóm |
| **Quản lý thanh toán** | ✅ Quản lý tất cả | ✅ Chỉ thanh toán của CTV trong nhóm |
| **Xem thống kê** | ✅ Xem tất cả | ✅ Chỉ thống kê của nhóm mình |
| **Xuất báo cáo** | ✅ Xuất tất cả | ❌ Không có quyền |
| **Xem lịch sử** | ✅ Xem tất cả | ✅ Chỉ lịch sử của nhóm mình |

#### 1.2. Quản lý Session & Security

- ✅ **Xem lịch sử đăng nhập/đăng xuất**
- ✅ **Quản lý session đang hoạt động**
- ✅ **Reset mật khẩu admin**
- ✅ **Quản lý OAuth tokens** (nếu có API)

---

### 👥 2. QUẢN LÝ CỘNG TÁC VIÊN (CTV)

#### 2.1. Quản lý thông tin CTV

- ✅ **Xem danh sách CTV**
  - Lọc theo trạng thái (active/inactive)
  - Lọc theo cấp bậc (rank_level_id)
  - Lọc theo nhóm (group_id)
  - Tìm kiếm theo tên, email, mã CTV, SĐT
  - Sắp xếp theo điểm tích lũy, ngày đăng ký, ngày duyệt
- ✅ **Xem chi tiết CTV**
  - Thông tin cá nhân: tên, email, SĐT, địa chỉ, ngày sinh, giới tính
  - Thông tin tổ chức: loại tổ chức (cá nhân/công ty), tên công ty, mã số thuế, giấy phép kinh doanh
  - Thông tin ngân hàng: tên ngân hàng, số tài khoản, tên chủ tài khoản, chi nhánh
  - Thông tin hệ thống: mã CTV, điểm tích lũy, cấp bậc, trạng thái, ngày duyệt
  - Liên kết mạng xã hội: Facebook, Zalo
- ✅ **Thêm mới CTV**
  - Tạo tài khoản CTV mới
  - Nhập đầy đủ thông tin cá nhân, tổ chức, ngân hàng
  - Gán nhóm quyền, cấp bậc ban đầu
- ✅ **Chỉnh sửa thông tin CTV**
  - Cập nhật thông tin cá nhân
  - Cập nhật thông tin tổ chức
  - Cập nhật thông tin ngân hàng
  - Thay đổi cấp bậc, nhóm quyền
- ✅ **Duyệt/Không duyệt CTV**
  - Duyệt tài khoản CTV (approved_at)
  - Từ chối tài khoản CTV
- ✅ **Kích hoạt/Vô hiệu hóa CTV**
  - Thay đổi trạng thái (status: 1 = active, 0 = inactive)
- ✅ **Xóa CTV** (soft delete)
- ✅ **Reset mật khẩu CTV**

#### 2.2. Quản lý điểm tích lũy CTV

- ✅ **Xem lịch sử điểm (point_histories)**
  - Lịch sử thay đổi điểm của từng CTV
  - Lọc theo CTV, loại thay đổi, khoảng thời gian
- ✅ **Cộng/Trừ điểm cho CTV**
  - Thêm điểm thủ công
  - Trừ điểm (nếu có lỗi)
  - Ghi chú lý do thay đổi điểm
- ✅ **Xem bảng xếp hạng CTV**
  - Sắp xếp theo điểm tích lũy
  - Xem top CTV
  - Thống kê điểm theo cấp bậc

#### 2.3. Quản lý cấp bậc CTV (rank_levels)

- ✅ **Xem danh sách cấp bậc**
- ✅ **Tạo cấp bậc mới**
  - Tên cấp bậc, mô tả
  - Điểm yêu cầu (points_required)
  - Phần trăm lợi nhuận (percent)
  - Trạng thái hoạt động
- ✅ **Chỉnh sửa cấp bậc**
- ✅ **Xóa cấp bậc**
- ✅ **Kích hoạt/Vô hiệu hóa cấp bậc**

#### 2.4. Quản lý nhóm CTV (groups)

- ✅ **Xem danh sách nhóm CTV**
- ✅ **Tạo nhóm CTV mới**
- ✅ **Chỉnh sửa nhóm CTV**
- ✅ **Xóa nhóm CTV**
- ✅ **Gán CTV vào nhóm**

#### 2.5. Quản lý thông báo CTV

- ✅ **Xem danh sách thông báo đã gửi cho CTV**
- ✅ **Gửi thông báo cho CTV**
  - Gửi cho 1 CTV
  - Gửi cho nhiều CTV
  - Gửi cho nhóm CTV
  - Thông báo về việc làm mới (job_id)
- ✅ **Xem trạng thái đọc thông báo**
- ✅ **Xóa thông báo**

#### 2.6. Quản lý API Log CTV

- ✅ **Xem lịch sử gọi API của CTV**
  - Endpoint được gọi
  - Method (GET, POST, PUT, DELETE)
  - Request/Response
  - Status code
  - IP address
  - Thời gian gọi

#### 2.7. Phân công CTV cho AdminBackOffice (Super Admin)

- ✅ **Super Admin phân công CTV cho AdminBackOffice**
  - Xem danh sách CTV chưa được phân công
  - Xem danh sách CTV đã được phân công cho từng AdminBackOffice
  - Phân công 1 CTV cho 1 AdminBackOffice
  - Phân công nhiều CTV cho 1 AdminBackOffice (bulk assign)
  - Chuyển CTV từ AdminBackOffice này sang AdminBackOffice khác
  - Hủy phân công CTV (gỡ khỏi AdminBackOffice)
  - Xem lịch sử phân công CTV (ai phân công, khi nào, cho ai)
- ✅ **AdminBackOffice quản lý CTV được phân công**
  - Xem danh sách CTV được Super Admin phân công cho mình
  - Xem chi tiết CTV được phân công
  - **Tiến cử ứng viên cho CTV được phân công**
    - Tạo đơn ứng tuyển mới cho CTV được phân công
    - Chọn việc làm
    - Nhập thông tin ứng viên
    - Upload CV, tài liệu
    - Gán đơn ứng tuyển cho CTV được phân công
  - **Thêm mới ứng viên cho CTV được phân công**
    - Tạo CV mới cho CTV được phân công
    - Nhập thông tin ứng viên
    - Upload file CV
    - Gán CV cho CTV được phân công
  - Xem danh sách đơn ứng tuyển của CTV được phân công
  - Xem danh sách CV của CTV được phân công
  - Cập nhật thông tin đơn ứng tuyển của CTV được phân công
  - Thay đổi trạng thái đơn ứng tuyển của CTV được phân công
  - Xem thống kê CTV được phân công (số đơn ứng tuyển, số CV, tỷ lệ thành công)

---

### 📄 3. QUẢN LÝ HỒ SƠ ỨNG VIÊN (CVs)

#### 3.1. Quản lý CV

- ✅ **Xem danh sách CV**
  - Lọc theo CTV tạo CV
  - Lọc theo trạng thái
  - Lọc theo ngày nhận hồ sơ
  - Tìm kiếm theo tên, email, mã CV
- ✅ **Xem chi tiết CV**
  - Thông tin cơ bản: mã CV, tiêu đề, tên đầy đủ, email, SĐT, địa chỉ
  - Ngày nhận hồ sơ, trạng thái
  - CTV tạo hồ sơ
  - File CV đính kèm
- ✅ **Tạo CV mới**
  - Nhập thông tin ứng viên
  - Upload file CV
  - Gán cho CTV
- ✅ **Chỉnh sửa CV**
  - Cập nhật thông tin ứng viên
  - Thay đổi file CV
- ✅ **Xóa CV** (soft delete)
- ✅ **Xem lịch sử cập nhật CV** (cv_updates)

#### 3.2. Quản lý file CV

- ✅ **Xem danh sách file CV** (cv_storages, ctv_cv_storages)
- ✅ **Upload file CV**
- ✅ **Download file CV**
- ✅ **Xóa file CV**

---

### 💼 4. QUẢN LÝ VIỆC LÀM (JOBS)

#### 4.1. Quản lý việc làm

- ✅ **Xem danh sách việc làm**
  - Lọc theo trạng thái (Draft, Published, Closed, Expired)
  - Lọc theo danh mục (job_category_id)
  - Lọc theo công ty (company_id)
  - Lọc theo việc làm hot (is_hot)
  - Lọc theo việc làm ghim (is_pinned)
  - Tìm kiếm theo tiêu đề, mã việc làm
  - Sắp xếp theo ngày tạo, lượt xem, số đơn ứng tuyển
- ✅ **Xem chi tiết việc làm**
  - Thông tin cơ bản: mã việc làm, tiêu đề, mô tả, yêu cầu, hướng dẫn
  - Địa điểm: nơi làm việc, địa điểm phỏng vấn
  - Lương và phúc lợi: lương ước tính, phụ cấp, thưởng, đánh giá lương
  - Thời gian: giờ làm việc, thời gian nghỉ, làm thêm giờ
  - Thông tin công ty: tên công ty, website, trụ sở, văn phòng khác
  - Tài chính: số tiền giới thiệu, phí tham khảo
  - Trạng thái và đặc biệt: việc làm hot, ghim lên đầu
  - File: JD file (tiếng Việt và tiếng Nhật), form CV bắt buộc
  - Thống kê: số đơn ứng tuyển, số đơn đã nyusha, số đơn đã thanh toán
- ✅ **Tạo việc làm mới**
  - Nhập đầy đủ thông tin việc làm
  - Chọn danh mục việc làm
  - Chọn công ty (hoặc nhập tên công ty)
  - Upload JD file (tiếng Việt và tiếng Nhật)
  - Upload form CV bắt buộc
  - Cấu hình yêu cầu việc làm (job_settings)
  - Cấu hình lợi nhuận (job_setting_profits)
- ✅ **Chỉnh sửa việc làm**
  - Cập nhật thông tin việc làm
  - Thay đổi trạng thái
  - Cập nhật file JD, form CV
  - Cập nhật cài đặt yêu cầu
  - Cập nhật cấu hình lợi nhuận
- ✅ **Xuất bản việc làm**
  - Chuyển từ Draft → Published
- ✅ **Đóng việc làm**
  - Chuyển trạng thái → Closed
- ✅ **Gia hạn việc làm**
  - Cập nhật deadline
- ✅ **Đánh dấu việc làm hot**
  - Bật/tắt is_hot
- ✅ **Ghim việc làm lên đầu**
  - Bật/tắt is_pinned
- ✅ **Xóa việc làm** (soft delete)

#### 4.2. Quản lý danh mục việc làm (job_categories)

- ✅ **Xem danh sách danh mục**
  - Xem cấu trúc cây (parent_id)
- ✅ **Tạo danh mục mới**
  - Tên danh mục, slug, mô tả
  - Chọn danh mục cha (nếu có)
  - Thứ tự hiển thị
  - Trạng thái
- ✅ **Chỉnh sửa danh mục**
- ✅ **Xóa danh mục**
- ✅ **Sắp xếp thứ tự danh mục**

#### 4.3. Quản lý cài đặt yêu cầu việc làm và lợi nhuận 

#### 4.5. Quản lý việc làm được chọn (job_pickups)

- ✅ **Xem danh sách việc làm được chọn**
- ✅ **Tạo danh sách việc làm được chọn**
  - Tên danh sách
  - Chọn các việc làm (job_ids - JSON array)
- ✅ **Chỉnh sửa danh sách**
- ✅ **Xóa danh sách**

#### 4.6. Quản lý cài đặt việc làm trang chủ (home_setting_jobs)

- ✅ **Cấu hình việc làm hiển thị trên trang chủ**
  - Chọn danh sách việc làm
  - Sắp xếp thứ tự hiển thị

---

### 📝 5. QUẢN LÝ ĐƠN ỨNG TUYỂN (JOB_APPLICATIONS)

#### 5.1. Quản lý đơn ứng tuyển

- ✅ **Xem danh sách đơn ứng tuyển**
  - Lọc theo việc làm (job_id)
  - Lọc theo CTV (collaborator_id)
  - Lọc theo trạng thái (17 trạng thái)
  - Lọc theo ngày ứng tuyển
  - Lọc theo ngày phỏng vấn
  - Lọc theo ngày nhập công ty (nyusha_date)
  - Tìm kiếm theo tên ứng viên, email, SĐT
  - Sắp xếp theo ngày ứng tuyển, trạng thái
- ✅ **Xem chi tiết đơn ứng tuyển**
  - Thông tin ứng viên: tên, email, SĐT, địa chỉ, ngày sinh, tuổi, giới tính
  - Thông tin visa: tình trạng cư trú, loại visa, ngày hết hạn visa
  - Trình độ: tiếng Nhật (JLPT), tiếng Anh (TOEIC, IELTS), bằng lái xe
  - Kinh nghiệm: số năm kinh nghiệm, chuyên ngành, công cụ đã học/có kinh nghiệm
  - Học vấn và lịch sử làm việc (JSON)
  - Tài liệu: CV, tài liệu khác
  - Tự giới thiệu và lý do ứng tuyển
  - Thông tin lương: lương hiện tại, lương mong muốn, lương hàng năm/tháng
  - Lịch trình: ngày phỏng vấn, ngày nhập công ty, ngày dự kiến thanh toán
  - Phí giới thiệu, phần trăm lợi nhuận
  - Ghi chú, lý do từ chối
  - Thông tin việc làm
  - Thông tin CTV
  - Lịch sử thay đổi trạng thái
- ✅ **Tạo đơn ứng tuyển mới**
  - Chọn việc làm
  - Chọn CTV (hoặc để null)
  - Chọn CV (hoặc nhập thông tin mới)
  - Nhập đầy đủ thông tin ứng viên
  - Upload CV, tài liệu
- ✅ **Chỉnh sửa đơn ứng tuyển**
  - Cập nhật thông tin ứng viên
  - Cập nhật thông tin visa, trình độ, kinh nghiệm
  - Cập nhật lịch trình (ngày phỏng vấn, ngày nhập công ty)
  - Cập nhật thông tin lương
  - Thêm ghi chú
- ✅ **Thay đổi trạng thái đơn ứng tuyển** (17 trạng thái)
  1. Admin đang xử lý hồ sơ
  2. Đang tiến cử
  3. Đang xếp lịch phỏng vấn
  4. Đang phỏng vấn
  5. Đang đợi naitei
  6. Đang thương lượng naitei
  7. Đang đợi nyusha
  8. **Đã nyusha** (quan trọng - bắt đầu tính phí)
  9. Đang chờ thanh toán với công ty
  10. Gửi yêu cầu thanh toán
  11. **Đã thanh toán** (hoàn thành)
  12. Hồ sơ không hợp lệ
  13. Hồ sơ bị trùng
  14. Hồ sơ không đạt
  15. Kết quả trượt
  16. Hủy giữa chừng
  17. Không shodaku
- ✅ **Xóa đơn ứng tuyển** (soft delete)

#### 5.2. Quản lý log đơn ứng tuyển (job_application_logs)

- ✅ **Xem lịch sử thay đổi đơn ứng tuyển**
  - Trạng thái trước và sau khi thay đổi
  - Admin thực hiện thay đổi
  - Ngày tạo log
- ✅ **Xem chi tiết log**
  - Dữ liệu trước và sau khi thay đổi

#### 5.3. Quản lý cập nhật CV trong đơn ứng tuyển (cv_updates)

- ✅ **Xem lịch sử cập nhật CV**
  - Dữ liệu CV trước và sau khi cập nhật
- ✅ **Cập nhật CV trong đơn ứng tuyển**

---

### 🏢 6. QUẢN LÝ CÔNG TY (COMPANIES)

#### 6.1. Quản lý công ty

- ✅ **Xem danh sách công ty**
  - Lọc theo loại công ty
  - Lọc theo trạng thái
  - Tìm kiếm theo tên, mã công ty
- ✅ **Xem chi tiết công ty**
  - Tên công ty, logo, mã công ty
  - Loại công ty, địa chỉ, SĐT, email, website
  - Mô tả, trạng thái
  - Danh sách email CC/BCC (JSON)
  - Danh sách việc làm của công ty
- ✅ **Tạo công ty mới**
  - Nhập thông tin công ty
  - Upload logo
  - Cấu hình email CC/BCC
- ✅ **Chỉnh sửa công ty**
  - Cập nhật thông tin công ty
  - Thay đổi logo
  - Cập nhật email CC/BCC
- ✅ **Xóa công ty** (soft delete)

---

### 💰 7. QUẢN LÝ THANH TOÁN (PAYMENT_REQUESTS)

#### 7.1. Quản lý yêu cầu thanh toán

- ✅ **Xem danh sách yêu cầu thanh toán**
  - Lọc theo CTV
  - Lọc theo trạng thái (Chờ duyệt, Đã duyệt, Từ chối, Đã thanh toán)
  - Lọc theo đơn ứng tuyển
  - Lọc theo khoảng thời gian
  - Tìm kiếm theo mã yêu cầu
  - Sắp xếp theo ngày tạo, số tiền
- ✅ **Xem chi tiết yêu cầu thanh toán**
  - Thông tin CTV
  - Thông tin đơn ứng tuyển
  - Số tiền yêu cầu
  - Trạng thái
  - Thời gian duyệt/từ chối
  - Lý do từ chối
  - File đính kèm (nếu có)
- ✅ **Duyệt yêu cầu thanh toán**
  - Chuyển trạng thái: Chờ duyệt → Đã duyệt
  - Ghi chú thời gian duyệt
- ✅ **Từ chối yêu cầu thanh toán**
  - Chuyển trạng thái: Chờ duyệt → Từ chối
  - Nhập lý do từ chối
  - Ghi chú thời gian từ chối
- ✅ **Xác nhận đã thanh toán**
  - Chuyển trạng thái: Đã duyệt → Đã thanh toán
  - Ghi chú thời gian thanh toán
- ✅ **Xuất báo cáo thanh toán**
  - Báo cáo theo CTV
  - Báo cáo theo thời gian
  - Báo cáo theo trạng thái

---

### 🎯 8. QUẢN LÝ CHIẾN DỊCH (CAMPAIGNS)

#### 8.1. Quản lý chiến dịch

- ✅ **Xem danh sách chiến dịch**
  - Lọc theo trạng thái (inactive, active, ended)
  - Lọc theo khoảng thời gian
- ✅ **Xem chi tiết chiến dịch**
  - Tên, mô tả chiến dịch
  - Thời gian: ngày bắt đầu, ngày kết thúc
  - Giới hạn số CV, phần trăm thưởng
  - Danh sách việc làm trong chiến dịch (job_ids - JSON)
  - Danh sách đơn ứng tuyển trong chiến dịch
- ✅ **Tạo chiến dịch mới**
  - Nhập thông tin chiến dịch
  - Chọn danh sách việc làm
  - Cấu hình phần trăm thưởng
  - Thiết lập thời gian bắt đầu/kết thúc
  - Giới hạn số CV
- ✅ **Chỉnh sửa chiến dịch**
  - Cập nhật thông tin chiến dịch
  - Thay đổi danh sách việc làm
  - Cập nhật phần trăm thưởng
- ✅ **Kích hoạt/Tạm dừng chiến dịch**
  - Thay đổi trạng thái
- ✅ **Kết thúc chiến dịch**
  - Chuyển trạng thái → ended
- ✅ **Xóa chiến dịch**

#### 8.2. Quản lý đơn ứng tuyển trong chiến dịch

- ✅ **Xem danh sách đơn ứng tuyển trong chiến dịch**
- ✅ **Gán đơn ứng tuyển vào chiến dịch**
- ✅ **Gỡ đơn ứng tuyển khỏi chiến dịch**

---

### 📧 9. QUẢN LÝ EMAIL

#### 9.1. Quản lý template email (email_templates)

- ✅ **Xem danh sách template email**
  - Lọc theo loại template
  - Lọc theo trạng thái
- ✅ **Xem chi tiết template**
  - Tên template, tiêu đề, nội dung
  - Loại template, trạng thái
- ✅ **Tạo template mới**
  - Nhập tên, tiêu đề, nội dung
  - Chọn loại template
  - Sử dụng biến động (variables)
- ✅ **Chỉnh sửa template**
- ✅ **Xóa template**
- ✅ **Kích hoạt/Vô hiệu hóa template**

#### 9.2. Quản lý email gửi công ty (email_companies)

- ✅ **Xem danh sách email đã gửi cho công ty**
  - Lọc theo công ty
  - Lọc theo trạng thái (draft/sent)
  - Lọc theo khoảng thời gian
- ✅ **Xem chi tiết email**
  - Tiêu đề, nội dung, chủ đề
  - Danh sách người nhận (JSON)
  - File đính kèm
  - Trạng thái, thời gian gửi
- ✅ **Tạo email mới**
  - Chọn công ty
  - Nhập tiêu đề, nội dung
  - Chọn template (nếu có)
  - Chọn người nhận (CC/BCC)
  - Upload file đính kèm
- ✅ **Chỉnh sửa email** (nếu chưa gửi)
- ✅ **Gửi email**
  - Gửi cho 1 công ty
  - Gửi cho nhiều công ty
- ✅ **Xóa email**

#### 9.3. Quản lý email newsletter (email_newsletters)

- ✅ **Xem danh sách email newsletter**
  - Lọc theo nhóm người nhận
  - Lọc theo trạng thái
- ✅ **Xem chi tiết newsletter**
  - Chủ đề, nội dung
  - Danh sách người nhận (JSON)
  - Lịch gửi, thời gian gửi
  - File đính kèm
- ✅ **Tạo newsletter mới**
  - Nhập chủ đề, nội dung
  - Chọn nhóm người nhận (CTV)
  - Upload file đính kèm
  - Thiết lập lịch gửi
- ✅ **Chỉnh sửa newsletter**
- ✅ **Gửi newsletter**
  - Gửi ngay
  - Lên lịch gửi
- ✅ **Xóa newsletter**

#### 9.4. Quản lý cấu hình email

- ✅ **Cấu hình email admin** (admin_email_configs)
  - Tạo cấu hình email cho admin
  - Chọn cấu hình mặc định
  - Kích hoạt/vô hiệu hóa cấu hình
- ✅ **Cấu hình mail hệ thống** (mail_settings)
  - Cấu hình SMTP
  - Cấu hình mail driver

---

### 📰 10. QUẢN LÝ NỘI DUNG

#### 10.1. Quản lý bài viết/Tin tức (posts)

- ✅ **Xem danh sách bài viết**
  - Lọc theo trạng thái
  - Lọc theo tác giả
  - Lọc theo danh mục
  - Tìm kiếm theo tiêu đề
- ✅ **Xem chi tiết bài viết**
  - Tiêu đề, nội dung, slug
  - Ảnh đại diện, mô tả
  - Tác giả, trạng thái
  - Ngày xuất bản
- ✅ **Tạo bài viết mới**
  - Nhập tiêu đề, nội dung
  - Upload ảnh đại diện
  - Chọn danh mục
  - Thiết lập ngày xuất bản
- ✅ **Chỉnh sửa bài viết**
- ✅ **Xuất bản/Gỡ bài viết**
- ✅ **Xóa bài viết** (soft delete)

#### 10.2. Quản lý FAQ (faqs)

- ✅ **Xem danh sách FAQ**
  - Lọc theo trạng thái
  - Sắp xếp theo thứ tự hiển thị
- ✅ **Xem chi tiết FAQ**
  - Câu hỏi, câu trả lời
  - Thứ tự hiển thị, trạng thái
- ✅ **Tạo FAQ mới**
  - Nhập câu hỏi, câu trả lời
  - Thiết lập thứ tự hiển thị
- ✅ **Chỉnh sửa FAQ**
- ✅ **Xóa FAQ**
- ✅ **Sắp xếp thứ tự FAQ**

#### 10.3. Quản lý danh mục (categories)

- ✅ **Xem danh sách danh mục**
  - Xem cấu trúc cây (parent_id)
- ✅ **Tạo danh mục mới**
- ✅ **Chỉnh sửa danh mục**
- ✅ **Xóa danh mục**

#### 10.4. Quản lý liên hệ (contacts)

- ✅ **Xem danh sách liên hệ**
  - Lọc theo trạng thái xử lý
  - Tìm kiếm theo tên, email
- ✅ **Xem chi tiết liên hệ**
  - Tên, email, SĐT, nội dung
  - Trạng thái xử lý
- ✅ **Đánh dấu đã xử lý**
- ✅ **Xóa liên hệ**

---

### ⚙️ 11. QUẢN LÝ CÀI ĐẶT HỆ THỐNG

#### 11.1. Quản lý cài đặt trang chủ

- ✅ **Cấu hình việc làm trang chủ** (home_setting_jobs)
  - Chọn việc làm hiển thị
  - Sắp xếp thứ tự
- ✅ **Cấu hình đối tác trang chủ** (home_setting_partners)
  - Thêm/sửa/xóa đối tác
  - Upload logo đối tác
  - Thêm link đối tác

#### 11.2. Quản lý cache

- ✅ **Xem cache hệ thống**
- ✅ **Xóa cache**
- ✅ **Xóa cache locks**

#### 11.3. Quản lý queue jobs

- ✅ **Xem danh sách job queue** (q_jobs)
- ✅ **Xem job queue thất bại** (failed_jobs)
- ✅ **Retry job thất bại**
- ✅ **Xóa job queue**

---

### 📊 12. BÁO CÁO & THỐNG KÊ

#### 12.1. Dashboard & Thống kê tổng quan

- ✅ **Dashboard tổng quan**
  - Tổng số CTV (active/inactive)
  - Tổng số việc làm (theo trạng thái)
  - Tổng số đơn ứng tuyển (theo trạng thái)
  - Tổng số yêu cầu thanh toán (theo trạng thái)
  - Tổng số CV
  - Biểu đồ thống kê theo thời gian
- ✅ **Thống kê CTV**
  - Top CTV theo điểm tích lũy
  - Top CTV theo số đơn ứng tuyển
  - Top CTV theo số tiền thanh toán
  - Thống kê CTV theo cấp bậc
  - Thống kê CTV theo nhóm
- ✅ **Thống kê việc làm**
  - Số việc làm theo danh mục
  - Số việc làm theo công ty
  - Việc làm hot nhất
  - Việc làm có nhiều đơn ứng tuyển nhất
- ✅ **Thống kê đơn ứng tuyển**
  - Số đơn theo trạng thái
  - Số đơn theo việc làm
  - Số đơn theo CTV
  - Tỷ lệ thành công (nyusha/thanh toán)
- ✅ **Thống kê thanh toán**
  - Tổng số tiền thanh toán theo thời gian
  - Số tiền thanh toán theo CTV
  - Số tiền thanh toán theo việc làm
  - Thống kê theo trạng thái

#### 12.2. Xuất báo cáo

- ✅ **Xuất báo cáo CTV**
  - Excel/PDF
- ✅ **Xuất báo cáo đơn ứng tuyển**
  - Excel/PDF
- ✅ **Xuất báo cáo thanh toán**
  - Excel/PDF
- ✅ **Xuất báo cáo việc làm**
  - Excel/PDF

---

### 📝 13. QUẢN LÝ LOG & LỊCH SỬ

#### 13.1. Quản lý action logs

- ✅ **Xem lịch sử hành động** (action_logs)
  - Lọc theo admin
  - Lọc theo đối tượng (Job, JobApplication, Collaborator, etc.)
  - Lọc theo hành động (login, logout, create, edit, delete, import)
  - Lọc theo khoảng thời gian
  - Lọc theo IP address
- ✅ **Xem chi tiết log**
  - Admin thực hiện
  - Đối tượng được thao tác
  - Hành động
  - Dữ liệu trước và sau khi thay đổi (JSON)
  - IP address, mô tả
  - Thời gian
- ✅ **Xuất báo cáo log**
  - Excel/PDF

---

## 👤 CHỨC NĂNG CHO CTV (CỘNG TÁC VIÊN)

### 🔐 1. QUẢN LÝ TÀI KHOẢN

#### 1.1. Đăng ký & Đăng nhập

- ✅ **Đăng ký tài khoản CTV**
  - Nhập thông tin cá nhân
  - Nhập thông tin tổ chức (nếu là công ty)
  - Nhập thông tin ngân hàng
  - Upload avatar
  - Xác thực email
- ✅ **Đăng nhập hệ thống**
- ✅ **Đăng xuất hệ thống**
- ✅ **Quên mật khẩu**
  - Yêu cầu reset mật khẩu
  - Reset mật khẩu qua email

#### 1.2. Quản lý hồ sơ cá nhân

- ✅ **Xem thông tin cá nhân**
  - Thông tin cơ bản: tên, email, SĐT, địa chỉ, ngày sinh, giới tính
  - Thông tin tổ chức: loại tổ chức, tên công ty, mã số thuế, giấy phép kinh doanh
  - Thông tin ngân hàng: tên ngân hàng, số tài khoản, tên chủ tài khoản, chi nhánh
  - Thông tin hệ thống: mã CTV, điểm tích lũy, cấp bậc, trạng thái
  - Liên kết mạng xã hội: Facebook, Zalo
- ✅ **Chỉnh sửa thông tin cá nhân**
  - Cập nhật thông tin cơ bản
  - Cập nhật thông tin tổ chức
  - Cập nhật thông tin ngân hàng
  - Thay đổi avatar
  - Cập nhật liên kết mạng xã hội
- ✅ **Đổi mật khẩu**
- ✅ **Xem trạng thái tài khoản**
  - Trạng thái duyệt (approved_at)
  - Trạng thái hoạt động (status)

---

### 📄 2. QUẢN LÝ HỒ SƠ ỨNG VIÊN (CVs)

#### 2.1. Quản lý CV

- ✅ **Xem danh sách CV của mình**
  - Lọc theo trạng thái
  - Lọc theo ngày nhận hồ sơ
  - Tìm kiếm theo tên, email, mã CV
- ✅ **Xem chi tiết CV**
  - Thông tin cơ bản: mã CV, tiêu đề, tên đầy đủ, email, SĐT, địa chỉ
  - Ngày nhận hồ sơ, trạng thái
  - File CV đính kèm
- ✅ **Tạo CV mới**
  - Nhập thông tin ứng viên
  - Upload file CV
- ✅ **Chỉnh sửa CV**
  - Cập nhật thông tin ứng viên
  - Thay đổi file CV
- ✅ **Xóa CV** (chỉ CV của mình)

#### 2.2. Quản lý file CV

- ✅ **Upload file CV**
- ✅ **Download file CV**
- ✅ **Xóa file CV**

---

### 💼 3. QUẢN LÝ VIỆC LÀM

#### 3.1. Xem danh sách việc làm

- ✅ **Xem danh sách việc làm công khai**
  - Lọc theo danh mục
  - Lọc theo công ty
  - Lọc theo việc làm hot
  - Tìm kiếm theo tiêu đề, mô tả
  - Sắp xếp theo ngày đăng, lượt xem
- ✅ **Xem chi tiết việc làm**
  - Thông tin cơ bản: tiêu đề, mô tả, yêu cầu, hướng dẫn
  - Địa điểm: nơi làm việc, địa điểm phỏng vấn
  - Lương và phúc lợi: lương ước tính, phụ cấp, thưởng
  - Thời gian: giờ làm việc, thời gian nghỉ
  - Thông tin công ty
  - Số tiền giới thiệu
  - File JD (tiếng Việt và tiếng Nhật)
  - Form CV bắt buộc
  - Yêu cầu việc làm (trình độ tiếng Nhật, kinh nghiệm, chuyên ngành)

#### 3.2. Tìm kiếm việc làm

- ✅ **Tìm kiếm việc làm**
  - Tìm theo từ khóa
  - Tìm theo danh mục
  - Tìm theo địa điểm
  - Tìm theo mức lương
- ✅ **Lưu việc làm yêu thích** (nếu có tính năng)

---

### 📝 4. QUẢN LÝ ĐƠN ỨNG TUYỂN

#### 4.1. Quản lý đơn ứng tuyển

- ✅ **Xem danh sách đơn ứng tuyển của mình**
  - Lọc theo việc làm
  - Lọc theo trạng thái (17 trạng thái)
  - Lọc theo ngày ứng tuyển
  - Tìm kiếm theo tên ứng viên
  - Sắp xếp theo ngày ứng tuyển, trạng thái
- ✅ **Xem chi tiết đơn ứng tuyển**
  - Thông tin ứng viên
  - Thông tin việc làm
  - Trạng thái đơn ứng tuyển
  - Lịch sử thay đổi trạng thái
  - Thông tin lương, phí giới thiệu
  - Lịch trình: ngày phỏng vấn, ngày nhập công ty
- ✅ **Tạo đơn ứng tuyển mới**
  - Chọn việc làm
  - Chọn CV (hoặc nhập thông tin mới)
  - Nhập đầy đủ thông tin ứng viên:
    - Thông tin cơ bản: tên, email, SĐT, địa chỉ, ngày sinh, tuổi, giới tính
    - Thông tin visa: tình trạng cư trú, loại visa, ngày hết hạn visa
    - Trình độ: tiếng Nhật (JLPT), tiếng Anh (TOEIC, IELTS), bằng lái xe
    - Kinh nghiệm: số năm kinh nghiệm, chuyên ngành, công cụ đã học/có kinh nghiệm
    - Học vấn và lịch sử làm việc
  - Upload CV, tài liệu
  - Nhập tự giới thiệu và lý do ứng tuyển
  - Nhập thông tin lương: lương hiện tại, lương mong muốn
- ✅ **Chỉnh sửa đơn ứng tuyển** (nếu trạng thái cho phép)
  - Cập nhật thông tin ứng viên
  - Cập nhật thông tin visa, trình độ, kinh nghiệm
  - Cập nhật CV, tài liệu
- ✅ **Xem lịch sử thay đổi trạng thái đơn ứng tuyển**
  - Trạng thái trước và sau
  - Thời gian thay đổi
  - Admin thực hiện thay đổi (nếu có)

---

### 💰 5. QUẢN LÝ THANH TOÁN

#### 5.1. Quản lý yêu cầu thanh toán

- ✅ **Xem danh sách yêu cầu thanh toán của mình**
  - Lọc theo trạng thái (Chờ duyệt, Đã duyệt, Từ chối, Đã thanh toán)
  - Lọc theo đơn ứng tuyển
  - Lọc theo khoảng thời gian
  - Sắp xếp theo ngày tạo, số tiền
- ✅ **Xem chi tiết yêu cầu thanh toán**
  - Thông tin đơn ứng tuyển
  - Số tiền yêu cầu
  - Trạng thái
  - Thời gian duyệt/từ chối
  - Lý do từ chối (nếu có)
  - File đính kèm
- ✅ **Tạo yêu cầu thanh toán mới**
  - Chọn đơn ứng tuyển (chỉ đơn có trạng thái "Đã nyusha" - status = 8)
  - Nhập số tiền yêu cầu
  - Upload file đính kèm (nếu có)
  - Ghi chú (nếu có)
- ✅ **Xem lịch sử thanh toán**
  - Tổng số tiền đã nhận
  - Danh sách các khoản thanh toán đã hoàn thành

---

### 📊 6. THỐNG KÊ & BÁO CÁO

#### 6.1. Dashboard CTV

- ✅ **Dashboard tổng quan**
  - Tổng số CV
  - Tổng số đơn ứng tuyển
  - Số đơn theo trạng thái
  - Số đơn đã nyusha
  - Số đơn đã thanh toán
  - Tổng số tiền đã nhận
  - Điểm tích lũy hiện tại
  - Cấp bậc hiện tại
  - Biểu đồ thống kê theo thời gian

#### 6.2. Thống kê chi tiết

- ✅ **Thống kê đơn ứng tuyển**
  - Số đơn theo việc làm
  - Số đơn theo trạng thái
  - Tỷ lệ thành công
- ✅ **Thống kê thanh toán**
  - Số tiền theo thời gian
  - Số tiền theo việc làm
  - Số tiền theo trạng thái

---

### 🔔 7. QUẢN LÝ THÔNG BÁO

#### 7.1. Thông báo

- ✅ **Xem danh sách thông báo**
  - Lọc theo loại thông báo
  - Lọc theo đã đọc/chưa đọc
  - Sắp xếp theo thời gian
- ✅ **Xem chi tiết thông báo**
  - Nội dung thông báo
  - Loại thông báo
  - Việc làm liên quan (nếu có)
  - Thời gian
- ✅ **Đánh dấu đã đọc**
- ✅ **Đánh dấu tất cả đã đọc**
- ✅ **Xóa thông báo**

---

### 📈 8. QUẢN LÝ ĐIỂM TÍCH LŨY

#### 8.1. Điểm tích lũy

- ✅ **Xem điểm tích lũy hiện tại**
- ✅ **Xem lịch sử thay đổi điểm** (point_histories)
  - Số điểm thay đổi
  - Loại thay đổi
  - Mô tả
  - Ngày thay đổi
- ✅ **Xem cấp bậc hiện tại** (rank_levels)
  - Tên cấp bậc
  - Điểm yêu cầu
  - Phần trăm lợi nhuận
  - Điểm cần để lên cấp tiếp theo

---

### 🔧 9. API & TÍCH HỢP

#### 9.1. API (nếu có)

- ✅ **Xem lịch sử gọi API** (collaborator_api_logs)
  - Endpoint được gọi
  - Method
  - Request/Response
  - Status code
  - Thời gian
- ✅ **Quản lý API tokens** (nếu có)
  - Tạo API token
  - Xóa API token
  - Xem danh sách tokens

---

## 📋 TÓM TẮT SỐ LƯỢNG CHỨC NĂNG

### Admin: **~180+ chức năng**

- Quản lý xác thực & phân quyền: ~35 chức năng
  - Quản lý Admin: ~15 chức năng
  - Quản lý Admin Group: ~20 chức năng
- Quản lý CTV: ~50 chức năng
  - Quản lý thông tin CTV: ~15 chức năng
  - Quản lý điểm tích lũy: ~5 chức năng
  - Quản lý cấp bậc CTV: ~5 chức năng
  - Quản lý nhóm CTV: ~5 chức năng
  - Quản lý thông báo CTV: ~5 chức năng
  - Quản lý API Log CTV: ~5 chức năng
  - Phân công CTV cho AdminBackOffice: ~10 chức năng
- Quản lý CV: ~15 chức năng
- Quản lý việc làm: ~40 chức năng
- Quản lý đơn ứng tuyển: ~25 chức năng
- Quản lý công ty: ~10 chức năng
- Quản lý thanh toán: ~15 chức năng
- Quản lý chiến dịch: ~15 chức năng
- Quản lý email: ~25 chức năng
- Quản lý nội dung: ~20 chức năng
- Quản lý cài đặt hệ thống: ~10 chức năng
- Báo cáo & thống kê: ~20 chức năng
- Quản lý log: ~5 chức năng

### CTV: **~60+ chức năng**

- Quản lý tài khoản: ~10 chức năng
- Quản lý CV: ~10 chức năng
- Quản lý việc làm: ~10 chức năng
- Quản lý đơn ứng tuyển: ~15 chức năng
- Quản lý thanh toán: ~10 chức năng
- Thống kê & báo cáo: ~10 chức năng
- Quản lý thông báo: ~5 chức năng
- Quản lý điểm tích lũy: ~5 chức năng
- API & tích hợp: ~5 chức năng

---

## 🔑 CÁC TRẠNG THÁI QUAN TRỌNG

### Trạng thái đơn ứng tuyển (17 trạng thái)

1. Admin đang xử lý hồ sơ
2. Đang tiến cử
3. Đang xếp lịch phỏng vấn
4. Đang phỏng vấn
5. Đang đợi naitei
6. Đang thương lượng naitei
7. Đang đợi nyusha
8. **Đã nyusha** ⭐ (quan trọng - bắt đầu tính phí)
9. Đang chờ thanh toán với công ty
10. Gửi yêu cầu thanh toán
11. **Đã thanh toán** ⭐ (hoàn thành)
12. Hồ sơ không hợp lệ
13. Hồ sơ bị trùng
14. Hồ sơ không đạt
15. Kết quả trượt
16. Hủy giữa chừng
17. Không shodaku

### Trạng thái yêu cầu thanh toán (4 trạng thái)

- 0: Chờ duyệt
- 1: Đã duyệt
- 2: Từ chối
- 3: Đã thanh toán

### Trạng thái việc làm (4 trạng thái)

- 0: Draft
- 1: Published
- 2: Closed
- 3: Expired

---

## 📝 GHI CHÚ QUAN TRỌNG

1. **Phân quyền**: Admin có 3 vai trò (Super Admin, Admin Backoffice, Admin CA Team) với quyền hạn khác nhau
2. **Soft Delete**: Nhiều bảng sử dụng `deleted_at` (soft delete)
3. **JSON Fields**: Một số trường lưu dữ liệu JSON (ví dụ: `job_ids`, `education_details`, `learned_tools`)
4. **Foreign Keys**: Có ràng buộc foreign key với ON DELETE CASCADE/SET NULL
5. **Dual Language**: Hệ thống hỗ trợ tiếng Việt và tiếng Nhật
6. **Logging**: Tất cả hành động quan trọng đều được ghi log (action_logs, job_application_logs)

---

*Tài liệu này được tạo dựa trên phân tích database JobShare 2.0 với 48 bảng dữ liệu.*
