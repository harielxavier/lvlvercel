import { storage } from "./storage.js";

// Define the default system settings
const defaultSystemSettings = [
  // Platform Configuration
  {
    settingKey: "platform_name",
    settingValue: "LVL UP Performance",
    category: "platform",
    description: "The name of the platform displayed in the UI",
    isEditable: true,
  },
  {
    settingKey: "platform_timezone",
    settingValue: "UTC",
    category: "platform",
    description: "Default timezone for the platform",
    isEditable: true,
  },
  {
    settingKey: "support_email",
    settingValue: "support@lvlupperformance.com",
    category: "platform",
    description: "Contact email for platform support",
    isEditable: true,
  },
  {
    settingKey: "terms_of_service_url",
    settingValue: "/terms",
    category: "platform",
    description: "URL for terms of service page",
    isEditable: true,
  },
  {
    settingKey: "privacy_policy_url",
    settingValue: "/privacy",
    category: "platform",
    description: "URL for privacy policy page",
    isEditable: true,
  },

  // Security Settings
  {
    settingKey: "session_timeout_minutes",
    settingValue: 480,
    category: "security",
    description: "Session timeout in minutes (default 8 hours)",
    isEditable: true,
  },
  {
    settingKey: "password_min_length",
    settingValue: 8,
    category: "security",
    description: "Minimum password length requirement",
    isEditable: true,
  },
  {
    settingKey: "max_login_attempts",
    settingValue: 5,
    category: "security",
    description: "Maximum login attempts before account lockout",
    isEditable: true,
  },
  {
    settingKey: "account_lockout_duration_minutes",
    settingValue: 15,
    category: "security",
    description: "Duration of account lockout in minutes",
    isEditable: true,
  },
  {
    settingKey: "require_2fa",
    settingValue: false,
    category: "security",
    description: "Require two-factor authentication for all users",
    isEditable: true,
  },

  // Notification Settings
  {
    settingKey: "email_notifications_enabled",
    settingValue: true,
    category: "notifications",
    description: "Enable email notifications system-wide",
    isEditable: true,
  },
  {
    settingKey: "sms_notifications_enabled",
    settingValue: false,
    category: "notifications",
    description: "Enable SMS notifications system-wide",
    isEditable: true,
  },
  {
    settingKey: "notification_rate_limit_per_hour",
    settingValue: 10,
    category: "notifications",
    description: "Maximum notifications per user per hour",
    isEditable: true,
  },
  {
    settingKey: "email_from_address",
    settingValue: "notifications@lvlupperformance.com",
    category: "notifications",
    description: "Default FROM email address for system notifications",
    isEditable: true,
  },

  // Database Settings
  {
    settingKey: "backup_frequency_hours",
    settingValue: 24,
    category: "database",
    description: "Frequency of automated database backups in hours",
    isEditable: true,
  },
  {
    settingKey: "audit_log_retention_days",
    settingValue: 90,
    category: "database",
    description: "Number of days to retain audit log entries",
    isEditable: true,
  },
  {
    settingKey: "data_retention_policy_months",
    settingValue: 36,
    category: "database",
    description: "Data retention policy in months for inactive tenants",
    isEditable: true,
  },

  // Performance Settings
  {
    settingKey: "api_rate_limit_per_minute",
    settingValue: 100,
    category: "performance",
    description: "API rate limit per user per minute",
    isEditable: true,
  },
  {
    settingKey: "max_file_upload_size_mb",
    settingValue: 10,
    category: "performance",
    description: "Maximum file upload size in MB",
    isEditable: true,
  },
  {
    settingKey: "max_goals_per_employee",
    settingValue: 20,
    category: "performance",
    description: "Maximum number of goals per employee",
    isEditable: true,
  },
  {
    settingKey: "max_feedback_length",
    settingValue: 2000,
    category: "performance",
    description: "Maximum character length for feedback comments",
    isEditable: true,
  },
];

export async function seedSystemSettings() {
  
  try {
    // Check if system settings already exist
    const existingSettings = await storage.getSystemSettings();
    
    if (existingSettings.length > 0) {
      return;
    }

    // Create each system setting
    for (const settingData of defaultSystemSettings) {
      try {
        const createdSetting = await storage.upsertSystemSetting({
          ...settingData,
          lastModifiedBy: null, // System-generated default
        });
      } catch (error) {
      }
    }

    
  } catch (error) {
    throw error;
  }
}

// Allow running this script directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  seedSystemSettings()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      process.exit(1);
    });
}