import { cn } from "@/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../Dialog";
import { Button } from "../Inputs";

export type ConfirmationModalProps = {
  open: boolean;
  description?: React.ReactNode;
  body?: React.ReactNode;
  areButtonsReversed?: boolean;
  title: React.ReactNode;
  onCancel: () => void;
  onAccept: () => void;
  cancelButtonText?: string;
  acceptButtonText?: string;
  cancelButtonVisible?: boolean;
  acceptButtonVisible?: boolean;
};

/** A modal with optional Cancel and Accept buttons */
export function ConfirmationModal({
  open,
  description,
  title,
  areButtonsReversed = false,
  body,
  onAccept,
  onCancel,
  acceptButtonText = "Confirm",
  cancelButtonText = "Cancel",
  acceptButtonVisible = true,
  cancelButtonVisible = true,
}: ConfirmationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {body && <div className="grid gap-4 py-4">{body}</div>}
        <DialogFooter
          className={cn({
            "flex-col sm:flex-row-reverse sm:justify-start": areButtonsReversed,
          })}
        >
          {acceptButtonVisible && (
            <Button type="submit" onClick={onAccept}>
              {acceptButtonText}
            </Button>
          )}
          {cancelButtonVisible && (
            <Button type="button" variant={"outline"} onClick={onCancel}>
              {cancelButtonText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
