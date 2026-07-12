import { getApiUrl } from "@/lib/api";
import { getAdminSession } from "@/lib/auth";

type DashboardPeriod = "monthly" | "biweekly" | "weekly";

type DashboardResponse = {
  stats?: {
    totalRevenue?: number;
    activeDrivers?: number;
    totalPassengers?: number;
    pendingApprovals?: number;
  };
  revenueSeries?: number[];
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
  stats: {
    totalRevenue: number;
    activeDrivers: number;
    totalPassengers: number;
    pendingApprovals: number;
  };
  revenueSeries: number[];
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

function normalizeSeries(values?: number[]) {
  const source = Array.isArray(values) && values.length ? values : [0, 0, 0, 0, 0, 0, 0];
  if (source.length === 7) return source;

  const next = Array.from({ length: 7 }, (_, index) => Number(source[index] || 0));
  return next;
}

export async function loadAdminDashboardData(period: DashboardPeriod): Promise<DashboardData> {
  const payload = await fetchJson<DashboardResponse>(`/admin/dashboard?period=${period}`);

  return {
    stats: {
      totalRevenue: Number(payload.stats?.totalRevenue || 0),
      activeDrivers: Number(payload.stats?.activeDrivers || 0),
      totalPassengers: Number(payload.stats?.totalPassengers || 0),
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
