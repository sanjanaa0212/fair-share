"use client";

import { Button, LoadingButton } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CircleCheckBig, CircleX, TriangleAlert } from "lucide-react";

export const ConfirmationDialog = ({
  children,
  open,
  setOpen,
  type,
  functionToBeExecuted,
  description,
  title,
  loading,
  actionButtonText,
  className,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: (text: boolean) => void;
  functionToBeExecuted: () => void;
  description: string | React.ReactNode;
  title: string;
  type: "failure" | "success" | "warning";
  loading?: boolean;
  actionButtonText: string;
  className?: string;
}) => {
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className={cn(className)} asChild onClick={(e) => e.stopPropagation()}>
          {children}
        </DialogTrigger>

        <DialogContent className="rounded-2xl bg-white p-4 shadow-lg sm:w-sm text-center">
          <div className="flex justify-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-100 text-red-600">
              {type === "failure" ? <CircleX /> : type === "warning" ? <TriangleAlert /> : <CircleCheckBig />}
            </div>
          </div>

          <DialogTitle className="text-lg font-gilroySemiBold text-gray-900">{title}</DialogTitle>

          <DialogDescription className="p-1 -mt-2 text-sm text-gray-600">{description}</DialogDescription>

          {/* Footer Buttons */}
          <DialogFooter className="flex flex-col gap-3 sm:gap-0  sm:flex-row w-full items-center justify-between mx-1">
            <DialogClose asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="outline" className="sm:w-1/2 w-full" onClick={(e) => e.stopPropagation()}>
                Cancel
              </Button>
            </DialogClose>
            <LoadingButton
              className="sm:w-1/2 w-full"
              disabled={loading}
              loading={loading}
              variant={type === "failure" ? "destructive" : "default"}
              onClick={(e) => {
                e.stopPropagation();
                functionToBeExecuted?.();
              }}
            >
              {actionButtonText}
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
