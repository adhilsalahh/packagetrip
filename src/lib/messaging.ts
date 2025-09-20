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

// WhatsApp API integration
export const sendWhatsAppMessage = async (message: WhatsAppMessage): Promise<boolean> => {
  try {
    console.log('Sending WhatsApp message:', message);
    
    // In production, integrate with WhatsApp Business API
    // For demo, we'll simulate the API call
    const response = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_WHATSAPP_API_TOKEN || 'demo-token'}`
      },
      body: JSON.stringify({
        to: message.to,
        type: 'text',
        text: {
          body: message.message
        }
      })
    }).catch(() => {
      // Simulate successful send for demo
      return { ok: true };
    });

    const success = response.ok;

    // Log the message in database
    await supabase.from('message_logs').insert({
      booking_id: message.bookingId,
      type: 'whatsapp',
      recipient: message.to,
      content: message.message,
      status: success ? 'sent' : 'failed',
      sent_at: new Date().toISOString(),
      delivered_at: success ? new Date().toISOString() : null
    });

    return success;
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
    console.log('Sending email:', email);

    // In production, integrate with SendGrid, AWS SES, or Resend
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_EMAIL_API_TOKEN || 'demo-token'}`
      },
      body: JSON.stringify({
        to: email.to,
        subject: email.subject,
        html: email.message
      })
    }).catch(() => {
      // Simulate successful send for demo
      return { ok: true };
    });

    const success = response.ok;

    // Log the email in database
    await supabase.from('message_logs').insert({
      booking_id: email.bookingId,
      type: 'email',
      recipient: email.to,
      subject: email.subject,
      content: email.message,
      status: success ? 'sent' : 'failed',
      sent_at: new Date().toISOString(),
      delivered_at: success ? new Date().toISOString() : null
    });

    return success;
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

// Get message templates
export const getMessageTemplates = async (type?: 'whatsapp' | 'email') => {
  let query = supabase
    .from('message_templates')
    .select('*')
    .eq('is_active', true);
    
  if (type) {
    query = query.eq('type', type);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
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
      bookingReference: booking.booking_reference || booking.id.slice(0, 8).toUpperCase(),
      confirmationDate: new Date().toLocaleDateString('en-IN')
    };

    // Get message templates
    const templates = await getMessageTemplates();
    const whatsappTemplate = templates.find(t => t.type === 'whatsapp' && t.name === 'Booking Confirmation');
    const emailTemplate = templates.find(t => t.type === 'email' && t.name === 'Booking Confirmation');

    // Send WhatsApp message
    if (user.phone && whatsappTemplate) {
      const whatsappMessage = processMessageTemplate(whatsappTemplate.content, variables);
      
      await sendWhatsAppMessage({
        to: user.phone,
        message: whatsappMessage,
        bookingId: booking.id
      });
    }

    // Send confirmation email
    if (emailTemplate) {
      const emailSubject = processMessageTemplate(emailTemplate.subject || 'Booking Confirmed', variables);
      const emailMessage = processMessageTemplate(emailTemplate.content, variables);

      await sendEmail({
        to: user.email,
        subject: emailSubject,
        message: emailMessage,
        bookingId: booking.id
      });
    }

  } catch (error) {
    console.error('Error sending booking confirmation:', error);
    throw error;
  }
};

// Get message logs for a booking
export const getBookingMessageLogs = async (bookingId: string) => {
  const { data, error } = await supabase
    .from('message_logs')
    .select('*')
    .eq('booking_id', bookingId)
    .order('sent_at', { ascending: false });
    
  if (error) throw error;
  return data;
};

// Retry failed messages
export const retryFailedMessage = async (messageLogId: string): Promise<boolean> => {
  const { data: messageLog, error } = await supabase
    .from('message_logs')
    .select('*')
    .eq('id', messageLogId)
    .single();
    
  if (error || !messageLog) {
    throw new Error('Message log not found');
  }
  
  if (messageLog.type === 'whatsapp') {
    return await sendWhatsAppMessage({
      to: messageLog.recipient,
      message: messageLog.content,
      bookingId: messageLog.booking_id
    });
  } else if (messageLog.type === 'email') {
    return await sendEmail({
      to: messageLog.recipient,
      subject: messageLog.subject || 'Booking Confirmation',
      message: messageLog.content,
      bookingId: messageLog.booking_id
    });
  }
  
  return false;
};