
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
import { useToast } from "@/hooks/use-toast"
import { PlusCircle, Trash2 } from "lucide-react"
import { Card, CardContent } from "./ui/card"
import { Separator } from "./ui/separator"
import React from "react"

const exerciseSchema = z.object({
    name: z.string().min(1, "Exercise name is required."),
    videoOrDescription: z.string().min(1, "Video link or description is required."),
    sets: z.coerce.number().int().min(1),
    reps: z.string().min(1, "Reps/duration is required."),
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
}).refine(data => {
    if (data.category === "Workout Plan") {
        return !!data.imageUrl && !!data.weeks && !!data.exercises && data.exercises.length > 0;
    }
    return true;
}, {
    message: "Image, duration, and at least one exercise are required for Workout Plans.",
    path: ["imageUrl"] // You can also target specific fields for the error message
}).refine(data => {
    if (data.category === "Nutrition") {
        return !!data.imageUrl && !!data.totalKcal && !!data.recipes && data.recipes.length > 0;
    }
    return true;
}, {
    message: "Image, total Kcal, and at least one recipe are required for Nutrition Plans.",
    path: ["imageUrl"]
}).refine(data => {
    if (data.category === "Supplements") {
        return !!data.imageUrl && data.stock !== undefined && data.stock !== null;
    }
    return true;
}, {
    message: "Image and Stock are required for Supplements.",
    path: ["imageUrl"]
});


type ProductFormValues = z.infer<typeof productFormSchema>

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

export function ProductForm({ onSubmit, initialData, submitButtonText = "Create Product" }: ProductFormProps) {
  const { toast } = useToast()
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
    toast({
      title: "Product Action Successful",
      description: `Product "${data.name}" has been successfully ${initialData ? 'updated' : 'created'}.`,
    })
    if (!initialData) {
      form.reset();
    }
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
                            <Input type="number" placeholder="100" {...field} value={field.value || ''}/>
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
                        <FormControl><Input type="number" placeholder="8" {...field} value={field.value || ''} /></FormControl>
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
                                    <FormItem><FormLabel>Video URL or Description</FormLabel><FormControl><Textarea placeholder="Link to video or text description..." {...field}/></FormControl><FormMessage /></FormItem>
                                )}/>
                                <div className="grid grid-cols-3 gap-2">
                                    <FormField control={form.control} name={`exercises.${index}.sets`} render={({ field }) => (
                                        <FormItem><FormLabel>Sets</FormLabel><FormControl><Input type="number" placeholder="3" {...field}/></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name={`exercises.${index}.reps`} render={({ field }) => (
                                        <FormItem><FormLabel>Reps/Duration</FormLabel><FormControl><Input placeholder="12 reps or 60s" {...field}/></FormControl><FormMessage /></FormItem>
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
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendExercise({ name: '', videoOrDescription: '', sets: 3, reps: '12', rest: 60 })}>
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
                        <FormControl><Input type="number" placeholder="2500" {...field} value={field.value || ''}/></FormControl>
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
                                        <FormItem><FormLabel>Kcal (Optional)</FormLabel><FormControl><Input type="number" placeholder="550" {...field} value={field.value || ''}/></FormControl><FormMessage /></FormItem>
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

        <Button type="submit">{submitButtonText}</Button>
      </form>
    </Form>
  )
}
