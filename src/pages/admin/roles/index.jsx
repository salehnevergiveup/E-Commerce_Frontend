// src/pages/admin/roles/dashboard.jsx

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify"; // Ensure you have react-toastify installed

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Pencil,
  ArrowLeft,
  Plus,
  Trash2,
  Eye,
  Edit,
  Search,
  Shield,
  Briefcase,
  AlertTriangle,
} from "lucide-react";

import AdminLayout from "@/layouts/admin-layout";
import { sendRequest } from "@/services/requests/request-service"; // Ensure correct path
import RequestMethods from "@/enums/request-methods"; // Ensure correct path

// Reusable Permission Checkbox Component
const RolePermissionCheckbox = ({ label, checked, onChange, disabled }) => (
  <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 transition-colors">
    <input
      type="checkbox"
      id={label}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className="h-4 w-4 text-orange-600 border-gray-300 rounded"
    />
    <Label htmlFor={label} className="cursor-pointer select-none">
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </Label>
  </div>
);

export default function RolesDashboard() {
  const router = useRouter();

  // State variables
  const [roles, setRoles] = useState([]); // Fetched roles
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedRole, setSelectedRole] = useState(null); // For viewing
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const [editRole, setEditRole] = useState(null); // For editing
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", description: "", permissions: {} });

  const [searchTerm, setSearchTerm] = useState("");
  const [deleteRoleId, setDeleteRoleId] = useState(null);

  // 🔹 **Added Pagination State**
  const [currentPage, setCurrentPage] = useState(1); // Current active page
  const [itemsPerPage, setItemsPerPage] = useState(10); // Number of roles per page

  // Fetch roles from backend on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      try {
        const response = await sendRequest(
          RequestMethods.GET,
          `roles`, // Ensure this endpoint exists and returns the roles data
          null,
          true // requireAuth
        );

        if (response.success) {
          setRoles(response.data);
        } else {
          setError(response.message || "Failed to fetch roles.");
        }
      } catch (err) {
        console.error("Error fetching roles:", err);
        setError("Failed to fetch roles.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  // 🔹 **Added Effect to Reset Current Page on Search or Items Per Page Change**
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  // Handle viewing a role
  const handleViewRole = (role) => {
    setSelectedRole(role);
    setIsViewDialogOpen(true);
  };

  // Handle editing a role
  const handleEditRole = (role) => {
    setEditRole({
      id: role.id,
      roleName: role.roleName,
      roleType: role.roleType,
      description: role.description,
      permissions: { ...role.permissions },
    });
    setIsEditDialogOpen(true);
  };

  // Handle permission changes in edit dialog
  const handleEditPermissionChange = (permission) => {
    setEditRole((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission],
      },
    }));
  };

  // Handle permission changes in create dialog
  const handleCreatePermissionChange = (permission) => {
    setNewRole((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission],
      },
    }));
  };

  // Handle creating a new role
  const handleCreateRole = async () => {
    // Validate required fields
    if (!newRole.name || !newRole.description) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare payload
      const payload = {
        roleName: newRole.name,
        description: newRole.description,
        permission: {
          roleId: 0, // Always 0
          canView: newRole.permissions.canView || false,
          canEdit: newRole.permissions.canEdit || false,
          canCreate: newRole.permissions.canCreate || false,
          canDelete: newRole.permissions.canDelete || false,
        },
      };

      const response = await sendRequest(
        RequestMethods.POST,
        `roles`, // Ensure this endpoint handles role creation
        payload,
        true // requireAuth
      );

      if (response.success) {
        toast.success("Role created successfully.");
        setNewRole({ name: "", description: "", permissions: {} });
        setIsCreateSheetOpen(false);
        // 🔹 **Added: Refetch roles after creation**
        fetchRoles();
      } else {
        setError(response.message || "Failed to create role.");
      }
    } catch (err) {
      console.error("Error creating role:", err);
      setError("Failed to create role.");
    } finally {
      setLoading(false);
    }
  };

  // Handle updating a role
  const handleUpdateRole = async () => {
    // Validate required fields
    if (!editRole.roleName || !editRole.description) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare payload
      const payload = {
        description: editRole.description,
        permissions: {
          roleId: 0, // Always 0
          canView: editRole.permissions.canView || false,
          canEdit: editRole.permissions.canEdit || false,
          canCreate: editRole.permissions.canCreate || false,
          canDelete: editRole.permissions.canDelete || false,
        },
      };

      const response = await sendRequest(
        RequestMethods.PUT,
        `roles/${editRole.id}`, // Ensure this endpoint handles role updates
        payload,
        true // requireAuth
      );

      if (response.success) {
        toast.success("Role updated successfully.");
        // Update roles state
        setRoles(
          roles.map((role) =>
            role.id === editRole.id
              ? { ...role, description: editRole.description, permissions: { ...editRole.permissions } }
              : role
          )
        );
        setEditRole(null);
        setIsEditDialogOpen(false);
      } else {
        toast.error(response.message || "Failed to update role.");
        setError(response.message || "Failed to update role.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to update role.");
      console.error("Error updating role:", err);
      setError("Failed to update role.");
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting a role
  const handleDelete = (id) => {
    setDeleteRoleId(id);
  };

  // Confirm deletion
  const confirmDelete = async () => {
    if (deleteRoleId === null) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch the role to get user count
      const roleToDelete = roles.find((role) => role.id === deleteRoleId);
      if (!roleToDelete) {
        setError("Role not found.");
        return;
      }

      const userCount = roleToDelete.users.length;

      // Proceed with deletion
      const response = await sendRequest(
        RequestMethods.DELETE,
        `roles/${deleteRoleId}`, // Ensure this endpoint handles role deletion
        null,
        true // requireAuth
      );

      if (response.success) {
        toast.success("Role deleted successfully.");
        setRoles(roles.filter((role) => role.id !== deleteRoleId));

        if (userCount > 0) {
          toast.info(`All ${userCount} user(s) under this role have been converted to Default_Admin.`);
          // Optional: You might need to fetch users again or handle client-side state
        }

        setDeleteRoleId(null);
      } else {
        setError(response.message || "Failed to delete role.");
      }
    } catch (err) {
      console.error("Error deleting role:", err);
      setError("Failed to delete role.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 **Added: Function to Fetch Roles (for refreshing after creation)**
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await sendRequest(
        RequestMethods.GET,
        `roles`,
        null,
        true
      );

      if (response.success) {
        setRoles(response.data);
      } else {
        setError(response.message || "Failed to fetch roles.");
      }
    } catch (err) {
      console.error("Error fetching roles:", err);
      setError("Failed to fetch roles.");
    } finally {
      setLoading(false);
    }
  };

  // Filter roles based on search term
  const filteredRoles = roles.filter((role) =>
    role.roleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.roleType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🔹 **Added: Calculate total pages and current roles for pagination**
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const indexOfLastRole = currentPage * itemsPerPage;
  const indexOfFirstRole = indexOfLastRole - itemsPerPage;
  const currentRoles = filteredRoles.slice(indexOfFirstRole, indexOfLastRole);

  // Statistics Cards Data
  const totalRoles = roles.length;
  const totalUsers = roles.reduce(
    (sum, role) => sum + role.users.length,
    0
  );

  // 🔹 **Added: Pagination Component**
  const Pagination = () => {
    const pageNumbers = [];

    // Generate page numbers
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    // Handle edge case when totalPages is 0
    if (totalPages === 0) return null;

    return (
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          aria-label="Previous Page"
        >
          Previous
        </Button>
        {pageNumbers.map(number => (
          <Button
            key={number}
            variant={number === currentPage ? "solid" : "outline"}
            className={number === currentPage ? "bg-orange-600 text-white" : ""}
            onClick={() => setCurrentPage(number)}
            aria-label={`Go to page ${number}`}
          >
            {number}
          </Button>
        ))}
        <Button
          variant="outline"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          aria-label="Next Page"
        >
          Next
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4">
      {/* Roles Overview Widgets */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {roles.map((role) => (
          <Card key={role.id} className="overflow-hidden shadow-sm">
            <CardHeader
              className={`flex flex-row items-center justify-between ${getRoleTypeColor(role.roleType)} text-white`}
            >
              <CardTitle className="text-sm font-medium">{role.roleName}</CardTitle>
              <Shield className="h-4 w-4" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{role.users.length}</div>
              <p className="text-xs text-muted-foreground">
                {role.users.length === 1 ? "user" : "users"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <CardTitle>Roles List</CardTitle>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              {/* Create Role Button */}
              <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
                <SheetTrigger asChild>
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="mr-2 h-4 w-4" /> Create Role
                  </Button>
                </SheetTrigger>
                <SheetContent className="bg-white">
                  <SheetHeader>
                    <SheetTitle>Create New Role</SheetTitle>
                  </SheetHeader>
                  <div className="py-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="roleName">Role Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="roleName"
                        value={newRole.name}
                        onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                        placeholder="Enter role name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="roleDescription">Description <span className="text-red-500">*</span></Label>
                      <Input
                        id="roleDescription"
                        value={newRole.description}
                        onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                        placeholder="Enter role description"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Permissions</Label>
                      {["canView", "canEdit", "canCreate", "canDelete"].map((permission) => (
                        <RolePermissionCheckbox
                          key={permission}
                          label={permission}
                          checked={newRole.permissions[permission] || false}
                          onChange={() => handleCreatePermissionChange(permission)}
                          disabled={false}
                        />
                      ))}
                    </div>
                    <Button
                      onClick={handleCreateRole}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                      disabled={loading}
                    >
                      {loading ? "Creating..." : "Create Role"}
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role Name</TableHead>
                  <TableHead>Role Type</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Loading roles...
                    </TableCell>
                  </TableRow>
                ) : currentRoles.length > 0 ? ( // 🔹 **Changed from filteredRoles to currentRoles**
                  currentRoles.map((role) => ( // 🔹 **Changed from filteredRoles.map to currentRoles.map**
                    <motion.tr
                      key={role.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <TableCell>{role.roleName}</TableCell>
                      <TableCell>{role.roleType}</TableCell>
                      <TableCell>{new Date(role.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{truncateDescription(role.description)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          {/* View Role */}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewRole(role)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View Role</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          {/* Edit Role */}
                          {role.roleType.toLowerCase() === "admin" &&
                            role.roleName !== "Default_Admin" && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditRole(role)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Edit Role</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}

                          {/* Delete Role */}
                          {role.roleType.toLowerCase() === "admin" &&
                            role.roleName !== "Default_Admin" && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDelete(role.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Delete Role</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No roles found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* 🔹 **Added: Pagination Controls Below the Table** */}
          <div className="flex justify-between items-center mt-4">
            {/* Items Per Page Select Box */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span className="text-sm text-gray-500">entries</span>
            </div>

            {/* Pagination Buttons */}
            <Pagination />
          </div>
        </CardContent>
      </Card>

      {/* View Role Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-orange-600">View Role</DialogTitle>
          </DialogHeader>
          {selectedRole && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${getRoleTypeColor(selectedRole.roleType)}`}>
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedRole.roleName}</h3>
                  <p className="text-sm text-gray-500">{selectedRole.roleType}</p>
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-lg font-semibold mb-2">Description</h4>
                <p className="text-sm">{selectedRole.description}</p>
              </div>
              <Separator />
              <div>
                <h4 className="text-lg font-semibold mb-2">Permissions</h4>
                <div className="grid grid-cols-2 gap-2">
                  {["canView", "canEdit", "canCreate", "canDelete"].map((permission) => (
                    <Badge
                      key={permission}
                      className={`${
                        selectedRole.permissions[permission]
                          ? "bg-green-500"
                          : "bg-gray-500"
                      } text-white`}
                    >
                      {permission.charAt(0).toUpperCase() + permission.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-lg font-semibold mb-2">Users</h4>
                <p className="text-sm">
                  {selectedRole.users.length} {selectedRole.users.length === 1 ? "user" : "users"}
                </p>
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-orange-600">Edit Role</DialogTitle>
          </DialogHeader>
          {editRole && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${getRoleTypeColor(editRole.roleType)}`}>
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{editRole.roleName}</h3>
                  <p className="text-sm text-gray-500">{editRole.roleType}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="editRoleDescription">Description <span className="text-red-500">*</span></Label>
                <Input
                  id="editRoleDescription"
                  value={editRole.description}
                  onChange={(e) => setEditRole({ ...editRole, description: e.target.value })}
                  placeholder="Enter role description"
                />
              </div>
              <Separator />
              <div>
                <h4 className="text-lg font-semibold mb-2">Permissions</h4>
                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-4 rounded-lg">
                  {["canView", "canEdit", "canCreate", "canDelete"].map((permission) => (
                    <RolePermissionCheckbox
                      key={permission}
                      label={permission}
                      checked={editRole.permissions[permission] || false}
                      onChange={() => handleEditPermissionChange(permission)}
                      disabled={
                        editRole.roleType.toLowerCase() === "superadmin" ||
                        editRole.roleType.toLowerCase() === "user" ||
                        editRole.roleName === "Default_Admin"
                      }
                    />
                  ))}
                </div>
              </div>
              <Button
                onClick={handleUpdateRole}
                className="w-full bg-orange-600 hover:bg-orange-700 transition-colors"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Role Alert Dialog */}
      <AlertDialog open={deleteRoleId !== null} onOpenChange={() => setDeleteRoleId(null)}>
        <AlertDialogContent className="bg-white text-center space-y-4">
          <AlertDialogHeader className="flex flex-col items-center gap-2">
            <AlertDialogTitle className="text-center text-2xl font-bold text-red-600">Delete Role</AlertDialogTitle>
            <AlertTriangle className="h-10 w-10 text-red-500" />
            <AlertDialogDescription className="text-center text-sm">
              Are you sure you want to delete this role?
              {roles.find((role) => role.id === deleteRoleId)?.users.length > 0 && (
                <span>
                  {" "}
                  There are {roles.find((role) => role.id === deleteRoleId).users.length} user(s) under this role. All users will be converted to Default_Admin.
                </span>
              )}
              <span className="block mt-2">This action cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:flex-col space-y-2">
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 w-full"
              onClick={confirmDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
            <AlertDialogCancel className="w-full">Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Define the layout for this page
RolesDashboard.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};

// Utility function to truncate description to first 10 words
const truncateDescription = (desc) => {
  const words = desc.split(" ");
  if (words.length <= 10) return desc;
  return words.slice(0, 10).join(" ") + "...";
};

// Function to get badge color based on role type
const getRoleTypeColor = (type) => {
  switch (type.toLowerCase()) {
    case "superadmin":
      return "bg-red-500";
    case "admin":
      return "bg-blue-500";
    case "user":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};
