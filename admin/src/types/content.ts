export type CustomRequirementStatus = 'pending' | 'followed';

export type CustomRequirementEntity = {
  id: number;
  name?: string | null;
  phone: string;
  company?: string | null;
  industry?: string | null;
  process?: string | null;
  temperature?: string | null;
  requirement?: string | null;
  status: CustomRequirementStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type CustomRequirementListQuery = {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: CustomRequirementStatus;
};
