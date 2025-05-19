import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, Loader2 } from "lucide-react";
import { useWeb3 } from "@/hooks/use-web3";
import { FcGoogle } from "react-icons/fc";

export default function Login() {
  const [, setLocation] = useLocation();
  const { connect, isConnecting } = useWeb3();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const handleWalletConnect = async () => {
    try {
      await connect();
      setLocation("/");
    } catch (error) {
      console.error("Connection error:", error);
    }
  };
  
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      window.location.href = "/api/auth/google";
    } catch (error) {
      console.error("Google login error:", error);
      setIsGoogleLoading(false);
    }
  };
  
  return (
    <div className="min-h-[calc(100vh-4rem)] w-full flex flex-col items-center justify-center bg-neutral-lightest py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center mb-8">
        <Layers className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-3xl font-bold text-neutral-dark">LithoChain</h1>
        <p className="text-neutral mt-2">Blockchain services made simple</p>
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
          <CardDescription className="text-center">
            Choose your preferred authentication method
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button 
            variant="outline" 
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="flex items-center justify-center gap-2 h-11"
          >
            {isGoogleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FcGoogle className="h-5 w-5" />
            )}
            Sign in with Google
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-neutral-light" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-neutral">or continue with</span>
            </div>
          </div>
          
          <Button 
            variant="default"
            onClick={handleWalletConnect}
            disabled={isConnecting}
            className="bg-primary text-white hover:bg-primary-dark h-11"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect Wallet"
            )}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="mt-2 text-xs text-center text-neutral">
            By continuing, you agree to LithoChain's Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 