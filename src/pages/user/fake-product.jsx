import { useState } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Star, ShoppingCart, Plus, Minus } from 'lucide-react'
import { sendRequest } from '@/services/requests/request-service'
import { toast } from "react-toastify";
import UserLayout from '@/layouts/user-layout'
import RequestMethods from '@/enums/request-methods';

const product = {
    id: '1',
    user_id: '13',
    category_id: '1',
    media_boolean: 1,
    title: 'Sample Product 1',
    description: 'This is a sample product description.',
    price: 49.99,
    status: 'available',
    quantity: 5,
    refund_guaranteed_duration: 30,
    created_at: '2024-11-03 12:07:37',
    updated_at: '2024-11-03 12:07:37',
    image: '',
    rating: 4.5,
}

export default function FakeProduct() {


    // this code that  will be used to product to the cart 
    // we will use the product id to add the product to the cart
    // neewd data is the product id  only  a
    //format of the payload is {productId: 2}
    const handleAddToCart = async () => {
        try {
            const payload = {
                productId: 3,
            }
            const response = await sendRequest(
                RequestMethods.POST,
                `/cartitems`,
                payload,
                true 
              );
              console.log(response);
            if (response.success) {
                toast.success("Product added to cart successfully")
            } else {
                toast.error(response.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    // end of the code that will be used to product to the cart 
    // end of the code that will be used to product to the cart 
    // end of the code that will be used to product to the cart 
    // end of the code that will be used to product to the cart 
    // end of the code that will be used to product to the cart 

    return (
        (<div className="container mx-auto px-4 py-8">
            <Card className="flex flex-col md:flex-row">
                <div className="md:w-1/2">
                    <Image
                        src={product.image}
                        alt={product.title}
                        width={500}
                        height={500}
                        className="w-full h-auto object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none" />
                </div>
                <div className="md:w-1/2 p-6">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold">{product.title}</CardTitle>
                        <CardDescription className="text-xl font-semibold text-green-600">
                            ${product.price.toFixed(2)}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 mb-4">{product.description}</p>
                        <div className="flex items-center mb-4">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                        }`} />
                            ))}
                            <span className="ml-2 text-gray-600">{product.rating.toFixed(1)}</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleAddToCart} className="w-full">
                            <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                        </Button>
                    </CardFooter>
                </div>
            </Card>
        </div>)
    );
}

FakeProduct.getLayout = function getLayout(page) {
    return <UserLayout>{page}</UserLayout>;
};



