export interface WishPayload {
  id: string;
  country: string;
  reason: string;
  createdAt: string;
  userAgent?: string;
  locale?: string;
}

export interface WishDraft {
  country: string;
  reason: string;
  updatedAt: string;
}
