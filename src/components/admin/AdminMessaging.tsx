import { useState } from "react";
import { useAdminCustomers } from "@/hooks/useAdminData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageCircle, Phone, Search, Send, MapPin, FileText,
  Users, Loader2, Printer, CheckSquare, X
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const messageTemplates = [
  {
    id: "offer",
    label: "🎉 Special Offer",
    message: "🎉 *DROPEE Special Offer!*\n\nHi {name}! We have an exclusive offer for you:\n\n📦 Get 20% off your next delivery!\n\nBook now and save. Limited time only!\n\nThank you for choosing DROPEE! 🚀",
  },
  {
    id: "welcome",
    label: "👋 Welcome Message",
    message: "👋 *Welcome to DROPEE!*\n\nHi {name}! Thank you for joining DROPEE.\n\nWe offer fast & reliable delivery services. Book your first delivery today and earn loyalty points!\n\nNeed help? Just reply to this message.",
  },
  {
    id: "loyalty",
    label: "🏆 Loyalty Update",
    message: "🏆 *DROPEE Loyalty Update*\n\nHi {name}! Don't forget to check your loyalty points and spin the wheel for exciting prizes!\n\nVisit your dashboard to see your rewards. 🎁",
  },
  {
    id: "reminder",
    label: "📦 Delivery Reminder",
    message: "📦 *DROPEE Delivery Reminder*\n\nHi {name}! Just a friendly reminder that we're here for all your delivery needs.\n\nBook a delivery anytime — fast, safe & affordable! 💨",
  },
  {
    id: "location",
    label: "📍 Location Request",
    message: "📍 *DROPEE - Share Your Location*\n\nHi {name}! Please share your location so we can serve you better:\n{location_link}\n\nThis helps us deliver to you faster! 🚀",
  },
  {
    id: "custom",
    label: "✏️ Custom Message",
    message: "",
  },
];

interface CustomerRow {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  referral_code: string;
  created_at: string;
  address?: string;
}

