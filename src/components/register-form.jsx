// components/RegisterForm.js
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
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
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShoppingBag } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Routes from "@/enums/routes";
import RequestMethod from "@/enums/request-methods";
import sendRequest from "@/services/requests/request-service";
import EndPointBuilder from "@/services/routing/routingService";
import { MessagePopup } from "@/components/message-popup";
import { useRouter } from "next/router";

const formSchema = z.object({
  name: z.string(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long" }),
  email: z.string().email({ message: "Invalid Email Address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." }),
    // .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{9,}$/, {
    //   message: "Password must contain at least one letter and one number.",
    // }),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, {
    message: "Invalid phone number.",
  }),
  billingAddress: z
    .string()
    .min(1, { message: "Billing address is required" }),
  age: z.string(),
  gender: z.enum(["M", "F"], {
    errorMap: () => ({ message: "Gender must be 'M' or 'F'." }),
  }),
});

export default function RegisterForm({ onClose, openLoginDialog }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupVariant, setPopupVariant] = useState("info");
  const [popupMessage, setPopupMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      phoneNumber: "",
      billingAddress: "",
      age: "",
      gender: "",
    },
  });

  const handleShowPopup = (variant, message) => {
    setPopupVariant(variant);
    setPopupMessage(message);
    setShowPopup(true);
  };

  async function onSubmit(values) {
    setIsLoading(true);
    setError("");

    const data = {
      userAccount: {
        name: values.name.trim(),
        username: values.username.trim(),
        password: values.password,
        status: "Active",
      },
      userDetails: {
        email: values.email.trim(),
        phoneNumber: values.phoneNumber.trim(),
        billingAddress: values.billingAddress.trim(),
        age: parseInt(values.age, 10) || 0,
        gender: values.gender,
      },
    };
    const requestMethod = RequestMethod.POST;
    const endpoint = new EndPointBuilder()
      .addRoute(Routes.AUTHENTICATION)
      .addRoute(Routes.PUBLIC)
      .addRoute(Routes.REGISTER)
      .build();

    const response = await sendRequest(requestMethod, endpoint, data, false);

    if (response.error) {
      handleShowPopup(
        "error",
        response.message || "An unexpected error occurred."
      );
    } else {
      handleShowPopup("success", "Registration successful!");
      // Close the dialog
      onClose();
      // Optionally, redirect the user
      // router.push('/user/login');
    }

    setIsLoading(false);
  }

  return (
    <div>
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <ShoppingBag className="h-12 w-12 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-orange-700">
            Create an Account
          </CardTitle>
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
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Name Field */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-orange-700">Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your name"
                          {...field}
                          className="border-orange-200 focus:border-orange-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Username Field */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-orange-700">Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your username"
                          {...field}
                          className="border-orange-200 focus:border-orange-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-orange-700">Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your email"
                          {...field}
                          className="border-orange-200 focus:border-orange-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Password Field */}
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
                            className="border-orange-200 focus:border-orange-500"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-orange-600"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? "Hide" : "Show"}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Phone Number Field */}
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-orange-700">Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your phone number"
                          {...field}
                          className="border-orange-200 focus:border-orange-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Billing Address Field */}
                <FormField
                  control={form.control}
                  name="billingAddress"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2 lg:col-span-1">
                      <FormLabel className="text-orange-700">Billing Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your billing address"
                          {...field}
                          className="border-orange-200 focus:border-orange-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Age Field */}
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-orange-700">Age</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter your age"
                          {...field}
                          className="border-orange-200 focus:border-orange-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Gender Field */}
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-orange-700">Gender</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
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
              </div>

              {/* Submit Button */}
              <div className="mt-6">
                <Button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  disabled={isLoading}
                >
                  {isLoading ? "Registering..." : "Register"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardContent>
          <p className="text-center">
            Already have an account?{" "}
            <button
              type="button"
              className="text-orange-600 hover:underline"
              onClick={() => {
                onClose();
                openLoginDialog();
              }}
            >
              Log in
            </button>
          </p>
        </CardContent>
      </Card>
      {showPopup && (
        <MessagePopup
          message={popupMessage}
          variant={popupVariant}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
}
