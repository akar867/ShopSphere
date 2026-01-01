export type Credentials = { email: string; password: string };
export type CreateVocabInput = {
  hanzi: string;
  pinyin: string;
  translation: string;
  audioUrl?: string;
  videoUrl?: string;
  imageUrl?: string;
  difficulty?: "easy" | "medium" | "hard";
};

export type Admin = {
  id: number;
  email: string;
  name: string;
  accessLevel: 1 | 2 | 3;
  createdAt: string;
};

export type AdminLoginResponse = {
  token: string;
  admin: Admin;
};

const API_BASE = "/api/words";

function getHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function getAdminHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let text = "";
    try {
      text = await res.text();
    } catch {}
    const err: any = new Error(text || `Request failed with ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export const api = {
  // Vocabulary APIs
  getVocab: async (): Promise<any[]> => {
    const url = `/api/words`;
    const opts: RequestInit = { method: "GET", headers: getHeaders() };
    const res = await fetch(url, opts);
    if (!res.ok) {
      const t = await res.text();
      throw new Error(t || `GET ${url} failed: ${res.status}`);
    }
    return res.json();
  },

  // User APIs
  getUsers: async (): Promise<any[]> => {
    const url = `/api/users`;
    const opts: RequestInit = { method: "GET", headers: getHeaders() };
    const res = await fetch(url, opts);
    if (!res.ok) {
      const t = await res.text();
      throw new Error(t || `GET ${url} failed: ${res.status}`);
    }
    return res.json();
  },

  deleteUser: async (userId: string): Promise<void> => {
    const url = `/api/users/${userId}`;
    const opts: RequestInit = { method: "DELETE", headers: getHeaders() };
    const res = await fetch(url, opts);
    if (!res.ok) {
      const t = await res.text();
      throw new Error(t || `DELETE ${url} failed: ${res.status}`);
    }
    return res.json();
  },

  // Admin APIs
  adminLogin: async (email: string, password: string): Promise<AdminLoginResponse> => {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return handle<AdminLoginResponse>(res);
  },

  getAdminMe: async (): Promise<Admin> => {
    const res = await fetch("/api/admin/me", {
      method: "GET",
      headers: getAdminHeaders(),
      cache: "no-store",
    });
    return handle<Admin>(res);
  },

  getAllAdmins: async (): Promise<Admin[]> => {
    const res = await fetch("/api/admin", {
      method: "GET",
      headers: getAdminHeaders(),
    });
    return handle<Admin[]>(res);
  },

  createAdmin: async (data: { email: string; password: string; name: string; accessLevel: 1 | 2 | 3 }): Promise<Admin> => {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: getAdminHeaders(),
      body: JSON.stringify(data),
    });
    return handle<Admin>(res);
  },

  deleteAdmin: async (adminId: number): Promise<void> => {
    const res = await fetch(`/api/admin/${adminId}`, {
      method: "DELETE",
      headers: getAdminHeaders(),
    });
    return handle<void>(res);
  },

  // Auth APIs
  async login(creds: Credentials) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || ""}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(creds),
    });
    return handle<{ token: string }>(res);
  },
  async register(creds: Credentials) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || ""}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(creds),
    });
    return handle<{ id: number; email: string }>(res);
  },
  async createVocab(input: CreateVocabInput, token?: string | null) {
    const res = await fetch(`${API_BASE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(input),
    });
    return handle<any>(res);
  },
  async updateVocab(id: number, input: Partial<CreateVocabInput>, token?: string | null) {
    const res = await fetch(`${API_BASE}?id=${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(input),
    });
    return handle<any>(res);
  },
  async deleteVocab(id: number, token?: string | null) {
    const res = await fetch(`${API_BASE}?id=${id}`, {
      method: "DELETE",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    return handle<void>(res);
  },
  async getVocabById(id: number | string) {
    const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
    const res = await fetch(`${API_BASE}/${id}`, {
      cache: "no-store",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    return handle<any>(res);
  },
};