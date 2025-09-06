
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { CartItem } from '@/hooks/use-cart';

type ShippingInfo = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
}

type OrderDetails = {
  orderId: number;
  items: CartItem[];
  total: number;
  shippingInfo: ShippingInfo;
  orderDate: string;
}

export default function OrderSuccessPage() {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
        const savedDetails = sessionStorage.getItem('lastOrderDetails');
        if (savedDetails) {
            setOrderDetails(JSON.parse(savedDetails));
        }
    } catch (error) {
        console.error("Could not retrieve order details from sessionStorage", error);
    } finally {
        setLoading(false);
    }
  }, []);

  const handleDownloadReceipt = async () => {
    if (!orderDetails) return;

    // Dynamically import jspdf and jspdf-autotable
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF();

    // Add content to the PDF
    doc.setFontSize(22);
    doc.text("Luxury Emporium Receipt", 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Order Date: ${new Date(orderDetails.orderDate).toLocaleDateString()}`, 14, 35);
    doc.text(`Order ID: ${orderDetails.orderId}`, 14, 42);

    doc.setFontSize(16);
    doc.text("Shipping To:", 14, 55);
    doc.setFontSize(12);
    doc.text(orderDetails.shippingInfo.name, 14, 62);
    doc.text(orderDetails.shippingInfo.address, 14, 69);
    doc.text(`${orderDetails.shippingInfo.city}, ${orderDetails.shippingInfo.zip}`, 14, 76);
    doc.text(orderDetails.shippingInfo.email, 14, 83);
    doc.text(orderDetails.shippingInfo.phone, 14, 90);

    doc.setFontSize(16);
    doc.text("Order Summary:", 14, 105);
    
    const tableColumn = ["Item", "Brand", "Quantity", "Price"];
    const tableRows: (string|number)[][] = [];

    orderDetails.items.forEach(item => {
        const itemData = [
            item.product.name,
            item.product.brand,
            item.quantity,
            `Rs.${(item.product.price * item.quantity).toLocaleString()}`,
        ];
        tableRows.push(itemData);
    });
    
    autoTable(doc, {
        startY: 110,
        head: [tableColumn],
        body: tableRows,
    });

    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: Rs.${orderDetails.total.toLocaleString()}`, 14, finalY + 15);
    doc.setFont('helvetica', 'normal');

    doc.setFontSize(10);
    doc.text("Thank you for your purchase!", 105, finalY + 30, { align: 'center'});


    doc.save(`receipt-${orderDetails.orderId}.pdf`);
  };

  if (loading) {
    return (
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center h-full">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="font-semibold">Loading Confirmation...</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center text-center">
      <CheckCircle className="w-24 h-24 text-green-500 mb-6" />
      <h1 className="text-4xl font-headline font-bold mb-4">Order Placed Successfully!</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
        Thank you for your purchase. We've sent a confirmation to your email. Your order will be delivered in 5-7 days.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/">Continue Shopping</Link>
        </Button>
        {orderDetails && (
            <Button variant="outline" onClick={handleDownloadReceipt}>
                <Download className="mr-2 h-4 w-4" />
                Download Receipt
            </Button>
        )}
      </div>
    </div>
  );
}
