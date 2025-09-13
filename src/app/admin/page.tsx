
"use client"
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState, FormEvent, useMemo } from "react";
import { getProducts, addProduct as addProductService, deleteProduct as deleteProductService, updateProduct } from "@/services/productService";
import { getUsers, updateUser, deleteUser as deleteUserService } from "@/services/userService";
import { getAllOrders, updateOrderStatus } from "@/services/orderService";
import type { Product, User, Order } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart as BarChartIcon, LineChart as LineChartIcon, ShieldCheck, ShoppingBag, ListOrdered, MessageSquare, Users, FileText, BadgePercent, Star, Package, Edit, Trash2, Loader2, DollarSign, ShoppingCart } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Line, LineChart as RechartsLineChart } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format, subMonths, getMonth, getYear } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

type SalesData = { month: string; sales: number };
type CategoryData = { name: string; value: number };

const chartConfig = {
    sales: {
        label: "Sales",
        color: "hsl(var(--primary))",
    },
    value: {
        label: "Sales",
        color: "hsl(var(--primary))",
    }
}

function AdminDashboard() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [salesChartData, setSalesChartData] = useState<SalesData[]>([]);
  const [categoryChartData, setCategoryChartData] = useState<CategoryData[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const { toast } = useToast();
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);
const [productCategories] = useState<string[]>(['Windows key', 'Microsoft key', 'Game keys', 'Other keys']);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);


  const fetchProducts = async () => {
      setLoadingProducts(true);
      const products = await getProducts();
      setAllProducts(products);
      setLoadingProducts(false);
  };
  
  const fetchUsers = async () => {
      setLoadingUsers(true);
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
      setLoadingUsers(false);
  }

  const fetchOrders = async () => {
    setLoadingOrders(true);
    const fetchedOrders = await getAllOrders();
    setOrders(fetchedOrders);
    setLoadingOrders(false);
  }


  useEffect(() => {
    fetchProducts();
    fetchUsers();
    fetchOrders();
  }, []);

  useEffect(() => {
    if (orders.length === 0 || allProducts.length === 0) return;

    const validOrders = orders.filter(o => o.status !== 'Cancelled');
    
    // Calculate total revenue and sales
    const revenue = validOrders.reduce((sum, order) => sum + order.total, 0);
    const salesCount = validOrders.length;
    setTotalRevenue(revenue);
    setTotalSales(salesCount);

    // Prepare monthly sales data for the last 6 months
    const monthlySales: { [key: string]: number } = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    for (let i = 5; i >= 0; i--) {
        const d = subMonths(new Date(), i);
        const monthKey = `${monthNames[getMonth(d)]} ${getYear(d)}`;
        monthlySales[monthKey] = 0;
    }
    
    validOrders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        const monthKey = `${monthNames[getMonth(orderDate)]} ${getYear(orderDate)}`;
        if(monthKey in monthlySales) {
            monthlySales[monthKey] += order.total;
        }
    });

    setSalesChartData(Object.entries(monthlySales).map(([month, sales]) => ({ month: month.split(' ')[0], sales })));

    // Prepare category sales data
    const categorySales: { [key: string]: number } = {};
    validOrders.forEach(order => {
        order.items.forEach(item => {
            const product = allProducts.find(p => p.id === item.id);
            if(product) {
                if(!categorySales[product.category]) {
                    categorySales[product.category] = 0;
                }
                categorySales[product.category] += item.price * item.quantity;
            }
        });
    });

    setCategoryChartData(Object.entries(categorySales).map(([name, value]) => ({ name, value })));

  }, [orders, allProducts]);
  
  const getGoogleDriveImageId = (url: string) => {
    const match = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    return match ? match[1] : null;
  };
  
  const handleAddProduct = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAddingProduct(true);
    const formData = new FormData(e.currentTarget);
    const gDriveLink = formData.get('image') as string;
    const imageId = getGoogleDriveImageId(gDriveLink);

    if (!imageId) {
        toast({ title: "Error", description: "Please provide a valid Google Drive share link.", variant: "destructive" });
        setIsAddingProduct(false);
        return;
    }
    
    const directImageUrl = `https://drive.google.com/uc?export=view&id=${imageId}`;
    let categoryValue = formData.get('category') as string;
    if (categoryValue === 'other') {
        categoryValue = formData.get('newCategory') as string;
        if (!categoryValue || categoryValue.trim() === '') {
            toast({ title: "Error", description: "Please enter a name for the new category.", variant: "destructive" });
            setIsAddingProduct(false);
            return;
        }
    }
    
    try {
        const newProductData = {
          name: formData.get('name') as string,
          price: Number(formData.get('price')),
          category: categoryValue,
          description: formData.get('description') as string,
          image: directImageUrl,
          images: [directImageUrl, directImageUrl],
          brand: formData.get('brand') as string || "Generic",
          rating: 0,
          reviews: 0,
          stock: Number(formData.get('stock')) || 100,
        };
        await addProductService(newProductData);
        toast({ title: "Success", description: "Product added successfully." });
        fetchProducts(); // Refresh products list
        (e.target as HTMLFormElement).reset();
        setShowNewCategoryInput(false);
    } catch(error) {
        console.error("Error adding product: ", error);
        toast({ title: "Error", description: "Failed to add product.", variant: "destructive" });
    } finally {
      setIsAddingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
        await deleteProductService(id);
        toast({ title: "Success", description: "Product deleted successfully." });
        fetchProducts(); // Refresh products list
    } catch(error) {
        console.error("Error deleting product: ", error);
        toast({ title: "Error", description: "Failed to delete product.", variant: "destructive" });
    }
  };

  const handleUpdateProduct = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsUpdatingProduct(true);

    const formData = new FormData(e.currentTarget);
    const gDriveLink = formData.get('image') as string;
    const imageId = getGoogleDriveImageId(gDriveLink);
    const directImageUrl = imageId ? `https://drive.google.com/uc?export=view&id=${imageId}` : editingProduct.image;
    
    let categoryValue = formData.get('category') as string;
    if (categoryValue === 'other') {
        categoryValue = formData.get('newCategory') as string;
        if (!categoryValue || categoryValue.trim() === '') {
            toast({ title: "Error", description: "Please enter a name for the new category.", variant: "destructive" });
            setIsUpdatingProduct(false);
            return;
        }
    }

    try {
        const updatedData: Partial<Product> = {
          name: formData.get('name') as string,
          price: Number(formData.get('price')),
          category: categoryValue,
          description: formData.get('description') as string,
          image: directImageUrl,
          images: [directImageUrl, directImageUrl],
          brand: formData.get('brand') as string,
          stock: Number(formData.get('stock')),
        };
        await updateProduct(editingProduct.id, updatedData);
        toast({ title: "Success", description: "Product updated successfully." });
        fetchProducts();
        setEditingProduct(null);
        setShowNewCategoryInput(false);
    } catch (error) {
      console.error("Error updating product:", error);
      toast({ title: "Error", description: "Failed to update product.", variant: "destructive" });
    } finally {
      setIsUpdatingProduct(false);
    }
  }

  const handleProductToggle = async (id: string, field: 'isFeatured' | 'isNew' | 'isSale', value: boolean) => {
    try {
        await updateProduct(id, { [field]: value });
        toast({ title: "Success", description: "Product updated successfully." });
        setAllProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    } catch (error) {
        console.error(`Error toggling ${field}:`, error);
        toast({ title: "Error", description: `Failed to update product ${field} status.`, variant: "destructive" });
    }
  }
  
  const handleToggleUserStatus = async (uid: string, disabled: boolean) => {
    try {
        await updateUser(uid, { disabled: !disabled });
        toast({ title: "Success", description: "User status updated." });
        fetchUsers();
    } catch (error) {
        console.error("Error updating user status: ", error);
        toast({ title: "Error", description: "Failed to update user status.", variant: "destructive" });
    }
  };

  const handleDeleteUser = async (uid: string) => {
    try {
      await deleteUserService(uid);
      toast({ title: "Success", description: "User deleted successfully." });
      fetchUsers(); // Refresh users list
    } catch (error) {
      console.error("Error deleting user: ", error);
      toast({ title: "Error", description: "Failed to delete user.", variant: "destructive" });
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
        await updateOrderStatus(orderId, status);
        toast({ title: "Success", description: "Order status updated." });
        fetchOrders(); // Refresh orders list
    } catch (error) {
        console.error("Error updating order status:", error);
        toast({ title: "Error", description: "Failed to update order status.", variant: "destructive" });
    }
  };

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

  const allPossibleCategories = useMemo(() => {
    const dynamicCategories = [...new Set(allProducts.map(p => p.category))].filter(c => c && c.trim() !== '');
    return [...new Set([...productCategories, ...dynamicCategories])];
  }, [allProducts, productCategories]);


  const renderProductsTab = (products: Product[], title: string, showToggles: boolean = false) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
               {showToggles && (
                <>
                  <TableHead>Featured</TableHead>
                  <TableHead>New</TableHead>
                  <TableHead>Sale</TableHead>
                </>
              )}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingProducts ? (
                Array.from({length: 5}).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                        {showToggles && <>
                          <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                          <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                          <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                        </>}
                        <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                    </TableRow>
                ))
            ) : products.map(product => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Image src={product.image} alt={product.name} width={40} height={40} className="rounded-sm" data-ai-hint="product image" />
                    <span className="font-medium">{product.name}</span>
                  </div>
                </TableCell>
                <TableCell>₹{product.price.toFixed(2)}</TableCell>
                <TableCell>{product.stock}</TableCell>
                {showToggles && (
                  <>
                    <TableCell>
                      <Switch 
                        checked={product.isFeatured} 
                        onCheckedChange={(value) => handleProductToggle(product.id, 'isFeatured', value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch 
                        checked={product.isNew} 
                        onCheckedChange={(value) => handleProductToggle(product.id, 'isNew', value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch 
                        checked={product.isSale} 
                        onCheckedChange={(value) => handleProductToggle(product.id, 'isSale', value)}
                      />
                    </TableCell>
                  </>
                )}
                <TableCell className="text-right">
                   <Button variant="ghost" size="icon" onClick={() => setEditingProduct(product)}><Edit className="h-4 w-4" /></Button>
                   <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this product.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <>
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-primary text-primary-foreground p-3 rounded-full">
            <ShieldCheck/>
        </div>
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
         
        </div>
      </div>
      
      <Tabs defaultValue="all-products">
        <TabsList className="mb-4 flex-wrap h-auto">
          <TabsTrigger value="all-products"><ShoppingBag className="mr-2 h-4 w-4"/>All Products</TabsTrigger>
          <TabsTrigger value="featured"><Star className="mr-2 h-4 w-4"/>Featured</TabsTrigger>
          <TabsTrigger value="new-arrivals"><Package className="mr-2 h-4 w-4"/>New Arrivals</TabsTrigger>
          <TabsTrigger value="sale-items"><BadgePercent className="mr-2 h-4 w-4"/>Sale Items</TabsTrigger>
          <TabsTrigger value="orders"><ListOrdered className="mr-2 h-4 w-4"/>Orders</TabsTrigger>
          <TabsTrigger value="qna"><MessageSquare className="mr-2 h-4 w-4"/>Customer Q&A</TabsTrigger>
          <TabsTrigger value="users"><Users className="mr-2 h-4 w-4"/>Users</TabsTrigger>
          <TabsTrigger value="reports"><FileText className="mr-2 h-4 w-4"/>Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="all-products">
           <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Product</CardTitle>
                  <CardDescription>Fill in the details to add a new product to your store.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4 col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Input name="name" placeholder="Product Name" required />
                      <Input name="price" type="number" step="0.01" placeholder="Price" required />
                       <Input name="brand" placeholder="Brand Name" required />
                    </div>
                     <div className="space-y-4 col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input name="stock" type="number" placeholder="Stock Quantity" required />
                      <Select name="category" onValueChange={(value) => setShowNewCategoryInput(value === 'other')}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select or Add Category" />
                          </SelectTrigger>
                          <SelectContent>
                             {productCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                             <SelectItem value="other">Add new category...</SelectItem>
                          </SelectContent>
                        </Select>
                     </div>
                     {showNewCategoryInput && (
                        <div className="col-span-1 md:col-span-2">
                             <Input name="newCategory" placeholder="Enter New Category Name" />
                        </div>
                     )}

                    <div className="col-span-1 md:col-span-2">
                        <Textarea name="description" placeholder="Description" required />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <Input name="image" type="text" placeholder="Google Drive Image Link" required />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <Button type="submit" disabled={isAddingProduct}>
                        {isAddingProduct && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add Product
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
              {renderProductsTab(allProducts, 'All Products', true)}
            </div>
        </TabsContent>
        
        <TabsContent value="featured">
            {renderProductsTab(allProducts.filter(p => p.isFeatured), 'Featured Products')}
        </TabsContent>
        <TabsContent value="new-arrivals">
            {renderProductsTab(allProducts.filter(p => p.isNew), 'New Arrivals')}
        </TabsContent>
        <TabsContent value="sale-items">
            {renderProductsTab(allProducts.filter(p => p.isSale), 'Sale Items')}
        </TabsContent>

        <TabsContent value="orders">
          <Card>
             <CardHeader>
              <CardTitle className="flex items-center gap-2"><ListOrdered className="h-5 w-5" /> Orders Management</CardTitle>
              <CardDescription>View and manage customer orders.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingOrders ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full space-y-4">
                  {orders.map(order => (
                    <AccordionItem value={order.id} key={order.id} className="border rounded-lg">
                      <div className="flex items-center p-4">
                        <AccordionTrigger className="flex-1 hover:no-underline p-0">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center flex-1 text-sm text-left">
                            <div>
                                <p className="text-xs text-muted-foreground">Customer</p>
                                <p className="font-medium">{order.customerInfo.name}</p>
                                <p className="text-sm text-muted-foreground">📞 {order.customerInfo.phone}</p>
                        
                                <p className="text-sm text-muted-foreground">🏠 {order.customerInfo.address}, {order.customerInfo.city}, {order.customerInfo.state} - {order.customerInfo.zip}</p>
                            </div>

                             <div>
                                <p className="text-xs text-muted-foreground">Date</p>
                                <p className="font-medium">{format(new Date(order.createdAt), "PPP")}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Total</p>
                                <p className="font-medium">₹ {order.total.toFixed(2)}</p>
                            </div>
                             <div className="flex justify-start">
                                <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                            </div>
                          </div>
                       </AccordionTrigger>
                       <div className="flex items-center gap-4 ml-auto pl-4">
                          <Select onValueChange={(value: Order['status']) => handleUpdateOrderStatus(order.id, value)} defaultValue={order.status}>
                              <SelectTrigger className="w-[180px] hidden md:flex">
                                <SelectValue placeholder="Update status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Confirmed">Confirmed</SelectItem>
                                <SelectItem value="Shipped">Shipped</SelectItem>
                                <SelectItem value="Delivered">Delivered</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                       </div>
                      </div>
                       <AccordionContent className="p-4 pt-0">
                          <Separator className="mb-4" />
                          <h4 className="font-semibold mb-2">Order Items</h4>
                          <Table>
                             <TableHeader>
                                <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {order.items.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                    <div className="flex items-center gap-4">
                                        <Image src={item.image} alt={item.name} width={40} height={40} className="rounded-md" data-ai-hint="product image"/>
                                        <span className="font-medium">{item.name}</span>
                                    </div>
                                    </TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell className="text-right">₹ {(item.price * item.quantity).toFixed(2)}</TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                          <div className="flex md:hidden justify-end mt-4">
                            <Select onValueChange={(value: Order['status']) => handleUpdateOrderStatus(order.id, value)} defaultValue={order.status}>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Update status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pending">Pending</SelectItem>
                                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                                  <SelectItem value="Shipped">Shipped</SelectItem>
                                  <SelectItem value="Delivered">Delivered</SelectItem>
                                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                          </div>
                       </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="qna">
           <Card>
             <CardHeader>
              <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Customer Q&A</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Customer Q&A coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users">
           <Card>
             <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage all registered users.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingUsers ? (
                    Array.from({length: 3}).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                            <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                            <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                            <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                            <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                        </TableRow>
                    ))
                  ) : users.map(user => (
                    <TableRow key={user.uid}>
                      <TableCell>
                         <div className="flex items-center gap-4">
                           <Image src={user.photoURL ?? 'https://placehold.co/40x40.png'} alt={user.displayName ?? 'user'} width={40} height={40} className="rounded-full" data-ai-hint="user avatar"/>
                           <span className="font-medium">{user.displayName}</span>
                         </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell><Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge></TableCell>
                      <TableCell>
                         <div className="flex items-center justify-start gap-2">
                            <Switch checked={!user.disabled} onCheckedChange={() => handleToggleUserStatus(user.uid, user.disabled)} id={`status-${user.uid}`} />
                            <label htmlFor={`status-${user.uid}`}>{user.disabled ? 'Blocked' : 'Active'}</label>
                         </div>
                      </TableCell>
                      <TableCell className="text-right">
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive" disabled={user.role === 'admin'}>
                                  <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete this user and all their data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteUser(user.uid)}>Continue</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <span className="text-muted-foreground font-bold text-lg">₹</span>
                    </CardHeader>
                    <CardContent>
                        {loadingOrders ? <Skeleton className="h-8 w-1/2"/> : <div className="text-2xl font-bold">₹ {totalRevenue.toFixed(2)}</div>}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sales</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                         {loadingOrders ? <Skeleton className="h-8 w-1/2"/> : <div className="text-2xl font-bold">+{totalSales}</div>}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                         {loadingProducts ? <Skeleton className="h-8 w-1/2"/> : <div className="text-2xl font-bold">{allProducts.length}</div>}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                         {loadingUsers ? <Skeleton className="h-8 w-1/2"/> : <div className="text-2xl font-bold">{users.length}</div>}
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><LineChartIcon className="h-5 w-5"/> Monthly Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                         {loadingOrders ? <Skeleton className="h-[300px] w-full" /> : (
                            <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                <RechartsLineChart
                                    accessibilityLayer
                                    data={salesChartData}
                                    margin={{
                                        left: 12,
                                        right: 12,
                                    }}
                                >
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="month"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                    />
                                    <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent indicator="dot" />}
                                    />
                                    <Line
                                        dataKey="sales"
                                        type="monotone"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </RechartsLineChart>
                            </ChartContainer>
                        )}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BarChartIcon className="h-5 w-5"/> Sales by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                         {loadingOrders || loadingProducts ? <Skeleton className="h-[300px] w-full" /> : (
                            <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                <BarChart accessibilityLayer data={categoryChartData} layout="vertical" margin={{ left: 0 }}>
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                        tickFormatter={(value) => value.slice(0, 15)}
                                        width={80}
                                    />
                                    <XAxis dataKey="value" type="number" hide />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent indicator="dot" hideLabel />}
                                    />
                                    <Bar dataKey="value" layout="vertical" fill="hsl(var(--primary))" radius={4} />
                                </BarChart>
                            </ChartContainer>
                         )}
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
      </Tabs>
    </div>

    {/* Edit Product Dialog */}
    <Dialog open={!!editingProduct} onOpenChange={(isOpen) => !isOpen && setEditingProduct(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Product</DialogTitle>
                <DialogDescription>
                    Make changes to the product details below. Click save when you're done.
                </DialogDescription>
            </DialogHeader>
            {editingProduct && (
                 <form onSubmit={handleUpdateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    <div className="md:col-span-2">
                        <label>Product Name</label>
                        <Input name="name" defaultValue={editingProduct.name} required />
                    </div>
                    <div>
                         <label>Price</label>
                        <Input name="price" type="number" step="0.01" defaultValue={editingProduct.price} required />
                    </div>
                    <div>
                         <label>Brand</label>
                        <Input name="brand" defaultValue={editingProduct.brand} required />
                    </div>
                    <div>
                        <label>Stock</label>
                        <Input name="stock" type="number" defaultValue={editingProduct.stock} required />
                    </div>
                     <div>
                        <label>Category</label>
                         <Select name="category" defaultValue={editingProduct.category} onValueChange={(value) => setShowNewCategoryInput(value === 'other')}>
                            <SelectTrigger>
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                {allPossibleCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                <SelectItem value="other">Add new category...</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     {showNewCategoryInput && (
                        <div className="col-span-1 md:col-span-2">
                             <Input name="newCategory" placeholder="Enter New Category Name" />
                        </div>
                     )}
                    <div className="md:col-span-2">
                        <label>Description</label>
                        <Textarea name="description" defaultValue={editingProduct.description} required />
                    </div>
                    <div className="md:col-span-2">
                        <label>Image Link</label>
                        <Input name="image" type="text" defaultValue={editingProduct.image} required />
                    </div>
                    <DialogFooter className="md:col-span-2">
                         <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isUpdatingProduct}>
                             {isUpdatingProduct && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            )}
        </DialogContent>
    </Dialog>
    </>
  );
}

export default function AdminPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        if (!user || user.email !== 'productkeyybazar@gmail.com') {
            router.push('/admin/login');
        }
    }, [user, loading, router]);

    if (loading || !user || user.email !== 'productkeyybazar@gmail.com') {
        return <div className="flex justify-center items-center h-screen">Verifying access...</div>;
    }
    
    return <AdminDashboard />;
}


    
