import React from "react"
import { Check, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

const PermissionsDisplay = ({ permissions }) => {
  if (!permissions) return null

  const permissionItems = [
    { label: "View", value: permissions.canView },
    { label: "Edit", value: permissions.canEdit },
    { label: "Create", value: permissions.canCreate },
    { label: "Delete", value: permissions.canDelete },
  ]

  return (
    (<Card className="mt-4 border-gray-200">
      <CardContent className="p-4">
        <h4 className="text-sm font-semibold mb-3">Permissions</h4>
        <div className="grid grid-cols-2 gap-2">
          {permissionItems.map((item) => (
            <Badge
              key={item.label}
              variant="outline"
              className={`flex items-center justify-between px-3 py-1 ${
                item.value ? "bg-orange-600 text-white" : "bg-gray-100 text-gray-700 border-gray-200"
              }`}>
              <span>{item.label}</span>
              {item.value ? (
                <Check className="h-4 w-4 text-white-500" />
              ) : (
                <X className="h-4 w-4 text-red-500" />
              )}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>)
  );
}

export default PermissionsDisplay