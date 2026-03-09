-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 01, 2026 at 07:30 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `job_share_prod`
--

-- --------------------------------------------------------

--
-- Table structure for table `cv_storages`
--

CREATE TABLE `cv_storages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `collaborator_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'ID cß╗ºa collaborator tß║ío CV (nß║┐u c├│)',
  `admin_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'ID cß╗ºa admin tß║ío CV (nß║┐u c├│)',
  `code` varchar(255) NOT NULL,
  `furigana` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `gender` tinyint(4) DEFAULT NULL,
  `ages` varchar(255) DEFAULT NULL,
  `address_origin` varchar(255) DEFAULT NULL,
  `passport` tinyint(4) DEFAULT NULL,
  `current_residence` tinyint(4) DEFAULT NULL,
  `jp_residence_status` tinyint(4) DEFAULT NULL,
  `visa_expiration_date` date DEFAULT NULL,
  `other_country` varchar(255) DEFAULT NULL,
  `address_current` varchar(255) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL COMMENT 'M├ú bã░u ─æiß╗çn',
  `spouse` tinyint(4) DEFAULT NULL,
  `current_income` int(11) DEFAULT NULL,
  `desired_income` int(11) DEFAULT NULL,
  `desired_work_location` varchar(255) DEFAULT NULL,
  `desired_position` varchar(255) DEFAULT NULL COMMENT 'Vß╗ï tr├¡ mong muß╗æn',
  `nyusha_time` varchar(255) DEFAULT NULL,
  `interview_time` varchar(255) DEFAULT NULL,
  `learned_tools` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`learned_tools`)),
  `experience_tools` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`experience_tools`)),
  `jlpt_level` tinyint(4) DEFAULT NULL,
  `experience_years` tinyint(4) DEFAULT NULL,
  `specialization` tinyint(4) DEFAULT NULL,
  `qualification` tinyint(4) DEFAULT NULL,
  `educations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Hß╗ìc vß║Ñn (array of education objects)' CHECK (json_valid(`educations`)),
  `work_experiences` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Kinh nghiß╗çm l├ám viß╗çc (array of work experience objects)' CHECK (json_valid(`work_experiences`)),
  `technical_skills` text DEFAULT NULL COMMENT 'Kß╗╣ n─âng kß╗╣ thuß║¡t',
  `certificates` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Chß╗®ng chß╗ë (array of certificate objects)' CHECK (json_valid(`certificates`)),
  `career_summary` text DEFAULT NULL COMMENT 'T├│m tß║»t nghß╗ü nghiß╗çp',
  `strengths` text DEFAULT NULL COMMENT '─Éiß╗âm mß║ính',
  `motivation` text DEFAULT NULL COMMENT '─Éß╗Öng lß╗▒c ß╗®ng tuyß╗ân',
  `other_documents` varchar(255) DEFAULT NULL,
  `curriculum_vitae` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` tinyint(4) NOT NULL DEFAULT 1,
  `is_duplicate` tinyint(1) DEFAULT 0 COMMENT 'Trß║íng th├íi tr├╣ng lß║Àp: 0 = kh├┤ng tr├╣ng, 1 = tr├╣ng',
  `duplicate_with_cv_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'ID cß╗ºa CV tr├╣ng lß║Àp',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cv_storages`
--

INSERT INTO `cv_storages` (`id`, `collaborator_id`, `admin_id`, `code`, `furigana`, `name`, `email`, `phone`, `birth_date`, `gender`, `ages`, `address_origin`, `passport`, `current_residence`, `jp_residence_status`, `visa_expiration_date`, `other_country`, `address_current`, `postal_code`, `spouse`, `current_income`, `desired_income`, `desired_work_location`, `desired_position`, `nyusha_time`, `interview_time`, `learned_tools`, `experience_tools`, `jlpt_level`, `experience_years`, `specialization`, `qualification`, `educations`, `work_experiences`, `technical_skills`, `certificates`, `career_summary`, `strengths`, `motivation`, `other_documents`, `curriculum_vitae`, `notes`, `status`, `is_duplicate`, `duplicate_with_cv_id`, `created_at`, `updated_at`, `deleted_at`) VALUES
(3385, NULL, 1, 'CV-F7DFD22F', 'Tuan Kiet', 'Tuan Kiet', 'kietvu389@gmail.com', '0365157215', '1982-02-01', 1, '43', NULL, NULL, NULL, NULL, NULL, NULL, 'Vu Hoi, Thu Vu, Hung Yen', '17000', NULL, 100000, 100000, 'Tokyo', 'IT', '10/2026', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[{\"year\":\"2025\",\"month\":\"10\",\"content\":\"Đại học Xây Dựng\"}]', '[{\"period\":\"2021\",\"company_name\":\"IIC\",\"business_purpose\":\"IT\",\"scale_role\":\"1000\",\"description\":\"lập trình\",\"tools_tech\":\"Cursor\"}]', 'AWS', '[]', 'lập trình viên', 'Mạnh vl', '1000', NULL, 'uploads\\cvs\\cv-1769928270673-716921232.pdf', NULL, 1, 0, NULL, '2026-02-01 06:44:30', '2026-02-01 06:44:30', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cv_storages`
--
ALTER TABLE `cv_storages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_cv_storages_code` (`code`),
  ADD KEY `fk_cv_storages_collaborator` (`collaborator_id`),
  ADD KEY `fk_cv_storages_admin` (`admin_id`),
  ADD KEY `fk_cv_storages_duplicate` (`duplicate_with_cv_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cv_storages`
--
ALTER TABLE `cv_storages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3386;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cv_storages`
--
ALTER TABLE `cv_storages`
  ADD CONSTRAINT `fk_cv_storages_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cv_storages_collaborator` FOREIGN KEY (`collaborator_id`) REFERENCES `collaborators` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cv_storages_duplicate` FOREIGN KEY (`duplicate_with_cv_id`) REFERENCES `cv_storages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