const AdminMessaging = () => {
  const [search, setSearch] = useState("");
  const { data: customers, isLoading } = useAdminCustomers(search);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [messageDialog, setMessageDialog] = useState(false);
  const [receiptDialog, setReceiptDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("offer");
  const [customMessage, setCustomMessage] = useState("");
  const [receiptData, setReceiptData] = useState({
    customer_name: "",
    phone: "",
    description: "",
    pickup: "",
    dropoff: "",
    fee: "0",
    status: "completed",
    notes: "",
  });

  // Fetch recent deliveries for receipt generation
  const { data: recentDeliveries } = useQuery({
    queryKey: ["admin-recent-deliveries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deliveries")
        .select("*, profiles!deliveries_user_id_fkey(full_name, phone)")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  const createLocationRequest = useMutation({
    mutationFn: async (customer: CustomerRow) => {
      const token = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
      const { error } = await supabase.from("location_requests").insert({
        user_id: customer.user_id,
        token,
      });
      if (error) throw error;
      return { token, customer };
    },
    onSuccess: ({ token, customer }) => {
      const url = `${window.location.origin}/share-location/${token}`;
      const phone = cleanPhone(customer.phone);
      const msg = `📍 *DROPEE - Share Your Location*\n\nHi ${customer.full_name || "there"}! Please share your location so we can serve you better:\n${url}\n\nThis helps us deliver to you faster! 🚀`;
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
      toast.success("Location request sent via WhatsApp");
    },
    onError: () => toast.error("Failed to create location request"),
  });

  const cleanPhone = (phone: string) => {
    return (phone || "").replace(/[^0-9+]/g, "").replace(/^\+/, "");
  };

  const toggleSelect = (userId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const selectAll = () => {
    const allWithPhone = (customers ?? []).filter(c => c.phone);
    if (selectedIds.size === allWithPhone.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allWithPhone.map(c => c.user_id)));
    }
  };

  const getMessageText = (name: string, locationLink?: string) => {
    const template = messageTemplates.find(t => t.id === selectedTemplate);
    if (selectedTemplate === "custom") return customMessage.replace(/{name}/g, name);
    let msg = (template?.message || "").replace(/{name}/g, name);
    if (locationLink) msg = msg.replace(/{location_link}/g, locationLink);
    return msg;
  };

  const sendWhatsAppToSelected = () => {
    const selected = (customers ?? []).filter(c => selectedIds.has(c.user_id) && c.phone);
    if (selected.length === 0) {
      toast.error("No customers with phone numbers selected");
      return;
    }

    // Open WhatsApp for each selected customer
    selected.forEach((c, idx) => {
      const phone = cleanPhone(c.phone);
      const msg = getMessageText(c.full_name || "there");
      setTimeout(() => {
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
      }, idx * 800); // Stagger openings
    });

    toast.success(`Opening WhatsApp for ${selected.length} customer(s)`);
    setMessageDialog(false);
  };

  const sendWhatsAppSingle = (customer: CustomerRow) => {
    const phone = cleanPhone(customer.phone);
    const msg = getMessageText(customer.full_name || "there");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const callCustomer = (phone: string) => {
    const cleaned = phone?.replace(/[^0-9+]/g, "");
    if (!cleaned) { toast.error("No phone number"); return; }
    window.open(`tel:${cleaned}`, "_self");
  };

  const printReceipt = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const d = receiptData;
    w.document.write(`<html><head><title>Receipt</title><style>
      body{font-family:'Segoe UI',sans-serif;padding:40px;max-width:600px;margin:0 auto;color:#222}
      h1{font-size:22px;margin-bottom:4px}
      .sub{color:#666;font-size:13px;margin-bottom:20px}
      .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee}
      .label{color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.5px}
      .value{font-weight:600}
      .total-row{border-top:2px solid #333;margin-top:12px;padding-top:12px;font-size:18px;font-weight:700}
      .footer{text-align:center;color:#999;font-size:11px;margin-top:30px;border-top:1px solid #eee;padding-top:16px}
      @media print{body{padding:20px}}
    </style></head><body>
      <h1>📦 DROPEE</h1>
      <p class="sub">Delivery Receipt</p>
      <div class="row"><div><span class="label">Customer</span><div class="value">${d.customer_name || "—"}</div></div><div><span class="label">Phone</span><div>${d.phone || "—"}</div></div></div>
      <div class="row"><div><span class="label">Description</span><div>${d.description || "—"}</div></div></div>
      <div class="row"><div><span class="label">Pickup</span><div>${d.pickup || "—"}</div></div><div><span class="label">Dropoff</span><div>${d.dropoff || "—"}</div></div></div>
      <div class="row"><div><span class="label">Status</span><div>${d.status.replace(/_/g, " ").toUpperCase()}</div></div><div><span class="label">Date</span><div>${format(new Date(), "MMM d, yyyy HH:mm")}</div></div></div>
      ${d.notes ? `<div class="row"><div><span class="label">Notes</span><div>${d.notes}</div></div></div>` : ""}
      <div class="total-row"><span>Total Fee:</span> <span>₹${d.fee || "0"}</span></div>
      <div class="footer">DROPEE Delivery Services • Thank you for choosing us!<br/>Generated on ${format(new Date(), "MMMM d, yyyy 'at' HH:mm")}</div>
    </body></html>`);
    w.document.close();
    w.print();
  };

  const sendReceiptWhatsApp = () => {
    const d = receiptData;
    const phone = cleanPhone(d.phone);
    if (!phone) { toast.error("No phone number"); return; }
    const msg = `📦 *DROPEE Delivery Receipt*\n\n👤 Customer: ${d.customer_name}\n📝 Description: ${d.description || "—"}\n📍 Pickup: ${d.pickup}\n📍 Dropoff: ${d.dropoff}\n📊 Status: ${d.status.replace(/_/g, " ").toUpperCase()}\n💰 Fee: ₹${d.fee}\n${d.notes ? `📋 Notes: ${d.notes}\n` : ""}\nThank you for using DROPEE! 🚀`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const allWithPhone = (customers ?? []).filter(c => c.phone);
  const isAllSelected = allWithPhone.length > 0 && selectedIds.size === allWithPhone.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-primary" /> Messaging Center
          </h1>
          <p className="text-sm text-muted-foreground">Send WhatsApp messages, call, generate receipts & request locations</p>
        </div>
      </div>

      <Tabs defaultValue="customers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="customers" className="gap-2"><Users className="h-4 w-4" /> Customers</TabsTrigger>
          <TabsTrigger value="receipt" className="gap-2"><FileText className="h-4 w-4" /> Generate Receipt</TabsTrigger>
        </TabsList>

        {/* ── CUSTOMERS TAB ── */}
        <TabsContent value="customers" className="space-y-4">
          {/* Toolbar */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search customers…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
                </div>
                {selectedIds.size > 0 && (
                  <>
                    <Badge variant="secondary" className="gap-1">
                      <CheckSquare className="h-3 w-3" /> {selectedIds.size} selected
                    </Badge>
                    <Button size="sm" className="gap-2" onClick={() => setMessageDialog(true)}>
                      <MessageCircle className="h-4 w-4" /> Send WhatsApp
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Customer List */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={isAllSelected}
                          onCheckedChange={selectAll}
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(customers ?? []).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No customers found</TableCell>
                      </TableRow>
                    )}
                    {(customers ?? []).map((c: any) => (
                      <TableRow key={c.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(c.user_id)}
                            onCheckedChange={() => toggleSelect(c.user_id)}
                            disabled={!c.phone}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{c.full_name || "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{c.phone || "No phone"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{format(new Date(c.created_at), "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost" size="icon" className="h-8 w-8"
                              title="WhatsApp"
                              disabled={!c.phone}
                              onClick={() => {
                                setSelectedIds(new Set([c.user_id]));
                                setMessageDialog(true);
                              }}
                            >
                              <MessageCircle className="h-4 w-4 text-primary" />
                            </Button>
                            <Button
                              variant="ghost" size="icon" className="h-8 w-8"
                              title="Call"
                              disabled={!c.phone}
                              onClick={() => callCustomer(c.phone)}
                            >
                              <Phone className="h-4 w-4 text-primary" />
                            </Button>
                            <Button
                              variant="ghost" size="icon" className="h-8 w-8"
                              title="Request Location"
                              disabled={!c.phone || createLocationRequest.isPending}
                              onClick={() => createLocationRequest.mutate(c)}
                            >
                              <MapPin className="h-4 w-4 text-primary" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── RECEIPT TAB ── */}
        <TabsContent value="receipt" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Receipt Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4" /> Receipt Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Customer Name</Label>
                    <Input value={receiptData.customer_name} onChange={e => setReceiptData({ ...receiptData, customer_name: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Phone</Label>
                    <Input value={receiptData.phone} onChange={e => setReceiptData({ ...receiptData, phone: e.target.value })} placeholder="+91..." />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <Input value={receiptData.description} onChange={e => setReceiptData({ ...receiptData, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Pickup</Label>
                    <Input value={receiptData.pickup} onChange={e => setReceiptData({ ...receiptData, pickup: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Dropoff</Label>
                    <Input value={receiptData.dropoff} onChange={e => setReceiptData({ ...receiptData, dropoff: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Fee (₹)</Label>
                    <Input type="number" value={receiptData.fee} onChange={e => setReceiptData({ ...receiptData, fee: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <Select value={receiptData.status} onValueChange={v => setReceiptData({ ...receiptData, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Notes</Label>
                  <Textarea value={receiptData.notes} onChange={e => setReceiptData({ ...receiptData, notes: e.target.value })} rows={2} />
                </div>
                <div className="flex gap-3">
                  <Button className="gap-2 flex-1" onClick={printReceipt}>
                    <Printer className="h-4 w-4" /> Print Receipt
                  </Button>
                  <Button variant="outline" className="gap-2 flex-1" onClick={sendReceiptWhatsApp} disabled={!receiptData.phone}>
                    <MessageCircle className="h-4 w-4" /> Send via WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick fill from recent deliveries */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Fill from Recent Deliveries</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Recipient</TableHead>
                        <TableHead className="text-xs">Route</TableHead>
                        <TableHead className="text-xs">Fee</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(recentDeliveries ?? []).slice(0, 20).map((d: any) => (
                        <TableRow key={d.id}>
                          <TableCell className="text-sm">{d.recipient_name || (d.profiles as any)?.full_name || "—"}</TableCell>
                          <TableCell className="text-xs text-muted-foreground truncate max-w-[120px]">{d.pickup} → {d.dropoff}</TableCell>
                          <TableCell className="text-sm">₹{d.fee}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="text-xs" onClick={() => {
                              setReceiptData({
                                customer_name: d.recipient_name || (d.profiles as any)?.full_name || "",
                                phone: (d.profiles as any)?.phone || "",
                                description: d.description || "",
                                pickup: d.pickup,
                                dropoff: d.dropoff,
                                fee: String(d.fee || 0),
                                status: d.status,
                                notes: d.receipt || "",
                              });
                            }}>
                              Fill
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── WhatsApp Message Dialog ── */}
      <Dialog open={messageDialog} onOpenChange={setMessageDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Send WhatsApp Message
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Recipients</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {(customers ?? [])
                  .filter(c => selectedIds.has(c.user_id))
                  .map((c: any) => (
                    <Badge key={c.user_id} variant="secondary" className="text-xs">
                      {c.full_name || c.phone}
                    </Badge>
                  ))}
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Template</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {messageTemplates.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTemplate === "custom" ? (
              <div>
                <Label className="text-xs text-muted-foreground">Custom Message (use {"{name}"} for customer name)</Label>
                <Textarea
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                  rows={6}
                  placeholder="Type your message here..."
                />
              </div>
            ) : (
              <div>
                <Label className="text-xs text-muted-foreground">Preview</Label>
                <div className="bg-muted rounded-lg p-3 text-sm whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                  {getMessageText("Customer")}
                </div>
              </div>
            )}

            <Button className="w-full gap-2" onClick={sendWhatsAppToSelected}>
              <Send className="h-4 w-4" />
              Send to {selectedIds.size} Customer{selectedIds.size !== 1 ? "s" : ""}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMessaging;
