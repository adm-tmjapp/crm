import { getApiUrl } from "@/lib/api";
import { getAdminSession } from "@/lib/auth";

type DashboardPeriod = "monthly" | "biweekly" | "weekly";

type DashboardResponse = {
  period?: {
    key?: DashboardPeriod;
    startDate?: string;
    endDate?: string;
    timezone?: string;
  };
  updatedAt?: string;
  stats?: {
    totalRevenue?: number;
    activeDrivers?: number;
    totalPassengers?: number;
    newPassengers?: number;
    completedRides?: number;
    averageRideValue?: number;
    pendingApprovals?: number;
  };
  revenueSeries?: Array<{ label?: string; value?: number }>;
  pendingDrivers?: Array<{
    id: string;
    type?: string;
    status?: string;
    createdAt?: string;
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
      phone?: string | null;
    } | null;
  }>;
  pendingVehicles?: Array<{
    id: string;
    manufacturer?: string;
    modelName?: string;
    vehiclePlate?: string;
    status?: string;
    documentationStatus?: string;
  }>;
  trends?: {
    revenueGrowthPercent?: number;
    paymentsGrowthPercent?: number;
  };
};

export type DashboardData = {
  period: {
    key: DashboardPeriod;
    startDate: string;
    endDate: string;
    timezone: string;
  };
  updatedAt: string;
  stats: {
    totalRevenue: number;
    activeDrivers: number;
    totalPassengers: number;
    newPassengers: number;
    completedRides: number;
    averageRideValue: number;
    pendingApprovals: number;
  };
  revenueSeries: Array<{ label: string; value: number }>;
  pendingDrivers: Array<{
    id: string;
    name: string;
    documents: string[];
  }>;
  pendingVehicles: Array<{
    id: string;
    name: string;
    details: string;
  }>;
  trends: {
    revenueGrowthPercent: number;
    paymentsGrowthPercent: number;
  };
};

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

async function fetchJson<T>(path: string) {
  const response = await fetch(getApiUrl(path), {
    headers: getAuthHeaders(),
    cache: "no-store"
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message || "Falha ao carregar dados do dashboard.");
  }

  return payload as T;
}

function normalizeSeries(values?: Array<{ label?: string; value?: number }>) {
  const source = Array.isArray(values) ? values : [];
  return Array.from({ length: 7 }, (_, index) => ({
    label: source[index]?.label || `Ponto ${index + 1}`,
    value: Number(source[index]?.value || 0),
  }));
}

export async function loadAdminDashboardData(period: DashboardPeriod): Promise<DashboardData> {
  const payload = await fetchJson<DashboardResponse>(`/admin/dashboard?period=${period}`);

  return {
    period: {
      key: payload.period?.key || period,
      startDate: payload.period?.startDate || new Date().toISOString(),
      endDate: payload.period?.endDate || new Date().toISOString(),
      timezone: payload.period?.timezone || "America/Recife",
    },
    updatedAt: payload.updatedAt || new Date().toISOString(),
    stats: {
      totalRevenue: Number(payload.stats?.totalRevenue || 0),
      activeDrivers: Number(payload.stats?.activeDrivers || 0),
      totalPassengers: Number(payload.stats?.totalPassengers || 0),
      newPassengers: Number(payload.stats?.newPassengers || 0),
      completedRides: Number(payload.stats?.completedRides || 0),
      averageRideValue: Number(payload.stats?.averageRideValue || 0),
      pendingApprovals: Number(payload.stats?.pendingApprovals || 0)
    },
    revenueSeries: normalizeSeries(payload.revenueSeries),
    pendingDrivers: (payload.pendingDrivers || []).map((driver) => ({
      id: driver.id,
      name: driver.user?.name || driver.user?.email || "Motorista pendente",
      documents: [driver.type || driver.status || "DOCUMENTO"]
    })),
    pendingVehicles: (payload.pendingVehicles || []).map((vehicle) => ({
      id: vehicle.id,
      name:
        `${vehicle.manufacturer || ""} ${vehicle.modelName || ""}`.trim() ||
        "Veiculo pendente",
      details: `${vehicle.vehiclePlate || "SEM PLACA"} • ${
        vehicle.documentationStatus || vehicle.status || "PENDENTE"
      }`
    })),
    trends: {
      revenueGrowthPercent: Number(payload.trends?.revenueGrowthPercent || 0),
      paymentsGrowthPercent: Number(payload.trends?.paymentsGrowthPercent || 0)
    }
  };
}

export async function approvePendingDocument(documentId: string) {
  const response = await fetch(getApiUrl(`/admin/driver-documents/${documentId}/approve`), {
    method: "PUT",
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const payload = await response.json();
    throw new Error(payload?.message || "Falha ao aprovar documento.");
  }
}

export async function rejectPendingDocument(documentId: string) {
  const response = await fetch(getApiUrl(`/admin/driver-documents/${documentId}/reject`), {
    method: "PUT",
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const payload = await response.json();
    throw new Error(payload?.message || "Falha ao rejeitar documento.");
  }
}

export async function approvePendingVehicle(vehicleId: string) {
  const response = await fetch(getApiUrl(`/admin/vehicles/${vehicleId}/approve`), {
    method: "PUT",
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const payload = await response.json();
    throw new Error(payload?.message || "Falha ao aprovar veiculo.");
  }
}

export async function rejectPendingVehicle(vehicleId: string) {
  const response = await fetch(getApiUrl(`/admin/vehicles/${vehicleId}/reject`), {
    method: "PUT",
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const payload = await response.json();
    throw new Error(payload?.message || "Falha ao rejeitar veiculo.");
  }
}
