
"use client"
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FaGoogle } from "react-icons/fa";
import { ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
    const { user, loading, signInWithGoogle } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            // Check if the logged-in user is the admin
            if (user.email === 'productkeyybazar@gmail.com') {
                router.push('/admin');
            } else {
                // If not admin, redirect to home. You might want to show an "unauthorized" message.
                router.push('/');
            }
        }
    }, [user, loading, router]);

    const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error("Error signing in with Google for admin", error);
        }
    };

    // While checking auth state, show a loader
    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    // If a user is logged in and they are the admin, they will be redirected.
    // This part of the component will render only if there's no user or the user is not the admin.
    // We prevent non-admin users from seeing the login form by redirecting them.
    if (user && user.email !== 'productkeyybazar@gmail.com') {
        // This will be handled by the useEffect, but as a fallback.
        return <div className="flex justify-center items-center h-screen">Redirecting...</div>;
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-background">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
                    <CardTitle className="text-2xl mt-4">Admin Access</CardTitle>
                    <CardDescription>Please sign in with your administrative Google account to continue.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleGoogleSignIn} className="w-full">
                        <FaGoogle className="mr-2" />
                        Sign in with Google
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
