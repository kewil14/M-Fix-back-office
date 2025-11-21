export interface SubscriptionResponseDto {
  id: string;
  workspaceId: string;
  planType: string;
  price: number;
  startDate: string;
  endDate: string;
  status: string;
  maxShops?: number;
  maxUsers?: number;
  maxProducts?: number;
  maxOrders?: number;
  features?: { [key: string]: string };
  autoRenew?: boolean;
  updatedAt?: string;
}

export interface SubscriptionPlanDto {
  code: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  billingPeriod?: string;
  features?: { [key: string]: string };
  limits?: { [key: string]: number };
  isPopular?: boolean;
}

export interface UpgradeSubscriptionDto {
  newPlanType: string;
}

export interface DowngradeSubscriptionDto {
  newPlanType: string;
}

export interface BillingHistoryDto {
  id: string;
  subscriptionId: string;
  amount: number;
  currency?: string;
  status: string;
  billingDate: string;
  invoiceUrl?: string;
  createdAt?: string;
}

