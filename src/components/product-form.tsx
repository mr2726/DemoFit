
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle, Trash2, UploadCloud, Loader2 } from "lucide-react"
import { Card, CardContent } from "./ui/card"
import { Separator } from "./ui/separator"
import React, { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "./ui/progress"

const exerciseSchema = z.object({
    name: z.string().min(1, "Exercise name is required."),
    videoOrDescription: z.string().min(1, "Video link or description is required."),
    sets: z.coerce.number().int().min(1),
    reps: z.string().optional(),
    duration: z.coerce.number().int().min(0).optional(),
    rest: z.coerce.number().int().min(0),
});

const recipeSchema = z.object({
    name: z.string().min(1, "Recipe name is required."),
    instructions: z.string().min(10, "Instructions are required."),
    imageUrl: z.string().url().optional().or(z.literal('')),
    kcal: z.coerce.number().int().min(0).optional(),
});

const productFormSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  price: z.coerce.number().positive("Price must be a positive number."),
  category: z.enum(["Workout Plan", "Nutrition", "Supplements"]),
  
  imageUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  
  // Workout Plan specific fields
  weeks: z.coerce.number().int().min(1).optional(),
  exercises: z.array(exerciseSchema).optional(),

  // Nutrition specific fields
  totalKcal: z.coerce.number().int().min(0).optional(),
  recipes: z.array(recipeSchema).optional(),

  // Supplements specific fields
  stock: z.coerce.number().int().min(0, "Stock can't be negative.").optional(),
}).superRefine((data, ctx) => {
    if (data.category === "Workout Plan") {
        if (!data.imageUrl) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Image URL is required for Workout Plans.", path: ["imageUrl"] });
        }
        if (!data.weeks) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Duration (weeks) is required for Workout Plans.", path: ["weeks"] });
        }
        if (!data.exercises || data.exercises.length === 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "At least one exercise is required for Workout Plans.", path: ["exercises"] });
        }
    }
    if (data.category === "Nutrition") {
        if (!data.imageUrl) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Image URL is required for Nutrition Plans.", path: ["imageUrl"] });
        }
        if (!data.totalKcal) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Total Kcal is required for Nutrition Plans.", path: ["totalKcal"] });
        }
        if (!data.recipes || data.recipes.length === 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "At least one recipe is required for Nutrition Plans.", path: ["recipes"] });
        }
    }
    if (data.category === "Supplements") {
        if (!data.imageUrl) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Image URL is required for Supplements.", path: ["imageUrl"] });
        }
        if (data.stock === undefined || data.stock === null) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Stock is required for Supplements.", path: ["stock"] });
        }
    }
});


export type ProductFormValues = z.infer<typeof productFormSchema>

interface ProductFormProps {
    onSubmit: (data: ProductFormValues) => void;
    initialData?: Partial<ProductFormValues>;
    submitButtonText?: string;
}

const defaultValues: Partial<ProductFormValues> = {
  name: "",
  description: "",
  price: 0,
  category: "Workout Plan",
  stock: 0,
  weeks: 4,
  totalKcal: 2000,
  exercises: [],
  recipes: [],
}

