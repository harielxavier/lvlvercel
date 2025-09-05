import { storage } from './storage.js';
import type { InsertNotification, NotificationPreferences, User } from '@shared/schema';

interface EmailConfig {
  from: string;
  to: string;
  subject: string;
  html: string;
}

interface SMSConfig {
  to: string;
  message: string;
}

export class NotificationService {
  private emailEnabled: boolean = true;
  private smsEnabled: boolean = false;
  
  constructor() {
    // Initialize email service (simulated for demo)
    console.log('📧 Email notification service initialized');
    console.log('📱 SMS service ready for configuration');
  }

  /**
   * Send a notification to a user based on their preferences
   */
  async sendNotification(
    userId: string, 
    type: 'feedback_received' | 'goal_reminder' | 'performance_review' | 'system_update' | 'weekly_digest',
    title: string,
    message: string,
    metadata?: any
  ): Promise<void> {
    try {
      // Get user and their notification preferences
      const user = await storage.getUser(userId);
      if (!user) {
        console.error(`User ${userId} not found for notification`);
        return;
      }

      let preferences = await storage.getUserNotificationPreferences(userId);
      
      // Create default preferences if none exist
      if (!preferences) {
        preferences = await storage.upsertNotificationPreferences({
          userId,
          emailNotifications: true,
          pushNotifications: true,
          feedbackNotifications: true,
          goalReminders: true,
          weeklyDigest: false,
        });
      }

      // Create the notification record
      const notificationData: InsertNotification = {
        userId,
        type,
        title,
        message,
        metadata,
      };

      const savedNotification = await storage.createNotification(notificationData);

      // Send real-time notification via WebSocket
      const broadcastSuccess = this.sendRealTimeNotification(userId, savedNotification);

      // Send email notification if enabled and user preference allows
      if (this.shouldSendEmail(type, preferences)) {
        await this.sendEmail(user, title, message, metadata);
      }

      // Send SMS if enabled and configured
      if (this.shouldSendSMS(type, preferences)) {
        await this.sendSMS(user, message);
      }

      const deliveryMethods = [];
      if (broadcastSuccess) deliveryMethods.push('real-time');
      if (this.shouldSendEmail(type, preferences)) deliveryMethods.push('email');
      if (this.shouldSendSMS(type, preferences)) deliveryMethods.push('sms');

      console.log(`✅ Notification sent to ${user.email} via [${deliveryMethods.join(', ')}]: ${title}`);
    } catch (error) {
      console.error('❌ Failed to send notification:', error);
    }
  }

  /**
   * Send feedback notification when new feedback is received
   */
  async notifyFeedbackReceived(employeeUserId: string, feedbackData: any): Promise<void> {
    const title = '⭐ New Feedback Received!';
    const message = `You have received new feedback with a ${feedbackData.rating}-star rating. Check your dashboard to view the details.`;
    
    await this.sendNotification(
      employeeUserId,
      'feedback_received',
      title,
      message,
      { feedbackId: feedbackData.id, rating: feedbackData.rating }
    );
  }

