import { useState } from "react";
import { Link, useLoaderData, useNavigate, useSearchParams, useSubmit } from "react-router";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import type {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { Edit, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import { db } from "~/lib/database";
import { task } from "~/db/schema";
import { eq, like, count, asc, desc } from "drizzle-orm";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "~/components/ui/pagination";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "sonner";
import type { Route } from "./+types/dashboard.tasks";

// Types
type Task = {
  id: string;
  title: string | null;
  description: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

type LoaderData = {
  tasks: Task[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// Loader - Fetch tasks with pagination and search
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
  const search = url.searchParams.get("search") || "";

  const offset = (page - 1) * pageSize;

  // Build query
  const whereConditions = search
    ? like(task.title, `%${search}%`)
    : undefined;

  // Get total count
  const totalCountResult = await db
    .select({ count: count() })
    .from(task)
    .where(whereConditions);
  const totalCount = totalCountResult[0]?.count || 0;

  // Get paginated tasks
  const tasks = await db
    .select()
    .from(task)
    .where(whereConditions)
    .orderBy(desc(task.createdAt))
    .limit(pageSize)
    .offset(offset);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    tasks,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}

// Action - Handle delete and update operations
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const taskId = formData.get("taskId")?.toString();

  try {
    if (intent === "delete" && taskId) {
      await db.delete(task).where(eq(task.id, taskId));
      return { success: true, message: "Task deleted successfully" };
    }

    if (intent === "update" && taskId) {
      const title = formData.get("title")?.toString();
      const description = formData.get("description")?.toString();

      await db
        .update(task)
        .set({
          title,
          description,
          updatedAt: new Date(),
        })
        .where(eq(task.id, taskId));

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
    { title: "Tasks - Dashboard" },
    { name: "description", content: "Manage your tasks" },
  ];
}

export default function DashboardTasksPage() {
  const loaderData = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const submit = useSubmit();
  const navigate = useNavigate();

  // State
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Table columns
  const columns: ColumnDef<Task>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("title") || "Untitled"}</div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="max-w-[500px] truncate text-muted-foreground">
          {row.getValue("description") || "No description"}
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
                  setEditingTask(task);
                  setEditTitle(task.title || "");
                  setEditDescription(task.description || "");
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

  // Initialize table
  const table = useReactTable({
    data: loaderData.tasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
    manualPagination: true,
    pageCount: loaderData.totalPages,
  });

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

  // Handle update
  const handleUpdate = () => {
    if (!editingTask) return;

    const formData = new FormData();
    formData.append("intent", "update");
    formData.append("taskId", editingTask.id);
    formData.append("title", editTitle);
    formData.append("description", editDescription);

    submit(formData, { method: "post" });
    setEditingTask(null);
    toast.success("Task updated successfully");
  };

  // Generate pagination items
  const generatePaginationItems = () => {
    const items = [];
    const { page, totalPages } = loaderData;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      if (page <= 3) {
        items.push(1, 2, 3, 4, "ellipsis", totalPages);
      } else if (page >= totalPages - 2) {
        items.push(1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        items.push(1, "ellipsis", page - 1, page, page + 1, "ellipsis", totalPages);
      }
    }

    return items;
  };

  return (
    <div className="flex-1 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
            <p className="text-muted-foreground mt-2">
              Manage and organize your tasks efficiently
            </p>
          </div>
          <Link to="/dashboard/tasks/add">
            <Button>
              <Plus className="mr-2 size-4" />
              Add Task
            </Button>
          </Link>
        </div>

        {/* Table Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>All Tasks</CardTitle>
                <CardDescription>
                  {loaderData.totalCount} task{loaderData.totalCount !== 1 ? "s" : ""} total
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchValue}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No tasks found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {loaderData.totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (loaderData.page > 1) {
                            handlePageChange(loaderData.page - 1);
                          }
                        }}
                        className={
                          loaderData.page === 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>

                    {generatePaginationItems().map((item, index) => (
                      <PaginationItem key={index}>
                        {item === "ellipsis" ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(item as number);
                            }}
                            isActive={loaderData.page === item}
                          >
                            {item}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (loaderData.page < loaderData.totalPages) {
                            handlePageChange(loaderData.page + 1);
                          }
                        }}
                        className={
                          loaderData.page === loaderData.totalPages
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
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
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deletingTask} onOpenChange={() => setDeletingTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingTask?.title}"? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingTask(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
