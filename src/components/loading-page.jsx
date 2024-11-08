import React from "react"
import { motion } from "framer-motion"
import { ShoppingCart, ShoppingBag } from "lucide-react"

const LoadingPage = () => {
  return (
    (<div
      className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center">
        <div className="flex items-center justify-center mb-8">
          <ShoppingBag className="h-12 w-12 text-orange-500 mr-2" />
          <h1 className="text-3xl font-bold text-orange-700">Potato Trade</h1>
        </div>
        <div className="relative w-64 h-24 mb-8">
          <motion.div
            className="absolute left-0 bottom-0"
            initial={{ x: -50 }}
            animate={{ x: 300 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}>
            <ShoppingCart className="h-16 w-16 text-orange-500" />
          </motion.div>
          {[...Array(3)].map((_, index) => (
            <motion.div
              key={index}
              className="absolute"
              initial={{ x: 300 - index * 20, y: 0, opacity: 0 }}
              animate={{ x: -50 - index * 20, y: -40, opacity: 1 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.5,
                ease: "easeInOut"
              }}>
              <svg
                className="h-8 w-8 text-orange-400"
                viewBox="0 0 24 24"
                fill="currentColor">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                <path
                  d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
              </svg>
            </motion.div>
          ))}
        </div>
        <p className="mt-4 text-orange-600 font-medium text-lg">Loading your spud selection...</p>
        <motion.p
          className="text-orange-500 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}>
          Preparing your potato paradise
        </motion.p>
      </motion.div>
    </div>)
  );
}

export default LoadingPage