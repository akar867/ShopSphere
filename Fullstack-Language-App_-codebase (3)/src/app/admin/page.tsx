"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, Admin } from "@/lib/api";
import { Loader2, ShieldCheck, BookOpen, Users, Edit2, Trash2, Plus, Save, X } from "lucide-react";
import { toast } from "sonner";
import { isYouTubeUrl, getYouTubeEmbedUrl } from "@/lib/youtube";

export default function AdminPage() {
  const router = useRouter();
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [adminLoading, setAdminLoading] = useState(true);

  const [list, setList] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [form, setForm] = useState({
    hanzi: "",
    pinyin: "",
    translation: "",
    audioUrl: "",
    videoUrl: "",
    difficulty: "easy",
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const [adminForm, setAdminForm] = useState({
    email: "",
    password: "",
    name: "",
    accessLevel: 2 as 1 | 2 | 3,
  });

  const triedRef = useRef(false);
  const redirectedRef = useRef(false);
  const tokenRetryCountRef = useRef(0);

  // ✅ Auth check with detailed logging + single retry on transient failure
  useEffect(() => {
    const checkAuth = async () => {
      console.log("[Admin Page] Starting auth check...");
      try {
        const token = localStorage.getItem("admin_token");
        console.log("[Admin Page] Token from localStorage:", token?.substring(0, 20) + "..." || "NULL");
        
        if (!token) {
          // Wait for token to settle after navigation from login; retry up to 10 times
          if (tokenRetryCountRef.current < 10) {
            tokenRetryCountRef.current += 1;
            const delay = 120 + tokenRetryCountRef.current * 30; // incremental backoff
            console.log(`[Admin Page] No token yet, retry #${tokenRetryCountRef.current} in ${delay}ms...`);
            setTimeout(checkAuth, delay);
            return;
          }
          console.log("[Admin Page] Still no token after retries, redirecting to login...");
          if (!redirectedRef.current) {
            redirectedRef.current = true;
            router.replace("/admin/login");
          }
          return;
        }

        // Reset retry counter once token is seen
        tokenRetryCountRef.current = 0;

        console.log("[Admin Page] Token found, verifying with API...");
        const admin = await api.getAdminMe();
        console.log("[Admin Page] Auth successful! Admin:", admin.name, admin.email);
        setCurrentAdmin(admin);
      } catch (err: any) {
        console.error("[Admin Page] Auth failed:", err);
        const status = err?.status as number | undefined;
        // Retry once on network/5xx/aborts to avoid false negatives on cold starts
        if (!triedRef.current && (!status || status >= 500)) {
          triedRef.current = true;
          console.log("[Admin Page] Transient error detected, retrying auth in 200ms...");
          setTimeout(checkAuth, 200);
          return; // Don't flip loading state yet; we'll retry
        }
        // Only redirect to login on explicit auth failures (401/403)
        if (status === 401 || status === 403) {
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_data");
          console.log("[Admin Page] Cleared tokens due to auth failure, redirecting to login...");
          if (!redirectedRef.current) {
            redirectedRef.current = true;
            router.replace("/admin/login");
          }
          return;
        }
        // For other errors, keep user on page and show message instead of redirecting
        setError(err?.message || "Failed to verify admin session. Please try again.");
      } finally {
        console.log("[Admin Page] Setting adminLoading to false");
        setAdminLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Load vocab, users, and admins
  useEffect(() => {
    if (!currentAdmin) return;
    const init = async () => {
      await Promise.all([load(), loadUsers(), loadAdmins()]);
    };
    init();
  }, [currentAdmin]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.getVocab();
      setList(res);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await api.getUsers();
      setUsers(res);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadAdmins = async () => {
    if (currentAdmin?.accessLevel !== 3) return;
    try {
      setLoadingAdmins(true);
      const res = await api.getAllAdmins();
      setAdmins(res);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const create = async () => {
    if (!currentAdmin || currentAdmin.accessLevel < 1) {
      setError("Insufficient permissions.");
      return;
    }
    try {
      await api.createVocab(form, localStorage.getItem("admin_token") || "");
      setForm({ hanzi: "", pinyin: "", translation: "", audioUrl: "", videoUrl: "", difficulty: "easy" });
      setNotice("Created successfully.");
      await load();
    } catch (e: any) {
      setError(e.message || "Create failed");
    }
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await api.updateVocab(editingId, form, localStorage.getItem("admin_token") || "");
      setNotice("Updated successfully.");
      cancelEdit();
      await load();
    } catch (e: any) {
      setError(e.message || "Update failed");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ hanzi: "", pinyin: "", translation: "", audioUrl: "", videoUrl: "", difficulty: "easy" });
  };

  const remove = async (id: number) => {
    try {
      await api.deleteVocab(id, localStorage.getItem("admin_token") || "");
      setNotice("Deleted successfully.");
      await load();
    } catch (e: any) {
      setError(e.message || "Delete failed");
    }
  };

  const deleteUser = async (userId: string) => {
    if (!currentAdmin || currentAdmin.accessLevel < 3) {
      setError("Insufficient permissions.");
      return;
    }
    try {
      await api.deleteUser(userId);
      toast.success("User deleted successfully");
      await loadUsers();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete user");
    }
  };

  const createAdmin = async () => {
    if (!currentAdmin || currentAdmin.accessLevel !== 3) {
      setError("Insufficient permissions.");
      return;
    }
    try {
      await api.createAdmin(adminForm);
      toast.success("Admin created successfully");
      setAdminForm({ email: "", password: "", name: "", accessLevel: 2 });
      await loadAdmins();
    } catch (e: any) {
      toast.error(e.message || "Failed to create admin");
    }
  };

  const deleteAdmin = async (adminId: number) => {
    try {
      await api.deleteAdmin(adminId);
      toast.success("Admin deleted successfully");
      await loadAdmins();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete admin");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_data");
    router.replace("/admin/login");
  };

  const getAccessLevelBadge = (level: number) => {
    const variants = {
      1: { color: "bg-blue-500", label: "Level 1 - View Only" },
      2: { color: "bg-green-500", label: "Level 2 - Editor" },
      3: { color: "bg-purple-500", label: "Level 3 - Full Access" },
    };
    const v = variants[level as keyof typeof variants];
    return <Badge className={`${v.color} text-white`}>{v.label}</Badge>;
  };

  if (adminLoading) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </main>
    );
  }

  if (!currentAdmin) return null;

  return (
    <main className="min-h-screen w-full px-4 py-8 max-w-6xl mx-auto space-y-8">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-8 w-8" />
            Admin Panel
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Logged in as: <strong>{currentAdmin.name}</strong> ({currentAdmin.email})
          </p>
        </div>
        <div className="flex items-center gap-3">
          {getAccessLevelBadge(currentAdmin.accessLevel)}
          <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
        </div>
      </div>

      <Tabs defaultValue="vocabulary" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vocabulary">
            <BookOpen className="h-4 w-4 mr-2" />
            Vocabulary
          </TabsTrigger>
          <TabsTrigger value="users" disabled={currentAdmin.accessLevel < 2}>
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="admins" disabled={currentAdmin.accessLevel !== 3}>
            <ShieldCheck className="h-4 w-4 mr-2" />
            Admins
          </TabsTrigger>
        </TabsList>

        {/* Vocabulary Management */}
        <TabsContent value="vocabulary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Vocabulary Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentAdmin.accessLevel >= 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    {editingId ? "Edit Vocabulary" : "Add New Vocabulary"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Hanzi (Chinese)</Label>
                      <Input
                        value={form.hanzi}
                        onChange={(e) => setForm({ ...form, hanzi: e.target.value })}
                        placeholder="你好"
                      />
                    </div>
                    <div>
                      <Label>Pinyin</Label>
                      <Input
                        value={form.pinyin}
                        onChange={(e) => setForm({ ...form, pinyin: e.target.value })}
                        placeholder="nǐ hǎo"
                      />
                    </div>
                    <div>
                      <Label>Translation</Label>
                      <Input
                        value={form.translation}
                        onChange={(e) => setForm({ ...form, translation: e.target.value })}
                        placeholder="Hello"
                      />
                    </div>
                    <div>
                      <Label>Difficulty</Label>
                      <Select
                        value={form.difficulty}
                        onValueChange={(val: any) => setForm({ ...form, difficulty: val })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Audio URL (optional)</Label>
                      <Input
                        value={form.audioUrl}
                        onChange={(e) => setForm({ ...form, audioUrl: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <Label>Video URL (optional)</Label>
                      <Input
                        value={form.videoUrl}
                        onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                        placeholder="https://www.youtube.com/watch?v=... or https://..."
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Supports YouTube URLs and direct video links
                      </p>
                    </div>
                  </div>
                  
                  {/* Video Preview */}
                  {form.videoUrl && (
                    <div className="pt-4">
                      <Label>Video Preview</Label>
                      {isYouTubeUrl(form.videoUrl) ? (() => {
                        const embedUrl = getYouTubeEmbedUrl(form.videoUrl);
                        return embedUrl ? (
                          <div className="relative w-full max-w-2xl mt-2" style={{ paddingBottom: '56.25%' }}>
                            <iframe
                              src={embedUrl}
                              className="absolute top-0 left-0 w-full h-full rounded-md border"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              title="Video preview"
                            />
                          </div>
                        ) : (
                          <div className="mt-2 text-sm text-destructive">Invalid YouTube URL</div>
                        );
                      })() : (
                        <video
                          src={form.videoUrl}
                          controls
                          className="mt-2 w-full max-w-2xl rounded-md border"
                          playsInline
                        />
                      )}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    {editingId ? (
                      <>
                        {currentAdmin.accessLevel >= 3 && (
                          <Button onClick={saveEdit} className="flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            Save Changes
                          </Button>
                        )}
                        <Button variant="outline" onClick={cancelEdit} className="flex items-center gap-2">
                          <X className="h-4 w-4" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      currentAdmin.accessLevel >= 1 && (
                        <Button onClick={create} className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Add Vocabulary
                        </Button>
                      )
                    )}
                  </div>
                </div>
              )}

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Vocabulary List</h3>
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : list.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No vocabulary entries yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Hanzi</TableHead>
                          <TableHead>Pinyin</TableHead>
                          <TableHead>Translation</TableHead>
                          <TableHead>Difficulty</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {list.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.hanzi}</TableCell>
                            <TableCell>{item.pinyin}</TableCell>
                            <TableCell>{item.translation}</TableCell>
                            <TableCell>
                              <Badge variant={
                                item.difficulty === "easy" ? "default" :
                                item.difficulty === "medium" ? "secondary" : "destructive"
                              }>
                                {item.difficulty}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {currentAdmin.accessLevel >= 3 && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingId(item.id);
                                      setForm({
                                        hanzi: item.hanzi,
                                        pinyin: item.pinyin,
                                        translation: item.translation,
                                        audioUrl: item.audioUrl || "",
                                        videoUrl: item.videoUrl || "",
                                        difficulty: item.difficulty,
                                      });
                                    }}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                )}
                                {currentAdmin.accessLevel >= 1 && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => remove(item.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Management */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : users.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No users registered yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Email Verified</TableHead>
                        <TableHead>Created At</TableHead>
                        {currentAdmin.accessLevel >= 3 && <TableHead className="text-right">Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.emailVerified ? "default" : "secondary"}>
                              {user.emailVerified ? "Verified" : "Not Verified"}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                          {currentAdmin.accessLevel >= 3 && (
                            <TableCell className="text-right">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteUser(user.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin Management */}
        <TabsContent value="admins" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Admin Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Create New Admin</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={adminForm.name}
                      onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={adminForm.email}
                      onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                      placeholder="admin@example.com"
                    />
                  </div>
                  <div>
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={adminForm.password}
                      onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <Label>Access Level</Label>
                    <Select
                      value={adminForm.accessLevel.toString()}
                      onValueChange={(val) => setAdminForm({ ...adminForm, accessLevel: parseInt(val) as 1 | 2 | 3 })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Level 1 - Add/Delete Vocabulary</SelectItem>
                        <SelectItem value="2">Level 2 - Editor + User List</SelectItem>
                        <SelectItem value="3">Level 3 - Full Access</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={createAdmin} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Admin
                </Button>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Admin List</h3>
                {loadingAdmins ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : admins.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No admins found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Access Level</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {admins.map((admin) => (
                          <TableRow key={admin.id}>
                            <TableCell className="font-medium">{admin.name}</TableCell>
                            <TableCell>{admin.email}</TableCell>
                            <TableCell>{getAccessLevelBadge(admin.accessLevel)}</TableCell>
                            <TableCell className="text-right">
                              {admin.id !== currentAdmin.id && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => deleteAdmin(admin.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {notice && (
        <div className="fixed bottom-4 right-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md shadow-lg z-50">
          {notice}
        </div>
      )}
      {error && (
        <div className="fixed bottom-4 right-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md shadow-lg z-50">
          {error}
        </div>
      )}
    </main>
  );
}