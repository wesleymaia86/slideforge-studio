export enum MemberRole {
  OWNER = "owner",
  ADMIN = "admin",
  EDITOR = "editor",
  VIEWER = "viewer",
  APPROVER = "approver",
}

export enum ProjectStatus {
  DRAFT = "draft",
  PROCESSING = "processing",
  READY = "ready",
  ARCHIVED = "archived",
}

export enum DeckStatus {
  DRAFT = "draft",
  GENERATING = "generating",
  READY = "ready",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

export enum SlideLayout {
  TITLE = "title",
  CONTENT = "content",
  TWO_COLUMN = "two_column",
  IMAGE_LEFT = "image_left",
  IMAGE_RIGHT = "image_right",
  FULL_IMAGE = "full_image",
  QUOTE = "quote",
  METRICS = "metrics",
  DIVIDER = "divider",
  BLANK = "blank",
}

export enum JobStatus {
  PENDING = "pending",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
  RETRYING = "retrying",
}

export enum JobType {
  FILE_PARSE = "file_parse",
  AI_PIPELINE = "ai_pipeline",
  EXPORT = "export",
  THUMBNAIL = "thumbnail",
}

export enum ExportFormat {
  PPTX = "pptx",
  PDF = "pdf",
  PNG = "png",
  HTML = "html",
}

export enum SubscriptionStatus {
  TRIALING = "trialing",
  ACTIVE = "active",
  PAST_DUE = "past_due",
  CANCELED = "canceled",
  INCOMPLETE = "incomplete",
  PAUSED = "paused",
}

export enum PlanTier {
  FREE = "free",
  STARTER = "starter",
  PRO = "pro",
  ENTERPRISE = "enterprise",
}

export enum AuditAction {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  PUBLISH = "publish",
  EXPORT = "export",
  INVITE = "invite",
  REVOKE = "revoke",
  LOGIN = "login",
  LOGOUT = "logout",
}

export enum FileAssetType {
  UPLOAD = "upload",
  EXPORT = "export",
  THUMBNAIL = "thumbnail",
  BRAND_LOGO = "brand_logo",
  BRAND_FONT = "brand_font",
}

export enum InsightType {
  SUMMARY = "summary",
  KEY_POINTS = "key_points",
  TONE = "tone",
  AUDIENCE = "audience",
  ACTION_ITEMS = "action_items",
  CUSTOM = "custom",
}
