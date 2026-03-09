-- Migration: Thu gọn bảng rank_levels còn 4 mức
-- Silver 25%, Gold 30%, Platinum 40%, Diamond 50%
-- Đồng thời cập nhật collaborators.rank_level_id theo % hiện tại của rank cũ

-- Bước 1: Thêm 4 rank mới với id tạm 1001-1004 (tránh trùng id cũ 1-26)
INSERT INTO `rank_levels` (`id`, `name`, `percent`, `description`, `points_required`, `is_active`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1001, 'Silver', 25.00, 'Silver', 0, 1, NOW(), NOW(), NULL),
(1002, 'Gold', 30.00, 'Gold', 10000, 1, NOW(), NOW(), NULL),
(1003, 'Platinum', 40.00, 'Platinum', 30000, 1, NOW(), NOW(), NULL),
(1004, 'Diamond', 50.00, 'Diamond', 50000, 1, NOW(), NOW(), NULL);

-- Bước 2: Cập nhật collaborators theo % của rank hiện tại
-- % <= 25 -> Silver (1001)
UPDATE `collaborators` c
INNER JOIN `rank_levels` r ON r.id = c.rank_level_id AND r.deleted_at IS NULL
SET c.rank_level_id = 1001
WHERE r.percent <= 25;

-- % > 25 và <= 30 -> Gold (1002)
UPDATE `collaborators` c
INNER JOIN `rank_levels` r ON r.id = c.rank_level_id AND r.deleted_at IS NULL
SET c.rank_level_id = 1002
WHERE r.percent > 25 AND r.percent <= 30;

-- % > 30 và <= 40 -> Platinum (1003)
UPDATE `collaborators` c
INNER JOIN `rank_levels` r ON r.id = c.rank_level_id AND r.deleted_at IS NULL
SET c.rank_level_id = 1003
WHERE r.percent > 30 AND r.percent <= 40;

-- % > 40 -> Diamond (1004)
UPDATE `collaborators` c
INNER JOIN `rank_levels` r ON r.id = c.rank_level_id AND r.deleted_at IS NULL
SET c.rank_level_id = 1004
WHERE r.percent > 40;

-- Bước 3: Collaborator có rank_level_id trỏ vào rank không còn tồn tại -> gán Silver (1001)
UPDATE `collaborators` c
LEFT JOIN `rank_levels` r ON r.id = c.rank_level_id AND r.deleted_at IS NULL
SET c.rank_level_id = 1001
WHERE c.rank_level_id IS NOT NULL AND r.id IS NULL;

-- Bước 4: Xóa toàn bộ rank_levels cũ (id 1-26)
DELETE FROM `rank_levels` WHERE id NOT IN (1001, 1002, 1003, 1004);

-- Bước 5: Đổi id 1001->1, 1002->2, 1003->3, 1004->4 (cập nhật collaborators trước, sau đó đổi PK rank_levels)
UPDATE `collaborators` SET rank_level_id = 1 WHERE rank_level_id = 1001;
UPDATE `collaborators` SET rank_level_id = 2 WHERE rank_level_id = 1002;
UPDATE `collaborators` SET rank_level_id = 3 WHERE rank_level_id = 1003;
UPDATE `collaborators` SET rank_level_id = 4 WHERE rank_level_id = 1004;

UPDATE `rank_levels` SET id = 1 WHERE id = 1001;
UPDATE `rank_levels` SET id = 2 WHERE id = 1002;
UPDATE `rank_levels` SET id = 3 WHERE id = 1003;
UPDATE `rank_levels` SET id = 4 WHERE id = 1004;
-- Nếu DB có FK ON UPDATE CASCADE thì có thể bỏ 4 lệnh UPDATE collaborators ở bước 5 và chỉ giữ 4 lệnh UPDATE rank_levels.
