"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { UserFormDialog } from "./UserFormDialog";
import { motion } from "framer-motion";

export function UserTable() {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<any | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('users').select('*');
      if (error) throw error;
      
      if (data) {
        setUsers(data);
        setFilteredUsers(data);
      }
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = users.filter(user => 
        (user.name?.toLowerCase() || "").includes(lowerQuery) ||
        (user.email?.toLowerCase() || "").includes(lowerQuery) ||
        (user.role?.toLowerCase() || "").includes(lowerQuery) ||
        (user.department_id?.toLowerCase() || "").includes(lowerQuery)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await supabase.from('users').delete().eq('id', id);
        toast.success("User deleted successfully");
        fetchUsers();
      } catch (error) {
        toast.error("Failed to delete user");
      }
    }
  };

  const openAddDialog = () => {
    setUserToEdit(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (user: any) => {
    setUserToEdit(user);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 glass-panel border-white/10"
          />
        </div>
        <Button onClick={openAddDialog} className="bg-primary text-primary-foreground hover:bg-primary/90">
          Add User
        </Button>
      </div>

      <div className="glass-panel rounded-md border border-white/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-black/20">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user, index) => (
                <motion.tr 
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-white/10 hover:bg-white/5 transition-colors"
                >
                  <TableCell className="font-medium">{user.name || "N/A"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="capitalize">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-destructive/20 text-destructive' :
                      user.role === 'manager' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-primary/20 text-primary'
                    }`}>
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>{user.department || "—"}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      } />
                      <DropdownMenuContent align="end" className="glass-panel border-white/10">
                        <DropdownMenuItem onClick={() => openEditDialog(user)} className="cursor-pointer">
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(user.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <UserFormDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        userToEdit={userToEdit}
        onSuccess={fetchUsers}
      />
    </div>
  );
}
