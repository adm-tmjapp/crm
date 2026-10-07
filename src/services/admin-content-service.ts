import { getApiUrl } from "@/lib/api";
import { getAdminSession } from "@/lib/auth";

export type AdminUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  authStatus?: string | null;
  createdAt?: string | null;
  onboardingStatus?: string | null;
};

export type AdminDocument = {
  id: string;
  type?: string;
  side?: string;
  status?: string;
  fileUrl?: string | null;
  filename?: string | null;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
  createdAt?: string | null;
  user?: AdminUser | null;
};

export type AdminVehicle = {
  id: string;
  manufacturer?: string;
  modelName?: string;
  vehiclePlate?: string;
  status?: string;
  documentationStatus?: string;
  createdAt?: string | null;
  owner?: AdminUser | null;
};

export type AdminRide = {
  id: string;
  passengerId?: string;
  status?: string;
  requestedAt?: string;
  acceptedAt?: string;
  completedAt?: string;
  paymentMethod?: string | null;
  rider?: {
    id?: string;
    name?: string;
    phone?: string | null;
  };
  driver?: {
    id?: string;
    name?: string;
    phone?: string | null;
    rating?: number | null;
  };
  vehicle?: {
    licensePlate?: string | null;
    model?: string | null;
    color?: string | null;
    type?: string | null;
  };
  fare?: {
    totalAmount?: number;
    currency?: string | null;
    breakdown?: {
      baseFare?: number | null;
      distanceFee?: number | null;
      timeFee?: number | null;
      serviceFee?: number | null;
    };
  };
  product?: {
    id?: string;
    name?: string;
    price?: number;
    description?: string;
    fare_breakdown?: {
      valorBase?: number;
      valorKm?: number;
      custoFixo?: number;
      taxaIntermediacao?: number;
      subtotal?: number;
      valorTaxa?: number;
    };
  };
  route?: {
    durationMin?: number | null;
    distanceKm?: number | null;
  };
  locations?: {
    pickupAddress?: string | null;
    destinationAddress?: string | null;
  };
};

export type AdminRideListResponse = {
  rides: AdminRide[];
  total: number;
  page: number;
  limit: number;
  summary: Record<string, number>;
};

export type AdminRideDetails = {
  id: string;
  status?: string | null;
  notes?: string | null;
  paymentMethod?: string | null;
  requestedAt?: string | null;
  acceptedAt?: string | null;
  pickedUpAt?: string | null;
  completedAt?: string | null;
  passenger?: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    photoUrl?: string | null;
    authStatus?: string | null;
  } | null;
  driver?: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    photoUrl?: string | null;
    authStatus?: string | null;
    rating?: number | null;
  } | null;
  vehicle?: {
    licensePlate?: string | null;
    model?: string | null;
    color?: string | null;
    type?: string | null;
  } | null;
  locations?: {
    pickup?: {
      address?: string | null;
      coordinates?: {
        latitude?: number | null;
        longitude?: number | null;
      } | null;
    } | null;
    destination?: {
      address?: string | null;
      coordinates?: {
        latitude?: number | null;
        longitude?: number | null;
      } | null;
    } | null;
  } | null;
  route?: {
    distanceKm?: number | null;
    durationMin?: number | null;
    encodedPolyline?: string | null;
  } | null;
  fare?: {
    currency?: string | null;
    totalAmount?: number | null;
    breakdown?: {
      baseFare?: number | null;
      distanceFee?: number | null;
      timeFee?: number | null;
      serviceFee?: number | null;
    } | null;
  } | null;
  product?: {
    id?: string | null;
    name?: string | null;
    price?: number | null;
    description?: string | null;
    fareBreakdown?: Record<string, unknown> | null;
  } | null;
  timeline?: Array<{
    key: string;
    label: string;
    at?: string | null;
    done?: boolean;
  }>;
  payments?: Array<{
    id: string;
    amount?: number | null;
    status?: string | null;
    paymentMethod?: string | null;
    passengerId?: string | null;
    driverId?: string | null;
    createdAt?: string | null;
  }>;
  raw?: Record<string, unknown> | null;
};

export type AdminPayment = {
  id: string;
  rideId?: string | null;
  driverId?: string | null;
  passengerId?: string | null;
  amount: number;
  paymentMethod?: string | null;
  status?: string | null;
  createdAt?: string | null;
};

export type AdminDriverWithdrawal = {
  id: string;
  amount: number;
  status?: string | null;
  pixKeyType?: string | null;
  pixKeyMasked?: string | null;
  providerTxId?: string | null;
  providerStatus?: string | null;
  failureReason?: string | null;
  rejectionReason?: string | null;
  createdAt?: string | null;
  reviewedAt?: string | null;
  completedAt?: string | null;
  driver?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
};

