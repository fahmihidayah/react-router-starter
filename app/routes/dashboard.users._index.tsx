import { useState } from "react";
import { useLoaderData, useNavigate, useSearchParams, useSubmit } from "react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { like } from "drizzle-orm/sql";
import { user } from "~/db/schema";
import { taskRepository } from "~/features/tasks/task-repository";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { toast } from "sonner";
import { PageHeader, DataTable, TablePagination, DeleteDialog } from "~/components/layout/table-list";
import type { Route } from "./+types/dashboard.tasks";
import type { User } from "~/features/users/type";
import { userRepository } from "~/features/users/user-repository";

// Loader - Fetch tasks with pagination and search using TaskRepository
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
  const search = url.searchParams.get("search") || "";

  // Use repository's findManyPaginated method
  const result = await userRepository.findManyPaginated({
    where: search ? like(user.name, `%${search}%`) : undefined,
    page,
    pageSize,
  });

  return {
    tasks: result.data,
    totalCount: result.pagination.totalItems,
    page: result.pagination.currentPage,
    pageSize: result.pagination.pageSize,
    totalPages: result.pagination.totalPages,
  };
}

// Action - Handle delete and update operations using TaskRepository
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const taskId = formData.get("taskId")?.toString();

  console.log("user id : ", intent, taskId)
  try {
    if (intent === "delete" && taskId) {
      await userRepository.delete(taskId);
      return { success: true, message: "Task deleted successfully" };
    }

    if (intent === "update" && taskId) {
      const title = formData.get("title")?.toString();
      const description = formData.get("description")?.toString();

      await taskRepository.update(taskId, {
        title,
        description,
        updatedAt: new Date(),
      });

      return { success: true, message: "Task updated successfully" };
    }

    return { success: false, message: "Invalid action" };
  } catch (error) {
    console.error("Action error:", error);
    return { success: false, message: "An error occurred" };
  }
}

export function meta() {
  return [
    { title: "User - Dashboard" },
    { name: "description", content: "Manage your tasks" },
  ];
}

export default function DashboardTasksPage() {
  const loaderData = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const submit = useSubmit();

  // State
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");
  const [deletingTask, setDeletingTask] = useState<User | null>(null);
  const navigate = useNavigate()

  // Table columns
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("email") || "Untitled"}</div>
      ),
    },
    {
      accessorKey: "name",
      header: "name",
      cell: ({ row }) => (
        <div className="max-w-[500px] truncate text-muted-foreground">
          {row.getValue("name") || "No Name"}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as Date | null;
        return date ? new Date(date).toLocaleDateString() : "-";
      },
    },
    {
      accessorKey: "updatedAt",
      header: "Updated",
      cell: ({ row }) => {
        const date = row.getValue("updatedAt") as Date | null;
        return date ? new Date(date).toLocaleDateString() : "-";
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const task = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="size-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(task.id);
                  toast.success("Task ID copied to clipboard");
                }}
              >
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  navigate(`${task.id}`)
                }}
              >
                <Edit className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeletingTask(task)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Handle search
  const handleSearch = (value: string) => {
    setSearchValue(value);
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.set("page", "1"); // Reset to first page
    setSearchParams(params);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    setSearchParams(params);
  };

  // Handle delete
  const handleDelete = () => {
    if (!deletingTask) return;

    const formData = new FormData();
    formData.append("intent", "delete");
    formData.append("taskId", deletingTask.id);

    submit(formData, { method: "post" });
    setDeletingTask(null);
    toast.success("Task deleted successfully");
  };

  return (
    <div className="flex-1 p-6">
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Users"
          description="Manage and organize your users efficiently"
          addButtonText="Add User"
          addButtonLink="/dashboard/users/add"
        />

        {/* Data Table */}
        <DataTable
          title="All Users"
          description={`${loaderData.totalCount} task${loaderData.totalCount !== 1 ? "s" : ""} total`}
          data={loaderData.tasks}
          columns={columns}
          searchPlaceholder="Search users..."
          searchValue={searchValue}
          onSearchChange={handleSearch}
          emptyMessage="No tasks found."
          totalPages={loaderData.totalPages}
          manualPagination
        />

        {/* Table Pagination */}
        {loaderData.totalPages > 1 && (
          <TablePagination
            currentPage={loaderData.page}
            totalPages={loaderData.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Edit Dialog */}
      {/* <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Make changes to your task here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Task title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Task description"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTask(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}

      {/* Delete Dialog */}
      <DeleteDialog
        open={!!deletingTask}
        onOpenChange={(open) => !open && setDeletingTask(null)}
        title="Delete Task"
        itemName={deletingTask?.email || ""}
        onConfirm={handleDelete}
        onCancel={() => setDeletingTask(null)}
      />
    </div>
  );
}
