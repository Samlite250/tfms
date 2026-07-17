import { triggerEmail, sendMessageNotification } from './emailService';
import { addDocToCollection } from '../firebase/firestoreService';

const NOTIFICATION_TYPES = {
  COFFEE_RECEIVED: 'coffee_received',
  COFFEE_ACCEPTED: 'coffee_accepted',
  PAYMENT_READY: 'payment_ready',
  PAYMENT_COMPLETED: 'payment_completed',
  PRICE_ANNOUNCEMENT: 'price_announcement',
  IMPORTANT_NOTICE: 'important_notice',
  REMINDER: 'reminder',
};

const NOTIFICATION_LABELS = {
  [NOTIFICATION_TYPES.COFFEE_RECEIVED]: 'Coffee Received',
  [NOTIFICATION_TYPES.COFFEE_ACCEPTED]: 'Coffee Accepted',
  [NOTIFICATION_TYPES.PAYMENT_READY]: 'Payment Ready',
  [NOTIFICATION_TYPES.PAYMENT_COMPLETED]: 'Payment Completed',
  [NOTIFICATION_TYPES.PRICE_ANNOUNCEMENT]: 'Price Announcement',
  [NOTIFICATION_TYPES.IMPORTANT_NOTICE]: 'Important Notice',
  [NOTIFICATION_TYPES.REMINDER]: 'Reminder',
};

async function createNotification({ type, userId, farmerId, farmerName, farmerEmail, data }) {
  const notification = {
    type,
    userId: userId || null,
    farmerId: farmerId || null,
    farmerName: farmerName || null,
    farmerEmail: farmerEmail || null,
    title: NOTIFICATION_LABELS[type] || type,
    message: generateMessage(type, data),
    data: data || {},
    read: false,
    createdAt: new Date().toISOString(),
  };

  try {
    await addDocToCollection('notifications', notification);
  } catch (error) {
    console.error('Failed to save notification:', error);
  }

  return notification;
}

function generateMessage(type, data) {
  switch (type) {
    case NOTIFICATION_TYPES.COFFEE_RECEIVED:
      return `Your coffee delivery of ${data.weight} kg (${data.grade} grade) has been received at ${data.center}. Receipt: ${data.receiptNumber}`;
    case NOTIFICATION_TYPES.COFFEE_ACCEPTED:
      return `Your coffee delivery ${data.receiptNumber} has been accepted. Weight: ${data.weight} kg, Grade: ${data.grade}. Payment will be processed soon.`;
    case NOTIFICATION_TYPES.PAYMENT_READY:
      return `Your payment of ${data.amount} RWF for delivery ${data.receiptNumber} is ready for collection. Payment method: ${data.paymentMethod}`;
    case NOTIFICATION_TYPES.PAYMENT_COMPLETED:
      return `Payment of ${data.amount} RWF has been completed for delivery ${data.receiptNumber}. Thank you for your coffee!`;
    case NOTIFICATION_TYPES.PRICE_ANNOUNCEMENT:
      return `New coffee prices announced: ${data.prices}. Effective from ${data.effectiveDate}.`;
    case NOTIFICATION_TYPES.IMPORTANT_NOTICE:
      return data.message || 'Important notice from the factory management.';
    case NOTIFICATION_TYPES.REMINDER:
      return data.message || 'Reminder: Please check your pending deliveries.';
    default:
      return 'You have a new notification.';
  }
}

export async function notifyCoffeeReceived({ farmerId, farmerName, farmerEmail, weight, grade, center, receiptNumber }) {
  const data = { weight, grade, center, receiptNumber };

  await createNotification({
    type: NOTIFICATION_TYPES.COFFEE_RECEIVED,
    farmerId,
    farmerName,
    farmerEmail,
    data,
  });

  if (farmerEmail) {
    await triggerEmail({
      type: 'coffee_received',
      to: farmerEmail,
      name: farmerName,
      weight,
      grade,
      center,
      receiptNumber,
    });
  }
}

export async function notifyCoffeeAccepted({ farmerId, farmerName, farmerEmail, weight, grade, receiptNumber }) {
  const data = { weight, grade, receiptNumber };

  await createNotification({
    type: NOTIFICATION_TYPES.COFFEE_ACCEPTED,
    farmerId,
    farmerName,
    farmerEmail,
    data,
  });

  if (farmerEmail) {
    await triggerEmail({
      type: 'coffee_accepted',
      to: farmerEmail,
      name: farmerName,
      weight,
      grade,
      receiptNumber,
    });
  }
}

export async function notifyPaymentReady({ farmerId, farmerName, farmerEmail, amount, receiptNumber, paymentMethod }) {
  const data = { amount, receiptNumber, paymentMethod };

  await createNotification({
    type: NOTIFICATION_TYPES.PAYMENT_READY,
    farmerId,
    farmerName,
    farmerEmail,
    data,
  });

  if (farmerEmail) {
    await triggerEmail({
      type: 'payment_ready',
      to: farmerEmail,
      name: farmerName,
      amount,
      receiptNumber,
      paymentMethod,
    });
  }
}

export async function notifyPaymentCompleted({ farmerId, farmerName, farmerEmail, amount, receiptNumber }) {
  const data = { amount, receiptNumber };

  await createNotification({
    type: NOTIFICATION_TYPES.PAYMENT_COMPLETED,
    farmerId,
    farmerName,
    farmerEmail,
    data,
  });

  if (farmerEmail) {
    await triggerEmail({
      type: 'payment_completed',
      to: farmerEmail,
      name: farmerName,
      amount,
      receiptNumber,
    });
  }
}

export async function notifyPriceAnnouncement({ prices, effectiveDate }) {
  const data = { prices, effectiveDate };

  await createNotification({
    type: NOTIFICATION_TYPES.PRICE_ANNOUNCEMENT,
    data,
  });
}

export async function notifyImportantNotice({ message, targetUsers }) {
  const data = { message, targetUsers };

  await createNotification({
    type: NOTIFICATION_TYPES.IMPORTANT_NOTICE,
    data,
  });

  if (targetUsers && targetUsers.length > 0) {
    for (const user of targetUsers) {
      if (user.email) {
        await triggerEmail({
          type: 'important_notice',
          to: user.email,
          name: user.name,
          message,
        });
      }
    }
  }
}

export async function sendFarmerReminder({ farmerId, farmerName, farmerEmail, message }) {
  const data = { message };

  await createNotification({
    type: NOTIFICATION_TYPES.REMINDER,
    farmerId,
    farmerName,
    farmerEmail,
    data,
  });

  if (farmerEmail) {
    await triggerEmail({
      type: 'reminder',
      to: farmerEmail,
      name: farmerName,
      message,
    });
  }
}

export { NOTIFICATION_TYPES, NOTIFICATION_LABELS };
