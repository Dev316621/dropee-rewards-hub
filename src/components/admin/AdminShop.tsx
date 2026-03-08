import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import ImageUpload from "./ImageUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Package, ShoppingCart, Eye } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  confirmed: "bg-blue-500/20 text-blue-400",
  processing: "bg-purple-500/20 text-purple-400",
  shipped: "bg-cyan-500/20 text-cyan-400",
  delivered: "bg-green-500/20 text-green-400",
  cancelled: "bg-red-500/20 text-red-400",
};

const AdminShop = () => {
  const qc = useQueryClient();
  const [productOpen, setProductOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [orderDetail, setOrderDetail] = useState<any>(null);

  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("display_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: orders } = useQuery({
    queryKey: ["admin-shop-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("shop_orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const upsertProduct = useMutation({
    mutationFn: async (p: any) => {
      const { error } = p.id
        ? await supabase.from("products").update(p).eq("id", p.id)
        : await supabase.from("products").insert(p);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-products"] }); setProductOpen(false); setEditProduct(null); toast.success("Product saved"); },
    onError: () => toast.error("Failed to save product"),
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-products"] }); toast.success("Product deleted"); },
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("shop_orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-shop-orders"] }); toast.success("Order updated"); },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold font-display text-dashboard-card-foreground">Shop Management</h1>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products" className="gap-1"><Package className="w-3.5 h-3.5" /> Products</TabsTrigger>
          <TabsTrigger value="orders" className="gap-1"><ShoppingCart className="w-3.5 h-3.5" /> Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => { setEditProduct(null); setProductOpen(true); }} className="gap-1">
              <Plus className="w-3.5 h-3.5" /> Add Product
            </Button>
          </div>

          <div className="bg-dashboard-card border border-dashboard-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-dashboard-border">
                  <TableHead className="text-muted-foreground">Product</TableHead>
                  <TableHead className="text-muted-foreground">Type</TableHead>
                  <TableHead className="text-muted-foreground">Price</TableHead>
                  <TableHead className="text-muted-foreground">Stock</TableHead>
                  <TableHead className="text-muted-foreground">Active</TableHead>
                  <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(products ?? []).map(p => (
                  <TableRow key={p.id} className="border-dashboard-border">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-dashboard-border overflow-hidden shrink-0">
                          {p.image_url ? <img src={p.image_url} alt="" className="w-full h-full object-cover" /> : <Package className="w-4 h-4 m-2 text-muted-foreground" />}
                        </div>
                        <span className="text-sm font-medium text-dashboard-card-foreground">{p.name}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px] capitalize">{p.product_type}</Badge></TableCell>
                    <TableCell className="text-sm text-dashboard-card-foreground">₹{p.price}</TableCell>
                    <TableCell className="text-sm text-dashboard-card-foreground">{p.stock}</TableCell>
                    <TableCell>{p.is_active ? <Badge className="bg-green-500/20 text-green-400 text-[10px]">Yes</Badge> : <Badge variant="outline" className="text-[10px]">No</Badge>}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditProduct(p); setProductOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteProduct.mutate(p.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="bg-dashboard-card border border-dashboard-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-dashboard-border">
                  <TableHead className="text-muted-foreground">Order ID</TableHead>
                  <TableHead className="text-muted-foreground">Items</TableHead>
                  <TableHead className="text-muted-foreground">Total</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(orders ?? []).map(o => {
                  const items = Array.isArray(o.items) ? o.items : [];
                  return (
                    <TableRow key={o.id} className="border-dashboard-border">
                      <TableCell className="font-mono text-xs text-dashboard-card-foreground">{o.id.slice(0, 8)}</TableCell>
                      <TableCell className="text-sm text-dashboard-card-foreground">{items.length} items</TableCell>
                      <TableCell className="text-sm font-medium text-dashboard-card-foreground">₹{o.total}</TableCell>
                      <TableCell>
                        <Select value={o.status} onValueChange={s => updateOrderStatus.mutate({ id: o.id, status: s })}>
                          <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map(s => (
                              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOrderDetail(o)}><Eye className="w-3.5 h-3.5" /></Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Product Form Dialog */}
      <Dialog open={productOpen} onOpenChange={setProductOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editProduct ? "Edit Product" : "Add Product"}</DialogTitle></DialogHeader>
          <ProductForm product={editProduct} onSave={p => upsertProduct.mutate(p)} isPending={upsertProduct.isPending} />
        </DialogContent>
      </Dialog>

      {/* Order Detail Dialog */}
      <Dialog open={!!orderDetail} onOpenChange={() => setOrderDetail(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Order Details</DialogTitle></DialogHeader>
          {orderDetail && (
            <div className="space-y-3 text-sm">
              <div><strong>Order ID:</strong> <span className="font-mono">{orderDetail.id.slice(0, 8)}</span></div>
              <div><strong>Address:</strong> {orderDetail.delivery_address || "N/A"}</div>
              <div><strong>Phone:</strong> {orderDetail.phone || "N/A"}</div>
              <div><strong>Notes:</strong> {orderDetail.notes || "None"}</div>
              <div className="border-t pt-2 space-y-1">
                <strong>Items:</strong>
                {(Array.isArray(orderDetail.items) ? orderDetail.items : []).map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span>{item.name} × {item.qty}</span>
                    <span>₹{item.price * item.qty}</span>
                  </div>
                ))}
                <div className="border-t pt-1 flex justify-between font-semibold">
                  <span>Total</span><span>₹{orderDetail.total}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ProductForm = ({ product, onSave, isPending }: { product: any; onSave: (p: any) => void; isPending: boolean }) => {
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product?.price ?? 0);
  const [category, setCategory] = useState(product?.category ?? "general");
  const [productType, setProductType] = useState(product?.product_type ?? "physical");
  const [stock, setStock] = useState(product?.stock ?? 0);
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "");
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [displayOrder, setDisplayOrder] = useState(product?.display_order ?? 0);

  const handleSave = () => {
    if (!name) { toast.error("Name is required"); return; }
    onSave({ ...(product?.id ? { id: product.id } : {}), name, description, price: Number(price), category, product_type: productType, stock: Number(stock), image_url: imageUrl || null, is_active: isActive, display_order: displayOrder });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1 col-span-2"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
        <div className="space-y-1 col-span-2"><Label>Description</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} /></div>
        <div className="space-y-1"><Label>Price (₹)</Label><Input type="number" value={price} onChange={e => setPrice(e.target.value)} /></div>
        <div className="space-y-1"><Label>Stock</Label><Input type="number" value={stock} onChange={e => setStock(e.target.value)} /></div>
        <div className="space-y-1"><Label>Category</Label><Input value={category} onChange={e => setCategory(e.target.value)} /></div>
        <div className="space-y-1">
          <Label>Type</Label>
          <Select value={productType} onValueChange={setProductType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="physical">Physical</SelectItem>
              <SelectItem value="digital">Digital</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2"><ImageUpload value={imageUrl} onChange={setImageUrl} label="Product Image" folder="products" /></div>
        <div className="space-y-1"><Label>Display Order</Label><Input type="number" value={displayOrder} onChange={e => setDisplayOrder(Number(e.target.value))} /></div>
        <div className="flex items-center gap-2 pt-5"><Switch checked={isActive} onCheckedChange={setIsActive} /><Label>Active</Label></div>
      </div>
      <Button className="w-full" onClick={handleSave} disabled={isPending}>{isPending ? "Saving..." : "Save Product"}</Button>
    </div>
  );
};

export default AdminShop;
