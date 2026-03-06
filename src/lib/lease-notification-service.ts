// Service for managing lease-related notifications and alerts
import { sendEmail } from "@/lib/mail";

export interface LeaseNotificationConfig {
  enableEmailNotifications: boolean;
  enableInAppNotifications: boolean;
  notificationPreferences: {
    leaseActivation: boolean;
    leaseExpiration: boolean;
    leaseTermination: boolean;
    listingRemoval: boolean;
    listingDecisionRequired: boolean;
  };
}

export interface NotificationTemplate {
  subject: string;
  textContent: string;
  htmlContent?: string;
}

export class LeaseNotificationService {
  private defaultConfig: LeaseNotificationConfig = {
    enableEmailNotifications: true,
    enableInAppNotifications: true,
    notificationPreferences: {
      leaseActivation: true,
      leaseExpiration: true,
      leaseTermination: true,
      listingRemoval: true,
      listingDecisionRequired: true
    }
  };

  /**
   * Send notification for lease activation
   */
  async sendLeaseActivationNotification(
    managerEmail: string,
    unitNumber: string,
    propertyName: string,
    leaseId: string
  ): Promise<void> {
    const template = this.getLeaseActivationTemplate(unitNumber, propertyName);
    
    await this.sendNotification({
      recipientEmail: managerEmail,
      template,
      notificationType: 'leaseActivation',
      metadata: { leaseId, unitNumber, propertyName }
    });
  }

  /**
   * Send notification for lease expiration with listing decision prompt
   */
  async sendLeaseExpirationNotification(
    managerEmail: string,
    unitNumber: string,
    propertyName: string,
    unitId: string,
    leaseId: string
  ): Promise<void> {
    const template = this.getLeaseExpirationTemplate(unitNumber, propertyName, unitId);
    
    await this.sendNotification({
      recipientEmail: managerEmail,
      template,
      notificationType: 'leaseExpiration',
      metadata: { leaseId, unitId, unitNumber, propertyName }
    });
  }

  /**
   * Send notification for lease termination with listing decision prompt
   */
  async sendLeaseTerminationNotification(
    managerEmail: string,
    unitNumber: string,
    propertyName: string,
    unitId: string,
    leaseId: string
  ): Promise<void> {
    const template = this.getLeaseTerminationTemplate(unitNumber, propertyName, unitId);
    
    await this.sendNotification({
      recipientEmail: managerEmail,
      template,
      notificationType: 'leaseTermination',
      metadata: { leaseId, unitId, unitNumber, propertyName }
    });
  }

  /**
   * Send notification when lease is signed (preparation for activation)
   */
  async sendLeaseSignedNotification(
    managerEmail: string,
    unitNumber: string,
    propertyName: string,
    leaseStartDate: Date,
    leaseId: string
  ): Promise<void> {
    const template = this.getLeaseSignedTemplate(unitNumber, propertyName, leaseStartDate);
    
    await this.sendNotification({
      recipientEmail: managerEmail,
      template,
      notificationType: 'listingRemoval',
      metadata: { leaseId, unitNumber, propertyName, leaseStartDate }
    });
  }

