// "use client";
// import { useRouter } from "next/navigation";

// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { AlertCircle } from "lucide-react";

// export default function TopUpFailed() {
//   const router = useRouter();

//   const handleReturn = () => {
//     router.push("/user/profile?tab=balance");
//   };

//   return (
//     <div className="min-h-screen bg-white p-4 md:p-6 lg:p-8">
//       <Card className="mx-auto max-w-md border-red-100">
//         <CardHeader>
//           <div className="flex flex-col items-center">
//             <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
//             <CardTitle className="text-2xl font-bold text-center text-red-600">
//               Top-Up Failed
//             </CardTitle>
//           </div>
//         </CardHeader>
//         <CardContent className="space-y-4 text-center">
//           <p className="text-lg text-gray-600">
//             We are terribly sorry, but the attempt to top-up has failed. Please
//             try again.
//           </p>
//         </CardContent>
//         <CardFooter className="flex justify-center">
//           <Button
//             onClick={handleReturn}
//             className="bg-red-500 hover:bg-red-600 text-white w-full max-w-xs"
//           >
//             Return
//           </Button>
//         </CardFooter>
//       </Card>
//     </div>
//   );
// }
