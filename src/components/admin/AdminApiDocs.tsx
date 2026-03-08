import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Copy, Check, ArrowRight, Shield, Zap, Globe, Code2 } from "lucide-react";
import { toast } from "sonner";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const CopyBlock = ({ code, language = "bash" }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group">
      <pre className="bg-black/80 text-green-400 text-xs p-4 rounded-lg overflow-x-auto font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleCopy}
      >
        {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );
};

const ENDPOINT_URL = `${SUPABASE_URL}/functions/v1/hub-receive-order`;

const submitOrderExample = `curl -X POST "${ENDPOINT_URL}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY_HERE" \\
  -d '{
    "external_order_id": "ORD-12345",
    "customer_name": "John Doe",
    "customer_phone": "+91 9876543210",
    "customer_address": "123 Main Street, Ukhrul",
    "items": [
      { "name": "Cappuccino", "qty": 2, "price": 150 },
      { "name": "Chocolate Cake", "qty": 1, "price": 250 }
    ],
    "total": 550,
    "notes": "Extra sugar please"
  }'`;

const submitOrderResponse = `{
  "hub_order_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "pending"
}`;

const pollStatusExample = `curl -X GET "${ENDPOINT_URL}?hub_order_id=a1b2c3d4-e5f6-7890-abcd-ef1234567890"`;

const pollStatusResponse = `{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "on_the_way",
  "updated_at": "2026-03-08T14:30:00Z",
  "assigned_agent_id": "agent-uuid-here"
}`;

const jsExample = `// Install: npm install @supabase/supabase-js

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "${SUPABASE_URL}",
  "${SUPABASE_ANON_KEY}"
);

// 1. Submit an order
async function submitOrder(apiKey, orderData) {
  const res = await fetch(
    "${ENDPOINT_URL}",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(orderData),
    }
  );
  return await res.json();
  // Returns: { hub_order_id: "...", status: "pending" }
}

// 2. Poll order status
async function getOrderStatus(hubOrderId) {
  const res = await fetch(
    \`${ENDPOINT_URL}?hub_order_id=\${hubOrderId}\`
  );
  return await res.json();
}

// 3. Listen for real-time status changes
function subscribeToOrders(websiteId, onUpdate) {
  return supabase
    .channel("hub-orders")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "hub_orders",
        filter: \`website_id=eq.\${websiteId}\`,
      },
      (payload) => onUpdate(payload.new)
    )
    .subscribe();
}`;

const phpExample = `<?php
// Submit order to Dropee Hub
function submitOrder($apiKey, $orderData) {
    $url = "${ENDPOINT_URL}";
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Content-Type: application/json",
        "x-api-key: " . $apiKey,
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($orderData));
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
    // Returns: ["hub_order_id" => "...", "status" => "pending"]
}

// Poll order status
function getOrderStatus($hubOrderId) {
    $url = "${ENDPOINT_URL}?hub_order_id=" . $hubOrderId;
    return json_decode(file_get_contents($url), true);
}

// Example usage
$result = submitOrder("YOUR_API_KEY", [
    "external_order_id" => "ORD-12345",
    "customer_name" => "John Doe",
    "customer_phone" => "+91 9876543210",
    "customer_address" => "123 Main St",
    "items" => [
        ["name" => "Cappuccino", "qty" => 2, "price" => 150],
    ],
    "total" => 300,
    "notes" => "",
]);
echo "Hub Order ID: " . $result["hub_order_id"];`;

const pythonExample = `import requests

API_KEY = "YOUR_API_KEY_HERE"
ENDPOINT = "${ENDPOINT_URL}"

# 1. Submit an order
def submit_order(order_data):
    response = requests.post(
        ENDPOINT,
        json=order_data,
        headers={
            "Content-Type": "application/json",
            "x-api-key": API_KEY,
        },
    )
    return response.json()
    # Returns: {"hub_order_id": "...", "status": "pending"}

# 2. Poll order status
def get_order_status(hub_order_id):
    response = requests.get(f"{ENDPOINT}?hub_order_id={hub_order_id}")
    return response.json()

# Example
result = submit_order({
    "external_order_id": "ORD-12345",
    "customer_name": "John Doe",
    "customer_phone": "+91 9876543210",
    "customer_address": "123 Main St",
    "items": [
        {"name": "Cappuccino", "qty": 2, "price": 150},
    ],
    "total": 300,
    "notes": "",
})
print(f"Hub Order ID: {result['hub_order_id']}")`;