const VideoUploader = ({ field, form, index }: { field: any, form: any, index: number }) => {
    const { toast } = useToast();
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (file.size > 50 * 1024 * 1024) { // 50 MB limit for Telegram Bot API
            toast({ title: "Error", description: "File size must be less than 50MB for Telegram uploads.", variant: "destructive" });
            return;
        }
        if (!file.type.startsWith('video/')) {
            toast({ title: "Error", description: "Please select a valid video file.", variant: "destructive" });
            return;
        }

        setUploading(true);
        setProgress(0); // Show indeterminate progress

        try {
            const formData = new FormData();
            formData.append('file', file);
            
            // Using fetch to simulate progress is complex. We'll show a loading spinner.
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }
            
            const { url } = await response.json();
            form.setValue(`exercises.${index}.videoOrDescription`, url);
            toast({ title: "Success", description: "Video uploaded successfully." });

        } catch (error: any) {
            console.error(error);
            toast({ title: "Upload Error", description: error.message || "Could not upload video.", variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    return (
        <FormItem>
            <FormLabel>Video URL or Upload</FormLabel>
            <div className="flex items-center gap-2">
                 <FormControl>
                    <Input placeholder="https://youtube.com/watch?v=..." {...field} />
                </FormControl>
                <Button type="button" variant="outline" asChild className="relative cursor-pointer">
                    <div>
                        <UploadCloud className="w-4 h-4"/>
                        <input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            accept="video/*"
                            onChange={handleFileUpload}
                            disabled={uploading}
                        />
                    </div>
                </Button>
            </div>
            {uploading && (
                <div className="mt-2 space-y-1 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p className="text-xs text-muted-foreground">Uploading to Telegram... this may take a moment.</p>
                </div>
            )}
             <FormMessage />
        </FormItem>
    );
};


export function ProductForm({ onSubmit, initialData, submitButtonText = "Create Product" }: ProductFormProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initialData || defaultValues,
    mode: "onChange",
  })
  
  React.useEffect(() => {
    if (initialData) {
        form.reset(initialData);
    }
  }, [initialData, form]);

  const { fields: exerciseFields, append: appendExercise, remove: removeExercise } = useFieldArray({
    control: form.control,
    name: "exercises",
  });

  const { fields: recipeFields, append: appendRecipe, remove: removeRecipe } = useFieldArray({
    control: form.control,
    name: "recipes",
  });

  const category = form.watch("category");

  function handleFormSubmit(data: ProductFormValues) {
    onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Advanced Gym Routine" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A brief description of the product."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Price ($)</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="49.00" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="Workout Plan">Workout Plan</SelectItem>
                        <SelectItem value="Nutrition">Nutrition</SelectItem>
                        <SelectItem value="Supplements">Supplements</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
        </div>

        {category === 'Supplements' && (
            <div className="space-y-4">
                <Separator />
                <h3 className="text-lg font-medium">Supplement Details</h3>
                 <FormField control={form.control} name="imageUrl" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl><Input placeholder="https://placehold.co/600x400" {...field} value={field.value || ''} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Stock</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="100" {...field} value={field.value ?? ''}/>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        )}
        
        {category === 'Workout Plan' && (
            <div className="space-y-4">
                <Separator />
                <h3 className="text-lg font-medium">Workout Plan Details</h3>
                <FormField control={form.control} name="imageUrl" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl><Input placeholder="https://placehold.co/600x400" {...field} value={field.value || ''} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="weeks" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Duration (weeks)</FormLabel>
                        <FormControl><Input type="number" placeholder="8" {...field} value={field.value ?? ''} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                
                <div>
                    <h4 className="text-md font-medium mb-2">Exercises</h4>
                    <div className="space-y-4">
                    {exerciseFields.map((field, index) => (
                        <Card key={field.id} className="p-4 relative">
                            <CardContent className="space-y-3 p-0">
                                <FormField control={form.control} name={`exercises.${index}.name`} render={({ field }) => (
                                    <FormItem><FormLabel>Exercise Name</FormLabel><FormControl><Input placeholder="Push-ups" {...field}/></FormControl><FormMessage /></FormItem>
                                )}/>
                                
                                <FormField control={form.control} name={`exercises.${index}.videoOrDescription`} render={({ field }) => (
                                    <VideoUploader field={field} form={form} index={index} />
                                )}/>

                                <div className="grid grid-cols-4 gap-2">
                                    <FormField control={form.control} name={`exercises.${index}.sets`} render={({ field }) => (
                                        <FormItem><FormLabel>Sets</FormLabel><FormControl><Input type="number" placeholder="3" {...field}/></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name={`exercises.${index}.reps`} render={({ field }) => (
                                        <FormItem><FormLabel>Reps</FormLabel><FormControl><Input placeholder="12" {...field}/></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name={`exercises.${index}.duration`} render={({ field }) => (
                                        <FormItem><FormLabel>Work (sec)</FormLabel><FormControl><Input type="number" placeholder="45" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name={`exercises.${index}.rest`} render={({ field }) => (
                                        <FormItem><FormLabel>Rest (sec)</FormLabel><FormControl><Input type="number" placeholder="60" {...field}/></FormControl><FormMessage /></FormItem>
                                    )}/>
                                </div>
                                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeExercise(index)}><Trash2 className="w-4 h-4 text-destructive"/></Button>
                            </CardContent>
                        </Card>
                    ))}
                    </div>
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendExercise({ name: '', videoOrDescription: '', sets: 3, rest: 60 })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Exercise
                    </Button>
                </div>
            </div>
        )}
        
        {category === 'Nutrition' && (
            <div className="space-y-4">
                <Separator />
                <h3 className="text-lg font-medium">Nutrition Plan Details</h3>
                <FormField control={form.control} name="imageUrl" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl><Input placeholder="https://placehold.co/600x400" {...field} value={field.value || ''} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="totalKcal" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Total Kcal</FormLabel>
                        <FormControl><Input type="number" placeholder="2500" {...field} value={field.value ?? ''}/></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                
                <div>
                     <h4 className="text-md font-medium mb-2">Recipes</h4>
                    <div className="space-y-4">
                    {recipeFields.map((field, index) => (
                        <Card key={field.id} className="p-4 relative">
                            <CardContent className="space-y-3 p-0">
                                <FormField control={form.control} name={`recipes.${index}.name`} render={({ field }) => (
                                    <FormItem><FormLabel>Recipe Name</FormLabel><FormControl><Input placeholder="Grilled Chicken Salad" {...field}/></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={form.control} name={`recipes.${index}.instructions`} render={({ field }) => (
                                    <FormItem><FormLabel>Instructions</FormLabel><FormControl><Textarea placeholder="Instructions for the recipe..." {...field}/></FormControl><FormMessage /></FormItem>
                                )}/>
                                <div className="grid grid-cols-2 gap-2">
                                     <FormField control={form.control} name={`recipes.${index}.imageUrl`} render={({ field }) => (
                                        <FormItem><FormLabel>Image URL (Optional)</FormLabel><FormControl><Input placeholder="https://placehold.co/300x200" {...field} value={field.value || ''}/></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name={`recipes.${index}.kcal`} render={({ field }) => (
                                        <FormItem><FormLabel>Kcal (Optional)</FormLabel><FormControl><Input type="number" placeholder="550" {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem>
                                    )}/>
                                </div>
                                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeRecipe(index)}><Trash2 className="w-4 h-4 text-destructive"/></Button>
                            </CardContent>
                        </Card>
                    ))}
                    </div>
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendRecipe({ name: '', instructions: '' })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Recipe
                    </Button>
                </div>
            </div>
        )}
        
        <Separator/>

        <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitButtonText}
        </Button>
      </form>
    </Form>
  )
}
