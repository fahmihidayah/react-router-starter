import { db } from "~/lib/database";
import type { Route } from "./+types/tasks.$_index";
import { task } from "~/db/schema";
import { Box } from "lucide-react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

export async function loader({ }: Route.LoaderArgs) {
    const tasks = await db.select().from(task);
    return tasks;
}
export default function TasksPage({ loaderData }: Route.ComponentProps) {
    const tasks = loaderData;
    return <div className="flex flex-col gap-5 p-5">
        <div className="flex flex-row ">
            <Button>
                <Link to={"/tasks/add"}>
                    Add Task
                </Link>
            </Button>
        </div>
        {
            tasks.length > 0 && tasks.map(e => (
                <Card key={e.id}>
                    <CardContent>
                        <h3 className="text-lg">
                            {e.title}
                        </h3>
                    </CardContent>
                </Card>
            ))
        }
        {
            tasks.length === 0 && <div className="flex flex-col items-center justify-center w-full h-80 gap-3">
                <Box size={40} className="text-slate-800" />
                <h3 className="text-lg">
                    No task here
                </h3>

                <Button>
                    <Link to={"/tasks/add"}>
                        Add Task
                    </Link>
                </Button>
            </div>
        }
    </div>
}