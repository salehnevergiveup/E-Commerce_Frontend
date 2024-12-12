import React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag, AlertTriangle } from "lucide-react"
import { useRouter } from 'next/router'

const UnauthorizedPage = () => {
  const router = useRouter()

  const handleContinue = () => {
    // Navigate to the home page or a safe page
    router.back();
  }

  return (
    (<div className="min-h-screen flex flex-col">
      <header className="p-4 bg-white shadow-sm">
        <div className="flex items-center">
          <ShoppingBag className="h-8 w-8 text-orange-500 mr-2" />
          <span className="text-xl font-bold text-orange-700">Potato Trade</span>
        </div>
      </header>
      <div className="flex-grow flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md">
          <Card className="shadow-lg border-orange-200">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <ShoppingBag className="h-12 w-12 text-orange-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-orange-700">Unauthorized Access</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Access Denied</h2>
              <p className="text-gray-600 mb-4">
                We're sorry, but you don't have permission to access this page. 
                This area may be restricted to certain users or require additional authentication.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button
                onClick={handleContinue}
                className="w-full bg-orange-500 text-white hover:bg-orange-600 transition-colors duration-300">
                Continue
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>)
  );
}

export default UnauthorizedPage