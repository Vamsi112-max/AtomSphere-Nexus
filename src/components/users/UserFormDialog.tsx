"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { userFormSchema } from "@/lib/validations/user";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface UserFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit: any | null;
  onSuccess: () => void;
}

export function UserFormDialog({ isOpen, onClose, userToEdit, onSuccess }: UserFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "employee",
      department: "",
      managerId: "",
    },
  });

  useEffect(() => {
    if (userToEdit) {
      form.reset({
        name: userToEdit.name || "",
        email: userToEdit.email || "",
        role: userToEdit.role || "employee",
        department: userToEdit.department || "",
        managerId: userToEdit.managerId || "",
      });
    } else {
      form.reset({
        name: "",
        email: "",
        role: "employee",
        department: "",
        managerId: "",
      });
    }
  }, [userToEdit, form, isOpen]);

  const onSubmit = async (values: z.infer<typeof userFormSchema>) => {
    setIsLoading(true);
    try {
      if (userToEdit) {
        const { error } = await supabase.from('users').update({
          name: values.name,
          role: values.role,
          department_id: values.department || null,
          manager_id: values.managerId || null,
        }).eq('id', userToEdit.id);
        if (error) throw error;
        toast.success("User updated successfully");
      } else {
        const tempUid = uuidv4();
        
        
        const { error } = await supabase.from('users').insert({
          id: tempUid,
          email: values.email,
          name: values.name,
          role: values.role,
          department_id: values.department || null,
          manager_id: values.managerId || null,
        });
        if (error) throw error;
        toast.success("User created successfully");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] glass-panel border-white/10">
        <DialogHeader>
          <DialogTitle>{userToEdit ? "Edit User" : "Add New User"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              placeholder="Full Name"
              className="bg-black/20 border-white/10"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email Address"
              className="bg-black/20 border-white/10"
              disabled={!!userToEdit}
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Select 
              value={form.watch("role")} 
              onValueChange={(val) => form.setValue("role", val as any)}
            >
              <SelectTrigger className="bg-black/20 border-white/10">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="glass-panel border-white/10">
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.role && (
              <p className="text-xs text-destructive">{form.formState.errors.role.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Input
              placeholder="Department (Optional)"
              className="bg-black/20 border-white/10"
              {...form.register("department")}
            />
          </div>

          <div className="space-y-2">
            <Input
              placeholder="Manager ID (Optional)"
              className="bg-black/20 border-white/10"
              {...form.register("managerId")}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {userToEdit ? "Save Changes" : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
