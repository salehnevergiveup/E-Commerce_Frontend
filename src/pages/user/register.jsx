"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShoppingBag } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters long" }),
  email: z.string().email({ message: "Invalid Email Address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long." })
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, { message: "Password must contain at least one letter and one number." }),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number." }),
  billingAddress: z.string().min(1, { message: "Billing address is required" }),
  age: z.number().min(18, { message: "Age must be 18 or older." }),
  gender: z.enum(["M", "F"], { errorMap: () => ({ message: "Gender must be 'M' or 'F'." }) }),
})

export default function RegisterPageComponent() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      phoneNumber: "",
      billingAddress: "",
      age: undefined,
      gender: undefined,
    },
  })

  async function onSubmit(values) {
    setIsLoading(true)
    setError("")

    try {
      // Simulate API call (replace with actual API call)
      const response = await fakeApiCall(values) // Replace with your API logic
      console.log(response)
      // Handle successful registration logic here (e.g., redirect, show success message, etc.)
    } catch (err) {
      setError("Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Simulate an API call for demonstration purposes
  function fakeApiCall(values) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (values.email !== "taken@example.com") {
          resolve({ success: true })
        } else {
          reject(new Error("Email already taken"))
        }
      }, 1000)
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <ShoppingBag className="h-12 w-12 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-orange-700">Create an Account</CardTitle>
          <CardDescription className="text-center text-orange-600">
            Sign up to start your journey with us
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert>
              <AlertDescription className="text-red-500">{error}</AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-orange-700">Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your username" {...field}
                      className="border-orange-200 focus:border-orange-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-orange-700">Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email" {...field}
                      className="border-orange-200 focus:border-orange-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-orange-700">Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your password" {...field}
                      className="border-orange-200 focus:border-orange-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-orange-700">Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your phone number" {...field} 
                      className="border-orange-200 focus:border-orange-500"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="billingAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-orange-700">Billing Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your billing address" {...field}
                      className="border-orange-200 focus:border-orange-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-orange-700">Age</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter your age" {...field}
                      className="border-orange-200 focus:border-orange-500" />
                    </FormControl >
                    <FormMessage className="border-orange-200 focus:border-orange-500"/>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-orange-700">Gender</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Male</SelectItem>
                          <SelectItem value="F">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit"  className="w-full bg-orange-500 hover:bg-orange-600" disabled={isLoading}>
                {isLoading ? "Registering..." : "Register"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardContent>
          <p className="text-center">
            Already have an account?{" "}
            <Link href="/user/login" className="text-orange-600 hover:underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
