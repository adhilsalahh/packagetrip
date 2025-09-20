import { supabase } from './supabase';

export interface WhatsAppMessage {
  to: string;
  message: string;
  bookingId: string;
}

export interface EmailMessage {
  to: string;
  subject: string;
  message: string;
  bookingId: string;
}

// WhatsApp API integration (using a mock service for demo)
export const sendWhatsAppMessage = async (message: WhatsAppMessage): Promise<boolean> => {
  try {
    // In production, integrate with WhatsApp Business API or services like Twilio
    console.log('Sending WhatsApp message:', message);
    
    // Mock API call
    const response = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WHATSAPP_API_TOKEN}`
      },
      body: JSON.stringify({
        to: message.to,
        type: 'text',
        text: {
          body: message.message
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send WhatsApp message');
    }

    // Log the message in database
    await supabase.from('message_logs').insert({
      booking_id: message.bookingId,
      type: 'whatsapp',
      recipient: message.to,
      content: message.message,
      status: 'sent',
      sent_at: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('WhatsApp message error:', error);
    
    // Log failed message
    await supabase.from('message_logs').insert({
      booking_id: message.bookingId,
      type: 'whatsapp',
      recipient: message.to,
      content: message.message,
      status: 'failed',
      error_message: error instanceof Error ? error.message : 'Unknown error',
      sent_at: new Date().toISOString()
    });

    return false;
  }
};

// Email service integration
export const sendEmail = async (email: EmailMessage): Promise<boolean> => {
  try {
    // In production, integrate with services like SendGrid, AWS SES, or Resend
    console.log('Sending email:', email);

    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EMAIL_API_TOKEN}`
      },
      body: JSON.stringify({
        to: email.to,
        subject: email.subject,
        html: email.message
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    // Log the email in database
    await supabase.from('message_logs').insert({
      booking_id: email.bookingId,
      type: 'email',
      recipient: email.to,
      subject: email.subject,
      content: email.message,
      status: 'sent',
      sent_at: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    
    // Log failed email
    await supabase.from('message_logs').insert({
      booking_id: email.bookingId,
      type: 'email',
      recipient: email.to,
      subject: email.subject,
      content: email.message,
      status: 'failed',
      error_message: error instanceof Error ? error.message : 'Unknown error',
      sent_at: new Date().toISOString()
    });

    return false;
  }
};

// Template processing
export const processMessageTemplate = (template: string, variables: Record<string, string>): string => {
  let processedTemplate = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processedTemplate = processedTemplate.replace(regex, value);
  });
  
  return processedTemplate;
};

// Send booking confirmation messages
export const sendBookingConfirmation = async (bookingId: string): Promise<void> => {
  try {
    // Get booking details with user and package info
    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        profiles!bookings_user_id_fkey (
          name,
          email,
          phone
        ),
        trek_packages!bookings_package_id_fkey (
          title,
          location,
          duration
        )
      `)
      .eq('id', bookingId)
      .single();

    if (error || !booking) {
      throw new Error('Booking not found');
    }

    const user = booking.profiles;
    const package_ = booking.trek_packages;

    // Prepare template variables
    const variables = {
      userName: user.name,
      packageTitle: package_.title,
      location: package_.location,
      startDate: new Date(booking.start_date).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      duration: package_.duration.toString(),
      groupSize: booking.group_size.toString(),
      totalAmount: `₹${booking.total_amount.toLocaleString()}`,
      bookingReference: booking.id.slice(0, 8).toUpperCase(),
      confirmationDate: new Date().toLocaleDateString('en-IN')
    };

    // Send WhatsApp message
    if (user.phone) {
      const whatsappMessage = processMessageTemplate(
        `🎉 *Booking Confirmed!*

Hello {{userName}},

Your booking for *{{packageTitle}}* has been confirmed!

📅 *Date:* {{startDate}}
📍 *Location:* {{location}}
⏱️ *Duration:* {{duration}} days
👥 *Group Size:* {{groupSize}} people
💰 *Total Amount:* {{totalAmount}}
🔖 *Reference:* {{bookingReference}}

We're excited to have you join us for this amazing trekking adventure! You'll receive detailed preparation guidelines and itinerary via email shortly.

For any queries, feel free to contact us.

Happy Trekking! 🏔️
Kerala Trekking Team`,
        variables
      );

      await sendWhatsAppMessage({
        to: user.phone,
        message: whatsappMessage,
        bookingId: booking.id
      });
    }

    // Send confirmation email
    const emailSubject = `Booking Confirmed - ${package_.title}`;
    const emailMessage = processMessageTemplate(
      `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .booking-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 8px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Booking Confirmed!</h1>
        </div>
        <div class="content">
            <p>Dear {{userName}},</p>
            
            <p>We're thrilled to confirm your booking for <strong>{{packageTitle}}</strong>! Your adventure awaits.</p>
            
            <div class="booking-details">
                <h3>Booking Details</h3>
                <div class="detail-row">
                    <span><strong>Package:</strong></span>
                    <span>{{packageTitle}}</span>
                </div>
                <div class="detail-row">
                    <span><strong>Location:</strong></span>
                    <span>{{location}}</span>
                </div>
                <div class="detail-row">
                    <span><strong>Start Date:</strong></span>
                    <span>{{startDate}}</span>
                </div>
                <div class="detail-row">
                    <span><strong>Duration:</strong></span>
                    <span>{{duration}} days</span>
                </div>
                <div class="detail-row">
                    <span><strong>Group Size:</strong></span>
                    <span>{{groupSize}} people</span>
                </div>
                <div class="detail-row">
                    <span><strong>Total Amount:</strong></span>
                    <span>{{totalAmount}}</span>
                </div>
                <div class="detail-row">
                    <span><strong>Booking Reference:</strong></span>
                    <span>{{bookingReference}}</span>
                </div>
            </div>
            
            <p><strong>What's Next?</strong></p>
            <ul>
                <li>You'll receive a detailed itinerary and preparation checklist within 24 hours</li>
                <li>Our team will contact you 48 hours before the trek with final instructions</li>
                <li>Please ensure you have all required documents and gear ready</li>
            </ul>
            
            <p>If you have any questions or need to make changes, please contact us immediately.</p>
            
            <p>We can't wait to share this incredible experience with you!</p>
            
            <p>Best regards,<br>
            Kerala Trekking Team<br>
            📞 +91 9876543210<br>
            📧 info@keralatrekking.com</p>
        </div>
        <div class="footer">
            <p>This is an automated confirmation. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>`,
      variables
    );

    await sendEmail({
      to: user.email,
      subject: emailSubject,
      message: emailMessage,
      bookingId: booking.id
    });

  } catch (error) {
    console.error('Error sending booking confirmation:', error);
    throw error;
  }
};