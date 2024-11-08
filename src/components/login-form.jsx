// components/LoginForm.js
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/contexts/auth-context';
import GuestGuard from '@/components/guest-guard';
import { toast } from 'react-toastify';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, ShoppingBag } from "lucide-react";
import { MessagePopup } from "@/components/message-popup";

const formSchema = z.object({
  emailOrUsername: z
    .string()
    .min(1, { message: "Email or username is required." }),
  password: z.string().min(1, { message: "Password is required." }),
  rememberMe: z.boolean().default(false),
});

function LoginForm({ onClose, openRegisterDialog }) {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailOrUsername: "",
      password: "",
      rememberMe: false,
    },
  });

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const onSubmit = async (values) => {
    setIsLoading(true);
    setError('');
    try {
      await login(values); 
      onClose(); 
      setError('Invalid email/username or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Card className="w-full max-w-3xl mx-auto shadow-none">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <ShoppingBag className="h-12 w-12 text-orange-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-orange-700">
            Login
          </CardTitle>
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
              {/* Email or Username Field */}
              <FormField
                control={form.control}
                name="emailOrUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-orange-700">
                      Email or Username
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your email or username"
                        {...field}
                        className="border-orange-200 focus:border-orange-500"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              {/* Password Field with Show/Hide functionality */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-orange-700">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          {...field}
                          className="border-orange-200 focus:border-orange-500 pr-10" // Added padding to the right for the icon
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              {/* Remember Me Checkbox */}
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
              {/* Submit Button */}
              <CardFooter className="pb-0 pt-2">
                <Button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
        <CardContent>
          <p className="text-center">
            Don’t have an account?{" "}
            <button
              type="button"
              className="text-orange-600 hover:underline"
              onClick={() => {
                onClose(); // Close the login dialog
                openRegisterDialog(); // Open the register dialog
              }}
            >
              Sign up
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default GuestGuard(LoginForm, 'user');