  /**
   * Send goal reminder notifications
   */
  async notifyGoalReminder(userId: string, goalData: any): Promise<void> {
    const daysUntilDue = Math.ceil((new Date(goalData.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const title = `🎯 Goal Reminder: ${goalData.title}`;
    const message = `Your goal "${goalData.title}" is due in ${daysUntilDue} days. Current progress: ${goalData.progress}%`;
    
    await this.sendNotification(
      userId,
      'goal_reminder',
      title,
      message,
      { goalId: goalData.id, targetDate: goalData.targetDate, progress: goalData.progress }
    );
  }

  /**
   * Send performance review notifications
   */
  async notifyPerformanceReview(userId: string, reviewData: any, action: 'created' | 'submitted' | 'approved'): Promise<void> {
    const actionMessages = {
      created: 'A new performance review has been created for you.',
      submitted: 'Your performance review has been submitted for approval.',
      approved: 'Your performance review has been approved!'
    };

    const title = `📊 Performance Review ${action.charAt(0).toUpperCase() + action.slice(1)}`;
    const message = `${actionMessages[action]} Review period: ${reviewData.reviewPeriod}`;
    
    await this.sendNotification(
      userId,
      'performance_review',
      title,
      message,
      { reviewId: reviewData.id, reviewPeriod: reviewData.reviewPeriod, action }
    );
  }

  /**
   * Send weekly digest to users who have opted in
   */
  async sendWeeklyDigest(userId: string, digestData: any): Promise<void> {
    const title = '📈 Your Weekly Performance Digest';
    const message = `Here's your weekly summary: ${digestData.newFeedback} new feedback received, ${digestData.goalsCompleted} goals completed.`;
    
    await this.sendNotification(
      userId,
      'weekly_digest',
      title,
      message,
      digestData
    );
  }

  private shouldSendEmail(type: string, preferences: NotificationPreferences): boolean {
    if (!this.emailEnabled || !preferences.emailNotifications) return false;
    
    switch (type) {
      case 'feedback_received':
        return !!preferences.feedbackNotifications;
      case 'goal_reminder':
        return !!preferences.goalReminders;
      case 'weekly_digest':
        return !!preferences.weeklyDigest;
      case 'performance_review':
      case 'system_update':
        return true; // Always send important notifications
      default:
        return false;
    }
  }

  private shouldSendSMS(type: string, preferences: NotificationPreferences): boolean {
    // SMS only for critical notifications
    return this.smsEnabled && !!preferences.pushNotifications && 
           (type === 'performance_review' || type === 'system_update');
  }

  private async sendEmail(user: User, title: string, message: string, metadata?: any): Promise<void> {
    const emailConfig: EmailConfig = {
      from: 'LVL UP Performance <notifications@lvlupperformance.com>',
      to: user.email || '',
      subject: title,
      html: this.generateEmailHTML(user, title, message, metadata),
    };

    try {
      // Check if Mailgun is configured
      if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
        console.log(`📧 Email simulated (Mailgun not configured) to ${emailConfig.to}: ${emailConfig.subject}`);
        return;
      }

      // Import Mailgun (only when needed)
      const formData = require('form-data');
      const Mailgun = require('mailgun.js');
      const mailgun = new Mailgun(formData);
      const mg = mailgun.client({
        username: 'api',
        key: process.env.MAILGUN_API_KEY,
      });

      // Send email via Mailgun
      const emailData = {
        from: emailConfig.from,
        to: emailConfig.to,
        subject: emailConfig.subject,
        html: emailConfig.html,
      };

      await mg.messages.create(process.env.MAILGUN_DOMAIN, emailData);
      console.log(`📧 Email sent via Mailgun to ${emailConfig.to}: ${emailConfig.subject}`);
    } catch (error) {
      console.error('❌ Failed to send email via Mailgun:', error);
      // Fallback to console logging
      console.log(`📧 Email fallback (simulated) to ${emailConfig.to}: ${emailConfig.subject}`);
    }
  }

  private async sendSMS(user: User, message: string): Promise<void> {
    // SMS implementation would require phone number in user profile
    console.log(`📱 SMS would be sent to user ${user.id}: ${message}`);
    
    // TODO: Integrate with SMS service like Twilio
    // await twilioClient.messages.create({
    //   body: message,
    //   to: user.phoneNumber,
    //   from: process.env.TWILIO_PHONE_NUMBER
    // });
  }

  private sendRealTimeNotification(userId: string, notification: any): boolean {
    // Use the global broadcast function set up by WebSocket server
    if (typeof (global as any).broadcastNotification === 'function') {
      return (global as any).broadcastNotification(userId, {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        metadata: notification.metadata,
        createdAt: notification.createdAt,
        isRead: false
      });
    }
    return false;
  }

  private generateEmailHTML(user: User, title: string, message: string, metadata?: any): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 LVL UP Performance</h1>
                <h2>${title}</h2>
            </div>
            <div class="content">
                <p>Hi ${user.firstName},</p>
                <p>${message}</p>
                ${metadata ? `<p><strong>Details:</strong> ${JSON.stringify(metadata, null, 2)}</p>` : ''}
                <a href="${process.env.REPLIT_DEV_DOMAIN || 'https://your-app.replit.app'}" class="button">
                    View Dashboard
                </a>
            </div>
            <div class="footer">
                <p>© 2025 LVL UP Performance. All rights reserved.</p>
                <p>You can manage your notification preferences in your profile settings.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Get notification statistics for system monitoring
   */
  async getNotificationStats(): Promise<any> {
    // This would typically query the database for notification metrics
    return {
      totalSent: 0, // TODO: Implement actual counting
      emailsSent: 0,
      smsSent: 0,
      status: 'configured'
    };
  }

  /**
   * Health check for notification services
   */
  async healthCheck(): Promise<{ email: boolean; sms: boolean }> {
    return {
      email: this.emailEnabled,
      sms: this.smsEnabled
    };
  }
}

export const notificationService = new NotificationService();