  /**
   * Send batch notifications for multiple lease events
   */
  async sendBatchNotifications(notifications: Array<{
    type: 'activation' | 'expiration' | 'termination' | 'signed';
    managerEmail: string;
    unitNumber: string;
    propertyName: string;
    leaseId: string;
    unitId?: string;
    leaseStartDate?: Date;
  }>): Promise<void> {
    const promises = notifications.map(async (notification) => {
      try {
        switch (notification.type) {
          case 'activation':
            await this.sendLeaseActivationNotification(
              notification.managerEmail,
              notification.unitNumber,
              notification.propertyName,
              notification.leaseId
            );
            break;
          case 'expiration':
            if (notification.unitId) {
              await this.sendLeaseExpirationNotification(
                notification.managerEmail,
                notification.unitNumber,
                notification.propertyName,
                notification.unitId,
                notification.leaseId
              );
            }
            break;
          case 'termination':
            if (notification.unitId) {
              await this.sendLeaseTerminationNotification(
                notification.managerEmail,
                notification.unitNumber,
                notification.propertyName,
                notification.unitId,
                notification.leaseId
              );
            }
            break;
          case 'signed':
            if (notification.leaseStartDate) {
              await this.sendLeaseSignedNotification(
                notification.managerEmail,
                notification.unitNumber,
                notification.propertyName,
                notification.leaseStartDate,
                notification.leaseId
              );
            }
            break;
        }
      } catch (error) {
        console.error(`Failed to send ${notification.type} notification for lease ${notification.leaseId}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Get user notification preferences
   */
  async getUserNotificationConfig(userId: string): Promise<LeaseNotificationConfig> {
    try {
      // In a full implementation, this would fetch from user preferences table
      // For now, return default config
      return this.defaultConfig;
    } catch (error) {
      console.error('Error fetching user notification config:', error);
      return this.defaultConfig;
    }
  }

  /**
   * Update user notification preferences
   */
  async updateUserNotificationConfig(
    userId: string, 
    config: Partial<LeaseNotificationConfig>
  ): Promise<void> {
    try {
      // In a full implementation, this would update user preferences table
      console.log(`Updated notification config for user ${userId}:`, config);
    } catch (error) {
      console.error('Error updating user notification config:', error);
      throw error;
    }
  }

  /**
   * Core notification sending method
   */
  private async sendNotification({
    recipientEmail,
    template,
    notificationType,
    metadata
  }: {
    recipientEmail: string;
    template: NotificationTemplate;
    notificationType: keyof LeaseNotificationConfig['notificationPreferences'];
    metadata: Record<string, any>;
  }): Promise<void> {
    try {
      // Send email notification
      await sendEmail({
        to: recipientEmail,
        subject: template.subject,
        text: template.textContent,
        html: template.htmlContent
      });

      // Log notification in database
      await this.logNotification({
        recipientEmail,
        notificationType,
        subject: template.subject,
        metadata
      });

      console.log(`Sent ${notificationType} notification to ${recipientEmail}`);

    } catch (error) {
      console.error(`Failed to send ${notificationType} notification:`, error);
      throw error;
    }
  }

  /**
   * Log notification in database for audit trail
   */
  private async logNotification({
    recipientEmail,
    notificationType,
    subject,
    metadata
  }: {
    recipientEmail: string;
    notificationType: string;
    subject: string;
    metadata: Record<string, any>;
  }): Promise<void> {
    try {
      // In a full implementation, this would create a notification log entry
      // For now, just log to console
      console.log('Notification logged:', {
        recipientEmail,
        notificationType,
        subject,
        metadata,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error logging notification:', error);
    }
  }

  /**
   * Template for lease activation notification
   */
  private getLeaseActivationTemplate(unitNumber: string, propertyName: string): NotificationTemplate {
    return {
      subject: `Unit ${unitNumber} Automatically Removed from Marketplace`,
      textContent: `
Hello,

Unit ${unitNumber} at ${propertyName} has been automatically removed from the marketplace because a lease has become active.

The unit is now marked as occupied and is no longer visible to potential tenants.

Key Actions Taken:
• Unit removed from marketplace listings
• Unit marked as occupied
• Tenant applications disabled for this unit

If you need to make any changes, please log into your property management dashboard.

Best regards,
RentFlow360 Team
      `.trim(),
      htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #333;">Unit Automatically Removed from Marketplace</h2>
  
  <p>Hello,</p>
  
  <p>Unit <strong>${unitNumber}</strong> at <strong>${propertyName}</strong> has been automatically removed from the marketplace because a lease has become active.</p>
  
  <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #495057;">Key Actions Taken:</h3>
    <ul style="margin-bottom: 0;">
      <li>Unit removed from marketplace listings</li>
      <li>Unit marked as occupied</li>
      <li>Tenant applications disabled for this unit</li>
    </ul>
  </div>
  
  <p>If you need to make any changes, please log into your property management dashboard.</p>
  
  <p>Best regards,<br>RentFlow360 Team</p>
</div>
      `.trim()
    };
  }

  /**
   * Template for lease expiration notification
   */
  private getLeaseExpirationTemplate(unitNumber: string, propertyName: string, unitId: string): NotificationTemplate {
    const dashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/property-manager/units/${unitId}`;
    
    return {
      subject: `Listing Decision Required: Unit ${unitNumber}`,
      textContent: `
Hello,

The lease for Unit ${unitNumber} at ${propertyName} has expired. The unit is now available and you can choose whether to list it on the marketplace.

You have the following options:
1. List the unit on the marketplace to make it visible to potential tenants
2. Keep the unit private for now (you can list it later)

To make your decision, please visit your property management dashboard:
${dashboardUrl}

The unit has been marked as unoccupied and is ready for your decision.

Best regards,
RentFlow360 Team
      `.trim()
    };
  }

  /**
   * Template for lease termination notification
   */
  private getLeaseTerminationTemplate(unitNumber: string, propertyName: string, unitId: string): NotificationTemplate {
    const dashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/property-manager/units/${unitId}`;
    
    return {
      subject: `Listing Decision Required: Unit ${unitNumber} (Lease Terminated)`,
      textContent: `
Hello,

The lease for Unit ${unitNumber} at ${propertyName} has been terminated early. The unit is now available and you can choose whether to list it on the marketplace.

You have the following options:
1. List the unit on the marketplace to make it visible to potential tenants
2. Keep the unit private for now (you can list it later)

To make your decision, please visit your property management dashboard:
${dashboardUrl}

The unit has been marked as unoccupied and is ready for your decision.

Best regards,
RentFlow360 Team
      `.trim()
    };
  }

  /**
   * Template for lease signed notification
   */
  private getLeaseSignedTemplate(unitNumber: string, propertyName: string, leaseStartDate: Date): NotificationTemplate {
    return {
      subject: `Lease Signed for Unit ${unitNumber} - Marketplace Listing Will Be Removed`,
      textContent: `
Hello,

Great news! The lease for Unit ${unitNumber} at ${propertyName} has been signed.

Important: When the lease becomes active on ${leaseStartDate.toLocaleDateString()}, the unit will be automatically removed from the marketplace and marked as occupied.

Upcoming Actions:
• Unit will be removed from marketplace on ${leaseStartDate.toLocaleDateString()}
• Unit will be marked as occupied
• Tenant applications will be disabled

If you need to make any adjustments before the lease activation, please log into your property management dashboard.

Best regards,
RentFlow360 Team
      `.trim()
    };
  }
}

// Export singleton instance
export const leaseNotificationService = new LeaseNotificationService();