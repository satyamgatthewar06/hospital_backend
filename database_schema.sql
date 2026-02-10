-- Hospital Management System Database Schema
-- Generated on: 2026-02-10T11:05:51.425Z

CREATE DATABASE IF NOT EXISTS hospital_management;
USE hospital_management;

-- Table structure for table `appointments`
CREATE TABLE `appointments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `appointmentNumber` varchar(50) NOT NULL,
  `patientId` int NOT NULL,
  `doctorId` int NOT NULL,
  `appointmentDate` datetime NOT NULL,
  `appointmentType` varchar(100) DEFAULT NULL,
  `reason` varchar(500) DEFAULT NULL,
  `status` enum('scheduled','completed','cancelled','no-show') DEFAULT 'scheduled',
  `notes` longtext,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `appointmentNumber` (`appointmentNumber`),
  KEY `patientId` (`patientId`),
  KEY `doctorId` (`doctorId`),
  CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`doctorId`) REFERENCES `doctors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `billing`
CREATE TABLE `billing` (
  `id` int NOT NULL AUTO_INCREMENT,
  `billNumber` varchar(50) NOT NULL,
  `patientId` int NOT NULL,
  `billDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `dueDate` date DEFAULT NULL,
  `items` longtext NOT NULL,
  `subtotal` decimal(10,2) DEFAULT '0.00',
  `taxes` decimal(10,2) DEFAULT '0.00',
  `discount` decimal(10,2) DEFAULT '0.00',
  `totalAmount` decimal(10,2) DEFAULT '0.00',
  `amountPaid` decimal(10,2) DEFAULT '0.00',
  `status` enum('pending','paid','partial','cancelled') DEFAULT 'pending',
  `paymentMethod` varchar(100) DEFAULT NULL,
  `notes` longtext,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `billNumber` (`billNumber`),
  KEY `billNumber_2` (`billNumber`),
  KEY `patientId` (`patientId`),
  KEY `status` (`status`),
  CONSTRAINT `billing_ibfk_1` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `doctor_rounds`
CREATE TABLE `doctor_rounds` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ipdId` int NOT NULL,
  `doctorName` varchar(255) DEFAULT NULL,
  `observation` text,
  `instruction` text,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ipdId` (`ipdId`),
  CONSTRAINT `doctor_rounds_ibfk_1` FOREIGN KEY (`ipdId`) REFERENCES `ipd_admissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `doctors`
CREATE TABLE `doctors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int DEFAULT NULL,
  `doctorId` varchar(50) NOT NULL,
  `firstName` varchar(100) NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `licenseNumber` varchar(50) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `yearsOfExperience` int DEFAULT NULL,
  `qualifications` longtext,
  `availabilityStatus` enum('available','busy','on-leave') DEFAULT 'available',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `doctorId` (`doctorId`),
  UNIQUE KEY `userId` (`userId`),
  CONSTRAINT `doctors_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `insurance_claims`
CREATE TABLE `insurance_claims` (
  `id` int NOT NULL AUTO_INCREMENT,
  `claimNumber` varchar(50) NOT NULL,
  `policyId` int NOT NULL,
  `patientId` int NOT NULL,
  `billId` int NOT NULL,
  `claimDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `claimAmount` decimal(12,2) DEFAULT NULL,
  `approvedAmount` decimal(12,2) DEFAULT NULL,
  `status` enum('submitted','approved','rejected','processing') DEFAULT 'submitted',
  `reason` varchar(500) DEFAULT NULL,
  `notes` longtext,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `claimNumber` (`claimNumber`),
  KEY `policyId` (`policyId`),
  KEY `patientId` (`patientId`),
  KEY `billId` (`billId`),
  CONSTRAINT `insurance_claims_ibfk_1` FOREIGN KEY (`policyId`) REFERENCES `insurance_policies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `insurance_claims_ibfk_2` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `insurance_claims_ibfk_3` FOREIGN KEY (`billId`) REFERENCES `billing` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `insurance_policies`
CREATE TABLE `insurance_policies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `policyId` varchar(50) NOT NULL,
  `patientId` int NOT NULL,
  `insuranceProvider` varchar(200) DEFAULT NULL,
  `policyNumber` varchar(100) DEFAULT NULL,
  `groupNumber` varchar(100) DEFAULT NULL,
  `memberId` varchar(100) DEFAULT NULL,
  `policyType` varchar(100) DEFAULT NULL,
  `coverageAmount` decimal(12,2) DEFAULT NULL,
  `copay` decimal(10,2) DEFAULT NULL,
  `deductible` decimal(10,2) DEFAULT NULL,
  `startDate` date DEFAULT NULL,
  `expiryDate` date DEFAULT NULL,
  `isPrimary` tinyint(1) DEFAULT '1',
  `status` enum('active','expired','suspended') DEFAULT 'active',
  `documentUrl` varchar(500) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `policyId` (`policyId`),
  KEY `patientId` (`patientId`),
  CONSTRAINT `insurance_policies_ibfk_1` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `intake_output`
CREATE TABLE `intake_output` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ipdId` int NOT NULL,
  `date` date DEFAULT NULL,
  `time` time DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `item` varchar(255) DEFAULT NULL,
  `quantity` varchar(100) DEFAULT NULL,
  `recordedBy` varchar(255) DEFAULT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ipdId` (`ipdId`),
  CONSTRAINT `intake_output_ibfk_1` FOREIGN KEY (`ipdId`) REFERENCES `ipd_admissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `ipd`
CREATE TABLE `ipd` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admissionNumber` varchar(50) NOT NULL,
  `patientId` int NOT NULL,
  `doctorId` int DEFAULT NULL,
  `wardId` int DEFAULT NULL,
  `bedNumber` varchar(20) DEFAULT NULL,
  `admissionDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `estimatedDischargeDate` date DEFAULT NULL,
  `actualDischargeDate` date DEFAULT NULL,
  `admissionReason` longtext,
  `diagnosis` longtext,
  `treatment` longtext,
  `status` enum('admitted','discharged','transferred') DEFAULT 'admitted',
  `notes` longtext,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `admissionNumber` (`admissionNumber`),
  KEY `patientId` (`patientId`),
  KEY `doctorId` (`doctorId`),
  KEY `wardId` (`wardId`),
  CONSTRAINT `ipd_ibfk_1` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ipd_ibfk_2` FOREIGN KEY (`doctorId`) REFERENCES `doctors` (`id`) ON DELETE SET NULL,
  CONSTRAINT `ipd_ibfk_3` FOREIGN KEY (`wardId`) REFERENCES `wards` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `ipd_admissions`
CREATE TABLE `ipd_admissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patientId` int DEFAULT NULL,
  `doctorId` int DEFAULT NULL,
  `wardId` int DEFAULT NULL,
  `admissionDate` datetime DEFAULT NULL,
  `dischargeDate` datetime DEFAULT NULL,
  `diagnosis` text,
  `treatmentPlan` text,
  `attendingNurse` varchar(255) DEFAULT NULL,
  `roomNumber` varchar(50) DEFAULT NULL,
  `bedNumber` varchar(50) DEFAULT NULL,
  `emergencyContactName` varchar(255) DEFAULT NULL,
  `emergencyContactPhone` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Admitted',
  `notes` text,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `patientId` (`patientId`),
  KEY `doctorId` (`doctorId`),
  CONSTRAINT `ipd_admissions_ibfk_1` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE SET NULL,
  CONSTRAINT `ipd_admissions_ibfk_2` FOREIGN KEY (`doctorId`) REFERENCES `doctors` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `ipd_medications`
CREATE TABLE `ipd_medications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ipdId` int NOT NULL,
  `medicineName` varchar(255) DEFAULT NULL,
  `dosage` varchar(100) DEFAULT NULL,
  `frequency` varchar(100) DEFAULT NULL,
  `startDate` date DEFAULT NULL,
  `endDate` date DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Active',
  PRIMARY KEY (`id`),
  KEY `ipdId` (`ipdId`),
  CONSTRAINT `ipd_medications_ibfk_1` FOREIGN KEY (`ipdId`) REFERENCES `ipd_admissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `lab_bills`
CREATE TABLE `lab_bills` (
  `id` int NOT NULL AUTO_INCREMENT,
  `billNo` varchar(50) DEFAULT NULL,
  `billDate` datetime DEFAULT NULL,
  `reqId` varchar(50) DEFAULT NULL,
  `patientName` varchar(255) DEFAULT NULL,
  `testName` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `discount` decimal(10,2) DEFAULT NULL,
  `gst` decimal(10,2) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `paymentMode` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `isCashless` tinyint(1) DEFAULT '0',
  `insuranceProvider` varchar(255) DEFAULT NULL,
  `policyNumber` varchar(100) DEFAULT NULL,
  `finalAmount` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `billNo` (`billNo`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `lab_requests`
CREATE TABLE `lab_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reqId` varchar(50) DEFAULT NULL,
  `patientId` int NOT NULL,
  `patientName` varchar(255) DEFAULT NULL,
  `testName` varchar(255) DEFAULT NULL,
  `sampleType` varchar(100) DEFAULT NULL,
  `collectionDate` datetime DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Pending',
  `priority` varchar(50) DEFAULT 'Normal',
  `technicianName` varchar(255) DEFAULT NULL,
  `testResult` varchar(255) DEFAULT NULL,
  `remarks` text,
  `signature` varchar(255) DEFAULT NULL,
  `resultDate` datetime DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `resultType` varchar(50) DEFAULT NULL,
  `pathologistRemark` text,
  `verifiedBy` varchar(255) DEFAULT NULL,
  `verifiedDate` datetime DEFAULT NULL,
  `isVerified` tinyint DEFAULT '0',
  `doctorId` int DEFAULT NULL,
  `shareHistory` text,
  `downloadHistory` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reqId` (`reqId`),
  KEY `patientId` (`patientId`),
  CONSTRAINT `lab_requests_ibfk_1` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `lab_tests`
CREATE TABLE `lab_tests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `testName` varchar(255) NOT NULL,
  `testCategory` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `sampleType` varchar(100) DEFAULT NULL,
  `normalRange` varchar(255) DEFAULT NULL,
  `tat` varchar(100) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `laboratory`
CREATE TABLE `laboratory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `testId` varchar(50) NOT NULL,
  `patientId` int NOT NULL,
  `doctorId` int DEFAULT NULL,
  `testName` varchar(200) NOT NULL,
  `testCategory` varchar(100) DEFAULT NULL,
  `testDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `sampleCollectionDate` date DEFAULT NULL,
  `reportDate` date DEFAULT NULL,
  `testResults` longtext,
  `referenceRange` varchar(500) DEFAULT NULL,
  `status` enum('pending','in-progress','completed','cancelled') DEFAULT 'pending',
  `normalRange` varchar(255) DEFAULT NULL,
  `normalValue` varchar(255) DEFAULT NULL,
  `interpretation` varchar(500) DEFAULT NULL,
  `performedBy` varchar(200) DEFAULT NULL,
  `verifiedBy` varchar(200) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `testId` (`testId`),
  KEY `doctorId` (`doctorId`),
  KEY `testId_2` (`testId`),
  KEY `patientId` (`patientId`),
  KEY `status` (`status`),
  CONSTRAINT `laboratory_ibfk_1` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `laboratory_ibfk_2` FOREIGN KEY (`doctorId`) REFERENCES `doctors` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `nursing_notes`
CREATE TABLE `nursing_notes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ipdId` int NOT NULL,
  `nurseName` varchar(255) DEFAULT NULL,
  `note` text,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ipdId` (`ipdId`),
  CONSTRAINT `nursing_notes_ibfk_1` FOREIGN KEY (`ipdId`) REFERENCES `ipd_admissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `opd`
CREATE TABLE `opd` (
  `id` int NOT NULL AUTO_INCREMENT,
  `opdTicketNumber` varchar(50) NOT NULL,
  `patientId` int NOT NULL,
  `doctorId` int DEFAULT NULL,
  `visitDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `consultationFee` decimal(10,2) DEFAULT NULL,
  `complaint` longtext,
  `diagnosis` longtext,
  `treatment` longtext,
  `prescriptions` longtext,
  `followUpDate` date DEFAULT NULL,
  `notes` longtext,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `opdTicketNumber` (`opdTicketNumber`),
  KEY `patientId` (`patientId`),
  KEY `doctorId` (`doctorId`),
  CONSTRAINT `opd_ibfk_1` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `opd_ibfk_2` FOREIGN KEY (`doctorId`) REFERENCES `doctors` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `opd_records`
CREATE TABLE `opd_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patientName` varchar(255) DEFAULT NULL,
  `patientId` varchar(100) DEFAULT NULL,
  `visitDate` date DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `doctorName` varchar(255) DEFAULT NULL,
  `symptoms` text,
  `diagnosis` text,
  `treatment` text,
  `consultationFee` decimal(10,2) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Completed',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `vitals` text,
  `notes` text,
  `followUpDate` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `ot_schedules`
CREATE TABLE `ot_schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ipdId` int NOT NULL,
  `procedureName` varchar(255) DEFAULT NULL,
  `operatingSurgeon` varchar(255) DEFAULT NULL,
  `otRoom` varchar(100) DEFAULT NULL,
  `scheduledDate` datetime DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Scheduled',
  `notes` text,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ipdId` (`ipdId`),
  CONSTRAINT `ot_schedules_ibfk_1` FOREIGN KEY (`ipdId`) REFERENCES `ipd_admissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `patients`
CREATE TABLE `patients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int DEFAULT NULL,
  `patientId` varchar(50) NOT NULL,
  `firstName` varchar(100) NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `dateOfBirth` date NOT NULL,
  `gender` enum('Male','Female','Other') NOT NULL,
  `bloodType` varchar(10) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `street` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `zipCode` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `emergencyContactName` varchar(100) DEFAULT NULL,
  `emergencyContactRelation` varchar(50) DEFAULT NULL,
  `emergencyContactPhone` varchar(20) DEFAULT NULL,
  `medicalHistory` longtext,
  `allergies` longtext,
  `medications` longtext,
  `chronicDiseases` longtext,
  `surgicalHistory` longtext,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `patientId` (`patientId`),
  UNIQUE KEY `userId` (`userId`),
  CONSTRAINT `patients_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `staff`
CREATE TABLE `staff` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staffId` varchar(50) NOT NULL,
  `firstName` varchar(100) NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `role` varchar(100) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `shiftTiming` varchar(100) DEFAULT NULL,
  `qualifications` longtext,
  `joiningDate` date DEFAULT NULL,
  `status` enum('active','inactive','on-leave') DEFAULT 'active',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `staffId` (`staffId`),
  KEY `staffId_2` (`staffId`),
  KEY `department` (`department`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `tpa`
CREATE TABLE `tpa` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tpaId` varchar(50) NOT NULL,
  `tpaName` varchar(200) NOT NULL,
  `contactPerson` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` longtext,
  `networkHospitals` longtext,
  `claimProcessingTime` int DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tpaId` (`tpaId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `user_settings`
CREATE TABLE `user_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `settingsData` json NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_settings` (`userId`),
  CONSTRAINT `user_settings_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `users`
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','doctor','nurse','patient','staff') DEFAULT 'patient',
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `wards`
CREATE TABLE `wards` (
  `id` int NOT NULL AUTO_INCREMENT,
  `wardId` varchar(50) NOT NULL,
  `wardName` varchar(100) NOT NULL,
  `wardType` varchar(100) DEFAULT NULL,
  `totalBeds` int DEFAULT NULL,
  `occupiedBeds` int DEFAULT '0',
  `availableBeds` int DEFAULT NULL,
  `floorNumber` int DEFAULT NULL,
  `facilities` longtext,
  `status` enum('active','maintenance','closed') DEFAULT 'active',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `wardId` (`wardId`),
  KEY `wardId_2` (`wardId`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

