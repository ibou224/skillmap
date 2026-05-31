/**
 * @module components/ui/Button
 * @description Composant Button base avec variantes (primary, secondary, outline, ghost).
 * Utilise CVA pour la gestion des variantes de style.
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input rounded-xl cursor-pointer bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        dangerLight: "cursor-pointer rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 hover:text-red-700 transition-colors gap-1.5",
        dangerFill: "cursor-pointer rounded-xl bg-red-50 text-red-500 border border-red-100 font-semibold hover:bg-red-500 hover:text-white transition-all duration-200 gap-1.5",
        citeGreen: "cursor-pointer rounded-xl bg-cite-green text-white font-bold hover:bg-cite-green-dark transition-colors gap-1.5",
        citeGreenLight: "cursor-pointer rounded-xl bg-cite-green/10 text-cite-green border border-cite-green/20 font-semibold hover:bg-cite-green hover:text-white transition-all duration-200 gap-1.5",
        archiveLight: "cursor-pointer rounded-xl bg-orange-50 text-orange-500 border border-orange-100 font-semibold hover:bg-orange-500 hover:text-white transition-all duration-200 gap-1.5",
        cancel: "cursor-pointer rounded-xl bg-gray-100 text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-200 hover:text-gray-800",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
        iconSm: "h-7 w-7 p-0 rounded-lg text-xs",
        xl: "h-9 p-5 rounded-xl text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
     />
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