export type PaymentScopeType = "GLOBAL" | "CITY" | "PRODUCT" | "OPERATION";
export type PaymentMethod = "PIX" | "CREDIT_CARD" | "CASH";

export type AdminPaymentSettings = {
  id?: string | null;
  provider: string;
  enabledMethods: PaymentMethod[];
  defaultMethod: PaymentMethod | null;
  allowSavedCard: boolean;
  scopeType: PaymentScopeType;
  scopeId?: string | null;
  updatedAt?: string | null;
  updatedBy?: {
    id?: string | null;
    name?: string | null;
  } | null;
  isInherited?: boolean;
  sourceScopeType?: PaymentScopeType;
  sourceScopeId?: string | null;
};

export type AdminPaymentSettingsAuditLog = {
  id: string;
  action: string;
  scopeType?: PaymentScopeType | null;
  scopeId?: string | null;
  before?: {
    provider?: string | null;
    enabledMethods?: PaymentMethod[];
    defaultMethod?: PaymentMethod | null;
    allowSavedCard?: boolean;
  } | null;
  after?: {
    provider?: string | null;
    enabledMethods?: PaymentMethod[];
    defaultMethod?: PaymentMethod | null;
    allowSavedCard?: boolean;
  } | null;
  createdAt?: string | null;
  adminUser?: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
  } | null;
};

export type AdminProduct = {
  _id: string;
  name?: string;
  icon?: string;
  taxaId?: string;
};

export type AdminTarifa = {
  _id: string;
  name?: string;
  vigenciaInicio?: string;
  vigenciaFim?: string;
  valorBase?: number;
  valorKm?: number;
  custoFixo?: number;
  taxaIntermediacao?: number;
};

export type SmsUsage = {
  totalMessages?: number;
  totalSent?: number;
  totalFailed?: number;
  threshold?: number;
  month?: string;
};

export type AdminAuditLog = {
  id: string;
  action?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  createdAt?: string | null;
  adminUser?: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
  } | null;
};

export type AdminSearchResults = {
  users: Array<{
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string | null;
  }>;
  rides: Array<{
    id: string;
    status?: string | null;
  }>;
  vehicles: Array<{
    id: string;
    vehiclePlate?: string | null;
    manufacturer?: string | null;
    modelName?: string | null;
  }>;
  documents: Array<{
    id: string;
    type?: string | null;
    filename?: string | null;
    user?: AdminUser | null;
  }>;
};

export class AdminApiError extends Error {
  status: number;

  code?: string;

  details?: Record<string, unknown>;

  constructor(input: {
    message: string;
    status: number;
    code?: string;
    details?: Record<string, unknown>;
  }) {
    super(input.message);
    this.name = "AdminApiError";
    this.status = input.status;
    this.code = input.code;
    this.details = input.details;
  }
}

