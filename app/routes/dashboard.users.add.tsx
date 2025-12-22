import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form as ReactRouterForm, redirect, useSubmit } from "react-router";
import { db } from "~/lib/database";
import { user, account } from "~/db/schema";
import { randomUUID } from "crypto";


// Zod schema
const userSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters").max(100, "Password must be less than 100 characters"),
});

type UserFormData = z.infer<typeof userSchema>;


// Server action example
export async function action({ request }: { request: Request }) {
    const formData = await request.formData();

    try {
        const name = formData.get('name')?.toString();
        const email = formData.get("email")?.toString();
        const password = formData.get("password")?.toString();

        const userId = randomUUID();
        const now = new Date();

        // Insert user
        await db.insert(user).values({
            id: userId,
            name: name!,
            email: email!,
            emailVerified: false,
            image: null,
            createdAt: now,
            updatedAt: now,
        });

        // Insert account with password
        await db.insert(account).values({
            id: randomUUID(),
            accountId: email!,
            providerId: "credential",
            userId: userId,
            password: password!,
            accessToken: null,
            refreshToken: null,
            idToken: null,
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: null,
            scope: null,
            createdAt: now,
            updatedAt: now,
        });

        return redirect("/dashboard/users");
    } catch (error) {
        return {
            error: "Failed to create user. Please try again.",
        };
    }
}

export default function AddUserPage() {
    const form = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: "",
            email: "",
            password: ""
        }
    })

    const submit = useSubmit();

    const onSubmit = (data: UserFormData) => {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("email", data.email);
        formData.append("password", data.password);

        // Sends to your `action()` on this route
        submit(formData, {
            method: "post",
        });
    };
    return <div className="container w-full mx-auto p-5">
        <Card >
            <CardHeader>
                <CardTitle className="text-2xl">Add New User</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <Form {...form}>
                    <ReactRouterForm onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                        <FormField control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            disabled={field.disabled}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        <FormField control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            disabled={field.disabled}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        <FormField control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            disabled={field.disabled}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        <Button >
                            Submit
                        </Button>
                    </ReactRouterForm>
                </Form>
            </CardContent>
        </Card>
    </div>
}