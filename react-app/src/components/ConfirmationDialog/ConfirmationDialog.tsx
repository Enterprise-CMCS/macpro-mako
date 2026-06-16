import { cn } from "@/utils";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../Dialog";
import { Button, ButtonProps } from "../Inputs";

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
  cancelVariant?: ButtonProps["variant"];
};

/** A modal with optional Cancel and Accept buttons */
export function ConfirmationDialog({
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
  cancelVariant = "outline",
}: ConfirmationModalProps) {
  const isPlainTextBody = typeof body === "string" || typeof body === "number";

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]" data-testid="dialog-content">
        <DialogHeader>
          <DialogTitle data-testid="dialog-title">{title}</DialogTitle>
          {description && <DialogDescription className="sr-only">{description}</DialogDescription>}
        </DialogHeader>
        {body && (
          <div className="grid min-w-0 max-w-full gap-4 break-words py-4" data-testid="dialog-body">
            {isPlainTextBody ? (
              <div className="min-w-0 max-w-full [overflow-wrap:anywhere] [word-break:break-word]">
                {body}
              </div>
            ) : (
              body
            )}
          </div>
        )}
        <DialogFooter
          className={cn({
            "flex-col sm:flex-row-reverse sm:justify-start": areButtonsReversed,
          })}
          data-testid="dialog-footer"
        >
          {acceptButtonVisible && (
            <Button type="submit" onClick={onAccept} data-testid="dialog-accept">
              {acceptButtonText}
            </Button>
          )}
          {cancelButtonVisible && (
            <Button
              type="button"
              variant={cancelVariant}
              onClick={onCancel}
              data-testid="dialog-cancel"
            >
              {cancelButtonText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
