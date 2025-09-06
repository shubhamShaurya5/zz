
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import type { CartItem } from '@/hooks/use-cart';
import type { Product } from '@/lib/types';
import { getProductById } from '@/lib/products';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldAlert, PackageOpen, ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const ADMIN_EMAILS = ['shubhamshauryabgp@gmail.com', 'superadmin@luxury.com'];
const ORDER_STATUSES = ["Placed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];

type ShippingInfo = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
};

type StoredOrderItem = {
  productId: string;
  quantity: number;
}

type StoredOrder = {
  orderId: number;
  userId?: string;
  items: StoredOrderItem[];
  total: number;
  shippingInfo: ShippingInfo;
  orderDate: string;
  status: string;
  upiReferenceId?: string;
};

type HydratedOrderItem = {
    product: Product;
    quantity: number;
}

type HydratedOrder = Omit<StoredOrder, 'items'> & {
    items: HydratedOrderItem[];
}

function OrderRow({ order, onStatusChange }: { order: HydratedOrder; onStatusChange: (orderId: number, newStatus: string) => void; }) {
  
  const getStatusVariant = (status: string) => {
    switch (status) {
        case 'Placed': return 'default';
        case 'Shipped': return 'secondary';
        case 'Out for Delivery': return 'outline';
        case 'Delivered': return 'destructive';
        case 'Cancelled': return 'destructive';
        default: return 'default';
    }
  }

  return (
    <Collapsible asChild key={order.orderId}>
        <>
        <TableRow>
          <TableCell className="font-medium">{order.orderId}</TableCell>
          <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
          <TableCell>
              <div>{order.shippingInfo.name}</div>
              <div className="text-sm text-muted-foreground">{order.shippingInfo.email}</div>
              <div className="text-sm text-muted-foreground">{order.shippingInfo.phone}</div>
          </TableCell>
          <TableCell>
              <ul className="list-disc list-inside">
                  {order.items.map(item => (
                      item.product && (
                          <li key={item.product.id}>
                              {item.quantity} x {item.product.name}
                          </li>
                      )
                  ))}
              </ul>
          </TableCell>
          <TableCell className="text-right font-semibold">Rs.{order.total.toLocaleString()}</TableCell>
          <TableCell>
            <Select defaultValue={order.status} onValueChange={(value) => onStatusChange(order.orderId, value)}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Update Status" />
                </SelectTrigger>
                <SelectContent>
                    {ORDER_STATUSES.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Badge variant={getStatusVariant(order.status)} className="mt-2">{order.status}</Badge>
          </TableCell>
          <TableCell className="text-center">
             <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="data-[state=open]:rotate-180 transition-transform">
                    <ChevronDown className="h-5 w-5" />
                    <span className="sr-only">Toggle Details</span>
                </Button>
            </CollapsibleTrigger>
          </TableCell>
        </TableRow>
        <CollapsibleContent asChild>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableCell colSpan={7} className="p-0">
                    <div className="grid grid-cols-2 gap-4 p-4">
                        <div>
                            <h4 className="font-semibold mb-2">Shipping Address</h4>
                            <address className="not-italic text-muted-foreground">
                                {order.shippingInfo.address}<br />
                                {order.shippingInfo.city}, {order.shippingInfo.zip}
                            </address>
                        </div>
                        {order.upiReferenceId && (
                             <div>
                                <h4 className="font-semibold mb-2">Payment Details</h4>
                                <p className="text-sm text-muted-foreground">UPI Reference ID:</p>
                                <p className="font-mono text-sm">{order.upiReferenceId}</p>
                            </div>
                        )}
                    </div>
                </TableCell>
            </TableRow>
        </CollapsibleContent>
        </>
    </Collapsible>
  );
}


export default function AdminOrdersPage() {
  const { user, loading } = useAuth();
  const [allOrders, setAllOrders] = useState<HydratedOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<HydratedOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dataLoading, setDataLoading] = useState(true);
  const { toast } = useToast();

  const loadOrders = async () => {
    setDataLoading(true);
    if (typeof window !== 'undefined') {
        const storedOrdersJSON = localStorage.getItem('allOrders');
        if (storedOrdersJSON) {
            const storedOrders = JSON.parse(storedOrdersJSON) as StoredOrder[];
            
            const hydratedOrders = await Promise.all(
                storedOrders.map(async (order) => {
                    const hydratedItems = await Promise.all(
                        order.items.map(async (item) => {
                            const product = await getProductById(item.productId);
                            return product ? { product, quantity: item.quantity } : null;
                        })
                    );
                    return { ...order, items: hydratedItems.filter((i): i is HydratedOrderItem => i !== null) };
                })
            );

            const sortedOrders = hydratedOrders.sort((a, b) => b.orderId - a.orderId);
            setAllOrders(sortedOrders);
            setFilteredOrders(sortedOrders);
        }
    }
    setDataLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = (orderId: number, newStatus: string) => {
    try {
        const updatedOrders = allOrders.map(order => 
            order.orderId === orderId ? { ...order, status: newStatus } : order
        );
        const storedOrdersToSave = updatedOrders.map(o => {
            const sanitizedItems = o.items.map(i => ({productId: i.product.id, quantity: i.quantity}));
            const {items, ...rest} = o;
            return {...rest, items: sanitizedItems};
        });
        localStorage.setItem('allOrders', JSON.stringify(storedOrdersToSave));

        setAllOrders(updatedOrders);
        setFilteredOrders(updatedOrders.filter(order =>
            order.orderId.toString().includes(searchQuery) ||
            order.shippingInfo.phone.replace(/\D/g, '').includes(searchQuery)
        ));
        toast({
            title: "Status Updated",
            description: `Order #${orderId} status changed to ${newStatus}.`,
        });
    } catch(error) {
        console.error("Failed to update status", error);
        toast({
            variant: 'destructive',
            title: "Update Failed",
            description: "Could not update the order status.",
        });
    }
  };


  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredOrders(allOrders);
      return;
    }
    const filtered = allOrders.filter(order =>
      order.orderId.toString().includes(query) ||
      order.shippingInfo.phone.replace(/\D/g, '').includes(query)
    );
    setFilteredOrders(filtered);
  }, [searchQuery, allOrders]);
  
  if (loading) {
    return (
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center h-full">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="font-semibold">Loading...</p>
        </div>
    );
  }

  const isAdmin = user && user.email && ADMIN_EMAILS.includes(user.email);

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <Card className="w-full max-w-md text-center border-destructive">
          <CardHeader>
            <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="mt-4">Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to view this page. This area is restricted to administrators only.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-2">
            <Button asChild>
              <Link href="/">Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-4xl font-headline font-bold">All Customer Orders</h1>
            <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search by Order ID or Phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>
        </div>
      <Card>
        <CardContent className="p-0">
          {dataLoading ? (
             <div className="text-center py-16">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
             </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16">
              <PackageOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No Orders Found</h2>
              <p className="text-muted-foreground">{searchQuery ? 'Try adjusting your search query.' : 'When customers place orders, they will appear here.'}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-[200px]">Status</TableHead>
                  <TableHead className="w-[50px] text-center">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <OrderRow key={order.orderId} order={order} onStatusChange={handleStatusChange} />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
