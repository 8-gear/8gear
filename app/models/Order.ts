import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  orderId: string;
  trackingId: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    address: string;
    apartment?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  items: Array<{
    productId: mongoose.Types.ObjectId;
    variantId: string;
    sku: string;
    title: string;
    slug: string;
    color: string;
    colorHex?: string;
    size: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
    image: string;
  }>;
  amounts: {
    subtotal: number;
    shippingAmount: number;
    totalAmount: number;
    currency: string;
  };
  payment: {
    paymentMethod: 'Stripe' | 'PayPal' | 'COD' | 'Test' | 'Free';
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    paymentProviderId?: string;
    stripeSessionId?: string;
    paypalOrderId?: string;
    paypalCaptureId?: string;
  };
  linkedCheckoutLeadId?: string;
  orderStatus:
  | 'pending_payment'
  | 'order_received'
  | 'payment_confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';
  fulfillmentStatus: 'pending' | 'packed' | 'shipped' | 'delivered' | 'returned';
  shipping?: {
    courierName?: string;
    trackingNumber?: string;
    trackingUrl?: string;
  };
  adminNotes?: string;
  stockReduced: boolean;
  orderConfirmationEmailSentAt?: Date;
  emailRevision: number;
  archived: boolean;
  archivedAt?: Date;
  archivedBy?: string;
  trackingTimeline: Array<{
    status: string;
    message: string;
    timestamp: Date;
    updatedBy: 'system' | 'admin';
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    orderId: { type: String, required: true, unique: true },
    trackingId: { type: String, required: true, unique: true },
    customerInfo: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    shippingAddress: {
      address: { type: String, required: true },
      apartment: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String, required: true },
      country: { type: String, required: true },
    },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        variantId: { type: String, required: true },
        sku: { type: String, required: true },
        title: { type: String, required: true },
        slug: { type: String, required: true },
        color: { type: String, required: true },
        colorHex: { type: String },
        size: { type: String, required: true },
        unitPrice: { type: Number, required: true },
        quantity: { type: Number, required: true },
        lineTotal: { type: Number, required: true },
        image: { type: String },
      },
    ],
    amounts: {
      subtotal: { type: Number, required: true },
      shippingAmount: { type: Number, required: true },
      totalAmount: { type: Number, required: true },
      currency: { type: String, default: 'USD' },
    },
    payment: {
      paymentMethod: { type: String, enum: ['Stripe', 'PayPal', 'COD', 'Test', 'Free'], required: true },
      paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
      },
      paymentProviderId: { type: String },
      stripeSessionId: { type: String },
      paypalOrderId: { type: String },
      paypalCaptureId: { type: String },
    },
    linkedCheckoutLeadId: { type: String },
    orderStatus: {
      type: String,
      enum: [
        'pending_payment',
        'order_received',
        'payment_confirmed',
        'processing',
        'packed',
        'shipped',
        'out_for_delivery',
        'delivered',
        'cancelled',
        'refunded',
      ],
      default: 'pending_payment',
    },
    fulfillmentStatus: {
      type: String,
      enum: ['pending', 'packed', 'shipped', 'delivered', 'returned'],
      default: 'pending',
    },
    shipping: {
      courierName: { type: String },
      trackingNumber: { type: String },
      trackingUrl: { type: String },
    },
    adminNotes: { type: String },
    stockReduced: { type: Boolean, default: false },
    orderConfirmationEmailSentAt: { type: Date },
    emailRevision: { type: Number, default: 0 },
    emailDeliveries: { type: [{
      _id: false,
      key: { type: String, required: true },
      type: { type: String, required: true },
      state: { type: String, enum: ['claimed', 'sent', 'failed'], required: true },
      claimedAt: Date,
      sentAt: Date,
    }], default: [], select: false },
    archived: { type: Boolean, default: false, index: true },
    archivedAt: { type: Date },
    archivedBy: { type: String },
    trackingTimeline: [
      {
        status: { type: String, required: true },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        updatedBy: { type: String, enum: ['system', 'admin'], default: 'system' },
      },
    ],
  },
  { timestamps: true }
);

OrderSchema.index({ archived: 1, createdAt: -1 });

// Force refresh model to avoid schema caching issues
if (mongoose.models.Order) {
  delete mongoose.models.Order;
}

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
