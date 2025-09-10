
"use client"
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Order } from "@/lib/types";
import { getOrdersByUser, updateOrderStatus } from "@/services/orderService";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const OrderHistorySkeleton = () => (
    <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
            <Card key={i}>
                <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-1/3 mt-2" />
                </CardHeader>
            </Card>
        ))}
    </div>
)

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    const fetchOrders = async (userId: string) => {
        setLoadingOrders(true);
        try {
            const userOrders = await getOrdersByUser(userId);
            setOrders(userOrders);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            toast({ title: "Error", description: "Could not load your orders.", variant: "destructive" });
        } finally {
            setLoadingOrders(false);
        }
    };

    useEffect(() => {
        if (loading) return;
        if (!user) {
            router.push('/login?redirect=/profile');
        } else {
            fetchOrders(user.uid);
        }
    }, [user, loading, router]);
    
    const handleCancelOrder = async (orderId: string) => {
        if (confirm("Are you sure you want to cancel this order?")) {
            try {
                await updateOrderStatus(orderId, 'Cancelled');
                toast({ title: "Success", description: "Your order has been cancelled." });
                if (user) fetchOrders(user.uid);
            } catch (error) {
                console.error("Error cancelling order:", error);
                toast({ title: "Error", description: "Failed to cancel the order.", variant: "destructive" });
            }
        }
    }
    
    const getStatusVariant = (status: Order['status']) => {
        switch (status) {
            case 'Pending': return 'secondary';
            case 'Confirmed': return 'default';
            case 'Shipped': return 'default';
            case 'Delivered': return 'default';
            case 'Cancelled': return 'destructive';
            default: return 'outline';
        }
    }

    const canCancelOrder = (status: Order['status']) => {
        return status === 'Pending' || status === 'Confirmed';
    }
    
    if (loading || !user) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Skeleton className="h-24 w-full mb-8" />
                <OrderHistorySkeleton />
            </div>
        );
    }
    
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Card className="mb-8 bg-card/50">
                <CardContent className="flex items-center gap-6 p-6">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? ''} />
                        <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-2xl font-bold">{user.displayName}</h1>
                        <p className="text-muted-foreground">{user.email}</p>
                    </div>
                </CardContent>
            </Card>

            <h2 className="text-2xl font-bold mb-4">Order History</h2>

            {loadingOrders ? (
                <OrderHistorySkeleton />
            ) : orders.length > 0 ? (
                 <Accordion type="single" collapsible className="w-full space-y-4">
                     {orders.map(order => (
                         <AccordionItem value={order.id} key={order.id} className="border-0">
                            <Card>
                                <AccordionTrigger className="p-6 text-left hover:no-underline">
                                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Order ID</p>
                                            <p className="font-mono text-sm truncate">{order.id}</p>
                                        </div>
                                         <div>
                                            <p className="text-xs text-muted-foreground">Date Placed</p>
                                            <p className="font-medium">{format(new Date(order.createdAt), "PPP")}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Total</p>
                                            <p className="font-medium">${order.total.toFixed(2)}</p>
                                        </div>
                                        <div className="flex justify-end">
                                            <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-6 pt-0">
                                    <Separator className="mb-4" />
                                    <div className="space-y-4">
                                       {order.items.map(item => (
                                         <div key={item.id} className="flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                            <Image src={item.image} alt={item.name} width={64} height={64} className="rounded-md" data-ai-hint="product image"/>
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                            </div>
                                            </div>
                                            <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                       ))}
                                    </div>
                                    {canCancelOrder(order.status) && (
                                        <>
                                            <Separator className="my-4" />
                                            <div className="flex justify-end">
                                                <Button variant="destructive" onClick={() => handleCancelOrder(order.id)}>Cancel Order</Button>
                                            </div>
                                        </>
                                    )}
                                </AccordionContent>
                            </Card>
                         </AccordionItem>
                     ))}
                 </Accordion>
            ) : (
                <Card>
                    <CardContent className="text-center p-12">
                        <p className="text-muted-foreground">You haven't placed any orders yet.</p>
                        <Button asChild className="mt-4" onClick={() => router.push('/products')}>
                            Start Shopping
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