function getAuthHeaders() {
  const session = getAdminSession();
  if (!session?.token) {
    throw new Error("Sessao administrativa invalida.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.token}`
  };
}

async function fetchJson<T>(path: string, init?: RequestInit) {
  const response = await fetch(getApiUrl(path), {
    ...init,
    headers: {
      ...getAuthHeaders(),
      ...(init?.headers || {})
    },
    cache: "no-store"
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new AdminApiError({
      message: payload?.message || "Falha ao carregar dados administrativos.",
      status: response.status,
      code: payload?.code,
      details:
        payload?.details && typeof payload.details === "object" ? payload.details : undefined,
    });
  }

  return payload as T;
}

export async function listPendingDocuments() {
  const payload = await fetchJson<{
    data?: { documents?: AdminDocument[] };
  }>("/admin/driver-documents?status=PENDING&limit=50&page=1");

  return payload.data?.documents || [];
}

export async function listPendingVehicles() {
  const payload = await fetchJson<{
    data?: { vehicles?: AdminVehicle[] };
  }>("/admin/vehicles?status=PENDING&limit=50&page=1");

  return payload.data?.vehicles || [];
}

export async function listRides(params?: {
  statuses?: string[];
  page?: number;
  limit?: number;
  query?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
}) {
  const search = new URLSearchParams();
  (params?.statuses || []).forEach((status) => search.append("status", status));
  search.set("page", String(params?.page || 1));
  search.set("limit", String(params?.limit || 20));
  if (params?.query) search.set("q", params.query);
  if (params?.paymentMethod) search.set("paymentMethod", params.paymentMethod);
  if (params?.startDate) search.set("startDate", params.startDate);
  if (params?.endDate) search.set("endDate", params.endDate);
  const payload = await fetchJson<{
    data?: AdminRideListResponse;
  }>(`/admin/rides?${search.toString()}`);

  return (
    payload.data || {
      rides: [],
      total: 0,
      page: 1,
      limit: 20,
      summary: {},
    }
  );
}

export async function getRideDetails(rideId: string) {
  const payload = await fetchJson<{
    success: boolean;
    data: AdminRideDetails;
  }>(`/admin/rides/${rideId}`);

  return payload.data;
}

export async function deleteRides(ids: string[]) {
  return fetchJson<{
    message?: string;
    deletedCount?: number;
  }>("/admin/rides", {
    method: "DELETE",
    body: JSON.stringify({ ids })
  });
}

export async function adminCancelRide(id: string, reason?: string) {
  return fetchJson<{
    success: boolean;
    message: string;
  }>(`/admin/rides/${id}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason })
  });
}

export async function adminReassignDriver(id: string, driverId: string) {
  return fetchJson<{
    success: boolean;
    message: string;
  }>(`/admin/rides/${id}/reassign`, {
    method: "POST",
    body: JSON.stringify({ driverId })
  });
}

export async function listUsers(params?: {
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const search = new URLSearchParams();
  if (params?.role) search.set("role", params.role);
  if (params?.status) search.set("status", params.status);
  search.set("page", String(params?.page || 1));
  search.set("limit", String(params?.limit || 20));

  const payload = await fetchJson<{
    data?: {
      users?: AdminUser[];
      total?: number;
      page?: number;
      limit?: number;
    };
  }>(`/admin/users?${search.toString()}`);

  return payload.data || { users: [], total: 0, page: 1, limit: 20 };
}

export async function listPayments(params?: {
  page?: number;
  limit?: number;
  status?: string;
  method?: string;
}) {
  const search = new URLSearchParams();
  search.set("page", String(params?.page || 1));
  search.set("limit", String(params?.limit || 20));
  if (params?.status) search.set("status", params.status);
  if (params?.method) search.set("method", params.method);

  const payload = await fetchJson<{
    data?: {
      payments?: AdminPayment[];
      total?: number;
      page?: number;
      limit?: number;
    };
  }>(`/admin/payments?${search.toString()}`);

  return payload.data || { payments: [], total: 0, page: 1, limit: 20 };
}

export async function listDriverWithdrawals(params?: { status?: string; page?: number; limit?: number }) {
  const search = new URLSearchParams();
  search.set("page", String(params?.page || 1));
  search.set("limit", String(params?.limit || 50));
  if (params?.status) search.set("status", params.status);
  return fetchJson<{
    success: boolean;
    items: AdminDriverWithdrawal[];
    total: number;
    page: number;
    limit: number;
  }>(`/admin/driver-withdrawals?${search.toString()}`);
}

export async function approveDriverWithdrawal(id: string) {
  return fetchJson<{ success: boolean; transfer: AdminDriverWithdrawal }>(`/admin/driver-withdrawals/${id}/approve`, {
    method: "PUT"
  });
}

export async function rejectDriverWithdrawal(id: string, reason: string) {
  return fetchJson<{ success: boolean; transfer: AdminDriverWithdrawal }>(`/admin/driver-withdrawals/${id}/reject`, {
    method: "PUT",
    body: JSON.stringify({ reason })
  });
}

export async function getPaymentSettings(params?: {
  scopeType?: PaymentScopeType;
  scopeId?: string | null;
}) {
  const search = new URLSearchParams();
  if (params?.scopeType) search.set("scopeType", params.scopeType);
  if (params?.scopeId) search.set("scopeId", params.scopeId);

  return fetchJson<AdminPaymentSettings>(
    `/admin/payments/settings${search.toString() ? `?${search.toString()}` : ""}`
  );
}

export async function updatePaymentSettings(input: {
  provider: string;
  enabledMethods: PaymentMethod[];
  defaultMethod: PaymentMethod;
  allowSavedCard: boolean;
  scopeType: PaymentScopeType;
  scopeId?: string | null;
}) {
  return fetchJson<{
    success: boolean;
    message: string;
    data?: AdminPaymentSettings;
  }>("/admin/payments/settings", {
    method: "PUT",
    body: JSON.stringify(input)
  });
}

export async function listPaymentSettings() {
  return fetchJson<{
    data: AdminPaymentSettings[];
  }>("/admin/payments/settings/list");
}

export async function deletePaymentSettings(id: string) {
  return fetchJson<{
    success: boolean;
    message: string;
  }>(`/admin/payments/settings/${id}`, {
    method: "DELETE"
  });
}

export async function listPaymentSettingsAuditLogs() {
  return fetchJson<{
    data: AdminPaymentSettingsAuditLog[];
  }>("/admin/payments/settings/audit-logs");
}

export async function getSmsUsage() {
  return fetchJson<SmsUsage>("/admin/usage/sms/monthly");
}

export async function listProducts() {
  const payload = await fetchJson<AdminProduct[]>("/admin/products");
  return Array.isArray(payload) ? payload : [];
}

export async function createProduct(input: {
  name: string;
  icon?: string;
  taxaId?: string | null;
}) {
  return fetchJson<AdminProduct>("/admin/products", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function updateProduct(
  productId: string,
  input: {
    name: string;
    icon?: string;
    taxaId?: string | null;
  }
) {
  return fetchJson<AdminProduct>(`/admin/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(input)
  });
}

export async function deleteProduct(productId: string) {
  const response = await fetch(getApiUrl(`/admin/products/${productId}`), {
    method: "DELETE",
    headers: getAuthHeaders(),
    cache: "no-store"
  });

  if (!response.ok && response.status !== 204) {
    const payload = await response.json();
    throw new Error(payload?.message || "Falha ao remover produto.");
  }
}

export async function listTarifas() {
  const payload = await fetchJson<AdminTarifa[]>("/admin/tarifas");
  return Array.isArray(payload) ? payload : [];
}

export async function createTarifa(input: {
  name?: string;
  vigenciaInicio?: string;
  vigenciaFim?: string;
  valorBase?: number;
  valorKm?: number;
  custoFixo?: number;
  taxaIntermediacao?: number;
}) {
  return fetchJson<AdminTarifa>("/admin/tarifas", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateTarifa(
  tarifaId: string,
  input: {
    name?: string;
    vigenciaInicio?: string;
    vigenciaFim?: string;
    valorBase?: number;
    valorKm?: number;
    custoFixo?: number;
    taxaIntermediacao?: number;
  }
) {
  return fetchJson<AdminTarifa>(`/admin/tarifas/${tarifaId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deleteTarifa(tarifaId: string) {
  const response = await fetch(getApiUrl(`/admin/tarifas/${tarifaId}`), {
    method: "DELETE",
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = await response.json();
    throw new Error(payload?.message || "Falha ao remover tarifa.");
  }
}

export async function listAuditLogs(params?: {
  page?: number;
  limit?: number;
  action?: string;
  targetType?: string;
}) {
  const search = new URLSearchParams();
  search.set("page", String(params?.page || 1));
  search.set("limit", String(params?.limit || 10));
  if (params?.action) search.set("action", params.action);
  if (params?.targetType) search.set("targetType", params.targetType);

  const payload = await fetchJson<{
    data?: {
      logs?: AdminAuditLog[];
      total?: number;
    };
  }>(`/admin/audit-logs?${search.toString()}`);

  return payload.data || { logs: [], total: 0 };
}

export async function searchAdmin(query: string) {
  const payload = await fetchJson<AdminSearchResults>(
    `/admin/search?q=${encodeURIComponent(query)}`
  );

  return payload;
}

export async function approveDocument(documentId: string) {
  await fetchJson(`/admin/driver-documents/${documentId}/approve`, {
    method: "PUT"
  });
}

export async function rejectDocument(documentId: string) {
  await fetchJson(`/admin/driver-documents/${documentId}/reject`, {
    method: "PUT"
  });
}

export async function batchApproveDocuments(ids: string[]) {
  await fetchJson("/admin/driver-documents/batch/approve", {
    method: "PUT",
    body: JSON.stringify({ ids })
  });
}

export async function batchRejectDocuments(ids: string[]) {
  await fetchJson("/admin/driver-documents/batch/reject", {
    method: "PUT",
    body: JSON.stringify({ ids })
  });
}

export async function approveVehicle(vehicleId: string) {
  await fetchJson(`/admin/vehicles/${vehicleId}/approve`, {
    method: "PUT"
  });
}

export async function rejectVehicle(vehicleId: string) {
  await fetchJson(`/admin/vehicles/${vehicleId}/reject`, {
    method: "PUT"
  });
}

export async function batchApproveVehicles(ids: string[]) {
  await fetchJson("/admin/vehicles/batch/approve", {
    method: "PUT",
    body: JSON.stringify({ ids })
  });
}

export async function batchRejectVehicles(ids: string[]) {
  await fetchJson("/admin/vehicles/batch/reject", {
    method: "PUT",
    body: JSON.stringify({ ids })
  });
}

export async function blockUser(userId: string) {
  await fetchJson(`/admin/users/${userId}/block`, {
    method: "PUT"
  });
}

export async function unblockUser(userId: string) {
  await fetchJson(`/admin/users/${userId}/unblock`, {
    method: "PUT"
  });
}

export async function resetDriverOnboarding(userId: string) {
  await fetchJson(`/admin/users/${userId}/reset-onboarding`, {
    method: "PUT"
  });
}
