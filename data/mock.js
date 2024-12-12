export const mockProducts = [
  {
    id: 59,
    user_id: 1,
    category_id: 1,
    media_boolean: 1,
    title: "Premium Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation",
    price: 299.99,
    status: "to_pay",
    refund_guaranteed_duration: 7,
    category: {
      id: 1,
      product_category_name: "Electronics",
      description: "Electronic devices and accessories",
      charge_rate: 0.05,
      rebate_rate: 0.02,
      created_at: "2023-12-09T00:00:00Z"
    },
    medias: [
      {
        id: 1,
        sourceId: 1,
        type: "image",
        mediaUrl: "/placeholder.svg",
        createdAt: "2023-12-09T00:00:00Z",
        updatedAt: "2023-12-09T00:00:00Z"
      }
    ]
  },
  {
    id: 2,
    user_id: 1,
    category_id: 2,
    media_boolean: 1,
    title: "Organic Cotton T-Shirt",
    description: "100% organic cotton t-shirt",
    price: 29.99,
    status: "completed",
    refund_guaranteed_duration: 7,
    category: {
      id: 2,
      product_category_name: "Clothing",
      description: "Apparel and accessories",
      charge_rate: 0.03,
      rebate_rate: 0.01,
      created_at: "2023-12-09T00:00:00Z"
    },
    medias: [
      {
        id: 2,
        sourceId: 2,
        type: "image",
        mediaUrl: "/placeholder.svg",
        createdAt: "2023-12-09T00:00:00Z",
        updatedAt: "2023-12-09T00:00:00Z"
      }
    ]
  },
  {
    id: 3,
    user_id: 1,
    category_id: 3,
    media_boolean: 1,
    title: "Smart Watch Pro",
    description: "Advanced smartwatch with health tracking",
    price: 199.99,
    status: "refund",
    refund_guaranteed_duration: 7,
    category: {
      id: 3,
      product_category_name: "Electronics",
      description: "Electronic devices and accessories",
      charge_rate: 0.05,
      rebate_rate: 0.02,
      created_at: "2023-12-09T00:00:00Z"
    },
    medias: [
      {
        id: 3,
        sourceId: 3,
        type: "image",
        mediaUrl: "/placeholder.svg",
        createdAt: "2023-12-09T00:00:00Z",
        updatedAt: "2023-12-09T00:00:00Z"
      }
    ]
  }
]

