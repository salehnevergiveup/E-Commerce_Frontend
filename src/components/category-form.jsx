// src/components/category-form.js

import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function CategoryForm({
  open,
  onOpenChange,
  initialData,
  mode,
  onSubmit
}) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  // Reset form fields when initialData or mode changes
  useEffect(() => {
    if (initialData) {
      reset({
        productCategoryName: initialData.productCategoryName || '',
        description: initialData.description || '',
        chargeRate: initialData.chargeRate || 0,
        rebateRate: initialData.rebateRate || 0
      })
    } else {
      reset({
        productCategoryName: '',
        description: '',
        chargeRate: 0,
        rebateRate: 0
      })
    }
  }, [initialData, reset])

  const submitHandler = (data) => {
    // Convert chargeRate and rebateRate to integers if necessary
    data.chargeRate = parseInt(data.chargeRate, 10)
    data.rebateRate = parseInt(data.rebateRate, 10)
    onSubmit(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create Category" : "Edit Category"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Fill in the details to create a new category." : "Update the category details."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(submitHandler)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="productCategoryName">Name</Label>
            <Input
              id="productCategoryName"
              {...register("productCategoryName", { required: "Category name is required." })}
              placeholder="Category name"
            />
            {errors.productCategoryName && <p className="text-red-500 text-sm">{errors.productCategoryName.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description", { required: "Description is required." })}
              placeholder="Category description"
            />
            {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="chargeRate">Charge Rate</Label>
              <Input
                id="chargeRate"
                type="number"
                {...register("chargeRate", { 
                  required: "Charge rate is required.",
                  min: { value: 0, message: "Charge rate cannot be negative." }
                })}
                placeholder="0"
              />
              {errors.chargeRate && <p className="text-red-500 text-sm">{errors.chargeRate.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rebateRate">Rebate Rate</Label>
              <Input
                id="rebateRate"
                type="number"
                {...register("rebateRate", { 
                  required: "Rebate rate is required.",
                  min: { value: 0, message: "Rebate rate cannot be negative." }
                })}
                placeholder="0"
              />
              {errors.rebateRate && <p className="text-red-500 text-sm">{errors.rebateRate.message}</p>}
            </div>
          </div>
          <DialogFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white">
              {mode === "create" ? "Create" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
