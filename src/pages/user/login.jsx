import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { ShoppingBag } from "lucide-react"

const formSchema = z.object({
  emailOrUsername: z.string().min(1, { message: "Email or username is required." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }).regex(/(?=.*[0-9])/, { message: "Password must contain at least one number." }),
  rememberMe: z.boolean().default(false),
})

export default function LoginPageComponent() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailOrUsername: "",
      password: "",
      rememberMe: false,
    },
  })

  async function onSubmit(values) {
    setIsLoading(true)
    setError("")

    try {
      // Simulate API call (replace with actual API call)
      const response = await fakeApiCall(values) // Replace with your API logic
      console.log(response)
      // Handle successful login logic here (e.g., redirect, store token, etc.)
    } catch (err) {
      setError("Invalid email/username or password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Simulate an API call for demonstration purposes
  function fakeApiCall(values) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (values.emailOrUsername === "test" && values.password === "password123") {
          resolve({ success: true })
        } else {
          reject(new Error("Invalid credentials"))
        }
      }, 1000)
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <ShoppingBag className="h-12 w-12 text-orange-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-orange-700">Login</CardTitle>
          <CardDescription className="text-center text-orange-600">
            Access your second-hand e-commerce account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4">
              <AlertDescription className="text-red-500">{error}</AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="emailOrUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-orange-700">Email or Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your email or username"
                        {...field}
                        className="border-orange-200 focus:border-orange-500" />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )} />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-orange-700">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                        className="border-orange-200 focus:border-orange-500" />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )} />
                 <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-orange-700">
                        Remember me
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <CardFooter>
              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
        <CardContent>
          <p className="text-center">
            Don’t have an account?{" "}
            <Link href="/user/register" className="text-orange-600 hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