const STATUSES = [
  { name: "pending", color: "bg-yellow-500/15 text-yellow-700", desc: "Order received, awaiting confirmation" },
  { name: "confirmed", color: "bg-blue-500/15 text-blue-700", desc: "Order confirmed by admin" },
  { name: "preparing", color: "bg-purple-500/15 text-purple-700", desc: "Order is being prepared" },
  { name: "picked_up", color: "bg-indigo-500/15 text-indigo-700", desc: "Agent has picked up the order" },
  { name: "on_the_way", color: "bg-orange-500/15 text-orange-700", desc: "Order is on the way to customer" },
  { name: "delivered", color: "bg-green-500/15 text-green-700", desc: "Order successfully delivered" },
  { name: "cancelled", color: "bg-red-500/15 text-red-700", desc: "Order was cancelled" },
];

const AdminApiDocs = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          Hub API Documentation
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Connect your external websites (café, pharmacy, e-commerce) to this central order hub.
        </p>
      </div>

      {/* Quick Start */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Quick Start
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</div>
              <div>
                <p className="text-sm font-medium text-foreground">Register your website</p>
                <p className="text-xs text-muted-foreground">Go to <a href="/admin/hub-websites" className="text-primary underline">Hub Websites</a> and add your site. Copy the generated API key.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</div>
              <div>
                <p className="text-sm font-medium text-foreground">Send orders via API</p>
                <p className="text-xs text-muted-foreground">POST orders to the endpoint below with your API key in the <code className="bg-muted px-1 rounded text-[11px]">x-api-key</code> header.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</div>
              <div>
                <p className="text-sm font-medium text-foreground">Listen for updates</p>
                <p className="text-xs text-muted-foreground">Use real-time subscriptions or poll the GET endpoint to track order status changes.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Base URL */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            Base Endpoint
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CopyBlock code={ENDPOINT_URL} />
        </CardContent>
      </Card>

      {/* Authentication */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Every <strong>POST</strong> request must include your website's API key in the <code className="bg-muted px-1.5 py-0.5 rounded text-[11px]">x-api-key</code> header. 
            GET requests for status polling do not require authentication.
          </p>
          <CopyBlock code={`x-api-key: YOUR_API_KEY_HERE`} />
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200 text-[10px]">401 — Missing or invalid API key</Badge>
            <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200 text-[10px]">403 — Website deactivated</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Endpoints */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Code2 className="h-4 w-4 text-primary" />
            API Endpoints
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* POST */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-600 text-white text-[10px] font-mono">POST</Badge>
              <span className="text-sm font-medium text-foreground">Submit a New Order</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium">Request Body (JSON):</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-border rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-2 font-medium text-foreground">Field</th>
                      <th className="text-left p-2 font-medium text-foreground">Type</th>
                      <th className="text-left p-2 font-medium text-foreground">Required</th>
                      <th className="text-left p-2 font-medium text-foreground">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-t border-border"><td className="p-2 font-mono text-foreground">external_order_id</td><td className="p-2">string</td><td className="p-2">No</td><td className="p-2">Your website's own order ID</td></tr>
                    <tr className="border-t border-border"><td className="p-2 font-mono text-foreground">customer_name</td><td className="p-2">string</td><td className="p-2"><Badge variant="destructive" className="text-[9px] h-4">Yes</Badge></td><td className="p-2">Customer's full name</td></tr>
                    <tr className="border-t border-border"><td className="p-2 font-mono text-foreground">customer_phone</td><td className="p-2">string</td><td className="p-2">No</td><td className="p-2">Customer's phone number</td></tr>
                    <tr className="border-t border-border"><td className="p-2 font-mono text-foreground">customer_address</td><td className="p-2">string</td><td className="p-2">No</td><td className="p-2">Delivery address</td></tr>
                    <tr className="border-t border-border"><td className="p-2 font-mono text-foreground">items</td><td className="p-2">array</td><td className="p-2"><Badge variant="destructive" className="text-[9px] h-4">Yes</Badge></td><td className="p-2">Array of {"{ name, qty, price }"}</td></tr>
                    <tr className="border-t border-border"><td className="p-2 font-mono text-foreground">total</td><td className="p-2">number</td><td className="p-2">No</td><td className="p-2">Order total amount</td></tr>
                    <tr className="border-t border-border"><td className="p-2 font-mono text-foreground">notes</td><td className="p-2">string</td><td className="p-2">No</td><td className="p-2">Special instructions</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-xs text-muted-foreground font-medium">Example:</p>
            <CopyBlock code={submitOrderExample} />
            <p className="text-xs text-muted-foreground font-medium">Success Response (201):</p>
            <CopyBlock code={submitOrderResponse} />
          </div>

          <hr className="border-border" />

          {/* GET */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-600 text-white text-[10px] font-mono">GET</Badge>
              <span className="text-sm font-medium text-foreground">Poll Order Status</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Pass the <code className="bg-muted px-1 rounded">hub_order_id</code> as a query parameter. No authentication required.
            </p>
            <CopyBlock code={pollStatusExample} />
            <p className="text-xs text-muted-foreground font-medium">Response (200):</p>
            <CopyBlock code={pollStatusResponse} />
          </div>
        </CardContent>
      </Card>

      {/* Status System */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            Order Status Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-1.5 mb-4">
            {STATUSES.map((s, i) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <Badge variant="outline" className={`${s.color} text-[10px]`}>{s.name.replace(/_/g, " ")}</Badge>
                {i < STATUSES.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
              </div>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-border rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-2 font-medium text-foreground">Status</th>
                  <th className="text-left p-2 font-medium text-foreground">Description</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {STATUSES.map(s => (
                  <tr key={s.name} className="border-t border-border">
                    <td className="p-2"><Badge variant="outline" className={`${s.color} text-[10px]`}>{s.name.replace(/_/g, " ")}</Badge></td>
                    <td className="p-2">{s.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Code Examples */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Code2 className="h-4 w-4 text-primary" />
            Integration Code Examples
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="js" className="w-full">
            <TabsList className="mb-3">
              <TabsTrigger value="curl" className="text-xs">cURL</TabsTrigger>
              <TabsTrigger value="js" className="text-xs">JavaScript</TabsTrigger>
              <TabsTrigger value="php" className="text-xs">PHP</TabsTrigger>
              <TabsTrigger value="python" className="text-xs">Python</TabsTrigger>
            </TabsList>
            <TabsContent value="curl">
              <CopyBlock code={submitOrderExample} />
            </TabsContent>
            <TabsContent value="js">
              <CopyBlock code={jsExample} language="javascript" />
            </TabsContent>
            <TabsContent value="php">
              <CopyBlock code={phpExample} language="php" />
            </TabsContent>
            <TabsContent value="python">
              <CopyBlock code={pythonExample} language="python" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Real-time */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Real-Time Updates (WebSocket)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Instead of polling, your website can subscribe to real-time order status changes using the Supabase Realtime client.
            Updates are pushed instantly via WebSocket when any order status changes.
          </p>
          <CopyBlock code={`// npm install @supabase/supabase-js

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "${SUPABASE_URL}",
  "${SUPABASE_ANON_KEY}"
);

// Subscribe to all updates for your website
const channel = supabase
  .channel("my-orders")
  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "hub_orders",
      filter: "website_id=eq.YOUR_WEBSITE_ID",
    },
    (payload) => {
      console.log("Order updated:", payload.new);
      // payload.new.status → "confirmed", "preparing", etc.
      // Update your UI accordingly
    }
  )
  .subscribe();

// Cleanup when done
// channel.unsubscribe();`} language="javascript" />
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <p className="text-xs text-foreground">
              <strong>💡 Tip:</strong> Your <code className="bg-muted px-1 rounded text-[10px]">website_id</code> is shown on the{" "}
              <a href="/admin/hub-websites" className="text-primary underline">Hub Websites</a> page. Use it to filter real-time events for only your site's orders.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Error Codes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Error Responses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-border rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-2 font-medium text-foreground">Code</th>
                  <th className="text-left p-2 font-medium text-foreground">Meaning</th>
                  <th className="text-left p-2 font-medium text-foreground">Response</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-t border-border"><td className="p-2 font-mono font-medium">400</td><td className="p-2">Missing required fields</td><td className="p-2 font-mono">{"{ \"error\": \"customer_name and items[] are required\" }"}</td></tr>
                <tr className="border-t border-border"><td className="p-2 font-mono font-medium">401</td><td className="p-2">Invalid or missing API key</td><td className="p-2 font-mono">{"{ \"error\": \"Invalid API key\" }"}</td></tr>
                <tr className="border-t border-border"><td className="p-2 font-mono font-medium">403</td><td className="p-2">Website deactivated</td><td className="p-2 font-mono">{"{ \"error\": \"Website is deactivated\" }"}</td></tr>
                <tr className="border-t border-border"><td className="p-2 font-mono font-medium">404</td><td className="p-2">Order not found (GET)</td><td className="p-2 font-mono">{"{ \"error\": \"Order not found\" }"}</td></tr>
                <tr className="border-t border-border"><td className="p-2 font-mono font-medium">405</td><td className="p-2">Method not allowed</td><td className="p-2 font-mono">{"{ \"error\": \"Method not allowed\" }"}</td></tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminApiDocs;
