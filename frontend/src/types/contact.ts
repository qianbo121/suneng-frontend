export type ContactInfoContent = {
  address: string;
  phone: string;
  email: string;
  fax: string;
  qrCodeImage: string;
  mapImage: string;
};

export type ContactFormValues = {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
};

export type ContactFormErrors = Partial<Record<keyof ContactFormValues, string>>;

export type ContactMessagePayload = {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  message: string;
};
