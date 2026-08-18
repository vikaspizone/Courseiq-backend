export enum UserRole {
  ADMIN = 'admin',
  INSTRUCTOR = 'instructor',
  STUDENT = 'student',
}

export enum CourseType {
  FREE = 'free',
  PAID = 'paid',
}

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum CourseStatus {
  DRAFT = 'draft',
  COMING_SOON = 'coming_soon',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum DiscountType {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
}

export enum CourseMediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
}

export enum EnrollmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  UPI = 'upi',
  CARD = 'card',
  NET_BANKING = 'net_banking',
  OTHER = 'other',
}



